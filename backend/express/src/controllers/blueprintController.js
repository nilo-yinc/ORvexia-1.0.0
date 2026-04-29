const Blueprint = require('../models/blueprint-model');

exports.listBlueprints = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const blueprints = await Blueprint.find(query).sort({ isFeatured: -1, popularity: -1 });
    res.json(blueprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBlueprint = async (req, res) => {
  try {
    const blueprint = await Blueprint.findById(req.params.id);
    if (!blueprint) return res.status(404).json({ error: 'Blueprint not found' });
    res.json(blueprint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.shareBlueprint = async (req, res) => {
  try {
    const { name, description, category, definition, tags } = req.body;
    
    // Basic sanitization: remove common sensitive keys from node data
    const sanitizedNodes = (definition.nodes || []).map(node => {
      const { data, ...rest } = node;
      const sanitizedData = { ...data };
      delete sanitizedData.token;
      delete sanitizedData.apiKey;
      delete sanitizedData.secret;
      delete sanitizedData.password;
      return { ...rest, data: sanitizedData };
    });

    const blueprint = await Blueprint.create({
      name,
      description,
      category,
      definition: { nodes: sanitizedNodes, edges: definition.edges },
      tags
    });

    res.status(201).json(blueprint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.seedPowerTrio = async () => {
  const count = await Blueprint.countDocuments({ name: 'The Power-Trio: Gmail -> AI -> Slack -> Notion' });
  if (count === 0) {
    await Blueprint.create({
      name: 'The Power-Trio: Gmail -> AI -> Slack -> Notion',
      description: 'The ultimate automation. Summarize unread emails with AI, notify your team in Slack, and log the contact in Notion automatically.',
      category: 'Productivity',
      isFeatured: true,
      tags: ['AI', 'Gmail', 'Slack', 'Notion'],
      definition: {
        nodes: [
          { id: 'node_0', type: 'custom', position: { x: 100, y: 250 }, data: { label: 'Gmail', nodeType: 'Trigger', app: 'Gmail', action: 'new_email', icon: 'gmail' } },
          { id: 'node_1', type: 'custom', position: { x: 400, y: 250 }, data: { label: 'AI Agent', nodeType: 'Action', app: 'AI', action: 'summarize', prompt: 'Summarize this email in 2 sentences.', icon: 'ai' } },
          { id: 'node_2', type: 'custom', position: { x: 700, y: 150 }, data: { label: 'Slack', nodeType: 'Action', app: 'Slack', action: 'send_message', message: 'New lead from {{node_0.Sender}}: {{node_1.Agent_Response}}', icon: 'slack' } },
          { id: 'node_3', type: 'custom', position: { x: 700, y: 350 }, data: { label: 'Notion', nodeType: 'Action', app: 'Notion', action: 'create_page', content: 'Sender: {{node_0.Sender}}\nSummary: {{node_1.Agent_Response}}', icon: 'notion' } }
        ],
        edges: [
          { id: 'e0-1', source: 'node_0', target: 'node_1', animated: true },
          { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e1-3', source: 'node_1', target: 'node_3', animated: true }
        ]
      }
    });
    console.log('[Blueprint] Power-Trio seeded successfully.');
  }
};
