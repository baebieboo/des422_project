import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Home from './pages/Home';
import QA from './pages/QA';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import CalendarPage from './pages/CalendarPage';
import MyInvites from './pages/MyInvites';
import Layout from './components/Layout'; // ✅ import layout

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="qa" element={<QA />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="myinvites" element={<MyInvites />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;