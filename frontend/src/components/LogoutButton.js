import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      🚪 Logout
    </button>
  );
};

export default LogoutButton;
