import React from 'react';
import { Link } from 'react-router-dom';
import "../App.css"; 

function QA() {
  return (
    <div className="qa-container">

    <header className="home-header">
        <Link to="/" className="home-link">Home</Link> {/* Link to Home page */}
        <Link to="/qa" className="qa-link">Q&A</Link> {/* Link to Q&A page */}
        <Link to="/contact" className="contact-link">Contact Us</Link> {/* Link to Contact Us page */}
        <Link to="/login" className="login-link">Login</Link> {/* Link to Login page */}
        <Link to="/signup" className="signup-link">Sign Up</Link> {/* Link to Sign Up page */}
      </header>

      <h1>Q&A</h1>
      <div className="qa-item">
        <p><strong>Q:</strong> Can I invite multiple people to the same meeting?</p>
        <p><strong>A:</strong> Yes! You can invite multiple participants by separating each email with a comma (,) in the invitation form.</p>
      </div>
      <div className="qa-item">
        <p><strong>Q:</strong> What happens after I invite someone to a meeting?</p>
        <p><strong>A:</strong> They will receive a notification. If they click "Accept", they can select one or more available time slots from the options you provided. If they are not available, they can click "Decline".</p>
      </div>
      <div className="qa-item">
        <p><strong>Q:</strong> What does "Success" or "Unsuccess" status mean for a meeting?</p>
        <p><strong>A:</strong> If at least 50% of all participants (including the host) select the same time slot, the meeting will be marked as Success. If fewer than 50% overlap on any time slot, it will be marked as Unsuccess.</p>
      </div>
      <div className="qa-item">
        <p><strong>Q:</strong> Can I update or delete a meeting after creating it?</p>
        <p><strong>A:</strong> You can’t edit the meeting date, invited users, or the available time slots once it’s created. However, invited users can modify their selected time slots (within the ones you offered). To make other changes, delete and recreate the meeting.</p>
      </div>
      <div className="qa-item">
        <p><strong>Q:</strong> What if the person I invited does not have an account yet?</p>
        <p><strong>A:</strong> They will not be able to join the meeting. Please make sure the invited emails belong to users who have already signed up.</p>
      </div>
    </div>
  );
}

export default QA;