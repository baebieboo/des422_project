import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../App.css";

function ContactUs() {
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const contactData = {
      full_name,
      email,
      subject,
      message,
    };

    try {
      const response = await fetch('/api/contact/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      const result = await response.json();
      console.log("📦 Server response:", result);

      if (response.ok) {
        alert('✅ Message sent successfully');
        // ล้างฟอร์ม
        setFullName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        alert('❌ Error sending message: ' + (result.error || 'Unknown error occurred'));
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      alert('❌ Network error: ' + err.message);
    }
  };

  return (
    <div className="contact-container">

      <header className="home-header">
        <Link to="/" className="home-link">Home</Link>
        <Link to="/qa" className="qa-link">Q&A</Link>
        <Link to="/contact" className="contact-link">Contact Us</Link>
        <Link to="/login" className="login-link">Login</Link>
        <Link to="/signup" className="signup-link">Sign Up</Link>
      </header>

      <h1>Contact Us</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input 
            type="text" 
            value={full_name} 
            onChange={(e) => setFullName(e.target.value)} 
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </div>
        <div>
          <label>Subject:</label>
          <input 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            required
          />
        </div>
        <div>
          <label>Message:</label>
          <textarea 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            required
          />
        </div>
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

export default ContactUs;