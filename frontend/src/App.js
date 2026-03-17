import { useState, useRef } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000"; // Change this to your server URL

/* ─────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────── */
function HomePage({ onNavigate }) {
  return (
    <div className="page home-page">
      <div className="home-bg">
        <div className="hb hb1" /><div className="hb hb2" /><div className="hb hb3" />
      </div>
      <div className="home-content">
        <div className="hero">
          <div className="hero-badge"><span className="badge-dot" />AI-Powered · Free to Use</div>
          <h1 className="hero-title">AI Resume<br /><span className="hero-accent">Analyzer</span></h1>
          <p className="hero-desc">Upload your resume and get instant AI-powered feedback, keyword matching, and a professional score — all in seconds.</p>
        </div>

        <div className="feature-grid">
          <button className="feat-card" onClick={() => onNavigate("analyze")}>
            <div className="feat-icon-wrap icon-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="feat-body">
              <h3 className="feat-title">Upload &amp; Analyze</h3>
              <p className="feat-desc">Upload your resume and paste a job description to get tailored keyword analysis and instant feedback.</p>
            </div>
            <div className="feat-arrow">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
            </div>
            <div className="feat-shine" />
          </button>

          <button className="feat-card" onClick={() => onNavigate("score")}>
            <div className="feat-icon-wrap icon-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <div className="feat-body">
              <h3 className="feat-title">Resume Score</h3>
              <p className="feat-desc">Get a detailed score across formatting, clarity, impact, and ATS compatibility with actionable tips.</p>
            </div>
            <div className="feat-arrow">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
            </div>
            <div className="feat-shine" />
          </button>
        </div>

        <div className="stats-strip">
          <div className="stat-pill"><span className="sp-num">10k+</span><span className="sp-lbl">Resumes analyzed</span></div>
          <div className="stat-sep" />
          <div className="stat-pill"><span className="sp-num">94%</span><span className="sp-lbl">User satisfaction</span></div>
          <div className="stat-sep" />
          <div className="stat-pill"><span className="sp-num">&lt;5s</span><span className="sp-lbl">Analysis time</span></div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   UPLOAD & ANALYZE PAGE
───────────────────────────────────────── */
function AnalyzePage({ onBack }) {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("job_description", jobDesc);

      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setJobDesc(""); setResult(null); setError(null); };
  const wordCount = jobDesc.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = file && jobDesc.length > 30;

  return (
    <div className="page inner-page">
      <div className="inner-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          Back
        </button>
        <div className="inner-title-wrap">
          <div className="inner-icon icon-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          </div>
          <div>
            <h2 className="inner-title">Upload &amp; Analyze</h2>
            <p className="inner-sub">Match your resume to a job description</p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingScreen labels={["Uploading resume", "Extracting keywords", "Matching job description", "Generating insights"]} />
      ) : result ? (
        <div className="result-body">
          {/* Score */}
          {result.score !== undefined && (
            <div className="res-score-row">
              <RingScore score={result.score} color="#63d2aa" />
              <div>
                <p className="res-score-label">Match Score</p>
                <h3 className="res-score-title">
                  {result.score >= 80 ? "Strong Match!" : result.score >= 60 ? "Good Match" : "Needs Work"}
                </h3>
                <p className="res-score-sub">Based on keyword &amp; content alignment</p>
              </div>
            </div>
          )}

          {/* Matched keywords */}
          {result.matched_keywords?.length > 0 && (
            <div className="kw-section">
              <p className="kw-heading kw-green">✓ Matched keywords</p>
              <div className="kw-chips">
                {result.matched_keywords.map((k, i) => <span key={i} className="kw-chip chip-green">{k}</span>)}
              </div>
            </div>
          )}

          {/* Missing keywords */}
          {result.missing_keywords?.length > 0 && (
            <div className="kw-section">
              <p className="kw-heading kw-red">✕ Missing keywords</p>
              <div className="kw-chips">
                {result.missing_keywords.map((k, i) => <span key={i} className="kw-chip chip-red">{k}</span>)}
              </div>
            </div>
          )}

          {/* Tips / feedback */}
          {result.tips?.length > 0 && (
            <div className="tips-box">
              <p className="tips-head">Suggestions</p>
              {result.tips.map((t, i) => (
                <div key={i} className="tip-row" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="tip-dot" /><span>{t}</span>
                </div>
              ))}
            </div>
          )}

          {/* Raw feedback fallback */}
          {result.feedback && !result.tips && (
            <div className="tips-box">
              <p className="tips-head">Feedback</p>
              <p className="raw-feedback">{result.feedback}</p>
            </div>
          )}

          <button className="btn-outline" onClick={reset}>Analyze another</button>
        </div>
      ) : (
        <div className="form-body">
          <div className="form-section">
            <label className="form-label">Your Resume</label>
            <div
              className={`dropzone${dragging ? " dz-drag" : ""}${file ? " dz-filled" : ""}`}
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
              <div className="dz-icon">
                {file
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                }
              </div>
              <p className="dz-title">{file ? file.name : "Drop your resume here"}</p>
              <p className="dz-sub">{file ? `${(file.size / 1024).toFixed(1)} KB · click to replace` : "PDF, DOC, DOCX · or click to browse"}</p>
              {!file && <div className="dz-ripple" />}
            </div>
          </div>

          <div className="form-section">
            <div className="label-row">
              <label className="form-label">Job Description</label>
              {wordCount > 0 && <span className="word-badge">{wordCount} words</span>}
            </div>
            <textarea className="jd-ta" placeholder="Paste the full job description here…" rows={6} value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className={`btn-primary${canSubmit ? " btn-active" : ""}`} disabled={!canSubmit} onClick={handleSubmit}>
            <span>Analyze Resume</span>
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   RESUME SCORE PAGE
───────────────────────────────────────── */
function ScorePage({ onBack }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(`${API_BASE}/score`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(null); };

  return (
    <div className="page inner-page">
      <div className="inner-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          Back
        </button>
        <div className="inner-title-wrap">
          <div className="inner-icon icon-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
          </div>
          <div>
            <h2 className="inner-title">Resume Score</h2>
            <p className="inner-sub">Get a detailed breakdown of your resume quality</p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingScreen labels={["Uploading resume", "Checking structure", "Evaluating content", "Calculating score"]} />
      ) : result ? (
        <div className="result-body">
          {/* Overall score */}
          {result.overall_score !== undefined && (
            <div className="res-score-row">
              <RingScore score={result.overall_score} color="#4f8ef7" />
              <div>
                <p className="res-score-label">Overall Score</p>
                <h3 className="res-score-title">
                  {result.overall_score >= 80 ? "Excellent!" : result.overall_score >= 60 ? "Good Resume" : "Needs Improvement"}
                </h3>
                <p className="res-score-sub">Across all scoring categories</p>
              </div>
            </div>
          )}

          {/* Category breakdown */}
          {result.categories?.length > 0 && (
            <div className="cat-list">
              {result.categories.map((c, i) => (
                <div key={i} className="cat-row" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="cat-top">
                    <span className="cat-label">{c.label}</span>
                    <span className="cat-score" style={{ color: c.color || "#4f8ef7" }}>{c.score}</span>
                  </div>
                  <div className="cat-track">
                    <div className="cat-bar" style={{ width: `${c.score}%`, background: c.color || "#4f8ef7", animationDelay: `${i * 0.12}s` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div className="tips-box">
              <p className="tips-head">Suggestions</p>
              {result.tips.map((t, i) => (
                <div key={i} className="tip-row" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="tip-dot" /><span>{t}</span>
                </div>
              ))}
            </div>
          )}

          {/* Raw feedback fallback */}
          {result.feedback && !result.tips && (
            <div className="tips-box">
              <p className="tips-head">Feedback</p>
              <p className="raw-feedback">{result.feedback}</p>
            </div>
          )}

          <button className="btn-outline" onClick={reset}>Score another resume</button>
        </div>
      ) : (
        <div className="form-body">
          <div className="form-section">
            <label className="form-label">Your Resume</label>
            <div
              className={`dropzone${dragging ? " dz-drag" : ""}${file ? " dz-filled" : ""}`}
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
              <div className="dz-icon">
                {file
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                }
              </div>
              <p className="dz-title">{file ? file.name : "Drop your resume here"}</p>
              <p className="dz-sub">{file ? `${(file.size / 1024).toFixed(1)} KB · click to replace` : "PDF, DOC, DOCX · or click to browse"}</p>
              {!file && <div className="dz-ripple" />}
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className={`btn-primary btn-blue${file ? " btn-active" : ""}`} disabled={!file} onClick={handleSubmit}>
            <span>Get My Score</span>
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────── */
function RingScore({ score, color }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  return (
    <div className="ring-wrap">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e2130" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="ring-inner">
        <span className="ring-num" style={{ color }}>{score}</span>
        <span className="ring-sub">/100</span>
      </div>
    </div>
  );
}

function LoadingScreen({ labels }) {
  return (
    <div className="loading-screen">
      <div className="loader-ring" />
      <p className="loading-title">Please wait…</p>
      <div className="loading-bars">
        {labels.map((l, i) => (
          <div key={i} className="lb-row">
            <span className="lb-label">{l}</span>
            <div className="lb-track"><div className="lb-bar" style={{ animationDelay: `${i * 0.45}s` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ROOT APP
───────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("home");
  return (
    <div className="app-root">
      <div className="particles">
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className="particle" style={{
            left: `${(i * 6.25) % 100}%`,
            top: `${(i * 13) % 100}%`,
            width: (i % 3) + 1,
            height: (i % 3) + 1,
            opacity: 0.1 + (i % 4) * 0.07,
            animationDuration: `${10 + (i % 6) * 2}s`,
            animationDelay: `${-(i * 0.8)}s`,
          }} />
        ))}
      </div>

      <div className="shell">
        <div className="top-bar">
          <button className="logo-btn" onClick={() => setPage("home")}>
            <div className="logo-dot" /><span>ResumeAI</span>
          </button>
        </div>

        <div className="page-wrap" key={page}>
          {page === "home"    && <HomePage onNavigate={setPage} />}
          {page === "analyze" && <AnalyzePage onBack={() => setPage("home")} />}
          {page === "score"   && <ScorePage  onBack={() => setPage("home")} />}
        </div>
      </div>
    </div>
  );
}