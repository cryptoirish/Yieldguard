require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

initDatabase().catch(console.error);

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Protected routes
const auth = require('./middleware/auth');
app.use('/api/inventory', auth, require('./routes/inventory'));
app.use('/api/haccp', auth, require('./routes/haccp'));

// Simple test route
app.get('/api/test', (req, res) => res.json({ message: 'API works' }));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
