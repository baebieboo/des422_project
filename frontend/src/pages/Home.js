import React from "react";
import "../App.css"; // นำเข้า CSS ที่ใช้ในหน้า Home
import { Link } from 'react-router-dom';
import Homeimage from "../images/homeimage.jpg"; // นำเข้าภาพที่ใช้ในหน้า Home



function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <Link to="/" className="home-link">Home</Link> {/* Link to Home page */}
        <Link to="/qa" className="qa-link">Q&A</Link> {/* Link to Q&A page */}
        <Link to="/contact" className="contact-link">Contact Us</Link> {/* Link to Contact Us page */}
        <Link to="/login" className="login-link">Login</Link> {/* Link to Login page */}
        <Link to="/signup" className="signup-link">Sign Up</Link> {/* Link to Sign Up page */}
      </header>

      {/* เนื้อหาหลักอยู่ทางซ้าย */}
      <div className="home-content">
        <h1>Harmonize Meeting Club</h1>
        <p>Find Your Perfect Time !!</p>
        <Link to="/login" className="login-link">Login</Link> {/* Link to Login page */}
        <p>Don't have an account?{" "}
          <Link to="/signup" className="signup-link">Sign Up Here</Link> {/* Link to Sign Up page */}
        </p>
      </div>

      {/* รูปภาพทางขวา */}
      <div className="home-image-container">
        <img src={Homeimage} className="home-image" alt="Meeting Club" />
      </div>
    </div>
  );
}

export default Home;