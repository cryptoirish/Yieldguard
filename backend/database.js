const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  const { error } = await supabase.from('inventory_items').select('count', { count: 'exact', head: true });
  if (error) {
    console.error('Supabase connection error:', error);
    throw error;
  }
  console.log('✅ Connected to Supabase');
  return supabase;
}

function getSupabase() {
  return supabase;
}

module.exports = { initDatabase, getSupabase };
