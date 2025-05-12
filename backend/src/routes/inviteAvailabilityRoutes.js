// ✅ backend/src/routes/inviteAvailabilityRoutes.js
const express = require('express');
const supabase = require('../supabase/supabaseClient');
const router = express.Router();

// POST /api/invite/update-availability
router.post('/update-availability', async (req, res) => {
  const { meeting_id, invitee_id, time_ranges } = req.body;

  if (!meeting_id || !invitee_id || !Array.isArray(time_ranges)) {
    return res.status(400).json({ error: 'Missing fields or invalid format' });
  }

  try {
    // 1. Delete old time selections
    const { error: deleteError } = await supabase
      .from('invitee_time_responses')
      .delete()
      .eq('meeting_id', meeting_id)
      .eq('invitee_id', invitee_id);

    if (deleteError) throw deleteError;

    // 2. Insert new selected time ranges
    const inserts = time_ranges.map(time => ({
      meeting_id,
      invitee_id,
      time_range: time,
      is_available: true
    }));

    const { error: insertError } = await supabase
      .from('invitee_time_responses')
      .insert(inserts);

    if (insertError) throw insertError;

    res.json({ message: '✅ Availability updated' });
  } catch (err) {
    console.error('❌ Update availability error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
