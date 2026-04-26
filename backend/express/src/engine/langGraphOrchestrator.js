const { StateGraph, END } = require("@langchain/langgraph");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const Execution = require("../models/execution-model");
const axios = require('axios');

// Configure Gemini
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-1.5-flash", 
  temperature: 0,
});

/**
 * Executes a LangGraph workflow based on React Flow JSON.
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @param {Object} execution - Mongoose Execution document
 * @param {Object} io - Socket.io instance
 */
const runLangGraphWorkflow = async (nodes, edges, execution, io) => {
    
    // 1. Define State
    // The state represents the shared context ("The Bag") across all nodes.
    const graphState = {
        contextData: {
            value: (x, y) => ({ ...x, ...y }),
            default: () => execution.checkpoint.contextData || {}
        },
        currentNodeId: {
            value: (x, y) => y, // Overwrite
            default: () => execution.checkpoint.currentNodeId || null
        },
        logs: {
            value: (x, y) => x.concat(y), // Append
            default: () => execution.checkpoint.logs || []
        },
        error: {
            value: (x, y) => y,
            default: () => null
        }
    };

    const workflowGraph = new StateGraph({ channels: graphState });

    // Helper: Find next node based on edges
    const getNextNodeId = (currentId, edgeLabel = null) => {
        let matchingEdges = edges.filter(e => e.source === currentId);
        if (edgeLabel && edgeLabel !== 'DEFAULT') {
             // For decision nodes
             const specificEdge = matchingEdges.find(e => e.label === edgeLabel);
             if (specificEdge) return specificEdge.target;
        }
        return matchingEdges.length > 0 ? matchingEdges[0].target : END;
    };

    // Helper: Emit logs and status
    const emitUpdate = async (status, logMessage, level = 'INFO') => {
        const logEntry = { timestamp: new Date(), level, message: logMessage };
        execution.logs.push(logEntry);
        
        if (io) {
            io.emit('workflow_log', { executionId: execution._id, log: logEntry });
            if (status) {
                io.emit('workflow_update', { 
                    executionId: execution._id, 
                    nodeId: execution.checkpoint.currentNodeId, 
                    status 
                });
            }
        }
        await execution.save();
        return [logEntry];
    };

    // 2. Define Node Handlers
    
    // Trigger / Start Node Handler
    const triggerHandler = async (state) => {
        const nodeId = state.currentNodeId;
        const node = nodes.find(n => n.id === nodeId);
        
        await emitUpdate('RUNNING', `Initializing trigger: ${node.data.label}`);
        
        // Pass payload to context
        let newContext = { ...state.contextData, _triggerTime: new Date().toISOString() };
        
        await emitUpdate('SUCCESS', `Trigger complete.`);
        return { contextData: newContext };
    };

    // Integration / Service Node Handler
    const serviceHandler = async (state) => {
        const nodeId = state.currentNodeId;
        const node = nodes.find(n => n.id === nodeId);
        
        await emitUpdate('RUNNING', `Executing service task: ${node.data.label} (${node.data.app || 'API'})`);
        
        let responseData = {};
        try {
             // Mock Integration logic based on app
             const appName = (node.data.app || '').toLowerCase();
             
             if (appName.includes('github')) {
                 responseData = { github_status: "Repo updated", commit_id: "a1b2c3d4" };
                 await new Promise(r => setTimeout(r, 800)); // Simulate latency
             } else if (appName.includes('mail')) {
                 responseData = { email_sent: true, timestamp: new Date() };
                 await new Promise(r => setTimeout(r, 600));
             } else {
                 responseData = { generic_service_called: true, app: appName };
                 await new Promise(r => setTimeout(r, 500));
             }

             await emitUpdate('SUCCESS', `Service task ${node.data.label} completed successfully.`);
             return { contextData: { ...state.contextData, [node.id]: responseData } };

        } catch (error) {
             await emitUpdate('FAILED', `Service task failed: ${error.message}`, 'ERROR');
             return { error: error.message };
        }
    };

    // AI Agent Handler (Llama 3 via Groq)
    const aiAgentHandler = async (state) => {
        const nodeId = state.currentNodeId;
        const node = nodes.find(n => n.id === nodeId);
        
        await emitUpdate('RUNNING', `Agentic reasoning initiated: ${node.data.label}`);
        
        try {
            const prompt = `
            You are an AI Agent in a workflow system. 
            Your task is: ${node.data.description || 'Analyze the context and provide a structured JSON response.'}
            Context Data: ${JSON.stringify(state.contextData)}
            
            Respond ONLY with a valid JSON object representing your decision or output.
            `;
            
            const response = await llm.invoke([
                new SystemMessage("You are a strict JSON-only AI assistant."),
                new HumanMessage(prompt)
            ]);

            let aiOutput = {};
            try {
                // Parse the JSON from the LLM
                aiOutput = JSON.parse(response.content);
            } catch (e) {
                // Fallback if LLM didn't return pure JSON
                aiOutput = { raw_response: response.content };
            }

            await emitUpdate('SUCCESS', `Agentic reasoning complete. Extracted ${Object.keys(aiOutput).length} data points.`);
            return { contextData: { ...state.contextData, [node.id]: aiOutput } };

        } catch (error) {
            await emitUpdate('FAILED', `AI Agent failure: ${error.message}`, 'ERROR');
            return { error: error.message };
        }
    };

    // Decision Logic Node Handler
    const decisionHandler = async (state) => {
        const nodeId = state.currentNodeId;
        const node = nodes.find(n => n.id === nodeId);
        
        await emitUpdate('RUNNING', `Evaluating logic gate: ${node.data.label}`);
        await new Promise(r => setTimeout(r, 500));
        
        // Simple logic evaluation (Mocked: random True/False or based on context)
        const decisionResult = Math.random() > 0.5 ? 'TRUE' : 'FALSE';
        
        await emitUpdate('SUCCESS', `Logic evaluated to: ${decisionResult}`);
        return { contextData: { ...state.contextData, [`${node.id}_decision`]: decisionResult } };
    };

    // 3. Construct Graph
    // Add nodes to the graph dynamically based on their type
    nodes.forEach(node => {
        if (node.type === 'input' || node.data.nodeType === 'Trigger') {
            workflowGraph.addNode(node.id, triggerHandler);
        } else if (node.data.label === 'AI Agent') {
            workflowGraph.addNode(node.id, aiAgentHandler);
        } else if (node.data.nodeType === 'Decision' || node.data.label === 'If' || node.data.label === 'Condition') {
            workflowGraph.addNode(node.id, decisionHandler);
        } else {
            // Default is service task
            workflowGraph.addNode(node.id, serviceHandler);
        }
    });

    // Determine entry point
    let startNode = nodes.find(n => n.type === 'input' || n.data.nodeType === 'Trigger');
    if (!startNode && nodes.length > 0) startNode = nodes[0];
    
    if (!startNode) {
        throw new Error("No start node found in workflow.");
    }
    
    workflowGraph.setEntryPoint(startNode.id);

    // Dynamic Routing Function
    const routeDecision = (state) => {
         if (state.error) return END; // Stop on error
         
         const currentNode = nodes.find(n => n.id === state.currentNodeId);
         if (!currentNode) return END;

         // If it's a decision node, route based on the context variable
         if (currentNode.data.nodeType === 'Decision' || currentNode.data.label === 'If') {
             const decision = state.contextData[`${currentNode.id}_decision`];
             return getNextNodeId(currentNode.id, decision);
         }

         return getNextNodeId(currentNode.id);
    };

    // Add Edges
    nodes.forEach(node => {
        // We use conditional edges for everything so the state machine can pause/error out or route dynamically
        workflowGraph.addConditionalEdges(node.id, routeDecision);
    });

    // 4. Compile Graph
    const app = workflowGraph.compile();

    // 5. Execute using streaming
    
    // Setup initial state
    let currentState = {
        contextData: execution.contextData || {},
        currentNodeId: startNode.id,
        logs: [],
        error: null
    };

    execution.status = 'RUNNING';
    await execution.save();

    if (io) io.emit('workflow_started', { executionId: execution._id });

    try {
        // Stream execution
        for await (const output of await app.stream(currentState)) {
            // output is a dict where keys are node names and values are the state updates from that node
            for (const [nodeId, stateUpdate] of Object.entries(output)) {
                
                // Update Checkpoint
                execution.checkpoint = {
                    contextData: stateUpdate.contextData || execution.checkpoint.contextData,
                    currentNodeId: nodeId
                };
                
                // If the node errored, halt.
                if (stateUpdate.error) {
                    execution.status = 'FAILED';
                    await emitUpdate('FAILED', `Workflow halted due to error in ${nodeId}`, 'ERROR');
                    break;
                }

                // Prepare for next node iteration by setting the checkpoint's current node to the next in sequence
                // The router actually handles this, but for visualization we might want to know.
            }
            if (execution.status === 'FAILED') break;
        }

        if (execution.status !== 'FAILED') {
            execution.status = 'COMPLETED';
            execution.completedAt = new Date();
            await emitUpdate('COMPLETED', `Workflow execution completed successfully.`, 'INFO');
            if (io) io.emit('workflow_complete', { executionId: execution._id, status: 'COMPLETED' });
        }
    } catch (e) {
        execution.status = 'FAILED';
        await emitUpdate('FAILED', `Critical graph execution failure: ${e.message}`, 'ERROR');
    }

    await execution.save();
};

module.exports = { runLangGraphWorkflow };
