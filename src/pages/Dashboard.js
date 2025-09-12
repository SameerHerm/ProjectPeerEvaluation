import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Here you would also clear auth tokens/context if implemented
    navigate('/');
  };
  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h2>Welcome to the Dashboard!</h2>
      <button className="login-btn" onClick={handleLogout} style={{ marginTop: '2rem' }}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
