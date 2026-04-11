const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// GET all inventory items
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.findAll(req.restaurantId);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// POST new inventory item
router.post('/', async (req, res) => {
  try {
    const { name, quantity, unit, cost_price, expiry_date, location, category } = req.body;
    if (!name || quantity === undefined || !unit || cost_price === undefined || !expiry_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newItem = await Inventory.create(req.body, req.restaurantId);
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT update item quantity
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ error: 'Quantity required' });
    }
    const updated = await Inventory.updateQuantity(req.params.id, req.restaurantId, quantity);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE inventory item
router.delete('/:id', async (req, res) => {
  try {
    await Inventory.delete(req.params.id, req.restaurantId);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// GET waste summary
router.get('/waste', async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 7;
    const waste = await Inventory.calculateWaste(req.restaurantId, period);
    res.json(waste);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate waste' });
  }
});

module.exports = router;
