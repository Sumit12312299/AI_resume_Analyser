import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  FileText, 
  Briefcase, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  ArrowLeft,
  Download,
  Copy,
  Zap,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  Search,
  Cpu,
  Moon,
  Sun,
  Upload,
  X,
  FileCheck,
  Fingerprint,
  Activity,
  Compass,
  FileDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';

// Internal Utils
import { analyzeResume } from './utils/analysis';

// PDF.js configuration
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// --- COMPONENTS ---

const SpotlightCard = ({ children, className = "", style = {} }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      className={`glass ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      <motion.div
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.15), transparent 80%)`
          ),
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </motion.div>
  );
};

const MeshBackground = () => (
  <div className="mesh-bg">
    <div className="mesh-circle" style={{ width: '40vw', height: '40vw', background: '#6366f1', top: '-10%', left: '-10%' }} />
    <div className="mesh-circle" style={{ width: '30vw', height: '30vw', background: '#0ea5e9', bottom: '10%', right: '-5%' }} />
    <div className="mesh-circle" style={{ width: '25vw', height: '25vw', background: '#f43f5e', top: '40%', left: '30%', opacity: 0.1 }} />
  </div>
);

function App() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isDownloading, setIsDownloading] = useState(false);
  
  const fileInputRef = useRef(null);
  const resumePrintRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const extractTextFromPdf = async (file) => {
    setIsParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n';
      }
      setResume(fullText);
      setUploadedFile(file);
    } catch (error) {
      alert('PDF Analysis Interrupted. System Error.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleRunAnalysis = () => {
    if (!resume || !jobDescription) return;
    setIsAnalyzing(true);
    
    // Simulate thinking time for "accuracy" feel
    setTimeout(() => {
      const liveResults = analyzeResume(resume, jobDescription);
      setResults(liveResults);
      setIsAnalyzing(false);
    }, 2500);
  };

  const downloadResumePdf = () => {
    if (!resumePrintRef.current) return;
    setIsDownloading(true);
    
    const element = resumePrintRef.current;
    const opt = {
      margin: 10,
      filename: `Improved_Resume_${uploadedFile ? uploadedFile.name : 'Generated'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsDownloading(false);
    });
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <MeshBackground />
      
      <div className="container">
        {/* HUD Elements */}
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <header style={{ marginBottom: '8rem' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--accent-primary)', marginBottom: '1.5rem', fontWeight: 600 }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--accent-primary)' }} />
              PULSE_ANALYTICS_v2.0
            </div>
            <h1>
              <span className="text-gradient">Precision AI</span><br />
              <span style={{ color: 'var(--text-primary)' }}>Career Architect</span>
            </h1>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', maxWidth: '600px', marginTop: '2rem' }}>
              Advanced heuristic scanning to bridge the gap between your talent and industry requirements.
            </p>
          </motion.div>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {!results && !isAnalyzing && (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}
              >
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                    <Fingerprint size={32} color="var(--accent-primary)" />
                    <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)' }}>DATA_SOURCE_IDENTIFICATION</h2>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                   <SpotlightCard style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                      <FileText size={20} color="var(--accent-primary)" /> TALENT_PROFILE (PDF/Text)
                    </div>
                    
                    {!uploadedFile ? (
                      <div 
                        className={`drop-zone`}
                        onDrop={(e) => { e.preventDefault(); extractTextFromPdf(e.dataTransfer.files[0]); }}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current.click()}
                        style={{ borderStyle: 'dashed', background: 'rgba(0,0,0,0.1)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                      >
                        {isParsing && <div className="scanner-line" />}
                        <input type="file" ref={fileInputRef} onChange={(e) => extractTextFromPdf(e.target.files[0])} style={{ display: 'none' }} />
                        <Upload size={32} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
                        <p style={{ fontWeight: 600 }}>{isParsing ? 'NEURAL_SCANNING...' : 'PUSH_PDF_RESUME'}</p>
                      </div>
                    ) : (
                      <div className="file-info" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <FileCheck size={20} color="var(--success)" />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{uploadedFile.name}</span>
                        <X size={18} onClick={() => { setUploadedFile(null); setResume(''); }} style={{ cursor: 'pointer' }} />
                      </div>
                    )}

                    <textarea 
                      rows={6} 
                      placeholder="RAW_TEXT_INJECTION"
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      style={{ marginTop: '1.5rem', width: '100%', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                    />
                   </SpotlightCard>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                   <SpotlightCard style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                      <Briefcase size={20} color="var(--accent-secondary)" /> BENCHMARK_CRITERIA (JD)
                    </div>
                    <textarea 
                      rows={14} 
                      placeholder="INSERT_REQUIREMENT_SPEC"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                    />
                   </SpotlightCard>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                    onClick={handleRunAnalysis}
                    disabled={!resume || !jobDescription}
                  >
                    CALCULATE_MATCH_VECTORS <Sparkles size={20} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10rem 0' }}
              >
                <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} style={{ position: 'absolute', inset: 0, border: '2px solid rgba(99, 102, 241, 0.1)', borderRadius: '50%' }} />
                   <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ position: 'absolute', inset: '15px', border: '3px solid transparent', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} />
                   <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                     <Activity size={48} color="var(--accent-primary)" />
                   </div>
                </div>
                <h3 style={{ marginTop: '3rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.3em', fontSize: '0.9rem' }}>CORRELATING_DATA_POINTS...</h3>
              </motion.div>
            )}

            {results && (
              <motion.div
                key="results"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}
              >
                <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setResults(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={16} /> RESET_SYSTEM
                  </button>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <div className="badge badge-success">ACCURACY_MODE:DYNAMIC</div>
                     <div className="badge" style={{ color: 'var(--accent-primary)' }}>LATENCY: 42MS</div>
                  </div>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '3rem' }}>
                   <SpotlightCard style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ position: 'relative', width: '240px', height: '240px' }}>
                        <svg width="240" height="240" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                          <motion.circle cx="50" cy="50" r="45" fill="none" stroke="url(#scoreGrad)" strokeWidth="6" strokeDasharray="283" strokeDashoffset={283 - (283 * results.score) / 100} strokeLinecap="round" transform="rotate(-90 50 50)" />
                          <defs>
                            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#f43f5e" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <span style={{ fontSize: '4.5rem', fontWeight: 800 }}>{results.score}</span>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ALIGNMENT_SCORE</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', textAlign: 'center' }}>
                        <div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{results.percentile}%</div>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>PERCENTILE_RANK</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{results.matches}/{results.matches + results.gaps}</div>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>VECTOR_MATCHES</div>
                        </div>
                      </div>
                   </SpotlightCard>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                      <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
                        <SpotlightCard style={{ padding: '2rem', height: '100%' }}>
                          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--success)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={16} /> POSITIVE_SIGNALS
                          </h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {results.matchingSkills.map((s, i) => <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }} key={s} className="badge badge-success">{s}</motion.span>)}
                          </div>
                        </SpotlightCard>
                      </motion.div>
                      <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
                        <SpotlightCard style={{ padding: '2rem', height: '100%' }}>
                          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Target size={16} /> CRITICAL_GAPS
                          </h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {results.missingSkills.map((s, i) => <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }} key={s} className="badge badge-danger">{s}</motion.span>)}
                          </div>
                        </SpotlightCard>
                      </motion.div>
                      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} style={{ gridColumn: 'span 2' }}>
                        <SpotlightCard style={{ padding: '2.5rem' }}>
                          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '1.25rem' }}>SYSTEM_RECOMMENDATIONS</h4>
                          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {results.suggestions.map((s, i) => (
                              <li key={i} style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                <div style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>0{i+1}</div>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </SpotlightCard>
                      </motion.div>
                   </div>
                </div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <SpotlightCard style={{ padding: '4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
                      <div>
                        <h3 style={{ fontSize: '2rem' }}>GENERATED_OPTIMIZED_SOURCE</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Heuristic-driven rewrite tailored for modern ATS architectures.</p>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                         <motion.button whileTap={{ scale: 0.95 }} className="btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                           <Copy size={18} /> COPY_BUFF
                         </motion.button>
                         <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={downloadResumePdf}
                          disabled={isDownloading}
                          className="btn-primary" 
                          style={{ padding: '0.8rem 1.8rem', fontSize: '0.9rem', minWidth: '180px' }}
                         >
                           {isDownloading ? (
                             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Cpu size={18} /></motion.div>
                           ) : (
                             <><FileDown size={18} /> EXPORT_PDF</>
                           )}
                         </motion.button>
                      </div>
                    </div>
                    {/* The printable area */}
                    <div 
                      ref={resumePrintRef}
                      className="prose" 
                      style={{ 
                        background: '#ffffff', 
                        padding: '4rem', 
                        borderRadius: '24px', 
                        color: '#000000',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                        fontSize: '1rem',
                        maxWidth: '850px',
                        margin: '0 auto'
                      }}
                    >
                      <ReactMarkdown>{results.finalResume}</ReactMarkdown>
                    </div>
                  </SpotlightCard>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer style={{ marginTop: '10rem', paddingBottom: '6rem', borderTop: '1px solid var(--glass-border)', paddingTop: '4rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
          <div>© PULSE_SYSTEMS // AI_CAREER_ARCHITECT</div>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={12} /> ENGINE_READY</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Compass size={12} /> V_SYNC_ACTIVE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
