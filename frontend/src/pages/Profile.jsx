import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  FileText, 
  Award,
  Lock,
  CheckCircle2
} from 'lucide-react';

export default function Profile() {
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  
  const [stats, setStats] = useState({
    resumes: 0,
    interviews: 0,
    avgAts: 0,
    avgInt: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const resumes = await api.get('/resumes/history');
        const interviews = await api.get('/interviews/history');
        
        const avgAts = resumes.length > 0 
          ? Math.round(resumes.reduce((acc, c) => acc + (c.atsScore || 0), 0) / resumes.length)
          : 0;

        const avgInt = interviews.length > 0
          ? Math.round(interviews.reduce((acc, c) => acc + (c.score || 0), 0) / interviews.length)
          : 0;

        setStats({
          resumes: resumes.length,
          interviews: interviews.length,
          avgAts,
          avgInt
        });
      } catch (e) {
        console.error('Failed to load profile statistics', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>My Profile</h1>
        <p style={styles.subtitle}>Manage your details, roles, and review aggregated progress history.</p>
      </header>

      <div style={styles.row}>
        {/* Profile Card */}
        <div className="glass-panel" style={styles.profileCard}>
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {user?.username ? user.username[0].toUpperCase() : 'U'}
            </div>
            <h2 style={styles.username}>{user?.username || 'User'}</h2>
            <span style={styles.roleBadge(isAdmin)}>{isAdmin ? 'System Administrator' : 'Interview Candidate'}</span>
          </div>

          <div style={styles.detailsList}>
            <div style={styles.detailItem}>
              <Mail size={18} color="#9ca3af" />
              <div style={styles.detailText}>
                <span style={styles.detailLabel}>Email Address</span>
                <span style={styles.detailValue}>{user?.email || 'N/A'}</span>
              </div>
            </div>

            <div style={styles.detailItem}>
              <Shield size={18} color="#9ca3af" />
              <div style={styles.detailText}>
                <span style={styles.detailLabel}>Security Authority</span>
                <span style={styles.detailValue}>{user?.role || 'ROLE_USER'}</span>
              </div>
            </div>

            <div style={styles.detailItem}>
              <Calendar size={18} color="#9ca3af" />
              <div style={styles.detailText}>
                <span style={styles.detailLabel}>Active Session Status</span>
                <span style={styles.detailValue}><strong style={{ color: '#10b981' }}>Authenticated via JWT</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregate Stats Card */}
        <div className="glass-panel" style={styles.statsCard}>
          <h3 style={styles.sectionTitle}>Performance Aggregates</h3>
          
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <FileText size={28} color="#3b82f6" />
              <span style={styles.statVal}>{loading ? '...' : stats.resumes}</span>
              <span style={styles.statLabel}>Resumes Analyzed</span>
            </div>

            <div style={styles.statBox}>
              <Award size={28} color="#8b5cf6" />
              <span style={styles.statVal}>{loading ? '...' : stats.interviews}</span>
              <span style={styles.statLabel}>Mock Sessions</span>
            </div>

            <div style={styles.statBox}>
              <div style={{ position: 'relative' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981' }}>{loading ? '...' : `${stats.avgAts}%`}</span>
              </div>
              <span style={styles.statLabel}>Avg ATS Score</span>
            </div>

            <div style={styles.statBox}>
              <div style={{ position: 'relative' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b' }}>{loading ? '...' : `${stats.avgInt}%`}</span>
              </div>
              <span style={styles.statLabel}>Avg Interview Score</span>
            </div>
          </div>

          <div style={styles.disclaimerPanel}>
            <CheckCircle2 size={16} color="#10b981" />
            <p style={styles.disclaimerText}>
              Your data is secured using industry-standard password hashing and cryptographically signed stateless tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '40px',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: '#f9fafb',
  },
  subtitle: {
    color: '#9ca3af',
    marginTop: '4px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  profileCard: {
    padding: '32px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '28px',
    textAlign: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '800',
    fontSize: '2.5rem',
    marginBottom: '16px',
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
  },
  username: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#f9fafb',
  },
  roleBadge: (isAdmin) => ({
    backgroundColor: isAdmin ? 'rgba(244, 63, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    color: isAdmin ? '#f43f5e' : '#3b82f6',
    border: isAdmin ? '1px solid rgba(244, 63, 94, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    marginTop: '8px',
  }),
  detailsList: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '24px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  detailText: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: '0.95rem',
    color: '#e5e7eb',
    fontWeight: '500',
  },
  statsCard: {
    padding: '32px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#f9fafb',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '28px',
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  statVal: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#f9fafb',
    marginTop: '8px',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '4px',
    fontWeight: '500',
  },
  disclaimerPanel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    padding: '16px',
    borderRadius: '8px',
  },
  disclaimerText: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    lineHeight: '1.4',
  }
};
