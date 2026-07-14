import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Tv, 
  Code2, 
  HelpCircle, 
  UserCheck, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle,
  Award,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export default function Interview() {
  const [resumes, setResumes] = useState([]);
  const [sessionType, setSessionType] = useState('JAVA_MCQ');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  
  // Active Session states
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: userAnswer }
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Results state
  const [gradedSession, setGradedSession] = useState(null);

  useEffect(() => {
    async function loadResumes() {
      try {
        const data = await api.get('/resumes/history');
        setResumes(data);
        if (data.length > 0) {
          setSelectedResumeId(data[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching resume history:', err);
      }
    }
    loadResumes();
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGradedSession(null);
    setAnswers({});
    setCurrentIdx(0);

    try {
      let query = `?sessionType=${sessionType}`;
      if (selectedResumeId) {
        query += `&resumeId=${selectedResumeId}`;
      }
      const data = await api.post(`/interviews/start${query}`);
      setSession(data);
    } catch (err) {
      setError(err.message || 'Failed to start interview session.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    const currentQuestion = session.questions[currentIdx];
    setAnswers({
      ...answers,
      [currentQuestion.id]: option
    });
  };

  const handleTextAnswerChange = (val) => {
    const currentQuestion = session.questions[currentIdx];
    setAnswers({
      ...answers,
      [currentQuestion.id]: val
    });
  };

  const handleNext = () => {
    if (currentIdx < session.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmitSession = async () => {
    setSubmitting(true);
    setError('');
    try {
      // Map answers to the format expected by backend: { answers: [{ questionId, userAnswer }] }
      const answersPayload = Object.keys(answers).map(qId => ({
        questionId: parseInt(qId),
        userAnswer: answers[qId]
      }));

      // If they missed answering some questions, fill them with empty strings
      session.questions.forEach(q => {
        if (!answers[q.id]) {
          answersPayload.push({
            questionId: q.id,
            userAnswer: ''
          });
        }
      });

      const graded = await api.post(`/interviews/${session.id}/submit`, { answers: answersPayload });
      setGradedSession(graded);
      setSession(null); // End the active QA simulator
    } catch (err) {
      setError(err.message || 'Failed to grade interview session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>AI Mock Interview Coach</h1>
        <p style={styles.subtitle}>Test your tech skills or HR readiness with real-time, customizable grading.</p>
      </header>

      {error && (
        <div style={styles.errorBanner}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Setup Card */}
      {!session && !gradedSession && !loading && (
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.sectionTitle}>Configure Interview Session</h3>
          <form onSubmit={handleStart} style={styles.setupForm}>
            
            <div className="form-group">
              <label className="form-label" htmlFor="type">Select Interview Type</label>
              <select 
                id="type"
                className="form-input" 
                value={sessionType} 
                onChange={(e) => setSessionType(e.target.value)}
                style={styles.select}
              >
                <option value="JAVA_MCQ">Java MCQs (Multiple Choice Questions)</option>
                <option value="HR">HR & Behavioral Questions</option>
                <option value="CODING">Coding Assessment (Logical/Algorithm Java questions)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="resume">Resume Context (Recommended)</label>
              {resumes.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                  No resumes uploaded. We will use a standard backend developer context.
                </p>
              ) : (
                <select 
                  id="resume"
                  className="form-input"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  style={styles.select}
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.fileName} ({new Date(r.uploadedAt).toLocaleDateString()})</option>
                  ))}
                </select>
              )}
            </div>

            <button type="submit" className="btn-primary" style={styles.startBtn}>
              <Tv size={18} />
              <span>Generate Mock Interview</span>
            </button>
          </form>
        </div>
      )}

      {/* 2. Loading State */}
      {loading && (
        <div className="glass-panel" style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <h3 style={{ fontSize: '1.2rem', marginTop: '20px' }}>Generating customized questions...</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px' }}>
            Gemini is creating a tailored interview based on your selected skills and resume profile.
          </p>
        </div>
      )}

      {/* 3. Simulator QA View */}
      {session && (
        <div style={styles.simulatorContainer}>
          {/* Progress Tracker */}
          <div style={styles.progressTracker}>
            {session.questions.map((_, idx) => (
              <div 
                key={idx} 
                style={{
                  ...styles.progressNode,
                  backgroundColor: idx === currentIdx ? '#8b5cf6' : (answers[session.questions[idx].id] ? '#3b82f6' : 'rgba(255,255,255,0.05)'),
                  boxShadow: idx === currentIdx ? '0 0 10px #8b5cf6' : 'none'
                }}
              ></div>
            ))}
          </div>

          <div className="glass-panel" style={styles.qaCard}>
            <div style={styles.qaHeader}>
              <span style={styles.questionNum}>Question {currentIdx + 1} of {session.questions.length}</span>
              <span style={styles.badge}>{session.sessionType}</span>
            </div>

            <h2 style={styles.questionText}>{session.questions[currentIdx].questionText}</h2>

            <div style={styles.answerArea}>
              {/* MCQ Options Rendering */}
              {session.questions[currentIdx].questionType === 'MCQ' && session.questions[currentIdx].options && (
                <div style={styles.mcqGrid}>
                  {session.questions[currentIdx].options.split(';;').map((option, idx) => {
                    const isSelected = answers[session.questions[currentIdx].id] === option;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        style={{
                          ...styles.mcqOption,
                          ...(isSelected ? styles.mcqOptionSelected : {})
                        }}
                      >
                        <span style={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Text/HR Answers Rendering */}
              {session.questions[currentIdx].questionType === 'HR' && (
                <textarea
                  className="form-input"
                  rows={8}
                  placeholder="Type your structured answer here (STAR method: Situation, Task, Action, Result is recommended)..."
                  value={answers[session.questions[currentIdx].id] || ''}
                  onChange={(e) => handleTextAnswerChange(e.target.value)}
                  style={styles.textArea}
                />
              )}

              {/* Coding Answers Rendering */}
              {session.questions[currentIdx].questionType === 'CODING' && (
                <div style={styles.codeContainer}>
                  <div style={styles.codeHeader}>
                    <Code2 size={16} color="#3b82f6" />
                    <span>Java Coding Arena</span>
                  </div>
                  <textarea
                    className="form-input"
                    rows={12}
                    placeholder="// Write your Java method here...&#10;public int solution() {&#10;    &#10;}"
                    value={answers[session.questions[currentIdx].id] || ''}
                    onChange={(e) => handleTextAnswerChange(e.target.value)}
                    style={styles.codeArea}
                  />
                </div>
              )}
            </div>

            {/* Navigation footer */}
            <div style={styles.navFooter}>
              <button 
                onClick={handleBack} 
                className="btn-secondary" 
                disabled={currentIdx === 0}
              >
                Previous
              </button>

              {currentIdx < session.questions.length - 1 ? (
                <button 
                  onClick={handleNext} 
                  className="btn-primary"
                >
                  <span>Next Question</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleSubmitSession} 
                  className="btn-primary" 
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px -3px rgba(16, 185, 129, 0.4)' }}
                >
                  {submitting ? 'Evaluating...' : 'Submit Answers'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Graded Results View */}
      {gradedSession && (
        <div className="animate-fade-in" style={styles.resultsContainer}>
          <div className="glass-panel" style={styles.resultsSummaryCard}>
            <div style={styles.summaryGrid}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Evaluation Complete!</h2>
                <p style={{ color: '#9ca3af', marginTop: '6px' }}>
                  Gemini has assessed your mock session and provided feedback.
                </p>
                <div style={styles.infoPills}>
                  <span style={styles.infoPill}>Session: <strong>#{gradedSession.id}</strong></span>
                  <span style={styles.infoPill}>Type: <strong>{gradedSession.sessionType}</strong></span>
                </div>
                <button onClick={() => setGradedSession(null)} className="btn-primary" style={{ marginTop: '24px' }}>
                  Start Another Simulator
                </button>
              </div>

              <div style={styles.radialGaugeCol}>
                <div className="score-circle">
                  <svg>
                    <circle cx="70" cy="70" r="60" className="bg" />
                    <circle 
                      cx="70" 
                      cy="70" 
                      r="60" 
                      className="progress" 
                      stroke="#8b5cf6"
                      strokeDashoffset={377 - (377 * (gradedSession.score || 0)) / 100}
                    />
                  </svg>
                  <div className="score-text">
                    <span className="score-val" style={{ color: '#8b5cf6' }}>{gradedSession.score || 0}%</span>
                    <span className="score-label">Graded</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3 style={{ ...styles.sectionTitle, marginTop: '16px' }}>Detailed Question Breakdown</h3>
          
          <div style={styles.questionsList}>
            {gradedSession.questions.map((q, idx) => (
              <div key={q.id} className="glass-panel" style={styles.questionReportCard}>
                <div style={styles.reportCardHeader}>
                  <span style={styles.reportQNum}>Question {idx + 1}</span>
                  <span style={styles.reportScore(q.score)}>{q.score}/100</span>
                </div>

                <h4 style={styles.reportQText}>{q.questionText}</h4>

                <div style={styles.reportAnswers}>
                  <div style={styles.answerBlock}>
                    <span style={styles.blockLabel}>Your Answer:</span>
                    <pre style={styles.blockContent}>{q.userAnswer || '[No Answer Provided]'}</pre>
                  </div>

                  <div style={styles.answerBlock}>
                    <span style={styles.blockLabel}>Correct/Expected Guideline:</span>
                    <pre style={{ ...styles.blockContent, color: '#10b981', borderLeftColor: '#10b981' }}>{q.correctAnswer}</pre>
                  </div>

                  <div style={styles.feedbackBlock}>
                    <span style={{ ...styles.blockLabel, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} /> AI Evaluator Feedback:
                    </span>
                    <p style={styles.feedbackContent}>{q.aiFeedback}</p>
                  </div>
                </div>
              </div>
            ))}
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
  card: {
    padding: '32px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
    maxWidth: '680px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#f9fafb',
  },
  setupForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  select: {
    cursor: 'pointer',
    backgroundColor: '#131a26',
  },
  startBtn: {
    marginTop: '16px',
    padding: '14px',
    fontSize: '1rem',
    justifyContent: 'center',
  },
  loadingCard: {
    padding: '60px 40px',
    textAlign: 'center',
    backgroundColor: 'rgba(20, 28, 43, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '680px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(59, 130, 246, 0.2)',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  simulatorContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '800px',
  },
  progressTracker: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px',
  },
  progressNode: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    transition: 'all 0.3s ease',
  },
  qaCard: {
    padding: '32px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
  },
  qaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  questionNum: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  questionText: {
    fontSize: '1.4rem',
    fontWeight: '700',
    lineHeight: '1.4',
    marginBottom: '32px',
  },
  answerArea: {
    marginBottom: '32px',
  },
  mcqGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '14px',
  },
  mcqOption: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: '#e5e7eb',
    padding: '16px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
  },
  mcqOptionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: '#3b82f6',
    boxShadow: '0 0 15px -3px rgba(59, 130, 246, 0.3)',
    color: 'white',
  },
  optionLetter: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  textArea: {
    width: '100%',
    lineHeight: '1.5',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  codeContainer: {
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  codeHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '10px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    color: '#9ca3af',
    fontWeight: '600',
  },
  codeArea: {
    width: '100%',
    border: 'none',
    borderRadius: '0',
    fontFamily: '"Courier New", Courier, monospace',
    backgroundColor: '#070a13',
    padding: '16px',
    fontSize: '0.95rem',
  },
  navFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '20px',
  },
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '800px',
  },
  resultsSummaryCard: {
    padding: '32px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '40px',
    alignItems: 'center',
  },
  infoPills: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  infoPill: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  radialGaugeCol: {
    display: 'flex',
    justifyContent: 'center',
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  questionReportCard: {
    padding: '24px',
    backgroundColor: 'rgba(20, 28, 43, 0.5)',
  },
  reportCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  reportQNum: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#8b5cf6',
    textTransform: 'uppercase',
  },
  reportScore: (score) => ({
    backgroundColor: score >= 80 ? 'rgba(16, 185, 129, 0.1)' : (score >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(244, 63, 94, 0.1)'),
    color: score >= 80 ? '#10b981' : (score >= 50 ? '#f59e0b' : '#f43f5e'),
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700',
  }),
  reportQText: {
    fontSize: '1.15rem',
    fontWeight: '700',
    marginBottom: '20px',
    lineHeight: '1.4',
  },
  reportAnswers: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  answerBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  blockLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  blockContent: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderLeft: '3px solid #3b82f6',
    padding: '12px 16px',
    borderRadius: '0 6px 6px 0',
    fontSize: '0.9rem',
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    color: '#e5e7eb',
  },
  feedbackBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
    border: '1px solid rgba(139, 92, 246, 0.1)',
    padding: '16px',
    borderRadius: '8px',
  },
  feedbackContent: {
    fontSize: '0.9rem',
    lineHeight: '1.5',
    color: '#d1d5db',
  }
};
