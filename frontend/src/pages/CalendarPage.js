// src/pages/CalendarPage.js
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import '../App.css';

const hours = [
  '6 AM - 7 AM', '7 AM - 8 AM', '8 AM - 9 AM',
  '9 AM - 10 AM', '10 AM - 11 AM', '11 AM - 12 PM',
  '1 PM - 2 PM', '2 PM - 3 PM', '3 PM - 4 PM',
  '4 PM - 5 PM', '5 PM - 6 PM'
];

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function CalendarPage() {
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedYear] = useState(dayjs().year());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [collab, setCollab] = useState('');
  const [hostMeetings, setHostMeetings] = useState([]);
  const [acceptedMeetings, setAcceptedMeetings] = useState([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const dateStr = dayjs().year(selectedYear).month(selectedMonth).format('YYYY-MM');
        const res = await fetch(`/api/invitee/availability/${currentUser.id}?month=${dateStr}`);
        if (!res.ok) {
          const text = await res.text();
          console.error("❌ Error fetching availability:", text);
          return;
        }
        const data = await res.json();
        setAvailableTimes(data);
      } catch (err) {
        console.error("❌ Network error:", err.message);
      }
    };
    fetchAvailability();
  }, [selectedMonth, selectedYear, currentUser.id]);

  useEffect(() => {
    const fetchHostMeetings = async () => {
      try {
        const res = await fetch(`/api/calendar/host-pending/${currentUser.id}`);
        if (!res.ok) {
          const text = await res.text();
          console.error("❌ Error fetching host meetings:", text);
          return;
        }
        const data = await res.json();
        setHostMeetings(data);
      } catch (err) {
        console.error("❌ Network error:", err.message);
      }
    };
    fetchHostMeetings();
  }, [currentUser.id]);

  useEffect(() => {
    const fetchAcceptedMeetings = async () => {
      try {
        const res = await fetch(`/api/invite/accepted/${currentUser.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAcceptedMeetings(data);
      } catch (err) {
        console.error("❌ Error fetching accepted meetings:", err.message);
      }
    };
    fetchAcceptedMeetings();
  }, [currentUser.id]);

  const getDaysInMonth = () => {
    const start = dayjs().year(selectedYear).month(selectedMonth).startOf('month');
    const end = dayjs().year(selectedYear).month(selectedMonth).endOf('month');
    const days = [];
    for (let i = 0; i < start.day(); i++) days.push(null);
    for (let d = 1; d <= end.date(); d++) {
      days.push(dayjs().year(selectedYear).month(selectedMonth).date(d));
    }
    return days;
  };

  const handleCreateMeeting = (date) => {
    setSelectedDate(date);
    setShowPopup(true);
  };

  const handleTimeEdit = (date, meeting_id, existingTimes) => {
    setSelectedDate(date);
    setEditingMeetingId(meeting_id);
    setSelectedTimes(existingTimes || []);
    setShowPopup(true);
  };

  const toggleTime = (t) => {
    setSelectedTimes(prev =>
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const handleSubmit = async () => {
    try {
      let res;
      if (editingMeetingId) {
        res = await fetch('/api/invitee/update-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meeting_id: editingMeetingId,
            invitee_id: currentUser.id,
            time_ranges: selectedTimes
          })
        });
      } else {
        res = await fetch('/api/meetings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            date: selectedDate.format('YYYY-MM-DD'),
            note,
            collaborators: collab.split(',').map(e => e.trim()),
            slots: selectedTimes,
            creator_id: currentUser.id
          })
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        alert('❌ Failed: ' + errText);
        return;
      }

      const result = await res.json();
      alert(result.message || '✅ Success');
      setShowPopup(false);
      setEditingMeetingId(null);
      setTitle('');
      setNote('');
      setCollab('');
      setSelectedTimes([]);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h2>📅 My Calendar</h2>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <button onClick={() => setSelectedMonth(m => (m + 11) % 12)}>⏴</button>
        <span style={{ margin: '0 15px' }}>{months[selectedMonth]} {selectedYear}</span>
        <button onClick={() => setSelectedMonth(m => (m + 1) % 12)}>⏵</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', backgroundColor: '#fff', borderRadius: '8px', padding: '10px' }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => <div key={day} style={{ fontWeight: 'bold', textAlign: 'center' }}>{day}</div>)}
        {getDaysInMonth().map((d, i) => {
          const dayStr = d ? d.format('YYYY-MM-DD') : null;
          const myMeetings = availableTimes.filter(a => a.date === dayStr);
          const myHostStatus = hostMeetings.find(m => m.date === dayStr && m.status === 'pending');
          const myAccepted = acceptedMeetings.filter(m => m.date === dayStr);

          return (
            <div key={i} style={{ border: '1px solid #ccc', minHeight: '70px', borderRadius: '6px', padding: '5px', position: 'relative' }}>
              {d && <>
                <div style={{ fontWeight: 'bold' }}>{d.date()}</div>
                {myHostStatus && <div style={{ fontSize: '12px', color: '#ca8a04' }}>🟡 Pending</div>}
                {myAccepted.map((m, idx) => (
                  <div key={`accepted-${idx}`} style={{ fontSize: '12px', color: '#4ade80' }}>✅ {m.title}</div>
                ))}
                <button
                  style={{ position: 'absolute', bottom: '5px', right: '5px', backgroundColor: '#fbb6d0', border: 'none', borderRadius: '50%', width: '24px', height: '24px' }}
                  onClick={() => handleCreateMeeting(d)}
                >+</button>
                {myMeetings.map((m, idx) => (
                  <div key={idx}>
                    <span style={{ fontSize: '12px' }}>{m.meeting_title}</span>
                    <button onClick={() => handleTimeEdit(d, m.meeting_id, m.time_ranges)} style={{ backgroundColor: '#fbb6d0', border: 'none', borderRadius: '4px', fontSize: '12px' }}>Edit</button>
                  </div>
                ))}
              </>}
            </div>
          );
        })}
      </div>

      {showPopup && (
        <div style={{ position: 'fixed', top: '10%', left: '20%', width: '60%', background: '#fff', borderRadius: '10px', padding: '20px', display: 'flex', zIndex: 10 }}>
          <div style={{ flex: 1 }}>
            <h3>{editingMeetingId ? '🕐 Edit Availability' : '📌 Create New Meeting'}</h3>
            <p><b>Date:</b> {selectedDate.format('DD MMM YYYY')}</p>
            {!editingMeetingId && (
              <>
                <p><b>Title:</b><br/><input value={title} onChange={e => setTitle(e.target.value)} /></p>
                <p><b>Collaborators (email):</b><br/><input value={collab} onChange={e => setCollab(e.target.value)} /></p>
                <p><b>Note:</b><br/><textarea value={note} onChange={e => setNote(e.target.value)} /></p>
              </>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {hours.map(h => (
                <button
                  key={h}
                  onClick={() => toggleTime(h)}
                  style={{ backgroundColor: selectedTimes.includes(h) ? '#86efac' : '#e5e7eb', border: 'none', borderRadius: '6px', padding: '5px 10px' }}
                >
                  {h}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '20px' }}>
              <button onClick={handleSubmit} style={{ backgroundColor: '#4ade80', marginRight: '10px' }}>Submit</button>
              <button onClick={() => setShowPopup(false)} style={{ backgroundColor: '#f87171' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;