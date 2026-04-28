const Table = require('../models/table-model');
const TableRecord = require('../models/tableRecord-model');
const AIService = require('../services/AIService');

exports.createTable = async (req, res) => {
  try {
    const table = await Table.create({
      ...req.body,
      owner_id: req.user.id
    });
    res.json({ status: 'success', table });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find({ owner_id: req.user.id });
    res.json({ status: 'success', tables });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.addRecord = async (req, res) => {
  try {
    const { tableId, data } = req.body;
    const table = await Table.findById(tableId);
    
    if (!table) return res.status(404).json({ message: "Table not found" });

    // AI Field Processing
    for (const col of table.columns) {
      if (col.type === 'ai' && col.ai_prompt) {
        // Only generate if not already provided or if it's explicitly an AI field
        data[col.name] = await AIService.generateForRow(col.ai_prompt, data);
      }
    }

    const record = await TableRecord.create({
      table_id: tableId,
      data,
      owner_id: req.user.id
    });

    res.json({ status: 'success', record });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getRecords = async (req, res) => {
  try {
    const records = await TableRecord.find({ table_id: req.params.tableId });
    res.json({ status: 'success', records });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
