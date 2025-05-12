// backend/src/routes/meetingViewRoutes.js
const express = require('express');
const supabase = require('../supabase/supabaseClient');
const router = express.Router();

// GET /api/meeting/:id
router.get('/:id', async (req, res) => {
  const meeting_id = req.params.id;

  try {
    // 1. ดึง meeting หลัก
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meeting_id)
      .single();

    if (meetingError) throw meetingError;

    // 2. ดึง time slots ของ meeting นั้น
    const { data: slots, error: slotError } = await supabase
      .from('meeting_time_slots')
      .select('time_range')
      .eq('meeting_id', meeting_id);

    if (slotError) throw slotError;

    // 3. ดึง collaborator status จาก meeting_invites
    const { data: invites, error: inviteError } = await supabase
      .from('meeting_invites')
      .select('invitee_id, status')
      .eq('meeting_id', meeting_id);

    if (inviteError) throw inviteError;

    // 4. Map uid เป็น email จาก profiles
    const collaboratorResults = await Promise.all(invites.map(async (i) => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', i.invitee_id)
        .single();
      return {
        email: profile?.email || '(unknown)',
        status: i.status
      };
    }));

    return res.status(200).json({
      title: meeting.title,
      date: meeting.date,
      note: meeting.note,
      slots: slots.map(s => s.time_range),
      collaborators: collaboratorResults
    });
  } catch (err) {
    console.error('❌ Error fetching meeting details:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch meeting' });
  }
});

module.exports = router;