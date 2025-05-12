const express = require('express');
const supabase = require('../supabase/supabaseClient');
const router = express.Router();
const dayjs = require('dayjs');

// POST /api/invite/update-availability
router.post('/update-availability', async (req, res) => {
  const { meeting_id, invitee_id, time_ranges } = req.body;

  if (!meeting_id || !invitee_id || !Array.isArray(time_ranges)) {
    return res.status(400).json({ error: 'Missing fields or invalid format' });
  }

  try {
    const { data: hostSlots, error: slotError } = await supabase
      .from('meeting_time_slots')
      .select('time_range')
      .eq('meeting_id', meeting_id);

    if (slotError) throw slotError;

    const hostSlotSet = new Set(hostSlots.map(s => s.time_range));

    const { data: meetingData, error: meetingError } = await supabase
      .from('meetings')
      .select('date')
      .eq('id', meeting_id)
      .single();

    if (meetingError) throw meetingError;

    const today = dayjs();
    const meetingDate = dayjs(meetingData.date);
    const nowHour = today.hour();

    if (meetingDate.isBefore(today, 'day')) {
      return res.status(400).json({ error: 'Cannot edit time on past meeting date' });
    }

    const invalidTime = time_ranges.find(t => {
      if (!hostSlotSet.has(t)) return true;
      if (meetingDate.isSame(today, 'day')) {
        const startHour = parseInt(t.split(' ')[0]);
        if (startHour <= nowHour) return true;
      }
      return false;
    });

    if (invalidTime) {
      return res.status(400).json({ error: 'Some time slots are invalid or in the past' });
    }

    await supabase
      .from('invitee_time_responses')
      .delete()
      .eq('meeting_id', meeting_id)
      .eq('invitee_id', invitee_id);

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