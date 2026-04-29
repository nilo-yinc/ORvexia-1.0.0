const mongoose = require('mongoose');
const WorkflowVersion = require('./models/workflowVersion-model');
require('dotenv').config({ path: '../.env' });

async function fixAllPositions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const versions = await WorkflowVersion.find({});
        console.log(`Found ${versions.length} versions`);

        let fixedCount = 0;
        for (const version of versions) {
            let changed = false;
            if (version.definition && Array.isArray(version.definition.nodes)) {
                version.definition.nodes = version.definition.nodes.map((node, index) => {
                    if (!node.position || typeof node.position.x === 'undefined' || typeof node.position.y === 'undefined') {
                        console.log(`Fixing node ${node.id} in version ${version._id}`);
                        changed = true;
                        return {
                            ...node,
                            position: { x: 250 + (index * 300), y: 200 }
                        };
                    }
                    return node;
                });
            }

            if (changed) {
                version.markModified('definition');
                await version.save();
                fixedCount++;
            }
        }

        console.log(`Fixed ${fixedCount} versions`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixAllPositions();
