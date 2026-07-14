import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { Lock, User, Mail, BrainCircuit, AlertTriangle, UserCheck } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER'); // Defaults to USER
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.register(username, email, password, role);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different username/email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel animate-fade-in" style={styles.card}>
        <div style={styles.header}>
          <BrainCircuit size={48} color="#8b5cf6" />
          <h2 className="glow-text" style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Get detailed ATS resume scans and AI coaching</p>
        </div>

        {error && (
          <div style={styles.errorContainer}>
            <AlertTriangle size={18} color="#f43f5e" />
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successContainer}>
            <UserCheck size={18} color="#10b981" />
            <span style={styles.successText}>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div style={styles.inputContainer}>
              <User size={18} style={styles.inputIcon} />
              <input
                id="username"
                className="form-input"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.inputWithIcon}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={styles.inputContainer}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                id="email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.inputWithIcon}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={styles.inputContainer}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="password"
                className="form-input"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.inputWithIcon}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Account Type</label>
            <select
              id="role"
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.selectInput}
            >
              <option value="USER">Candidate (Standard User)</option>
              <option value="ADMIN">Administrator (Access Admin Panel)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Already have an account? </span>
          <Link to="/login" style={styles.link}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'radial-gradient(circle at center, #111827 0%, #0b0f19 100%)',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px 32px',
    borderRadius: '20px',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '28px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    marginTop: '16px',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#9ca3af',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  errorText: {
    color: '#f43f5e',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  successText: {
    color: '#10b981',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: '#6b7280',
  },
  inputWithIcon: {
    paddingLeft: '48px',
    width: '100%',
  },
  selectInput: {
    cursor: 'pointer',
    backgroundColor: '#1f2937',
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '12px',
    padding: '14px',
    fontSize: '1rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '28px',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: '0.9rem',
  },
  link: {
    color: '#8b5cf6',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
  }
};
