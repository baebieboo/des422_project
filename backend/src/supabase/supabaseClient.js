const { createClient } = require('@supabase/supabase-js');
const { config } = require('./config');

// ตรวจสอบว่ามีค่าครบไหม
if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase URL or Service Role Key in .env');
  process.exit(1);
}

// ✅ ใช้ Service Role Key แทน anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
module.exports = supabase;