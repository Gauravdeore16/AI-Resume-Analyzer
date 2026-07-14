import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { 
  Users, 
  FileText, 
  Tv, 
  ShieldCheck, 
  UserPlus, 
  Calendar,
  Lock,
  Search
} from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState([]);
  const [resumesList, setResumesList] = useState([]);
  const [interviewsList, setInterviewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleMessage, setRoleMessage] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  async function loadAdminData() {
    setLoading(true);
    setError('');
    setRoleMessage('');
    try {
      if (activeTab === 'users') {
        const users = await api.get('/admin/users');
        setUsersList(users);
      } else if (activeTab === 'resumes') {
        const resumes = await api.get('/admin/resumes');
        setResumesList(resumes);
      } else if (activeTab === 'interviews') {
        const interviews = await api.get('/admin/interviews');
        setInterviewsList(interviews);
      }
    } catch (err) {
      setError(err.message || 'Access denied or failed to load administrative data.');
    } finally {
      setLoading(false);
    }
  }

  const handleRoleToggle = async (userId, currentRole) => {
    setError('');
    setRoleMessage('');
    const newRole = currentRole === 'ROLE_ADMIN' ? 'USER' : 'ADMIN';
    try {
      const resp = await api.put(`/admin/users/${userId}/role?role=${newRole}`, {});
      setRoleMessage(resp.message || 'User role updated successfully!');
      // Refresh user listing
      const users = await api.get('/admin/users');
      setUsersList(users);
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    }
  };

  const tabs = [
    { id: 'users', label: 'Users Management', icon: Users },
    { id: 'resumes', label: 'Candidate Resumes', icon: FileText },
    { id: 'interviews', label: 'Interview Logs', icon: Tv },
  ];

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Administrative Control Panel</h1>
        <p style={styles.subtitle}>Review user demographics, inspect parsed uploads, and audit interview scores.</p>
      </header>

      {/* Tabs */}
      <div style={styles.tabBar}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabBtn,
                ...(isActive ? styles.tabBtnActive : {})
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <span>{error}</span>
        </div>
      )}

      {roleMessage && (
        <div style={styles.successBanner}>
          <span>{roleMessage}</span>
        </div>
      )}

      <div className="glass-panel" style={styles.contentCard}>
        {loading ? (
          <div style={styles.loader}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: '16px', color: '#9ca3af' }}>Fetching secure audit logs...</p>
          </div>
        ) : (
          <div>
            {/* 1. USERS LISTING */}
            {activeTab === 'users' && (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Username</th>
                      <th style={styles.th}>Email Address</th>
                      <th style={styles.th}>Created Date</th>
                      <th style={styles.th}>Account Role</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id} style={styles.tableRow}>
                        <td style={styles.td}>#{u.id}</td>
                        <td style={{ ...styles.td, fontWeight: '600' }}>{u.username}</td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={styles.td}>
                          <span style={styles.roleLabel(u.role)}>{u.role}</span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleRoleToggle(u.id, u.role)}
                            style={styles.toggleBtn(u.role === 'ROLE_ADMIN')}
                          >
                            {u.role === 'ROLE_ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. RESUMES LISTING */}
            {activeTab === 'resumes' && (
              <div style={styles.tableWrapper}>
                {resumesList.length === 0 ? (
                  <p style={styles.emptyText}>No resumes currently in the system.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.th}>Resume ID</th>
                        <th style={styles.th}>User</th>
                        <th style={styles.th}>File Name</th>
                        <th style={styles.th}>Overall</th>
                        <th style={styles.th}>ATS</th>
                        <th style={styles.th}>Uploaded Date</th>
                        <th style={styles.th}>Parsed Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumesList.map(r => (
                        <tr key={r.id} style={styles.tableRow}>
                          <td style={styles.td}>#{r.id}</td>
                          <td style={{ ...styles.td, fontWeight: '600' }}>{r.user?.username || `User #${r.user?.id || 'Unknown'}`}</td>
                          <td style={styles.td}>{r.fileName}</td>
                          <td style={styles.td}>
                            <span style={styles.scorePill}>{r.overallScore}%</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ ...styles.scorePill, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{r.atsScore}%</span>
                          </td>
                          <td style={styles.td}>{new Date(r.uploadedAt).toLocaleDateString()}</td>
                          <td style={{ ...styles.td, fontSize: '0.8rem', color: '#9ca3af', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.fileText || '[No Content]'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* 3. INTERVIEWS LISTING */}
            {activeTab === 'interviews' && (
              <div style={styles.tableWrapper}>
                {interviewsList.length === 0 ? (
                  <p style={styles.emptyText}>No mock interviews logged in system.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.th}>Session ID</th>
                        <th style={styles.th}>Candidate</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Date Taken</th>
                        <th style={styles.th}>Score Graded</th>
                        <th style={styles.th}>Questions Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interviewsList.map(i => (
                        <tr key={i.id} style={styles.tableRow}>
                          <td style={styles.td}>#{i.id}</td>
                          <td style={{ ...styles.td, fontWeight: '600' }}>{i.user?.username || `Candidate #${i.user?.id || 'Unknown'}`}</td>
                          <td style={styles.td}>
                            <span style={styles.typeBadge}>{i.sessionType}</span>
                          </td>
                          <td style={styles.td}>{new Date(i.createdAt).toLocaleString()}</td>
                          <td style={styles.td}>
                            <span style={styles.scorePill}>{i.score !== null ? `${i.score}%` : 'Grading...'}</span>
                          </td>
                          <td style={styles.td}>{i.questions ? i.questions.length : 0} items</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
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
  tabBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '12px',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
  },
  errorBanner: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    color: '#f43f5e',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '0.9rem',
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '0.9rem',
  },
  contentCard: {
    padding: '24px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
  },
  loader: {
    textAlign: 'center',
    padding: '40px 0',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(139, 92, 246, 0.2)',
    borderTop: '3px solid #8b5cf6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px 0',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  th: {
    padding: '12px 16px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background-color 0.2s ease',
  },
  td: {
    padding: '16px',
    fontSize: '0.9rem',
    color: '#e5e7eb',
  },
  roleLabel: (role) => ({
    backgroundColor: role === 'ROLE_ADMIN' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    color: role === 'ROLE_ADMIN' ? '#f43f5e' : '#3b82f6',
    border: role === 'ROLE_ADMIN' ? '1px solid rgba(244, 63, 94, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '700',
  }),
  scorePill: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f9fafb',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  toggleBtn: (isAdmin) => ({
    backgroundColor: isAdmin ? 'rgba(244, 63, 94, 0.05)' : 'rgba(139, 92, 246, 0.1)',
    border: isAdmin ? '1px solid rgba(244, 63, 94, 0.15)' : '1px solid rgba(139, 92, 246, 0.25)',
    color: isAdmin ? '#f43f5e' : '#8b5cf6',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  })
};
