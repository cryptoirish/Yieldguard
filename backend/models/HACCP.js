const { getSupabase } = require('../database');

class HACCP {
  static async findAll(restaurantId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('haccp_logs')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async findViolations(restaurantId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('haccp_logs')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_compliant', false)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async create(log, restaurantId) {
    const supabase = getSupabase();
    const thresholds = {
      fridge: { min: 0, max: 5 },
      freezer: { max: -18 },
      cooking_chicken: { min: 75 },
      cooking_beef: { min: 63 },
      hot_holding: { min: 60 },
      cold_holding: { max: 5 }
    };
    let isCompliant = true;
    let correctiveAction = null;
    if (thresholds[log.check_type]) {
      const t = thresholds[log.check_type];
      if (t.min !== undefined && log.value < t.min) {
        isCompliant = false;
        correctiveAction = `Temperature too low. Minimum required: ${t.min}°C`;
      } else if (t.max !== undefined && log.value > t.max) {
        isCompliant = false;
        correctiveAction = `Temperature too high. Maximum allowed: ${t.max}°C`;
      }
    }
    const { data, error } = await supabase
      .from('haccp_logs')
      .insert([{
        restaurant_id: restaurantId,
        check_type: log.check_type,
        location: log.location,
        value: log.value,
        unit: log.unit || '°C',
        is_compliant: isCompliant,
        notes: log.notes || null,
        corrective_action: correctiveAction,
      }])
      .select()
      .single();
    if (error) throw error;
    return { ...data, is_compliant: isCompliant, corrective_action: correctiveAction };
  }
}

module.exports = HACCP;
