import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  FileText, 
  Award, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const resumeData = await api.get('/resumes/history');
        const interviewData = await api.get('/interviews/history');
        setResumes(resumeData);
        setInterviews(interviewData);
      } catch (err) {
        setError('Failed to fetch dashboard data. Make sure backend is running.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalResumes = resumes.length;
  const totalInterviews = interviews.length;
  
  const avgResumeScore = totalResumes > 0 
    ? Math.round(resumes.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / totalResumes) 
    : 0;

  const avgInterviewScore = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalInterviews)
    : 0;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '16px', color: '#9ca3af' }}>Loading dashboard insights...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Candidate Dashboard</h1>
          <p style={styles.subtitle}>Insights, resume health check, and interview performance metrics.</p>
        </div>
        <div style={styles.actionGroup}>
          <button onClick={() => navigate('/analyzer')} className="btn-primary">
            <FileText size={18} />
            <span>Analyze Resume</span>
          </button>
          <button onClick={() => navigate('/interview')} className="btn-secondary">
            <TrendingUp size={18} />
            <span>Start Practice</span>
          </button>
        </div>
      </header>

      {error && (
        <div style={styles.errorBanner}>
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Cards */}
      <section style={styles.grid}>
        <div className="glass-panel" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Uploaded Resumes</span>
            <div style={{ ...styles.iconBg, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <FileText size={20} color="#3b82f6" />
            </div>
          </div>
          <span style={styles.cardValue}>{totalResumes}</span>
          <div style={styles.cardFooter}>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight size={14} /> Active profiles
            </span>
          </div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Average Resume Score</span>
            <div style={{ ...styles.iconBg, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <ShieldCheck size={20} color="#10b981" />
            </div>
          </div>
          <span style={styles.cardValue}>{avgResumeScore}%</span>
          <div style={styles.cardFooter}>
            <span style={{ color: '#9ca3af' }}>ATS target: 80%+</span>
          </div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Interviews Completed</span>
            <div style={{ ...styles.iconBg, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
              <Award size={20} color="#8b5cf6" />
            </div>
          </div>
          <span style={styles.cardValue}>{totalInterviews}</span>
          <div style={styles.cardFooter}>
            <span style={{ color: '#9ca3af' }}>Java, HR & Coding</span>
          </div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Average Interview Score</span>
            <div style={{ ...styles.iconBg, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <TrendingUp size={20} color="#f59e0b" />
            </div>
          </div>
          <span style={styles.cardValue}>{avgInterviewScore}%</span>
          <div style={styles.cardFooter}>
            <span style={{ color: '#9ca3af' }}>AI feedback based</span>
          </div>
        </div>
      </section>

      {/* Analytics Charts Section */}
      <section style={styles.chartsGrid}>
        <div className="glass-panel" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>ATS Score Progression</h3>
          {resumes.length === 0 ? (
            <div style={styles.emptyChart}>Upload multiple resumes to see trends</div>
          ) : (
            <div style={styles.chartContainer}>
              {/* SVG Line Chart */}
              <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Gridlines */}
                <line x1="50" y1="30" x2="450" y2="30" stroke="rgba(255,255,255,0.05)" />
                <line x1="50" y1="80" x2="450" y2="80" stroke="rgba(255,255,255,0.05)" />
                <line x1="50" y1="130" x2="450" y2="130" stroke="rgba(255,255,255,0.05)" />
                <line x1="50" y1="180" x2="450" y2="180" stroke="rgba(255,255,255,0.1)" />
                
                {/* Labels */}
                <text x="20" y="35" fill="#6b7280" fontSize="10">100</text>
                <text x="20" y="85" fill="#6b7280" fontSize="10">50</text>
                <text x="20" y="185" fill="#6b7280" fontSize="10">0</text>

                {/* Plotting points */}
                {(() => {
                  const points = resumes.slice().reverse().map((r, i) => {
                    const x = 50 + (i * (400 / Math.max(resumes.length - 1, 1)));
                    const y = 180 - ((r.atsScore || 0) * 1.5);
                    return { x, y, score: r.atsScore };
                  });

                  const pathD = points.reduce((acc, p, i) => {
                    return acc + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                  }, '');

                  const areaD = points.length > 0 
                    ? `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z` 
                    : '';

                  return (
                    <>
                      {points.length > 0 && <path d={areaD} fill="url(#chartGrad)" />}
                      {points.length > 0 && <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" />}
                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#0b0f19" stroke="#3b82f6" strokeWidth="3" />
                          <text x={p.x - 10} y={p.y - 12} fill="#f9fafb" fontSize="10" fontWeight="bold">{p.score}%</text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          )}
        </div>

        <div className="glass-panel" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Recent Practice Scores</h3>
          {interviews.length === 0 ? (
            <div style={styles.emptyChart}>Complete mock interviews to view progress</div>
          ) : (
            <div style={styles.barChartContainer}>
              {interviews.slice(0, 5).map((session, idx) => (
                <div key={session.id} style={styles.barRow}>
                  <div style={styles.barRowLabel}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{session.sessionType}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Session #{session.id}</span>
                  </div>
                  <div style={styles.barOuter}>
                    <div 
                      style={{ 
                        ...styles.barInner, 
                        width: `${session.score || 0}%`,
                        background: session.score >= 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                      }}
                    ></div>
                  </div>
                  <span style={styles.barScore}>{session.score || 0}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* History and Activity Tables */}
      <section style={styles.tablesGrid}>
        <div className="glass-panel" style={styles.tableCard}>
          <h3 style={styles.tableTitle}>Resume Scan Log</h3>
          {resumes.length === 0 ? (
            <div style={styles.emptyState}>No resumes analyzed yet.</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>File Name</th>
                    <th style={styles.th}>Overall Score</th>
                    <th style={styles.th}>ATS Score</th>
                    <th style={styles.th}>Scanned Date</th>
                    <th style={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map((resume) => (
                    <tr key={resume.id} style={styles.tableRow}>
                      <td style={{ ...styles.td, fontWeight: '600' }}>{resume.fileName}</td>
                      <td style={styles.td}>
                        <span style={styles.scoreBadge(resume.overallScore)}>{resume.overallScore}/100</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.scoreBadge(resume.atsScore)}>{resume.atsScore}/100</span>
                      </td>
                      <td style={styles.td}>{new Date(resume.uploadedAt).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <button onClick={() => navigate(`/analyzer?id=${resume.id}`)} style={styles.viewLink}>View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '40px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '20px',
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
  actionGroup: {
    display: 'flex',
    gap: '12px',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  statCard: {
    padding: '24px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  cardLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  iconBg: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: '2.4rem',
    fontWeight: '800',
    color: '#f9fafb',
    lineHeight: '1.2',
  },
  cardFooter: {
    marginTop: '12px',
    fontSize: '0.8rem',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  chartCard: {
    padding: '24px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
  },
  chartTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#f9fafb',
  },
  emptyChart: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    border: '1px dashed rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
  },
  chartContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barChartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    justifyContent: 'center',
    flex: 1,
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  barRowLabel: {
    width: '90px',
    display: 'flex',
    flexDirection: 'column',
  },
  barOuter: {
    flex: 1,
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 1s ease-in-out',
  },
  barScore: {
    fontSize: '0.85rem',
    fontWeight: '700',
    width: '36px',
    textAlign: 'right',
  },
  tablesGrid: {
    marginBottom: '32px',
  },
  tableCard: {
    padding: '24px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
  },
  tableTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#f9fafb',
  },
  emptyState: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '30px 0',
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
  scoreBadge: (score) => ({
    backgroundColor: score >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    color: score >= 80 ? '#10b981' : '#3b82f6',
    border: score >= 80 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
  }),
  viewLink: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    textDecoration: 'underline',
  },
  loadingContainer: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(59, 130, 246, 0.2)',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};
