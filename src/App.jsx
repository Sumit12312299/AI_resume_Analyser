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
  FileDown,
  Settings,
  Brain,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  Edit,
  Sliders,
  CheckSquare,
  RefreshCw,
  Palette,
  Layout,
  ListChecks,
  Wand2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';

// Internal Utils
import { 
  analyzeResume, 
  analyzeResumeWithGemini,
  checkAtsCompliance,
  revampBulletPoint
} from './utils/analysis';

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

const SettingsModal = ({ isOpen, onClose, apiKey, setApiKey, selectedModel, setSelectedModel }) => {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState(selectedModel);

  useEffect(() => {
    if (isOpen) {
      setTempKey(apiKey);
      setTempModel(selectedModel);
    }
  }, [isOpen, apiKey, selectedModel]);

  const handleSave = () => {
    setApiKey(tempKey);
    setSelectedModel(tempModel);
    localStorage.setItem('gemini_api_key', tempKey);
    localStorage.setItem('gemini_model', tempModel);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="modal-card" 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Brain size={24} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>ENGINE_CONFIGURATION</h3>
              </div>
              <button className="modal-close" onClick={onClose}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>GEMINI_API_KEY</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter your Gemini API key..."
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    className="settings-input"
                    style={{ paddingRight: '3rem' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  <Info size={12} /> Get a free API key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-secondary)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>Google AI Studio <ExternalLink size={10} /></a>.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>SELECTED_MODEL</label>
                <select 
                  value={tempModel} 
                  onChange={(e) => setTempModel(e.target.value)}
                  className="settings-input"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Optimized)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Deep & Analytical)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Legacy)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-secondary" onClick={onClose}>CANCEL</button>
              <button className="btn-primary-small" onClick={handleSave}>SAVE_CHANGES</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const categorizeSkills = (matching = [], missing = []) => {
  const categories = {
    'Languages': ['javascript', 'typescript', 'python', 'java', 'c++', 'sql', 'postgresql', 'mongodb', 'nosql'],
    'Frameworks & Libs': ['react', 'node.js', 'graphql', 'rest api', 'jest', 'cypress', 'selenium', 'testing'],
    'Cloud & DevOps': ['aws', 'azure', 'docker', 'kubernetes', 'git', 'ci/cd', 'cloud', 'devops', 'microservices'],
    'Design & Methods': ['ui/ux', 'figma', 'agile', 'scrum', 'accessibility', 'wcag', 'performance', 'optimization', 'seo']
  };

  const result = {};
  Object.keys(categories).forEach(cat => {
    const matchInCat = matching.filter(s => categories[cat].includes(s.toLowerCase()));
    const missInCat = missing.filter(s => categories[cat].includes(s.toLowerCase()));
    if (matchInCat.length > 0 || missInCat.length > 0) {
      result[cat] = { match: matchInCat, miss: missInCat };
    }
  });

  const categorizedAll = Object.values(categories).flat();
  const otherMatch = matching.filter(s => !categorizedAll.includes(s.toLowerCase()));
  const otherMiss = missing.filter(s => !categorizedAll.includes(s.toLowerCase()));
  if (otherMatch.length > 0 || otherMiss.length > 0) {
    result['General Skills'] = { match: otherMatch, miss: otherMiss };
  }

  return result;
};

function App() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Gemini API & Settings States
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('gemini_model') || 'gemini-2.5-flash');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // --- NEW WORKSPACE / CUSTOMIZER / COPILOT STATES ---
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'audit', 'workspace', 'templates'
  const [editedResume, setEditedResume] = useState('');
  
  // Bullet Revamper States
  const [bulletInput, setBulletInput] = useState('');
  const [bulletOutput, setBulletOutput] = useState('');
  const [isRevamping, setIsRevamping] = useState(false);

  // Template Customizer States
  const [templateAccent, setTemplateAccent] = useState('#6366f1'); // Indigo default
  const [templateFont, setTemplateFont] = useState('sans'); // 'sans', 'serif', 'mono'
  const [templateFontSize, setTemplateFontSize] = useState('standard'); // 'compact', 'standard', 'large'
  const [templateLineHeight, setTemplateLineHeight] = useState('1.5');
  const [templateMargin, setTemplateMargin] = useState('balanced'); // 'narrow', 'balanced', 'wide'
  
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

  const handleRunAnalysis = async () => {
    if (!resume || !jobDescription) return;
    setIsAnalyzing(true);
    setApiError(null);
    
    if (apiKey) {
      try {
        const geminiResults = await analyzeResumeWithGemini(resume, jobDescription, apiKey, selectedModel);
        setResults(geminiResults);
        setEditedResume(geminiResults.finalResume);
        setActiveTab('analytics');
      } catch (error) {
        console.error(error);
        setApiError(error.message || 'Failed to connect to Gemini API. Please check your API key.');
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Fallback: Heuristic Analysis Engine
      setTimeout(() => {
        const liveResults = analyzeResume(resume, jobDescription);
        setResults(liveResults);
        setEditedResume(liveResults.finalResume);
        setActiveTab('analytics');
        setIsAnalyzing(false);
      }, 2500);
    }
  };

  const handleRevampBullet = async () => {
    if (!bulletInput.trim()) return;
    setIsRevamping(true);
    try {
      const revamped = await revampBulletPoint(bulletInput, apiKey, selectedModel);
      setBulletOutput(revamped);
    } catch (err) {
      console.error(err);
      setBulletOutput("Failed to revamp bullet point. Please check connection or try again.");
    } finally {
      setIsRevamping(false);
    }
  };

  const copyToClipboard = () => {
    if (!editedResume) return;
    navigator.clipboard.writeText(editedResume);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={apiKey} 
        setApiKey={setApiKey} 
        selectedModel={selectedModel} 
        setSelectedModel={setSelectedModel} 
      />

      <div className="container">
        {/* HUD Elements */}
        <div className="hud-tray">
          <button className="hud-button" onClick={() => setIsSettingsOpen(true)} title="Configure API Settings">
            <Settings size={22} />
          </button>
          <button className="hud-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle Light/Dark Theme">
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>

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
              {apiKey ? 'Deep neural semantic analysis to align your resume with high-impact job parameters.' : 'Advanced heuristic scanning to bridge the gap between your talent and industry requirements.'}
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
                  {apiError && (
                    <div className="api-error-banner">
                      <AlertCircle size={18} />
                      <span>{apiError}</span>
                    </div>
                  )}
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

                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                    onClick={handleRunAnalysis}
                    disabled={!resume || !jobDescription}
                  >
                    CALCULATE_MATCH_VECTORS <Sparkles size={20} />
                  </motion.button>

                  {!apiKey && (
                    <div className="pro-tip-banner">
                      <Sparkles size={16} color="var(--accent-primary)" />
                      <span>💡 <strong>Config Tip:</strong> Provide a Gemini API Key in the settings panel (bottom-right) to activate LLM-powered deep resume rewriting and analytical intelligence.</span>
                    </div>
                  )}
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
                style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
              >
                {/* Header System info */}
                <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <button onClick={() => setResults(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={16} /> RESET_SYSTEM
                  </button>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                     <div className="badge badge-success">
                       {apiKey ? `ACCURACY_MODE: DEEP_AI (${selectedModel.toUpperCase()})` : 'ACCURACY_MODE: LOCAL_HEURISTIC'}
                     </div>
                     <div className="badge" style={{ color: 'var(--accent-primary)' }}>{apiKey ? 'API_DRIVEN: GEMINI' : 'LATENCY: 42MS'}</div>
                  </div>
                </motion.div>

                {/* ADVANCED TAB BAR BUTTONS */}
                <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
                  <div className="tab-bar">
                    <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                      <Activity size={16} /> ANALYTICS_MATRIX
                    </button>
                    <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
                      <CheckSquare size={16} /> ATS_AUDIT_COPILOT
                    </button>
                    <button className={`tab-btn ${activeTab === 'workspace' ? 'active' : ''}`} onClick={() => setActiveTab('workspace')}>
                      <Edit size={16} /> WORKSPACE_EDITOR
                    </button>
                    <button className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
                      <Palette size={16} /> TEMPLATE_CUSTOMIZER
                    </button>
                  </div>
                </motion.div>

                {/* TAB CONTENTS CONTAINER */}
                <AnimatePresence mode="wait">
                  {/* TAB 1: ANALYTICS_MATRIX */}
                  {activeTab === 'analytics' && (
                    <motion.div
                      key="analytics-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '3rem' }}>
                        {/* Score Ring Card */}
                        <SpotlightCard style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                            <svg width="220" height="220" viewBox="0 0 100 100">
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
                              <span style={{ fontSize: '4rem', fontWeight: 800 }}>{results.score}</span>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>ALIGNMENT_SCORE</div>
                            </div>
                          </div>
                          <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%', textAlign: 'center' }}>
                            <div>
                              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{results.percentile}%</div>
                              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>PERCENTILE_RANK</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{results.matches}/{results.matches + results.gaps}</div>
                              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>VECTOR_MATCHES</div>
                            </div>
                          </div>
                        </SpotlightCard>

                        {/* Suggestions and Overview */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                          <SpotlightCard style={{ padding: '2.5rem' }}>
                            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Brain size={16} /> EXECUTIVE_SUMMARY
                            </h4>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                              {results.improvedSummary}
                            </p>
                          </SpotlightCard>

                          <SpotlightCard style={{ padding: '2.5rem' }}>
                            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-vibrant)', marginBottom: '1.25rem' }}>SYSTEM_RECOMMENDATIONS</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              {results.suggestions.map((s, i) => (
                                <li key={i} style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                  <div style={{ color: 'var(--accent-vibrant)', fontWeight: 800 }}>0{i+1}</div>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </SpotlightCard>
                        </div>
                      </div>

                      {/* Skills Matrix Category Grid */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                          <Layers size={22} color="var(--accent-secondary)" />
                          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>INTERACTIVE_SKILL_GAP_MATRIX</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                          Skills extracted from the Job Description mapped against your talent profile.
                        </p>

                        <div className="skills-matrix-grid">
                          {Object.entries(categorizeSkills(results.matchingSkills, results.missingSkills)).map(([category, data]) => (
                            <div key={category} className="matrix-category-card">
                              <h4 className="matrix-category-title">{category.toUpperCase()}</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {data.match.length > 0 && (
                                  <div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--success)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase' }}>Verified Matches</div>
                                    <div className="matrix-badge-list">
                                      {data.match.map(skill => (
                                        <span key={skill} className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.25rem 0.6rem' }}>{skill}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {data.miss.length > 0 && (
                                  <div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase' }}>Missing Gaps</div>
                                    <div className="matrix-badge-list">
                                      {data.miss.map(skill => (
                                        <span key={skill} className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '0.25rem 0.6rem' }}>{skill}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: ATS_AUDIT_COPILOT */}
                  {activeTab === 'audit' && (
                    <motion.div
                      key="audit-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}
                    >
                      {/* Left: ATS Compliance Checklists */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <SpotlightCard style={{ padding: '2.5rem' }}>
                          <div className="compliance-header">
                            <div>
                              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-mono)' }}>ATS_COMPLIANCE_AUDIT</h3>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                Structural analysis based on standard parser rules.
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: checkAtsCompliance(editedResume).complianceScore >= 70 ? 'var(--success)' : checkAtsCompliance(editedResume).complianceScore >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                                {checkAtsCompliance(editedResume).complianceScore}%
                              </div>
                              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>COMPLIANCE_SCORE</div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '2.5rem' }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                width: `${checkAtsCompliance(editedResume).complianceScore}%`, 
                                background: checkAtsCompliance(editedResume).complianceScore >= 70 ? 'var(--success)' : checkAtsCompliance(editedResume).complianceScore >= 40 ? 'var(--warning)' : 'var(--danger)',
                                transition: 'width 1s ease-out' 
                              }} 
                            />
                          </div>

                          <div className="compliance-grid">
                            {checkAtsCompliance(editedResume).checks.map(check => (
                              <div key={check.id} className="check-card">
                                <div className={`check-status-indicator ${check.status}`}>
                                  {check.status === 'pass' ? <CheckCircle2 size={14} /> : check.status === 'warning' ? <AlertCircle size={14} /> : <X size={14} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{check.label}</span>
                                    <span 
                                      className={`badge ${check.status === 'pass' ? 'badge-success' : check.status === 'warning' ? '' : 'badge-danger'}`}
                                      style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', border: 'none', background: check.status === 'pass' ? 'rgba(16,185,129,0.1)' : check.status === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: check.status === 'pass' ? 'var(--success)' : check.status === 'warning' ? 'var(--warning)' : 'var(--danger)' }}
                                    >
                                      {check.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{check.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </SpotlightCard>
                      </div>

                      {/* Right: STAR Bullet point revamp widget */}
                      <div>
                        <SpotlightCard style={{ padding: '2.5rem', height: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Wand2 size={22} color="var(--accent-primary)" />
                            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>STAR_BULLET_REVAMPER</h3>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                            Revamp weak bullets into action-driven statements containing Situation, Task, Action, and Metrics (STAR).
                          </p>

                          <div className="revamp-container">
                            <div className="revamp-input-group">
                              <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>ORIGINAL_BULLET_POINT</label>
                              <textarea
                                className="revamp-textarea"
                                value={bulletInput}
                                onChange={(e) => setBulletInput(e.target.value)}
                                placeholder="Example: I worked on the front-end dashboard and fixed some bugs."
                                rows={3}
                              />
                            </div>

                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleRevampBullet}
                              disabled={isRevamping || !bulletInput.trim()}
                              className="btn-primary-small"
                              style={{ width: '100%', background: 'var(--accent-primary)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}
                            >
                              {isRevamping ? (
                                <>
                                  <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> REVAMPING_VECTORS...
                                </>
                              ) : (
                                <>
                                  <Sparkles size={14} /> GENERATE_STAR_PHRASE
                                </>
                              )}
                            </motion.button>

                            {bulletOutput && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="revamp-output-card"
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>OPTIMIZED_BULLET_POINT</span>
                                  <button 
                                    onClick={() => { navigator.clipboard.writeText(bulletOutput); alert('Copied to clipboard'); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}
                                  >
                                    <Copy size={12} /> COPY
                                  </button>
                                </div>
                                <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                                  {bulletOutput}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        </SpotlightCard>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: WORKSPACE_EDITOR */}
                  {activeTab === 'workspace' && (
                    <motion.div
                      key="workspace-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="workspace-grid"
                    >
                      {/* Left: Markdown Editor */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>MARKDOWN_SOURCE_EDITOR</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Edits compile live on the right</span>
                        </div>
                        <textarea
                          className="editor-textarea"
                          value={editedResume}
                          onChange={(e) => setEditedResume(e.target.value)}
                          placeholder="Your optimized markdown resume starts here..."
                        />
                      </div>

                      {/* Right: Live preview sheet */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>LIVE_RENDER_SHEET</span>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={copyToClipboard} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}>
                              {isCopied ? 'COPIED!' : 'COPY_MARKDOWN'}
                            </button>
                            <button onClick={downloadResumePdf} disabled={isDownloading} className="btn-primary-small" style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}>
                              {isDownloading ? 'EXPORTING...' : 'EXPORT_PDF'}
                            </button>
                          </div>
                        </div>

                        {/* Document Container */}
                        <div 
                          ref={resumePrintRef}
                          style={{
                            background: '#ffffff', 
                            padding: '3rem', 
                            borderRadius: '20px', 
                            color: '#1f2937',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                            fontSize: '0.95rem',
                            lineHeight: '1.5',
                            fontFamily: 'inherit',
                            borderTop: `6px solid ${templateAccent}`,
                            minHeight: '650px',
                            textAlign: 'left'
                          }}
                        >
                          <ReactMarkdown
                            components={{
                              h1: ({ node, ...props }) => <h1 style={{ color: templateAccent, fontSize: '1.9rem', borderBottom: `2px solid ${templateAccent}22`, paddingBottom: '0.5rem', marginTop: '1.4rem', marginBottom: '0.8rem', fontWeight: 800 }} {...props} />,
                              h2: ({ node, ...props }) => <h2 style={{ color: '#111827', fontSize: '1.35rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem', marginTop: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }} {...props} />,
                              h3: ({ node, ...props }) => <h3 style={{ color: '#374151', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.25rem', fontWeight: 600 }} {...props} />,
                              p: ({ node, ...props }) => <p style={{ marginBottom: '0.75rem', color: '#374151' }} {...props} />,
                              li: ({ node, ...props }) => <li style={{ marginBottom: '0.4rem', color: '#374151' }} {...props} />,
                              ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.75rem' }} {...props} />,
                              ol: ({ node, ...props }) => <ol style={{ paddingLeft: '1.25rem', marginBottom: '0.75rem' }} {...props} />,
                              a: ({ node, ...props }) => <a style={{ color: templateAccent, textDecoration: 'underline' }} {...props} />,
                            }}
                          >
                            {editedResume}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: TEMPLATE_CUSTOMIZER */}
                  {activeTab === 'templates' && (
                    <motion.div
                      key="templates-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem' }}
                    >
                      {/* Left: Customizer controls panel */}
                      <div className="customizer-sidebar">
                        <SpotlightCard style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                          <h4 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                            DESIGN_CONTROLS
                          </h4>

                          {/* Accent Color dot selectors */}
                          <div className="customizer-section">
                            <span className="customizer-section-title">ACCENT_COLOR</span>
                            <div className="swatch-group">
                              {[
                                { name: 'Indigo', val: '#6366f1' },
                                { name: 'Emerald', val: '#10b981' },
                                { name: 'Rose', val: '#f43f5e' },
                                { name: 'Amber', val: '#d97706' },
                                { name: 'Slate', val: '#475569' }
                              ].map(color => (
                                <button
                                  key={color.name}
                                  className={`color-swatch ${templateAccent === color.val ? 'active' : ''}`}
                                  style={{ background: color.val }}
                                  onClick={() => setTemplateAccent(color.val)}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Font Selector */}
                          <div className="customizer-section">
                            <span className="customizer-section-title">TYPOGRAPHY</span>
                            <div className="selector-grid">
                              <button className={`selector-btn ${templateFont === 'sans' ? 'active' : ''}`} onClick={() => setTemplateFont('sans')}>Outfit</button>
                              <button className={`selector-btn ${templateFont === 'serif' ? 'active' : ''}`} onClick={() => setTemplateFont('serif')}>Georgia</button>
                              <button className={`selector-btn ${templateFont === 'mono' ? 'active' : ''}`} onClick={() => setTemplateFont('mono')}>Mono</button>
                            </div>
                          </div>

                          {/* Font Size Selector */}
                          <div className="customizer-section">
                            <span className="customizer-section-title">FONT_SIZE</span>
                            <div className="selector-grid">
                              <button className={`selector-btn ${templateFontSize === 'compact' ? 'active' : ''}`} onClick={() => setTemplateFontSize('compact')}>Compact</button>
                              <button className={`selector-btn ${templateFontSize === 'standard' ? 'active' : ''}`} onClick={() => setTemplateFontSize('standard')}>Standard</button>
                              <button className={`selector-btn ${templateFontSize === 'large' ? 'active' : ''}`} onClick={() => setTemplateFontSize('large')}>Large</button>
                            </div>
                          </div>

                          {/* Line Spacing Selector */}
                          <div className="customizer-section">
                            <span className="customizer-section-title">LINE_HEIGHT</span>
                            <div className="selector-grid">
                              <button className={`selector-btn ${templateLineHeight === '1.3' ? 'active' : ''}`} onClick={() => setTemplateLineHeight('1.3')}>1.3x</button>
                              <button className={`selector-btn ${templateLineHeight === '1.5' ? 'active' : ''}`} onClick={() => setTemplateLineHeight('1.5')}>1.5x</button>
                              <button className={`selector-btn ${templateLineHeight === '1.7' ? 'active' : ''}`} onClick={() => setTemplateLineHeight('1.7')}>1.7x</button>
                            </div>
                          </div>

                          {/* Margins Selector */}
                          <div className="customizer-section">
                            <span className="customizer-section-title">MARGIN_SPACING</span>
                            <div className="selector-grid">
                              <button className={`selector-btn ${templateMargin === 'narrow' ? 'active' : ''}`} onClick={() => setTemplateMargin('narrow')}>Narrow</button>
                              <button className={`selector-btn ${templateMargin === 'balanced' ? 'active' : ''}`} onClick={() => setTemplateMargin('balanced')}>Balanced</button>
                              <button className={`selector-btn ${templateMargin === 'wide' ? 'active' : ''}`} onClick={() => setTemplateMargin('wide')}>Wide</button>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button onClick={downloadResumePdf} disabled={isDownloading} className="btn-primary-small" style={{ width: '100%', background: templateAccent, color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.9rem' }}>
                              {isDownloading ? (
                                <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                              ) : (
                                <><FileDown size={14} /> EXPORT_PDF</>
                              )}
                            </button>
                            <button onClick={copyToClipboard} className="btn-secondary" style={{ width: '100%', padding: '0.75rem' }}>
                              {isCopied ? 'COPIED!' : 'COPY_SOURCE'}
                            </button>
                          </div>
                        </SpotlightCard>
                      </div>

                      {/* Right: Printable Custom Styled Document Preview */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>LIVE_STYLED_SHEET (PDF RENDER TARGET)</span>
                        <div 
                          ref={resumePrintRef}
                          style={{
                            background: '#ffffff',
                            color: '#111827',
                            padding: templateMargin === 'narrow' ? '2.5rem' : templateMargin === 'wide' ? '5.5rem' : '4rem',
                            borderRadius: '16px',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                            fontSize: templateFontSize === 'compact' ? '0.85rem' : templateFontSize === 'large' ? '1.05rem' : '0.95rem',
                            lineHeight: templateLineHeight,
                            fontFamily: templateFont === 'serif' ? 'Georgia, serif' : templateFont === 'mono' ? 'Courier New, monospace' : 'inherit',
                            borderTop: `8px solid ${templateAccent}`,
                            maxWidth: '820px',
                            margin: '0 auto',
                            textAlign: 'left'
                          }}
                        >
                          <ReactMarkdown
                            components={{
                              h1: ({ node, ...props }) => (
                                <h1 style={{ 
                                  color: templateAccent, 
                                  fontSize: templateFontSize === 'compact' ? '1.75rem' : templateFontSize === 'large' ? '2.3rem' : '2rem', 
                                  borderBottom: `2px solid ${templateAccent}25`, 
                                  paddingBottom: '0.5rem', 
                                  marginTop: '1.5rem', 
                                  marginBottom: '0.8rem',
                                  fontWeight: 800,
                                  fontFamily: templateFont === 'serif' ? 'Georgia, serif' : 'inherit'
                                }} {...props} />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2 style={{ 
                                  color: '#111827', 
                                  fontSize: templateFontSize === 'compact' ? '1.2rem' : templateFontSize === 'large' ? '1.5rem' : '1.35rem', 
                                  borderBottom: '1px solid #e5e7eb', 
                                  paddingBottom: '0.2,rem', 
                                  marginTop: '1.3rem', 
                                  marginBottom: '0.5rem',
                                  fontWeight: 700
                                }} {...props} />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3 style={{ 
                                  color: '#374151', 
                                  fontSize: templateFontSize === 'compact' ? '1.0rem' : templateFontSize === 'large' ? '1.2rem' : '1.1rem', 
                                  marginTop: '1.1rem', 
                                  marginBottom: '0.25rem',
                                  fontWeight: 600
                                }} {...props} />
                              ),
                              p: ({ node, ...props }) => (
                                <p style={{ 
                                  marginBottom: '0.75rem', 
                                  color: '#374151',
                                  fontSize: 'inherit',
                                  lineHeight: 'inherit'
                                }} {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li style={{ 
                                  marginBottom: '0.45rem', 
                                  color: '#374151',
                                  fontSize: 'inherit',
                                  lineHeight: 'inherit'
                                }} {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul style={{ 
                                  paddingLeft: '1.35rem',
                                  marginBottom: '0.9rem'
                                }} {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol style={{ 
                                  paddingLeft: '1.35rem',
                                  marginBottom: '0.9rem'
                                }} {...props} />
                              ),
                              a: ({ node, ...props }) => (
                                <a style={{ 
                                  color: templateAccent, 
                                  textDecoration: 'underline' 
                                }} {...props} />
                              ),
                            }}
                          >
                            {editedResume}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
