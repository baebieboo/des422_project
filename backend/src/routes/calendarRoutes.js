const express = require('express');
const supabase = require('../supabase/supabaseClient');
const router = express.Router();

// ✅ 1. Get all meetings where user is host or invited
router.get('/meetings/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data: hosted, error: hostedErr } = await supabase
    .from('meetings')
    .select('*')
    .eq('creator_id', userId);

  const { data: invited, error: invitedErr } = await supabase
    .from('meeting_invites')
    .select('meeting_id, meetings(*)')
    .eq('invitee_id', userId);

  if (hostedErr || invitedErr) {
    return res.status(500).json({ error: hostedErr?.message || invitedErr?.message });
  }

  const invitedMeetings = invited.map(i => i.meetings);
  const allMeetings = [...hosted, ...invitedMeetings];

  res.json({ meetings: allMeetings });
});

// ✅ 2. Get time slots for a meeting
router.get('/slots/:meetingId', async (req, res) => {
  const { meetingId } = req.params;

  const { data, error } = await supabase
    .from('meeting_time_slots')
    .select('*')
    .eq('meeting_id', meetingId);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ slots: data });
});

// ✅ 3. Get availability of this user for a meeting
router.get('/availability/:meetingId/:userId', async (req, res) => {
  const { meetingId, userId } = req.params;

  const { data, error } = await supabase
    .from('invitee_time_responses')
    .select('*')
    .eq('meeting_id', meetingId)
    .eq('invitee_id', userId);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ responses: data });
});

// ✅ 4. Update or insert availability
router.post('/availability', async (req, res) => {
  const { meeting_id, invitee_id, time_range, is_available } = req.body;

  const { data: existing, error: findError } = await supabase
    .from('invitee_time_responses')
    .select('*')
    .eq('meeting_id', meeting_id)
    .eq('invitee_id', invitee_id)
    .eq('time_range', time_range)
    .single();

  if (findError && findError.code !== 'PGRST116') {
    return res.status(500).json({ error: findError.message });
  }

  let result;
  if (existing) {
    result = await supabase
      .from('invitee_time_responses')
      .update({ is_available })
      .eq('id', existing.id);
  } else {
    result = await supabase.from('invitee_time_responses').insert([
      { meeting_id, invitee_id, time_range, is_available },
    ]);
  }

  if (result.error) {
    return res.status(500).json({ error: result.error.message });
  }

  res.status(200).json({ message: '✅ Availability updated' });
});

// ✅ 5. Get pending meetings created by host
router.get('/host-pending/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('id, date')
    .eq('creator_id', userId);

  if (error) return res.status(500).json({ error: error.message });

  const results = [];

  for (const meeting of meetings) {
    const { data: invites, error: inviteError } = await supabase
      .from('meeting_invites')
      .select('status')
      .eq('meeting_id', meeting.id);

    if (inviteError) continue;

    const hasPending = invites.some(i => i.status === 'pending');
    if (hasPending) {
      results.push({ date: meeting.date, status: 'pending' });
    }
  }

  res.json(results);
});

module.exports = router;