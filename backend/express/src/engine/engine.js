const axios = require('axios');

const runWorkflow = async (nodes, edges, execution, socket) => {
    let currentData = execution.contextData;
    
    // Simple Traversal: Find Start -> Find Next
    // Note: For MVP, we assume a simple linear chain based on edges
    // Find the starting node (usually type 'input' or 'Trigger' or has no incoming edges)
    // Based on the provided frontend code, the start node has type 'input' and data.nodeType 'Trigger'
    let currentNode = nodes.find(n => n.type === 'input' || (n.data && n.data.nodeType === 'Trigger'));

    // If no explicit start node found, take the first one (fallback)
    if (!currentNode && nodes.length > 0) {
        currentNode = nodes[0];
    }

    while (currentNode) {
        try {
            console.log(`Executing node: ${currentNode.id} (${currentNode.data.label})`);
            
            // 1. Log Step: Started
            // Check if step already exists (e.g. restart) or push new
            const stepIndex = execution.steps.findIndex(s => s.nodeId === currentNode.id);
            if (stepIndex === -1) {
                execution.steps.push({
                    nodeId: currentNode.id,
                    label: currentNode.data.label,
                    status: 'RUNNING',
                    startedAt: new Date()
                });
            } else {
                execution.steps[stepIndex].status = 'RUNNING';
                execution.steps[stepIndex].startedAt = new Date();
            }
            
            await execution.save(); // Save to DB so frontend sees "Yellow"
            
            if (socket) {
                socket.emit('workflow_update', { 
                    executionId: execution._id, 
                    nodeId: currentNode.id, 
                    status: 'RUNNING' 
                });
            }

            // 2. Execute Task (Call FastAPI)
            // Check if it is an action/service task
            // Based on frontend 'popularApps', actions are nodes that aren't triggers.
            // We need a way to determine the service URL. 
            // For this MVP, we will map based on the 'app' name or 'label' to the FastAPI endpoints.
            
            let responseData = null;
            
            if (currentNode.data && currentNode.data.app) {
                const appName = currentNode.data.app.toLowerCase();
                const eventName = currentNode.data.event || ''; // Trigger/Action name
                
                let serviceUrl = null;
                let payload = { ...currentData };

                // Map apps to FastAPI endpoints
                // E-Commerce
                if (appName.includes('inventory') || (appName.includes('excel') && eventName.includes('Row'))) { 
                    // Simulation: Mapping Excel 'Add Row' or similar to Inventory Check for demo
                    // Or strictly follow PRD Mapping:
                    // E-commerce companies (order processing) -> /ecommerce/...
                    serviceUrl = 'http://localhost:8000/ecommerce/inventory/check';
                    // fastAPI expects 'sku'
                    if (!payload.sku) payload.sku = "GADGET-001"; 
                } else if (appName.includes('shipping') || appName.includes('stripe')) {
                    serviceUrl = 'http://localhost:8000/ecommerce/shipping/label';
                    if (!payload.address) payload.address = "123 Main St";
                    if (!payload.weight) payload.weight = 2.5;
                }
                // Marketing
                else if (appName.includes('mailchimp') || appName.includes('gmail') || appName.includes('email')) {
                    serviceUrl = 'http://localhost:8000/marketing/campaign/send';
                    if (!payload.subject) payload.subject = "Welcome!";
                    if (!payload.recipient_count) payload.recipient_count = 100;
                }
                // DevOps
                else if (appName.includes('github') || appName.includes('deployment')) {
                    serviceUrl = 'http://localhost:8000/devops/deployment/trigger';
                    if (!payload.repo_url) payload.repo_url = "https://github.com/example/repo";
                }

                if (serviceUrl) {
                    console.log(`Calling Worker: ${serviceUrl}`);
                    const response = await axios.post(serviceUrl, payload);
                    responseData = response.data;
                    
                    // Update "The Bag" (Context)
                    currentData = { ...currentData, ...responseData };
                }
            } else if (currentNode.data && currentNode.data.nodeType === 'Trigger') {
                // Pass through for trigger
                responseData = { triggered: true };
            }

            // 3. Success Update
            const successStepIndex = execution.steps.findIndex(s => s.nodeId === currentNode.id);
            if (successStepIndex > -1) {
                execution.steps[successStepIndex].status = 'SUCCESS';
                execution.steps[successStepIndex].output = responseData || {};
                execution.steps[successStepIndex].completedAt = new Date();
            }
            
            // Update Global Context in DB
            execution.contextData = currentData;
            
            if (socket) {
                socket.emit('workflow_update', { 
                    executionId: execution._id, 
                    nodeId: currentNode.id, 
                    status: 'SUCCESS',
                    output: responseData
                });
            }

            await execution.save(); // Save "Green" status

            // 4. Find Next Node
            const edge = edges.find(e => e.source === currentNode.id);
            if (!edge) {
                console.log("End of workflow chain reached.");
                break;
            }
            currentNode = nodes.find(n => n.id === edge.target);

            // Optional: Small delay to visualize the flow
            await new Promise(r => setTimeout(r, 1000));

        } catch (error) {
            console.error(`Error in node ${currentNode.id}:`, error.message);
            // Handle Failure
            const stepIndex = execution.steps.findIndex(s => s.nodeId === currentNode.id);
            if(stepIndex > -1) {
                execution.steps[stepIndex].status = 'FAILED';
                execution.steps[stepIndex].error = error.message;
            }
            execution.status = 'FAILED';
            await execution.save();
            
            if (socket) {
                socket.emit('workflow_update', { 
                    executionId: execution._id, 
                    nodeId: currentNode.id, 
                    status: 'FAILED',
                    error: error.message
                });
            }
            return; // Stop engine
        }
    }

    execution.status = 'COMPLETED';
    execution.completedAt = new Date();
    await execution.save();
    
    if (socket) {
        socket.emit('workflow_complete', { executionId: execution._id, status: 'COMPLETED' });
    }
}

module.exports = { runWorkflow };
