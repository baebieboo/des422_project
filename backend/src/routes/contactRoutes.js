const express = require('express');
const supabase = require('../supabase/supabaseClient');

const router = express.Router();

router.post('/sendMessage', async (req, res) => {
  const { full_name, email, subject, message } = req.body;

  const { data, error } = await supabase.from('messages').insert([
    { full_name, email, subject, message },
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Message sent successfully', data });
});

module.exports = router;