const express = require('express');
const supabase = require('../supabase/supabaseClient');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  console.log("🔐 Login request:", { email });

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data?.user) {
      console.error("❌ Login failed:", error);
      return res.status(401).json({ error: error?.message || 'Login failed.' });
    }

    console.log("✅ Login success:", data.user.id);

    // ดึงข้อมูลเพิ่มเติมจากตาราง profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.warn("⚠️ Cannot fetch profile:", profileError.message);
    }

    return res.status(200).json({
      message: '✅ Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name || '',
        phone_number: profile?.phone_number || ''
      }
    });

  } catch (err) {
    console.error("❌ Server error during login:", err);
    return res.status(500).json({ error: err.message || 'Unexpected server error' });
  }
});

module.exports = router;