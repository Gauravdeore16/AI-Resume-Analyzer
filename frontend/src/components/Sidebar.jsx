import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSearch, 
  Tv, 
  ShieldAlert, 
  User, 
  LogOut,
  BrainCircuit
} from 'lucide-react';
import { authService } from '../services/auth';

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = authService.isAdmin();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analyzer', path: '/analyzer', icon: FileSearch },
    { name: 'Interview Coach', path: '/interview', icon: Tv },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (isAdmin) {
    menuItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  const handleLogoutClick = () => {
    authService.logout();
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <aside className="sidebar glass-panel" style={styles.sidebar}>
      <div style={styles.logoContainer} onClick={() => navigate('/dashboard')}>
        <BrainCircuit size={32} color="#3b82f6" />
        <span className="glow-text" style={styles.logoText}>AI Coach</span>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <div 
              key={item.name} 
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
            >
              <Icon size={20} color={isActive ? '#3b82f6' : '#9ca3af'} />
              <span>{item.name}</span>
            </div>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.username ? user.username[0].toUpperCase() : 'U'}
          </div>
          <div style={styles.userDetails}>
            <span style={styles.username}>{user?.username || 'User'}</span>
            <span style={styles.role}>{isAdmin ? 'Admin' : 'Candidate'}</span>
          </div>
        </div>
        
        <button onClick={handleLogoutClick} style={styles.logoutBtn}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 20,
    left: 20,
    bottom: 20,
    width: 240,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    zIndex: 100,
    borderRadius: '16px',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    marginBottom: '40px',
    paddingLeft: '8px',
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '0.5px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: '#9ca3af',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#f9fafb',
    borderLeft: '3px solid #3b82f6',
    paddingLeft: '13px',
  },
  footer: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingLeft: '8px',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.95rem',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  username: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#f9fafb',
  },
  role: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'transparent',
    border: 'none',
    color: '#f43f5e',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    padding: '10px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    width: '100%',
    textAlign: 'left',
  }
};
