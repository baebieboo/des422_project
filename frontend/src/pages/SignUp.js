import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const signupData = {
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim(),
      password,
      confirm_password: confirmPassword,
    };

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Unexpected server response");
      }

      if (response.ok) {
        alert('✅ Signup successful! You can now log in.');
        navigate('/login');
      } else {
        alert('❌ Signup failed: ' + result.error);
      }
    } catch (err) {
      alert('❌ Network error: ' + err.message);
    }
  };

  return (
    <div className="contact-container">
      <header className="home-header">
        <Link to="/">Home</Link>
        <Link to="/qa">Q&A</Link>
        <Link to="/contact">Contact Us</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign Up</Link>
      </header>

      <h1>SIGN UP</h1>
      <form onSubmit={handleSignup}>
        <div>
          <label>EMAIL :</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>FULL NAME :</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
        </div>
        <div>
          <label>PHONE NUMBER :</label>
          <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
        </div>
        <div>
          <label>PASSWORD :</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>CONFIRM PASSWORD :</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit">SIGN UP</button>
        <p>Already have an account? <Link to="/login">LOGIN here</Link></p>
      </form>
    </div>
  );
}

export default Signup;