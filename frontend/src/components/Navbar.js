import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import './Navbar.css';

function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (!token) return null;
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/haccp', label: 'HACCP', icon: '🛡️' }
  ];
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🍳</span>
          <span className="logo-text">YieldGuard</span>
        </Link>
        <div className="nav-links">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="nav-actions">
          <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
