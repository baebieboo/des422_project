// backend/src/server/server.js
const express = require('express');
const contactRoutes = require('../routes/contactRoutes');
const signupRoutes = require('../routes/signupRoutes');
const loginRoutes = require('../routes/loginRoutes');
const calendarRoutes = require('../routes/calendarRoutes');
const meetingRoutes = require('../routes/meetingRoutes.js');
const inviteRoutes = require('../routes/inviteRoutes');
// const meetingViewRoutes = require('../routes/meetingViewRoutes');
const inviteAvailabilityRoutes = require('../routes/inviteAvailabilityRoutes');

const app = express();
app.use(express.json());

app.use('/api/contact', contactRoutes);
app.use('/api/signup', signupRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/invitee', inviteAvailabilityRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});