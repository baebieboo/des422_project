import React, { useEffect, useState, useCallback } from 'react';

function MyInvites() {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [invites, setInvites] = useState([]);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [showModal, setShowModal] = useState(false);  // For showing the modal

  const fetchInvites = useCallback(async () => {
    try {
      const res = await fetch(`/api/invite/pending/${currentUser.id}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error fetching invites:', errorText);
        return;
      }
      const data = await res.json();
      setInvites(data);
    } catch (err) {
      console.error('❌ Fetch error:', err.message);
    }
  }, [currentUser.id]);

  useEffect(() => {
    if (currentUser?.id) fetchInvites();
  }, [currentUser?.id, fetchInvites]);

  const toggleTime = (t) => {
    setSelectedTimes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const respond = async (meeting_id, status) => {
    if (status === 'accepted') {
      setSelectedInvite(meeting_id);
      try {
        const res = await fetch(`/api/invite/slots/${meeting_id}`);
        const slots = await res.json();
        setAvailableSlots(slots);
        setShowModal(true); // Show the modal when slots are fetched
      } catch (err) {
        console.error('❌ Error fetching available slots:', err.message);
      }
    } else {
      await sendResponse(meeting_id, status);
    }
  };

  const sendResponse = async (meeting_id, status) => {
    const res = await fetch('/api/invite/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meeting_id, user_id: currentUser.id, status })
    });

    if (res.ok) {
      await fetchInvites(); // Refresh invite list after accept/decline
      setSelectedInvite(null);
      setSelectedTimes([]);
    } else {
      const err = await res.json();
      alert("❌ " + err.error);
    }
  };

  const submitAvailability = async () => {
    if (!selectedInvite || selectedTimes.length === 0) {
      alert("Please select at least one time slot");
      return;
    }

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
      alert("❌ " + result.error);
    }
  };

  const removeInvite = (meeting_id) => {
    setInvites(prev => prev.filter(invite => invite.meeting_id !== meeting_id));
  };

  // Handle accepting and declining the proposed time
  const handleModalResponse = (status) => {
    if (status === 'accepted') {
      // Add the selected time slot to the calendar here
      // You can handle this by calling another API or updating state
      alert("Appointment added to calendar!");
    }

    setShowModal(false); // Close the modal
    setSelectedInvite(null);
    setSelectedTimes([]);
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
            <button onClick={() => { respond(invite.meeting_id, 'accepted'); removeInvite(invite.meeting_id); }} style={{ marginRight: 10 }}>✅ Accept</button>
            <button onClick={() => { respond(invite.meeting_id, 'declined'); removeInvite(invite.meeting_id); }}>❌ Decline</button>
          </div>
        ))
      )}

      {showModal && selectedInvite && (
        <div style={{ marginTop: 30, borderTop: '1px solid #ccc', paddingTop: 20 }}>
          <h3>Selected Available Times</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {availableSlots.map(h => (
              <button
                key={h}
                style={{
                  backgroundColor: '#e5e7eb',
                  padding: '6px 12px',
                  borderRadius: '6px'
                }}
              >
                {h}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '15px' }}>
            <button onClick={() => handleModalResponse('accepted')} style={{ marginRight: '10px' }}>Accept</button>
            <button onClick={() => handleModalResponse('declined')}>Decline</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyInvites;
