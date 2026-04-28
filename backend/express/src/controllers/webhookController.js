const Workflow = require('../models/workflow-model');
const WorkflowVersion = require('../models/workflowVersion-model');
const Execution = require('../models/execution-model');
const { runWorkflow } = require('../engine/workflowRunner');

const webhook = async (req, res) => {
    try {
        const { slug } = req.params;
        const inputData = req.body; // e.g., { "order_id": 123 }

        const workflow = await Workflow.findOne({ triggerSlug: slug });
        console.log(`Webhook triggered for slug: ${slug}`);
        
        if (!workflow) {
            return res.status(404).json({ error: "Workflow not found" });
        }
        if (!workflow.is_active) {
            return res.status(409).json({ error: "Workflow is paused" });
        }
        
        if (!workflow.active_version_id) {
            return res.status(400).json({ error: "Workflow has no active version" });
        }

        const activeVersion = await WorkflowVersion.findById(workflow.active_version_id);
        if (!activeVersion) {
            return res.status(500).json({ error: "Active version definition missing" });
        }

        const execution = await Execution.create({
            workflow_id: workflow._id,
            version_id: activeVersion._id,
            status: 'PENDING',
            checkpoint: { contextData: inputData },
            contextData: inputData,
            steps: (activeVersion.definition.nodes || []).map(node => ({
                nodeId: node.id,
                label: node.data?.label || node.id,
                status: "PENDING",
            })),
        });

        // Trigger the engine asynchronously (Fire and Forget)
        // Pass req.io which was attached in server.js
        runWorkflow(
            activeVersion.definition.nodes, 
            activeVersion.definition.edges, 
            execution, 
            req.io
        ).catch(err => {
            console.error("Async Workflow Execution Error:", err);
        });

        // Return immediately
        res.json({ 
            status: "started", 
            executionId: execution._id,
            message: "Workflow execution initiated"
        });

    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { webhook };
