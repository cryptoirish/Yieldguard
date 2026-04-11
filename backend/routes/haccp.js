const express = require('express');
const router = express.Router();
const HACCP = require('../models/HACCP');

// GET all HACCP logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await HACCP.findAll(req.restaurantId);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET HACCP violations
router.get('/violations', async (req, res) => {
  try {
    const violations = await HACCP.findViolations(req.restaurantId);
    res.json(violations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch violations' });
  }
});

// POST new HACCP log
router.post('/logs', async (req, res) => {
  try {
    const { check_type, location, value, unit, notes } = req.body;
    if (!check_type || !location || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newLog = await HACCP.create(req.body, req.restaurantId);
    res.status(201).json(newLog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

module.exports = router;
