import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { Lock, User, BrainCircuit, AlertTriangle, Mail } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(username, password);
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await authService.forgotPassword(email, newPassword);
      setSuccessMsg('Password reset successfully! You can now log in.');
      setIsForgotPassword(false);
      setEmail('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Email not found or invalid input');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel animate-fade-in" style={styles.card}>
        {isForgotPassword ? (
          <>
            <div style={styles.header}>
              <BrainCircuit size={48} color="#3b82f6" />
              <h2 className="glow-text" style={styles.title}>Reset Password</h2>
              <p style={styles.subtitle}>Enter your email to update your password</p>
            </div>

            {error && (
              <div style={styles.errorContainer}>
                <AlertTriangle size={18} color="#f43f5e" />
                <span style={styles.errorText}>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} style={styles.form}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <div style={styles.inputContainer}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    id="email"
                    className="form-input"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.inputWithIcon}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">New Password</label>
                <div style={styles.inputContainer}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    id="newPassword"
                    className="form-input"
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={styles.inputWithIcon}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                style={styles.submitBtn}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div style={styles.footer}>
              <button 
                type="button" 
                onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMsg(''); }} 
                style={styles.textBtn}
              >
                Back to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={styles.header}>
              <BrainCircuit size={48} color="#3b82f6" />
              <h2 className="glow-text" style={styles.title}>Welcome Back</h2>
              <p style={styles.subtitle}>Sign in to resume coaching and simulator</p>
            </div>

            {successMsg && (
              <div style={styles.successContainer}>
                <span style={styles.successText}>{successMsg}</span>
              </div>
            )}

            {error && (
              <div style={styles.errorContainer}>
                <AlertTriangle size={18} color="#f43f5e" />
                <span style={styles.errorText}>{error}</span>
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
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={styles.inputWithIcon}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '6px' }}>
                <label className="form-label" htmlFor="password">Password</label>
                <div style={styles.inputContainer}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    id="password"
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.inputWithIcon}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }} 
                  style={styles.forgotBtn}
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                style={styles.submitBtn}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div style={styles.footer}>
              <span style={styles.footerText}>Don't have an account? </span>
              <Link to="/register" style={styles.link}>Create Account</Link>
            </div>
          </>
        )}
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
    maxWidth: '420px',
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
    marginBottom: '32px',
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
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    padding: 0,
  },
  textBtn: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    padding: 0,
  },
};
