const { getSupabase } = require('../database');

class Inventory {
  static async findAll(restaurantId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('expiry_date', { ascending: true });
    if (error) throw error;
    return data;
  }

  static async create(item, restaurantId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{
        restaurant_id: restaurantId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        cost_price: item.cost_price,
        expiry_date: item.expiry_date,
        location: item.location || null,
        category: item.category || null,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateQuantity(id, restaurantId, quantity) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ quantity })
      .eq('id', id)
      .eq('restaurant_id', restaurantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id, restaurantId) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)
      .eq('restaurant_id', restaurantId);
    if (error) throw error;
    return true;
  }

  static async calculateWaste(restaurantId, periodDays = 7) {
    const supabase = getSupabase();
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('restaurant_id', restaurantId);
    if (error) throw error;

    const today = new Date();
    const cutoff = new Date();
    cutoff.setDate(today.getDate() - periodDays);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    let totalWaste = 0;
    const breakdown = [];

    for (const item of items) {
      if (item.expiry_date >= cutoffStr && item.expiry_date < todayStr) {
        const wastedValue = item.quantity * item.cost_price;
        totalWaste += wastedValue;
        breakdown.push({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          wasted_value: wastedValue,
          expiry_date: item.expiry_date,
          location: item.location,
        });
      }
    }
    return { total_waste_value: totalWaste, breakdown };
  }
}

module.exports = Inventory;
