import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const hours = [
  '6 AM - 7 AM', '7 AM - 8 AM', '8 AM - 9 AM',
  '9 AM - 10 AM', '10 AM - 11 AM', '11 AM - 12 PM',
  '1 PM - 2 PM', '2 PM - 3 PM', '3 PM - 4 PM',
  '4 PM - 5 PM', '5 PM - 6 PM'
];

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function CalendarPage() {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedYear] = useState(dayjs().year());

  const [availableTimes, setAvailableTimes] = useState([]);
  const [acceptedMeetings, setAcceptedMeetings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [availableSlots, setAvailableSlots] = useState([]);

  const [creating, setCreating] = useState(false);
  const [createDate, setCreateDate] = useState(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [collab, setCollab] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const monthStr = dayjs().year(selectedYear).month(selectedMonth).format('YYYY-MM');

      const res1 = await fetch(`/api/invitee/availability/${currentUser.id}?month=${monthStr}`);
      const times = res1.ok ? await res1.json() : [];
      setAvailableTimes(times);

      const res2 = await fetch(`/api/invite/accepted/${currentUser.id}`);
      const meetings = res2.ok ? await res2.json() : [];
      setAcceptedMeetings(meetings);
    };
    fetchData();
  }, [selectedMonth, selectedYear, currentUser.id]);

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

  const openEdit = async (meeting_id, date) => {
    const dateObj = dayjs(date);
    const today = dayjs();

    if (dateObj.isBefore(today, 'day')) {
      alert("❌ Cannot edit past dates");
      return;
    }

    const res = await fetch(`/api/invite/slots/${meeting_id}`);
    const slots = res.ok ? await res.json() : [];
    setAvailableSlots(slots);

    const userDayTimes = availableTimes
      .filter(a => a.date === date && a.meeting_id === meeting_id)
      .map(a => a.time_range);

    setSelectedTimes(userDayTimes);
    setEditing({ meeting_id, date });
  };

  const handleSaveEdit = async () => {
    const res = await fetch('/api/invitee/update-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meeting_id: editing.meeting_id,
        invitee_id: currentUser.id,
        time_ranges: selectedTimes
      })
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message);
      setEditing(null);
    } else {
      alert("❌ " + result.error);
    }
  };

  const handleCreateMeeting = (date) => {
    setCreating(true);
    setCreateDate(date);
    setTitle('');
    setNote('');
    setCollab('');
    setSelectedTimes([]);
  };

  const handleSaveCreate = async () => {
    try {
      const res = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          date: createDate.format('YYYY-MM-DD'),
          note,
          collaborators: collab.split(',').map(e => e.trim()),
          slots: selectedTimes,
          creator_id: currentUser.id
        })
      });

      const result = await res.json();
      if (!res.ok) {
        alert("❌ Failed: " + result.error);
        return;
      }

      alert(result.message || '✅ Meeting created');
      setCreating(false);
    } catch (err) {
      alert("❌ Network error: " + err.message);
    }
  };

  const toggleTime = (t) => {
    setSelectedTimes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Calendar</h2>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <button onClick={() => setSelectedMonth(m => (m + 11) % 12)}>⏴</button>
        <span style={{ margin: '0 15px' }}>{months[selectedMonth]} {selectedYear}</span>
        <button onClick={() => setSelectedMonth(m => (m + 1) % 12)}>⏵</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} style={{ fontWeight: 'bold', textAlign: 'center' }}>{d}</div>)}
        {getDaysInMonth().map((d, i) => {
          const dayStr = d?.format('YYYY-MM-DD');
          const accepts = acceptedMeetings.filter(m => m.date === dayStr);

          return (
            <div key={i} style={{ border: '1px solid #ccc', minHeight: 70, borderRadius: 6, padding: 5 }}>
              {d && <>
                <div><b>{d.date()}</b></div>
                {accepts.map((m, idx) => (
                  <div key={idx} style={{ fontSize: 12, color: '#4ade80' }}>
                    ✅ {m.title}
                    <button style={{ fontSize: 10, marginLeft: 4 }} onClick={() => openEdit(m.meeting_id, m.date)}>Edit</button>
                  </div>
                ))}
                <button style={{ fontSize: 12, marginTop: 5 }} onClick={() => handleCreateMeeting(d)}>+ Create</button>
              </>}
            </div>
          );
        })}
      </div>

      {(editing || creating) && (
        <div style={{ marginTop: 20, padding: 10, border: '1px solid #ccc', borderRadius: 8 }}>
          <h3>{creating ? "📌 Create Meeting" : `🕐 Edit Availability (${editing.date})`}</h3>
          {creating && (
            <>
              <p><b>Title:</b> <input value={title} onChange={e => setTitle(e.target.value)} /></p>
              <p><b>Collaborators (comma separated):</b> <input value={collab} onChange={e => setCollab(e.target.value)} /></p>
              <p><b>Note:</b><br /><textarea value={note} onChange={e => setNote(e.target.value)} /></p>
            </>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {hours.map(h => (
              <button key={h} onClick={() => toggleTime(h)} style={{
                backgroundColor: selectedTimes.includes(h) ? '#86efac' : '#e5e7eb',
                borderRadius: 6, padding: '6px 12px'
              }}>
                {h}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 15 }}>
            <button onClick={creating ? handleSaveCreate : handleSaveEdit} style={{ marginRight: 10 }}>Save</button>
            <button onClick={() => { setCreating(false); setEditing(null); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;