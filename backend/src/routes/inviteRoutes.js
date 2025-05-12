const express = require('express');
const supabase = require('../supabase/supabaseClient');
const router = express.Router();

// 1. GET pending invites with meeting + creator email
router.get('/pending/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from('meeting_invites')
    .select(`
      meeting_id,
      status,
      meetings(
        title,
        date,
        note,
        creator_id
      ),
      profiles(
        email
      )
    `)
    .eq('invitee_id', user_id)
    .eq('status', 'pending');

  if (error) return res.status(500).json({ error: error.message });

  const formatted = data.map(invite => ({
    meeting_id: invite.meeting_id,
    status: invite.status,
    meeting_title: invite.meetings?.title,
    date: invite.meetings?.date,
    note: invite.meetings?.note,
    creator_email: invite.profiles?.email || 'unknown'
  }));

  res.json(formatted);
});

// 2. GET available slots for a meeting
router.get('/slots/:meeting_id', async (req, res) => {
  const { meeting_id } = req.params;
  const { data, error } = await supabase
    .from('meeting_time_slots')
    .select('time_range')
    .eq('meeting_id', meeting_id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(s => s.time_range));
});

// 3. POST respond to invite
router.post('/respond', async (req, res) => {
  const { meeting_id, user_id, status } = req.body;
  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { data, error } = await supabase
  .from('meeting_invites')
  .select(`
    meeting_id,
    status,
    meetings(title, date, note, creator_id),
    profiles(email)
  `)
  .eq('invitee_id', user_id)
  .eq('status', 'pending');

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: `✅ Invitation ${status}` });
});

// 4. POST submit availability
router.post('/availability', async (req, res) => {
  const { meeting_id, invitee_id, time_ranges } = req.body;

  if (!meeting_id || !invitee_id || !Array.isArray(time_ranges)) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const inserts = time_ranges.map(time => ({
    meeting_id,
    invitee_id,
    time_range: time,
    is_available: true
  }));

  const { error } = await supabase
    .from('invitee_time_responses')
    .insert(inserts);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: '✅ Availability saved' });
});

// 5. GET accepted meetings for calendar display
router.get('/accepted/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from('meeting_invites')
    .select(`
      meeting_id,
      status,
      meetings (
        title,
        date
      )
    `)
    .eq('invitee_id', user_id)
    .eq('status', 'accepted');

  if (error) return res.status(500).json({ error: error.message });

  const formatted = data.map(item => ({
    meeting_id: item.meeting_id,
    title: item.meetings?.title,
    date: item.meetings?.date
  }));

  res.json(formatted);
});

module.exports = router;