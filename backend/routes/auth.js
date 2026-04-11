const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSupabase } = require('../database');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, restaurant_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const supabase = getSupabase();
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create restaurant
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .insert([{ name: restaurant_name || email, email }])
    .select()
    .single();

  if (restaurantError) {
    return res.status(400).json({ error: restaurantError.message });
  }

  // Create user
  const { error: userError } = await supabase
    .from('users')
    .insert([{
      email,
      password_hash: hashedPassword,
      restaurant_id: restaurant.id,
    }]);

  if (userError) {
    // Rollback: delete the restaurant if user creation fails
    await supabase.from('restaurants').delete().eq('id', restaurant.id);
    return res.status(400).json({ error: userError.message });
  }

  // Generate JWT
  const token = jwt.sign(
    { id: restaurant.id, email, restaurant_id: restaurant.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, restaurant_id: restaurant.id });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const supabase = getSupabase();

  // Find user by email
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*, restaurants(id)')
    .eq('email', email)
    .single();

  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Compare password
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email, restaurant_id: user.restaurant_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, restaurant_id: user.restaurant_id });
});

module.exports = router;
