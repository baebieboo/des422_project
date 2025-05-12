const express = require('express');
const supabase = require('../supabase/supabaseClient');
const router = express.Router();

// POST /api/meetings/create
router.post('/create', async (req, res) => {
  const { title, date, note, collaborators, slots, creator_id } = req.body;

  console.log('📥 [BACKEND] Create meeting request received:', {
    title, date, note, creator_id, slots, collaborators
  });

  if (!creator_id || !title || !date) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // 1. Insert meeting
    const { data: meetingData, error: meetingError } = await supabase
      .from('meetings')
      .insert([{ title, date, note, creator_id }])
      .select()
      .single();

    if (meetingError) throw meetingError;
    const meeting_id = meetingData.id;
    console.log(`✅ Meeting created with ID: ${meeting_id}`);

    // 2. Insert time slots
    const slotData = slots.map(time_range => ({ meeting_id, time_range, creator_id }));
    const { error: slotError } = await supabase
      .from('meeting_time_slots')
      .insert(slotData);

    if (slotError) throw slotError;
    console.log(`🕐 Time slots added: ${slots.length}`);

    const failed = [];

    // 3. Fetch all profiles once
    const { data: allProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email');

    if (profileError) {
      console.error('❌ Failed to fetch profiles:', profileError.message);
      return res.status(500).json({ error: profileError.message });
    }

    // 4. Insert invites & notifications
    if (Array.isArray(collaborators)) {
      for (const rawEmail of collaborators) {
        const cleanEmail = rawEmail.trim().toLowerCase();
        console.log("🔍 Cleaned collaborator email:", cleanEmail);

        // Match email manually (to avoid .single() crash)
        const matched = allProfiles.find(
          p => (p.email || '').trim().toLowerCase() === cleanEmail
        );

        console.log("📄 Matched profile:", matched);

        if (!matched) {
          console.warn(`⚠️ Collaborator not found: ${cleanEmail}`);
          failed.push({ email: cleanEmail, reason: 'Profile not found' });
          continue;
        }

        const invitee_id = matched.id;

        const { error: inviteError } = await supabase
          .from('meeting_invites')
          .insert([{ meeting_id, invitee_id, status: 'pending' }]);

        if (inviteError) {
          console.error(`❌ Invite insert error for ${cleanEmail}:`, inviteError.message);
          failed.push({ email: cleanEmail, reason: inviteError.message });
          continue;
        }

        const { error: notifyError } = await supabase
          .from('notifications')
          .insert([{
            user_id: invitee_id,
            meeting_id,
            message: `You were invited to a meeting: ${title}`,
            is_read: false,
          }]);

        if (notifyError) {
          console.error(`❌ Notification insert error for ${cleanEmail}:`, notifyError.message);
          failed.push({ email: cleanEmail, reason: notifyError.message });
        }
      }
    }

    return res.status(201).json({ message: '✅ Meeting created', meeting_id, failed });
  } catch (err) {
    console.error('❌ Create meeting error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create meeting' });
  }
});

module.exports = router;