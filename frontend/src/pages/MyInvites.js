// src/pages/MyInvites.js
import React, { useEffect, useState, useCallback } from 'react';

function MyInvites() {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [invites, setInvites] = useState([]);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);

  const fetchInvites = useCallback(async () => {
    try {
      const res = await fetch(`/api/invite/pending/${currentUser.id}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error fetching invites:', errorText);
        return;
      }
      const data = await res.json();
      console.log('📥 Invites:', data);
      setInvites(data);
    } catch (err) {
      console.error('❌ Fetch error:', err.message);
    }
  }, [currentUser.id]);

  useEffect(() => {
    if (currentUser?.id) fetchInvites();
  }, [currentUser?.id, fetchInvites]);

  const toggleTime = (t) => {
    setSelectedTimes(prev => (
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    ));
  };

  const respond = async (meeting_id, status) => {
    if (status === 'accepted') {
      try {
        const res = await fetch(`/api/invite/slots/${meeting_id}`);
        if (!res.ok) {
          const err = await res.text();
          console.error('❌ Failed to fetch slots:', err);
          return;
        }
        const slots = await res.json();
        setSelectedInvite(meeting_id);
        setAvailableSlots(slots);
      } catch (err) {
        console.error('❌ Error loading slots:', err.message);
      }
    } else {
      await sendResponse(meeting_id, status);
    }
  };

  const sendResponse = async (meeting_id, status) => {
    try {
      const res = await fetch('/api/invite/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_id, user_id: currentUser.id, status })
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message);
        await fetchInvites(); // รีโหลดใหม่
        setSelectedInvite(null);
        setSelectedTimes([]);
      } else {
        alert("❌ Error: " + result.error);
      }
    } catch (err) {
      alert("❌ Network error: " + err.message);
    }
  };

  const submitAvailability = async () => {
    if (!selectedInvite || selectedTimes.length === 0) {
      alert("Please select at least one time slot");
      return;
    }

    try {
      const res = await fetch('/api/invite/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_id: selectedInvite,
          invitee_id: currentUser.id,
          time_ranges: selectedTimes
        })
      });

      const result = await res.json();

      if (res.ok) {
        await sendResponse(selectedInvite, 'accepted');
      } else {
        alert("❌ Failed to save availability: " + result.error);
      }
    } catch (err) {
      alert("❌ Network error: " + err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📬 My Meeting Invitations</h2>

      {invites.length === 0 ? (
        <p>No pending invitations.</p>
      ) : (
        invites.map(invite => (
          <div key={invite.meeting_id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}>
            <p><b>From:</b> {invite.creator_email}</p>
            <p><b>Meeting:</b> {invite.meeting_title}</p>
            <p><b>Date:</b> {invite.date}</p>
            <p><b>Note:</b> {invite.note}</p>
            <button onClick={() => respond(invite.meeting_id, 'accepted')} style={{ marginRight: 10 }}>✅ Accept</button>
            <button onClick={() => respond(invite.meeting_id, 'declined')}>❌ Decline</button>
          </div>
        ))
      )}

      {selectedInvite && availableSlots.length > 0 && (
        <div style={{ marginTop: 30, borderTop: '1px solid #ccc', paddingTop: 20 }}>
          <h3>Select Available Time</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {availableSlots.map(h => (
              <button
                key={h}
                onClick={() => toggleTime(h)}
                style={{
                  backgroundColor: selectedTimes.includes(h) ? '#86efac' : '#e5e7eb',
                  padding: '6px 12px',
                  borderRadius: '6px'
                }}
              >
                {h}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '15px' }}>
            <button onClick={submitAvailability} style={{ marginRight: '10px' }}>Submit</button>
            <button onClick={() => { setSelectedInvite(null); setSelectedTimes([]); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyInvites;