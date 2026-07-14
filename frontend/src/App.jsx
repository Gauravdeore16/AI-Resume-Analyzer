import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import Interview from './pages/Interview';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { authService } from './services/auth';

function AppContent() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const location = useLocation();

  // Keep state updated with localStorage
  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, [location]);

  const handleAuthChange = (userData) => {
    setUser(userData);
  };

  const isPublicPath = ['/login', '/register'].includes(location.pathname);
  const isAuthenticated = authService.isAuthenticated();

  // Redirect if not authenticated
  if (!isAuthenticated && !isPublicPath) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if authenticated trying to visit login/register
  if (isAuthenticated && isPublicPath) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-container">
      {isAuthenticated && <Sidebar user={user} onLogout={handleAuthChange} />}
      
      <main className={isAuthenticated ? 'main-content' : ''} style={{ width: '100%' }}>
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleAuthChange} />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/profile" element={<Profile />} />
          
          <Route 
            path="/admin" 
            element={
              authService.isAdmin() ? <Admin /> : <Navigate to="/dashboard" replace />
            } 
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
