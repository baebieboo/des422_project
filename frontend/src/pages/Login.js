import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import {api} from '../utils/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginData = { email, password };

    try {
      const response = await api.post('/api/login',
        loginData
      );

      const contentType = response.headers.get('content-type');
      if (response.status != 200) {
        if (contentType && contentType.includes('application/json')) {
          const errorResult = await response.data;
          alert('❌ Login failed: ' + (errorResult.error || 'Unknown error'));
        } else {
          const text = await response.text();
          alert('❌ Login failed (non-JSON): ' + text);
        }
        return;
      }

      const result = await response.data;
      if (!result.user) {
        alert('❌ Login response invalid.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(result.user));
      alert('✅ Login successful!');
      navigate('/calendar');
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

      <h1>LOGIN</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>EMAIL :</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>PASSWORD :</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <input type="checkbox" id="remember" />
          <label htmlFor="remember"> Remember me</label>
          <span style={{ float: 'right' }}><Link to="#">Forgot Password?</Link></span>
        </div>
        <button type="submit">LOGIN</button>
        <p>Don’t have an account ? <Link to="/signup">SIGN UP here</Link></p>
      </form>
    </div>
  );
}

export default Login;