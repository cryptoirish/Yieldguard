require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase, getSupabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 
app.get('/api/test', (req, res) => res.json({ message: 'API works' }));

initDatabase().catch(console.error);

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Protected routes
const auth = require('./middleware/auth');
app.use('/api/inventory', auth, require('./routes/inventory'));
app.use('/api/haccp', auth, require('./routes/haccp'));
app.get('/api/test', (req, res) => res.json({ message: 'API works' }));

// Dashboard stats (protected)
app.get('/api/dashboard/stats', auth, async (req, res) => {
  const supabase = getSupabase();
  const restaurantId = req.user.restaurant_id;
  const today = new Date().toISOString().split('T')[0];

  try {
    const { data: lowStock } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .lte('quantity', 0);
    
    const { data: violations } = await supabase
      .from('haccp_logs')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('is_compliant', false)
      .gte('timestamp', new Date(Date.now() - 86400000).toISOString());
    
    const { data: items } = await supabase
      .from('inventory_items')
      .select('quantity, cost_price')
      .eq('restaurant_id', restaurantId);
    
    const inventoryValue = items?.reduce((sum, i) => sum + (i.quantity * i.cost_price), 0) || 0;

    res.json({
      today_reservations: 0,
      total_covers: 0,
      low_stock_items: lowStock?.length || 0,
      recent_violations: violations?.length || 0,
      inventory_value: inventoryValue,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
