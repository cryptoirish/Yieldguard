import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

function Dashboard() {
  const [stats, setStats] = useState({ low_stock_items: 0, recent_violations: 0, inventory_value: 0 });
  const [waste, setWaste] = useState({ total_waste_value: 0, breakdown: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, wasteRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/inventory/waste?period=7')
        ]);
        setStats(statsRes.data);
        setWaste(wasteRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: 'white' }}>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <div className="stat-number">{stats.low_stock_items}</div>
        </div>
        <div className="stat-card">
          <h3>HACCP Violations (24h)</h3>
          <div className="stat-number">{stats.recent_violations}</div>
        </div>
        <div className="stat-card">
          <h3>Inventory Value</h3>
          <div className="stat-number">£{stats.inventory_value.toFixed(2)}</div>
        </div>
      </div>
      <div className="stat-card">
        <h3>Wasted Stock (last 7 days)</h3>
        <div className="stat-number">£{waste.total_waste_value.toFixed(2)}</div>
        {waste.breakdown.length > 0 ? (
          waste.breakdown.map((b, i) => (
            <div key={i}>• {b.name}: £{b.wasted_value.toFixed(2)}</div>
          ))
        ) : (
          <div>No waste recorded this week</div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
// trigger rebuild).
