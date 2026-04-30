const Workflow = require("../models/workflow-model");
const WorkflowVersion = require("../models/workflowVersion-model");
const crypto = require('crypto');
const Execution = require("../models/execution-model");
const { runWorkflow } = require("../engine/workflowRunner");

// 1. Create/Update a Workflow (The "Save" Button)
const createWorkflow = async (req, res) => {
  try {
    const { name, description, triggerSlug, nodes = [], edges = [] } = req.body;
    const owner_id = req.user.id;

    // Generate slug if not provided
    const slug = triggerSlug || crypto.randomBytes(8).toString('hex');

    // A. Find or Create the "Container" (Workflow)
    // Try to find by slug if provided, OR by name/owner? 

    // Generate slug if not provided
    const slug = triggerSlug || crypto.randomBytes(8).toString('hex');

    // A. Find or Create the "Container" (Workflow)
    // Try to find by slug if provided, OR by name/owner? 
    // For now, let's rely on slug if provided, otherwise create new.
    // If updating, the frontend should ideally send the slug or ID. 
    // But here we are simplifying: 
    // If valid triggerSlug is sent and exists -> Update
    // Else -> Create New

    let workflow;
    if (triggerSlug) {
        workflow = await Workflow.findOne({ triggerSlug });
    }

    // --- PLAN LIMIT CHECK ---
    if (!workflow) {
        const User = require("../models/user.models");
        const user = await User.findById(owner_id);
        const plan = user?.subscription?.plan || 'FREE';
        
        const workflowCount = await Workflow.countDocuments({ owner_id });
        
        if (plan === 'FREE' && workflowCount >= 1) {
            return res.status(403).json({ 
                error: "SUBSCRIPTION_REQUIRED", 
                message: "Basic plan is limited to 1 workflow. Upgrade to Pro or Elite for unlimited architectures." 
            });
        }
    }
    // ------------------------

    if (!workflow) {
      workflow = await Workflow.create({
        name: name || "Untitled Workflow",
        description,
        owner_id,
        triggerSlug: slug,
      });
    } else {
        if (String(workflow.owner_id) !== String(owner_id)) {
            return res.status(403).json({ error: "You do not own this workflow" });
        }
        // Update name if changed
        if (name) {
            workflow.name = name;
        }
        if (description !== undefined) workflow.description = description;
        await workflow.save();
    }

    // B. Increment Version (Count + 1)
    const count = await WorkflowVersion.countDocuments({
      workflow_id: workflow._id,
    });
    const newVersion = `1.0.${count + 1}`;

    // C. Save the Logic (The "Brain")
    const versionDoc = await WorkflowVersion.create({
      workflow_id: workflow._id,
      version: newVersion,
      definition: { nodes, edges },
    });

    // D. Update the Pointer (Make it Live!)
    workflow.active_version_id = versionDoc._id;
    workflow.is_active = true;
    workflow.updatedAt = new Date();
    await workflow.save();

    res.json({ success: true, workflowId: workflow._id, version: newVersion, triggerSlug: workflow.triggerSlug });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getworkflows = async (req, res) => {
    try {
        // Query the "Container" collection
        // We select specific fields to keep the response light and fast.
        const workflows = await Workflow.find({ owner_id: req.user.id }).sort({ updatedAt: -1 });

        const results = await Promise.all(workflows.map(async (workflow) => {
            let nodes = [];
            if (workflow.active_version_id) {
                try {
                    const version = await WorkflowVersion.findById(workflow.active_version_id);
                    if (version && version.definition) {
                        nodes = (version.definition.nodes || []).map(n => ({
                            id: n.id, data: { label: n.data?.label, category: n.data?.category }
                        }));
                    }
                } catch(e) {}
            }
            return {
                ...workflow.toObject(),
                status: workflow.is_active ? "active" : "draft",
                executions: workflow.stats?.total_runs || 0,
                successRate: workflow.stats?.success_rate || 0,
                nodes,
            };
        }));

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getWorkflowById = async (req, res) => {
    try {
        const { id } = req.params;

        // Step A: Find the Workflow Metadata
        const workflow = await Workflow.findById(id);
        if (!workflow) {
            return res.status(404).json({ error: "Workflow not found" });
        }
        if (String(workflow.owner_id) !== String(req.user.id)) {
            return res.status(403).json({ error: "You do not own this workflow" });
        }

        // Step B: Find the Logic (Nodes & Edges)
        // We check if there is an active version pointer.
        let flowData = { nodes: [], edges: [] };

        if (workflow.active_version_id) {
            const activeVersion = await WorkflowVersion.findById(workflow.active_version_id);
            if (activeVersion) {
                // Return the definition so React Flow can draw it
                flowData = activeVersion.definition; 
            }
        }

        // Step C: Return Combined Data
        // The frontend gets the Name/ID (for the header) AND the Nodes (for the canvas)
        res.json({
            ...workflow.toObject(),
            nodes: flowData.nodes || [],
            edges: flowData.edges || []
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const executeWorkflow = async (req, res) => {
    try {
        const { id } = req.params;
        
        const workflow = await Workflow.findById(id);
        if (!workflow || !workflow.active_version_id) {
            return res.status(404).json({ error: "Workflow or active version not found" });
        }
        if (String(workflow.owner_id) !== String(req.user.id)) {
            return res.status(403).json({ error: "You do not own this workflow" });
        }

        const activeVersion = await WorkflowVersion.findById(workflow.active_version_id);
        const { nodes, edges } = activeVersion.definition;

        // Create Execution Instance
        const execution = await Execution.create({
            workflow_id: workflow._id,
            version_id: activeVersion._id,
            status: "PENDING",
            checkpoint: { contextData: req.body || {} },
            contextData: req.body || {},
            logs: [],
            steps: nodes.map(n => ({
                nodeId: n.id,
                label: n.data.label,
                status: "PENDING"
            }))
        });

        // Fire & Forget (run in background)
        // Note: req.io comes from server.js middleware
        runWorkflow(nodes, edges, execution, req.io).catch(err => {
            console.error("Background workflow execution failed:", err);
        });

        res.json({ success: true, executionId: execution._id, message: "Workflow triggered." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getWorkflowExecutions = async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) return res.status(404).json({ error: "Workflow not found" });
        if (String(workflow.owner_id) !== String(req.user.id)) {
            return res.status(403).json({ error: "You do not own this workflow" });
        }

        const executions = await Execution.find({ workflow_id: workflow._id })
            .sort({ startedAt: -1 })
            .limit(Number(req.query.limit || 25));

        res.json(executions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getGlobalExecutions = async (req, res) => {
    try {
        const workflows = await Workflow.find({ owner_id: req.user.id });
        const workflowIds = workflows.map(w => w._id);
        
        const executions = await Execution.find({ workflow_id: { $in: workflowIds } })
            .sort({ startedAt: -1 })
            .limit(Number(req.query.limit || 50))
            .populate('workflow_id', 'name');

        res.json(executions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) return res.status(404).json({ error: "Workflow not found" });
        if (String(workflow.owner_id) !== String(req.user.id)) {
            return res.status(403).json({ error: "You do not own this workflow" });
        }

        await Promise.all([
            WorkflowVersion.deleteMany({ workflow_id: workflow._id }),
            Execution.deleteMany({ workflow_id: workflow._id }),
            Workflow.deleteOne({ _id: workflow._id }),
        ]);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const toggleWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) return res.status(404).json({ error: "Workflow not found" });
        if (String(workflow.owner_id) !== String(req.user.id)) {
            return res.status(403).json({ error: "You do not own this workflow" });
        }

        workflow.is_active = typeof req.body.is_active === "boolean" ? req.body.is_active : !workflow.is_active;
        workflow.updatedAt = new Date();
        await workflow.save();
        res.json({ success: true, workflow });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const Blueprint = require("../models/blueprint-model");

const toggleTemplate = async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) return res.status(404).json({ error: "Workflow not found" });
        if (String(workflow.owner_id) !== String(req.user.id)) {
            return res.status(403).json({ error: "You do not own this workflow" });
        }

        if (workflow.is_template) {
            // Remove from template
            if (workflow.blueprint_id) {
                await Blueprint.findByIdAndDelete(workflow.blueprint_id);
            }
            workflow.is_template = false;
            workflow.blueprint_id = null;
        } else {
            // Add as template
            const activeVersion = await WorkflowVersion.findById(workflow.active_version_id);
            if (!activeVersion) return res.status(400).json({ error: "Workflow has no active version to share." });

            const { nodes, edges } = activeVersion.definition;
            
            // Basic sanitization
            const sanitizedNodes = (nodes || []).map(node => {
                const { data, ...rest } = node;
                const sanitizedData = { ...data };
                delete sanitizedData.token;
                delete sanitizedData.apiKey;
                delete sanitizedData.secret;
                delete sanitizedData.password;
                return { ...rest, data: sanitizedData };
            });

            const tags = (nodes || []).map(n => n.data?.app).filter(Boolean);
            
            const generateDescription = (nodesList) => {
                const trigger = nodesList.find(n => String(n.data?.nodeType).toLowerCase() === 'trigger');
                const actions = nodesList.filter(n => String(n.data?.nodeType).toLowerCase() === 'action' || String(n.data?.nodeType).toLowerCase() === 'ai agent').map(n => n.data?.app || n.data?.label);
                const uniqueActions = [...new Set(actions)].filter(Boolean);
                
                const triggerName = trigger?.data?.app || trigger?.data?.label || 'external event';
                
                if (uniqueActions.length > 0) {
                    const actionString = uniqueActions.length > 1 
                        ? `${uniqueActions.slice(0, -1).join(', ')} and ${uniqueActions[uniqueActions.length - 1]}`
                        : uniqueActions[0];
                    return `Automated workflow triggered by ${triggerName}. Autonomously executes actions across ${actionString} to streamline system operations and data flow.`;
                }
                return `Automated ${triggerName} module for seamless system integration and orchestration.`;
            };

            const User = require("../models/user.models");
            const dbUser = await User.findById(req.user.id);
            const actualAuthorName = dbUser && dbUser.name ? dbUser.name : 'System Architect';

            const blueprint = await Blueprint.create({
                name: workflow.name,
                description: workflow.description || generateDescription(nodes || []),
                category: 'Community',
                authorName: actualAuthorName,
                definition: { nodes: sanitizedNodes, edges: edges || [] },
                tags: [...new Set(tags)] // Unique tags
            });

            workflow.is_template = true;
            workflow.blueprint_id = blueprint._id;
        }

        workflow.updatedAt = new Date();
        await workflow.save();
        res.json({ success: true, workflow });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const owner_id = req.user.id;
        const [workflows, totalExecutions, completedExecutions] = await Promise.all([
            Workflow.find({ owner_id }),
            Execution.countDocuments({ 
                workflow_id: { $in: await Workflow.find({ owner_id }).distinct('_id') } 
            }),
            Execution.countDocuments({ 
                workflow_id: { $in: await Workflow.find({ owner_id }).distinct('_id') },
                status: 'COMPLETED'
            })
        ]);

        const activeWorkflows = workflows.filter(w => w.is_active).length;
        const successRate = totalExecutions > 0 ? ((completedExecutions / totalExecutions) * 100).toFixed(1) : 0;

        res.json({
            activeWorkflows,
            totalExecutions,
            successRate: `${successRate}%`,
            resourceLoad: 'Optimal' // This could be calculated from system metrics if needed
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createWorkflow,
    getworkflows,
    getWorkflowById,
    executeWorkflow,
    getWorkflowExecutions,
    getGlobalExecutions,
    getDashboardStats,
    deleteWorkflow,
    toggleWorkflow,
    toggleTemplate,
};
