const dotenv = require("dotenv");
dotenv.config();

console.log("🔍 ENV CHECK:", {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV
});

const config = {
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "", // ✅ เพิ่ม service role key
  port: process.env.PORT || "5000",
  nodeEnv: process.env.NODE_ENV || "",
};

module.exports = { config };