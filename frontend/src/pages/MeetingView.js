// src/pages/MeetingView.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

function MeetingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await fetch(`/api/meeting/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setMeeting(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchMeeting();
  }, [id]);

  if (error) return <p style={{ color: 'red' }}>❌ {error}</p>;
  if (!meeting) return <p>Loading...</p>;

  return (
    <div style={{ backgroundColor: '#3b5120', minHeight: '100vh', padding: '20px' }}>
      <div style={{ background: '#eee', padding: '30px', borderRadius: '20px', maxWidth: '700px', margin: '0 auto' }}>
        <h3 style={{ color: '#6b4e1d' }}>MY MEETING VIEW</h3>
        <p><b>FULL NAME :</b> <span style={{ fontSize: '20px' }}>{meeting.title}</span></p>
        <p><b>DATE :</b> {new Date(meeting.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><b>NOTE :</b><br />
          <div style={{ background: '#ccc', borderRadius: '10px', padding: '10px' }}>{meeting.note}</div>
        </p>

        <p><b>AVAILABLE TIME :</b></p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {meeting.slots.map((slot, idx) => (
            <span key={idx} style={{ backgroundColor: '#ddd', padding: '5px 15px', borderRadius: '10px' }}>{slot}</span>
          ))}
        </div>

        <p><b>STATUS COLLABORATORS AND TEAMS :</b></p>
        {meeting.collaborators.map((col, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <div style={{ background: '#ccc', borderRadius: '10px', padding: '5px 10px', width: '70%' }}>{col.email}</div>
            <div style={{ background: '#fdba74', borderRadius: '10px', padding: '5px 10px' }}>{col.status}</div>
          </div>
        ))}

        <div style={{ marginTop: '20px' }}>
          <button onClick={() => navigate('/')} style={{ backgroundColor: '#a5b4fc', marginRight: '10px' }}>HOME</button>
          <button onClick={() => navigate('/calendar')} style={{ backgroundColor: '#fda4af' }}>MY MEETING</button>
        </div>
      </div>
    </div>
  );
}

export default MeetingView;
