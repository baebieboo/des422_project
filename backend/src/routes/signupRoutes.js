const express = require('express');
const supabase = require('../supabase/supabaseClient');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, full_name, phone_number, password, confirm_password } = req.body;
  const cleanEmail = email?.trim().toLowerCase();

  console.log("📥 New signup request received:", { cleanEmail, full_name, phone_number });

  // 1. ตรวจสอบค่าว่าง
  if (!cleanEmail || !full_name || !password || !confirm_password) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  // 2. ตรวจสอบความยาวของ password
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // 3. ตรวจสอบว่า password ตรงกับ confirm_password
  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  try {
    // 4. สมัครสมาชิกผ่าน Supabase Auth
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: cleanEmail,
      password
    });

    if (signupError) {
      console.error("❌ Signup error:", signupError);
      return res.status(400).json({ error: signupError.message || 'Signup failed.' });
    }

    const userId = signupData?.user?.id;
    if (!userId) {
      return res.status(500).json({ error: 'Failed to retrieve user ID after signup.' });
    }

    // ✅ 5. อัปเดต profiles หลัง trigger สร้างข้อมูล
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name,
        phone_number
      })
      .eq('id', userId);

    if (updateError) {
      console.error("❌ Profile update error:", updateError);
      return res.status(500).json({ error: updateError.message || 'Failed to update profile.' });
    }

    console.log("✅ Signup completed:", { userId });
    return res.status(201).json({ message: '✅ Account created successfully!' });

  } catch (err) {
    console.error("❌ Unexpected server error:", err);
    return res.status(500).json({ error: err.message || 'Server error occurred.' });
  }
});

module.exports = router;