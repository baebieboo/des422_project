import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    alert("👋 Logged out");
    navigate('/login');
  };

  return (
    <div>
      <header className="home-header" style={{ backgroundColor: '#333', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/" style={{ marginRight: '10px', color: 'white' }}>Home</Link>
          <Link to="/calendar" style={{ marginRight: '10px', color: 'white' }}>Calendar</Link>
          <Link to="/myinvites" style={{ marginRight: '10px', color: 'white' }}>My Invites</Link>
          <Link to="/contact" style={{ marginRight: '10px', color: 'white' }}>Contact Us</Link>
          {!currentUser && <Link to="/login" style={{ marginRight: '10px', color: 'white' }}>Login</Link>}
          {!currentUser && <Link to="/signup" style={{ color: 'white' }}>Sign Up</Link>}
        </div>

        {currentUser && (
          <div style={{ color: 'white' }}>
            👤 {currentUser.email || currentUser.full_name}
            <button onClick={handleLogout} style={{ marginLeft: '15px', backgroundColor: '#f87171', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px' }}>
              Logout
            </button>
          </div>
        )}
      </header>

      <main style={{ padding: '20px' }}>
        {/* หน้าเนื้อหา */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;