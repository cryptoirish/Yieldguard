import React, { useState, useEffect } from 'react';
import { haccp as haccpApi } from '../services/api';
import toast from 'react-hot-toast';

function HACCP() {
  const [logs, setLogs] = useState([]);
  const [violations, setViolations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    check_type: 'fridge',
    location: '',
    value: '',
    unit: '°C',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [logsRes, violationsRes] = await Promise.all([
        haccpApi.getLogs(),
        haccpApi.getViolations()
      ]);
      setLogs(logsRes.data);
      setViolations(violationsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load HACCP data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, value: parseFloat(formData.value) };
      const res = await haccpApi.addLog(data);
      if (!res.data.is_compliant) {
        toast.error(`⚠️ Violation: ${res.data.corrective_action}`);
      } else {
        toast.success('Reading logged');
      }
      setShowModal(false);
      setFormData({ check_type: 'fridge', location: '', value: '', unit: '°C', notes: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save reading');
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
        <h1 style={{ color: 'white' }}>🛡️ HACCP</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Reading
        </button>
      </div>

      {violations.length > 0 && (
        <div className="card">
          <div className="card-header">⚠️ Recent Violations</div>
          <div className="card-body">
            {violations.slice(0, 5).map(v => (
              <div key={v.id} className="alert alert-danger" style={{ marginBottom: '10px' }}>
                <strong>{v.location}</strong> - {v.check_type}<br />
                <small>{new Date(v.timestamp).toLocaleString()}: {v.value}°C</small><br />
                <small>Action: {v.corrective_action}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Location</th>
              <th>Type</th>
              <th>Value</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td>{log.location}</td>
                <td>{log.check_type}</td>
                <td>{log.value}{log.unit}</td>
                <td>
                  {log.is_compliant ? 
                    <span style={{ color: '#28a745' }}>✓ Compliant</span> : 
                    <span style={{ color: '#dc3545' }}>✗ Violation</span>
                  }
                </td>
                <td>{log.notes || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No HACCP logs yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New HACCP Reading</h3>
              <button className="btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Check Type</label>
                  <select
                    className="form-select"
                    value={formData.check_type}
                    onChange={e => setFormData({ ...formData, check_type: e.target.value })}
                    required
                  >
                    <option value="fridge">Refrigerator Temperature</option>
                    <option value="freezer">Freezer Temperature</option>
                    <option value="cooking_chicken">Cooking - Chicken</option>
                    <option value="cooking_beef">Cooking - Beef</option>
                    <option value="hot_holding">Hot Holding</option>
                    <option value="cold_holding">Cold Holding</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Walk-in Fridge"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    className="form-select"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="°C">°C</option>
                    <option value="°F">°F</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
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

export default HACCP;
