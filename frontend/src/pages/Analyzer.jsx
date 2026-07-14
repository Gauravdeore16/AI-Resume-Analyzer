import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Award,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function Analyzer() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (resumeId) {
      loadResumeDetails(resumeId);
    }
  }, [resumeId]);

  async function loadResumeDetails(id) {
    setUploading(true);
    setError('');
    try {
      const data = await api.get(`/resumes/${id}`);
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Failed to load resume details');
    } finally {
      setUploading(false);
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        setError('Only PDF and DOCX files are allowed.');
        setFile(null);
      } else {
        setError('');
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');
    setAnalysis(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await api.post('/resumes/upload', formData, true);
      setSuccess('Resume analyzed successfully!');
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Error occurred during resume upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        {resumeId && (
          <a href="/dashboard" style={styles.backLink}>
            <ArrowLeft size={16} /> Back to Dashboard
          </a>
        )}
        <h1 style={styles.title}>AI Resume Scanner</h1>
        <p style={styles.subtitle}>Upload your resume for real-time ATS optimization and skill-gap feedback.</p>
      </header>

      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={styles.successBanner}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Zone */}
      {!analysis && !uploading && (
        <div className="glass-panel" style={styles.uploadCard}>
          <form onSubmit={handleUpload} style={styles.uploadForm}>
            <UploadCloud size={64} color="#8b5cf6" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Drag & Drop your Resume</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '24px' }}>Supports PDF and DOCX formats (Max 10MB)</p>
            
            <label style={styles.fileSelectBtn}>
              Choose File
              <input type="file" onChange={handleFileChange} accept=".pdf,.docx" style={{ display: 'none' }} />
            </label>

            {file && (
              <div style={styles.selectedFile}>
                <FileText size={18} color="#3b82f6" />
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{file.name}</span>
              </div>
            )}

            {file && (
              <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>
                <Sparkles size={18} />
                <span>Start AI Analysis</span>
              </button>
            )}
          </form>
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="glass-panel" style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <h3 style={{ fontSize: '1.2rem', marginTop: '20px' }}>Extracting and Grading...</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px' }}>
            Gemini is evaluating your resume layout, ATS formatting, and matching technical keywords.
          </p>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysis && (
        <div style={styles.resultsContainer}>
          <div style={styles.row}>
            {/* Scores Cards */}
            <div className="glass-panel" style={styles.scoresCard}>
              <h3 style={styles.sectionTitle}>Scan Scores</h3>
              <div style={styles.scoreRow}>
                {/* Overall Score */}
                <div style={styles.scoreCol}>
                  <div className="score-circle">
                    <svg>
                      <circle cx="70" cy="70" r="60" className="bg" />
                      <circle 
                        cx="70" 
                        cy="70" 
                        r="60" 
                        className="progress" 
                        stroke="#8b5cf6"
                        strokeDashoffset={377 - (377 * (analysis.overallScore || 0)) / 100}
                      />
                    </svg>
                    <div className="score-text">
                      <span className="score-val" style={{ color: '#8b5cf6' }}>{analysis.overallScore}</span>
                      <span className="score-label">Overall</span>
                    </div>
                  </div>
                </div>
                {/* ATS Score */}
                <div style={styles.scoreCol}>
                  <div className="score-circle">
                    <svg>
                      <circle cx="70" cy="70" r="60" className="bg" />
                      <circle 
                        cx="70" 
                        cy="70" 
                        r="60" 
                        className="progress" 
                        stroke="#10b981"
                        strokeDashoffset={377 - (377 * (analysis.atsScore || 0)) / 100}
                      />
                    </svg>
                    <div className="score-text">
                      <span className="score-val" style={{ color: '#10b981' }}>{analysis.atsScore}</span>
                      <span className="score-label">ATS Score</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={styles.metaRow}>
                <div style={styles.metaItem}>
                  <FileText size={16} color="#9ca3af" />
                  <span>File: <strong>{analysis.fileName}</strong></span>
                </div>
                <div style={styles.metaItem}>
                  <Activity size={16} color="#9ca3af" />
                  <span>Status: <strong style={{ color: '#10b981' }}>Optimized</strong></span>
                </div>
              </div>

              {!resumeId && (
                <button onClick={() => setAnalysis(null)} className="btn-secondary" style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}>
                  Analyze Another Resume
                </button>
              )}
            </div>

            {/* Missing Skills Cards */}
            <div className="glass-panel" style={styles.skillsCard}>
              <h3 style={styles.sectionTitle}>
                <Award size={20} color="#f59e0b" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Detected Skill Gaps
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '20px' }}>
                We compared your resume content against standards for matching job roles. Adding these keywords can boost your ATS matches.
              </p>
              <div style={styles.skillsGrid}>
                {analysis.missingSkills ? analysis.missingSkills.split(',').map((skill, idx) => (
                  <span key={idx} style={styles.skillBadge}>
                    {skill.trim()}
                  </span>
                )) : <p style={{ color: '#6b7280' }}>No significant skill gaps found. Great work!</p>}
              </div>
            </div>
          </div>

          {/* Suggestions Card */}
          <div className="glass-panel" style={styles.suggestionsCard}>
            <h3 style={styles.sectionTitle}>
              <Sparkles size={20} color="#8b5cf6" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              ATS Suggestions for Improvement
            </h3>
            <ul style={styles.suggestionList}>
              {analysis.suggestions ? analysis.suggestions.split('\n').map((suggestion, idx) => (
                <li key={idx} style={styles.suggestionItem}>
                  <div style={styles.bullet}></div>
                  <span>{suggestion}</span>
                </li>
              )) : <li>No suggestions needed. Your resume matches ATS specifications.</li>}
            </ul>
          </div>
        </div>
      )}
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
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '0.9rem',
    marginBottom: '16px',
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
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    color: '#f43f5e',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  uploadCard: {
    padding: '60px 40px',
    textAlign: 'center',
    backgroundColor: 'rgba(20, 28, 43, 0.4)',
    borderStyle: 'dashed',
    borderWidth: '2px',
  },
  uploadForm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  fileSelectBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  selectedFile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    border: '1px solid rgba(59, 130, 246, 0.15)',
    padding: '10px 16px',
    borderRadius: '8px',
  },
  loadingCard: {
    padding: '60px 40px',
    textAlign: 'center',
    backgroundColor: 'rgba(20, 28, 43, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(139, 92, 246, 0.2)',
    borderTop: '4px solid #8b5cf6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '24px',
  },
  scoresCard: {
    padding: '24px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#f9fafb',
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: '24px 0',
  },
  scoreCol: {
    display: 'flex',
    justifyContent: 'center',
  },
  metaRow: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '0.85rem',
    color: '#9ca3af',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  skillsCard: {
    padding: '24px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
  },
  skillsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  skillBadge: {
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    color: '#f59e0b',
    padding: '8px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '0.3px',
    textShadow: '0 0 10px rgba(245, 158, 11, 0.2)',
  },
  suggestionsCard: {
    padding: '24px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
  },
  suggestionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    listStyle: 'none',
  },
  suggestionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: '0.95rem',
    color: '#e5e7eb',
    lineHeight: '1.4',
  },
  bullet: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#8b5cf6',
    marginTop: '8px',
    flexShrink: 0,
    boxShadow: '0 0 8px #8b5cf6',
  }
};
