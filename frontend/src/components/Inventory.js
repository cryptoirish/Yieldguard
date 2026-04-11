import React, { useState, useEffect } from 'react';
import { inventory as inventoryApi } from '../services/api';
import toast from 'react-hot-toast';

function Inventory() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    cost_price: '',
    expiry_date: '',
    location: ''
  });

  const presets = [
    { name: 'Milk', emoji: '🥛', defaultQty: 10, unit: 'L', defaultCost: 1.20, shelfLifeDays: 7, location: 'Walk-in Fridge' },
    { name: 'Tomatoes', emoji: '🍅', defaultQty: 5, unit: 'kg', defaultCost: 2.50, shelfLifeDays: 5, location: 'Walk-in Fridge' },
    { name: 'Eggs', emoji: '🥚', defaultQty: 30, unit: 'pcs', defaultCost: 0.25, shelfLifeDays: 14, location: 'Walk-in Fridge' },
    { name: 'Chicken', emoji: '🐔', defaultQty: 5, unit: 'kg', defaultCost: 5.00, shelfLifeDays: 5, location: 'Freezer' },
    { name: 'Cheese', emoji: '🧀', defaultQty: 2, unit: 'kg', defaultCost: 4.00, shelfLifeDays: 21, location: 'Dairy Fridge' },
    { name: 'Butter', emoji: '🧈', defaultQty: 5, unit: 'kg', defaultCost: 3.50, shelfLifeDays: 30, location: 'Dairy Fridge' }
  ];

  const fetchItems = async () => {
    try {
      const res = await inventoryApi.getAll();
      setItems(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handlePreset = async (preset) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + preset.shelfLifeDays);
    const newItem = {
      name: preset.name,
      quantity: preset.defaultQty,
      unit: preset.unit,
      cost_price: preset.defaultCost,
      expiry_date: expiry.toISOString().split('T')[0],
      location: preset.location
    };
    try {
      await inventoryApi.add(newItem);
      toast.success(`${preset.name} added to inventory`);
      fetchItems();
    } catch (err) {
      toast.error('Failed to add item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemToAdd = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        cost_price: parseFloat(formData.cost_price)
      };
      await inventoryApi.add(itemToAdd);
      toast.success('Item added');
      setShowModal(false);
      setFormData({ name: '', quantity: '', unit: 'kg', cost_price: '', expiry_date: '', location: '' });
      fetchItems();
    } catch (err) {
      toast.error('Failed to add item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      try {
        await inventoryApi.delete(id);
        toast.success('Item deleted');
        fetchItems();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: 'white' }}>📦 Inventory</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Item
        </button>
      </div>

      <div className="card">
        <div className="card-header">Quick Add Presets</div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {presets.map(preset => (
              <button key={preset.name} className="btn btn-success" onClick={() => handlePreset(preset)}>
                {preset.emoji} {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Cost (£)</th>
              <th>Expiry</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>£{item.cost_price}</td>
                <td>{item.expiry_date}</td>
                <td>{item.location || '-'}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No inventory items yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Inventory Item</h3>
              <button className="btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    className="form-select"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pieces</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cost Price (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.cost_price}
                    onChange={e => setFormData({ ...formData, cost_price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.expiry_date}
                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Walk-in Fridge"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
