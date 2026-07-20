import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
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
  Wand2,
  Plus,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';

// Internal Utils
import { 
  analyzeResume, 
  analyzeResumeWithGemini,
  checkAtsCompliance,
  revampBulletPoint,
  getKeywordDensity,
  getInterviewPrepQuestions,
  evaluateInterviewResponse,
  tailorResumeSummary,
  tailorResumeExperience
} from './utils/analysis';

// PDF.js configuration
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// --- COMPONENTS ---

const SpotlightCard = ({ children, className = "", style = {} }) => {
  const mouseX = useMotionValue(200);
  const mouseY = useMotionValue(200);

  // Transform values for 3D tilt effect
  const rotateX = useSpring(useTransform(mouseY, [0, 400], [6, -6]), { damping: 25, stiffness: 200 });
  const rotateY = useSpring(useTransform(mouseX, [0, 400], [-6, 6]), { damping: 25, stiffness: 200 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(200);
    mouseY.set(200);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        perspective: 1000,
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: 'preserve-3d',
        ...style
      }}
    >
      <motion.div
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(450px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.15), transparent 80%)`
          ),
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, transform: 'translateZ(10px)' }}>{children}</div>
    </motion.div>
  );
};

const AnimatedCounter = ({ value, duration = 1.2 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) return;
    if (start === end) {
      setCount(end);
      return;
    }
    let totalMs = duration * 1000;
    let increment = Math.ceil(end / 40); // 40 steps
    let stepTime = Math.max(Math.floor(totalMs / 40), 16); // ~60fps target
    let timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count}</span>;
};

const AnimatedTextMessage = ({ text }) => {
  const words = text.split(' ');
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.02 } }
      }}
    >
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          variants={{
            hidden: { opacity: 0, y: 3 },
            visible: { opacity: 1, y: 0 }
          }}
          style={{ display: 'inline-block', marginRight: '0.25rem' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

const MeshBackground = () => (
  <div className="mesh-bg">
    <div className="mesh-circle" style={{ width: '45vw', height: '45vw', background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)', top: '-15%', left: '-15%' }} />
    <div className="mesh-circle" style={{ width: '35vw', height: '35vw', background: 'radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)', bottom: '5%', right: '-10%' }} />
    <div className="mesh-circle" style={{ width: '30vw', height: '30vw', background: 'radial-gradient(circle, var(--accent-vibrant) 0%, transparent 70%)', top: '35%', left: '25%', opacity: 0.08 }} />
    <div className="mesh-circle" style={{ width: '25vw', height: '25vw', background: 'radial-gradient(circle, #8b5cf6 0%, transparent 75%)', bottom: '40%', right: '20%', opacity: 0.05 }} />
  </div>
);

const SettingsModal = ({ onClose, apiKey, setApiKey, selectedModel, setSelectedModel }) => {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState(selectedModel);

  const handleSave = () => {
    setApiKey(tempKey);
    setSelectedModel(tempModel);
    localStorage.setItem('gemini_api_key', tempKey);
    localStorage.setItem('gemini_model', tempModel);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay" 
      onClick={onClose}
      style={{ perspective: 1200 }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.88, rotateX: -15 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.88, rotateX: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
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
    </motion.div>
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

const compileDataToMarkdown = (data) => {
  let md = `# ${data.name || 'Your Name'}\n`;
  if (data.title) md += `**${data.title}**\n\n`;
  
  const contacts = [];
  if (data.email) contacts.push(data.email);
  if (data.phone) contacts.push(data.phone);
  if (data.linkedin) contacts.push(data.linkedin);
  if (data.location) contacts.push(data.location);
  
  if (contacts.length > 0) {
    md += `${contacts.join('  |  ')}\n\n`;
  }
  
  if (data.summary) {
    md += `## Professional Summary\n${data.summary}\n\n`;
  }
  
  if (data.experiences && data.experiences.length > 0) {
    md += `## Professional Experience\n\n`;
    data.experiences.forEach(exp => {
      md += `### ${exp.role} at ${exp.company} (${exp.duration})\n`;
      const bullets = exp.bulletPoints.split('\n').filter(b => b.trim());
      bullets.forEach(b => {
        if (b.startsWith('-') || b.startsWith('*')) {
          md += `${b}\n`;
        } else {
          md += `- ${b}\n`;
        }
      });
      md += `\n`;
    });
  }
  
  if (data.education && data.education.length > 0) {
    md += `## Education\n\n`;
    data.education.forEach(edu => {
      md += `### ${edu.degree}\n*${edu.school} (${edu.year})*\n\n`;
    });
  }
  
  if (data.skills) {
    md += `## Skills\n${data.skills}\n`;
  }
  
  return md;
};

const parseMarkdownToData = (md) => {
  const data = {
    name: 'Sumit Kumar',
    title: 'Software Developer',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    summary: '',
    experiences: [],
    education: [],
    skills: ''
  };
  
  if (!md) return data;
  
  const lines = md.split('\n');
  let currentSection = '';
  let currentExp = null;
  
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    if (i === 0 && trimmed.startsWith('# ')) {
      data.name = trimmed.replace('#', '').trim();
      return;
    }
    
    if (i === 1 && trimmed.startsWith('**') && trimmed.endsWith('**') && !data.title) {
      data.title = trimmed.replace(/\*\*/g, '').trim();
      return;
    }
    
    if (trimmed.includes('@') || trimmed.includes('linkedin.com') || (trimmed.toLowerCase().includes('phone') || trimmed.toLowerCase().includes('mobile') || trimmed.toLowerCase().includes('email'))) {
      const delimiters = /[|•·,]| {2,}/;
      const parts = trimmed.split(delimiters).map(p => p.trim()).filter(Boolean);
      parts.forEach(p => {
        if (p.includes('@')) {
          const emailMatch = p.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          data.email = emailMatch ? emailMatch[0] : p;
        } else if (p.toLowerCase().includes('linkedin.com')) {
          const liMatch = p.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
          data.linkedin = liMatch ? liMatch[0] : p;
        } else if (/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(p) || p.toLowerCase().includes('mobile') || p.toLowerCase().includes('phone')) {
          const phoneMatch = p.replace(/(?:mobile|phone|tel|contact|:|\+)/ig, '').trim();
          data.phone = phoneMatch;
        } else {
          if (!data.location && p.length < 50 && !p.toLowerCase().includes('skills') && !p.toLowerCase().includes('projects')) {
            data.location = p;
          }
        }
      });
      return;
    }
    
    if (trimmed.startsWith('## ')) {
      const sec = trimmed.replace('##', '').trim().toLowerCase();
      if (sec.includes('summary') || sec.includes('profile')) {
        currentSection = 'summary';
      } else if (sec.includes('experience') || sec.includes('history')) {
        currentSection = 'experience';
      } else if (sec.includes('education')) {
        currentSection = 'education';
      } else if (sec.includes('skills')) {
        currentSection = 'skills';
      } else {
        currentSection = '';
      }
      return;
    }
    
    if (currentSection === 'summary') {
      data.summary += (data.summary ? '\n' : '') + trimmed;
    } else if (currentSection === 'skills') {
      data.skills += (data.skills ? ', ' : '') + trimmed;
    } else if (currentSection === 'experience') {
      if (trimmed.startsWith('### ')) {
        if (currentExp) data.experiences.push(currentExp);
        
        const header = trimmed.replace('###', '').trim();
        const parts = header.split(' at ');
        const role = parts[0] || 'Software Engineer';
        let company = 'Company';
        let duration = 'Present';
        if (parts[1]) {
          const compParts = parts[1].split('(');
          company = compParts[0].trim();
          if (compParts[1]) {
            duration = compParts[1].replace(')', '').trim();
          }
        }
        currentExp = { role, company, duration, bulletPoints: '' };
      } else if (currentExp && (trimmed.startsWith('-') || trimmed.startsWith('*'))) {
        const bullet = trimmed.replace(/^[-*]\s*/, '');
        currentExp.bulletPoints += (currentExp.bulletPoints ? '\n' : '') + bullet;
      }
    } else if (currentSection === 'education') {
      if (trimmed.startsWith('### ')) {
        const degree = trimmed.replace('###', '').trim();
        data.education.push({ degree, school: 'University', year: '' });
      } else if (data.education.length > 0 && (trimmed.startsWith('*') || trimmed.startsWith('_'))) {
        const schoolText = trimmed.replace(/[*_]/g, '').trim();
        const parts = schoolText.split('(');
        const school = parts[0] ? parts[0].trim() : 'University';
        const year = parts[1] ? parts[1].replace(')', '').trim() : '';
        data.education[data.education.length - 1].school = school;
        data.education[data.education.length - 1].year = year;
      }
    }
  });
  
  if (currentExp) data.experiences.push(currentExp);
  
  return data;
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
  
  // --- ADDITIONAL NEXT-LEVEL STATES ---
  const [templateLayout, setTemplateLayout] = useState('classic'); // 'classic', 'modern', 'creative', 'tech_elite'
  const [isFormWizard, setIsFormWizard] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [interviewMode, setInterviewMode] = useState('questions'); // 'questions', 'simulator'
  const [chatMessages, setChatMessages] = useState([]);
  const [currentChatIndex, setCurrentChatIndex] = useState(0); // 0 = ready, 1, 2, 3 = active Qs, 4 = finished
  const [userChatInput, setUserChatInput] = useState('');
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);
  const [sectionOrder, setSectionOrder] = useState(['summary', 'experience', 'education', 'skills']);
  const [tailoringStatus, setTailoringStatus] = useState({ summary: false, experiences: {} });
  const [resumeData, setResumeData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    summary: '',
    experiences: [],
    education: [],
    skills: ''
  });
  
  const fileInputRef = useRef(null);
  const resumePrintRef = useRef(null);

  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setSectionOrder(newOrder);
  };

  const handleTailorSummary = async () => {
    if (!resumeData.summary) return;
    setTailoringStatus(prev => ({ ...prev, summary: true }));
    try {
      const tailored = await tailorResumeSummary(resumeData.summary, jobDescription, apiKey, selectedModel);
      setResumeData(prev => ({ ...prev, summary: tailored }));
    } catch (err) {
      console.error(err);
      alert("Failed to tailor summary. Please check your API key.");
    } finally {
      setTailoringStatus(prev => ({ ...prev, summary: false }));
    }
  };

  const handleTailorExperience = async (index) => {
    const exp = resumeData.experiences[index];
    if (!exp || !exp.bulletPoints) return;
    setTailoringStatus(prev => ({ 
      ...prev, 
      experiences: { ...prev.experiences, [index]: true } 
    }));
    try {
      const tailored = await tailorResumeExperience(exp.role, exp.company, exp.bulletPoints, jobDescription, apiKey, selectedModel);
      updateExperience(index, 'bulletPoints', tailored);
    } catch (err) {
      console.error(err);
      alert("Failed to tailor experience bullets. Please check your API key.");
    } finally {
      setTailoringStatus(prev => ({ 
        ...prev, 
        experiences: { ...prev.experiences, [index]: false } 
      }));
    }
  };

  const startMockInterview = async () => {
    let activeQs = interviewQuestions;
    if (!activeQs || activeQs.length === 0) {
      setIsGeneratingQuestions(true);
      try {
        const questions = await getInterviewPrepQuestions(editedResume, jobDescription, apiKey, selectedModel);
        setInterviewQuestions(questions);
        activeQs = questions;
      } catch (err) {
        console.error(err);
        alert("Failed to generate questions. Please ensure Job Description and Resume are loaded.");
        return;
      } finally {
        setIsGeneratingQuestions(false);
      }
    }
    
    if (activeQs && activeQs.length > 0) {
      setCurrentChatIndex(1);
      setChatMessages([
        {
          sender: 'ai',
          text: `Welcome to your AI Mock Interview! I have analyzed your resume against the Job Description. Let's start with Question 1:\n\n**${activeQs[0].question}**`,
          question: activeQs[0].question
        }
      ]);
      setUserChatInput('');
    } else {
      alert("Could not generate interview questions.");
    }
  };

  const handleSendResponse = async () => {
    if (!userChatInput.trim()) return;
    const answer = userChatInput.trim();
    
    // Find current active question
    const aiMsgs = chatMessages.filter(m => m.sender === 'ai');
    const currentQ = aiMsgs[aiMsgs.length - 1]?.question || (interviewQuestions && interviewQuestions[currentChatIndex - 1]?.question);
    
    if (!currentQ) {
      alert("Error finding the current question.");
      return;
    }
    
    // Add user message
    const updatedMessages = [...chatMessages, { sender: 'user', text: answer }];
    setChatMessages(updatedMessages);
    setUserChatInput('');
    setIsSendingChatMessage(true);
    
    try {
      // Evaluate response
      const evalResult = await evaluateInterviewResponse(
        currentQ,
        answer,
        editedResume,
        jobDescription,
        apiKey,
        selectedModel
      );
      
      // Add feedback message
      const nextIndex = currentChatIndex + 1;
      let aiText = `**Score: ${evalResult.score}/10**\n\n**Recruiter Feedback:** ${evalResult.feedback}`;
      let nextQ = "";
      
      // We also want to record this score on the ai message object
      const newAiMsg = {
        sender: 'ai',
        text: '',
        score: evalResult.score,
        feedback: evalResult.feedback
      };
      
      if (nextIndex <= 3 && interviewQuestions[nextIndex - 1]) {
        nextQ = interviewQuestions[nextIndex - 1].question;
        aiText += `\n\nLet's move to Question ${nextIndex}:\n\n**${nextQ}**`;
        setCurrentChatIndex(nextIndex);
        newAiMsg.text = aiText;
        newAiMsg.question = nextQ;
        setChatMessages(prev => [...prev, newAiMsg]);
      } else {
        // Complete interview
        // Gather all previous scores from state + this score
        const prevScores = chatMessages
          .filter(m => m.sender === 'ai' && m.score !== undefined)
          .map(m => m.score);
        const allScores = [...prevScores, evalResult.score];
        
        const avgScore = allScores.length > 0 
          ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
          : evalResult.score;
          
        aiText += `\n\n**Mock Interview Complete!**\n\n**Overall Performance: ${avgScore}/10**\n\nRecommendations:\n- Structure details with Situation-Task-Action-Result.\n- Include direct KPIs and percentage improvements.`;
        setCurrentChatIndex(4); // complete
        newAiMsg.text = aiText;
        newAiMsg.isFinal = true;
        newAiMsg.avgScore = avgScore;
        setChatMessages(prev => [...prev, newAiMsg]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "Sorry, I encountered an error evaluating your response. Please try submitting again." 
      }]);
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Compile Wizard data to Markdown on changes
  useEffect(() => {
    if (isFormWizard && results) {
      const compiled = compileDataToMarkdown(resumeData);
      setEditedResume(compiled);
    }
  }, [resumeData, isFormWizard, results]);

  const extractTextFromPdf = async (file) => {
    setIsParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const items = content.items;
        if (items.length === 0) continue;
        
        // Group items on roughly the same line (y-coordinate within ~5 units)
        const lineGroups = {};
        items.forEach(item => {
          if (!item.str || !item.transform) return;
          const y = Math.round(item.transform[5] / 5) * 5;
          if (!lineGroups[y]) {
            lineGroups[y] = [];
          }
          lineGroups[y].push(item);
        });
        
        // Sort lines vertically (top to bottom)
        const sortedY = Object.keys(lineGroups).map(Number).sort((a, b) => b - a);
        
        const pageText = sortedY.map(y => {
          // Sort items horizontally (left to right)
          const lineItems = lineGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
          return lineItems.map(item => item.str).join(' ');
        }).join('\n');
        
        fullText += pageText + '\n';
      }
      setResume(fullText);
      setUploadedFile(file);
    } catch (error) {
      console.error(error);
      alert('PDF Analysis Interrupted. System Error.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFetchInterviewQuestions = async (resumeText, jdText) => {
    setIsGeneratingQuestions(true);
    try {
      const questions = await getInterviewPrepQuestions(resumeText, jdText, apiKey, selectedModel);
      setInterviewQuestions(questions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!resume || !jobDescription) return;
    setIsAnalyzing(true);
    setApiError(null);
    setLoadingStep(0);
    
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < 6 ? prev + 1 : prev));
    }, 450);
    
    if (apiKey) {
      try {
        const geminiResults = await analyzeResumeWithGemini(resume, jobDescription, apiKey, selectedModel);
        clearInterval(interval);
        setResults(geminiResults);
        setEditedResume(geminiResults.finalResume);
        
        // Populate Wizard data
        const parsedData = parseMarkdownToData(geminiResults.finalResume);
        setResumeData(parsedData);
        
        setActiveTab('analytics');
        setIsAnalyzing(false);

        // Fetch interview questions
        handleFetchInterviewQuestions(geminiResults.finalResume, jobDescription);
      } catch (error) {
        clearInterval(interval);
        console.error(error);
        setApiError(error.message || 'Failed to connect to Gemini API. Please check your API key.');
        setIsAnalyzing(false);
      }
    } else {
      // Fallback: Heuristic Analysis Engine
      setTimeout(() => {
        clearInterval(interval);
        const liveResults = analyzeResume(resume, jobDescription);
        setResults(liveResults);
        setEditedResume(liveResults.finalResume);
        
        // Populate Wizard data
        const parsedData = parseMarkdownToData(liveResults.finalResume);
        setResumeData(parsedData);
        
        setActiveTab('analytics');
        setIsAnalyzing(false);

        // Fetch interview questions
        handleFetchInterviewQuestions(liveResults.finalResume, jobDescription);
      }, 2800);
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

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { role: '', company: '', duration: '', bulletPoints: '' }]
    }));
  };

  const updateExperience = (index, field, value) => {
    setResumeData(prev => {
      const copy = [...prev.experiences];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, experiences: copy };
    });
  };

  const removeExperience = (index) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, idx) => idx !== index)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', school: '', year: '' }]
    }));
  };

  const updateEducation = (index, field, value) => {
    setResumeData(prev => {
      const copy = [...prev.education];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, education: copy };
    });
  };

  const removeEducation = (index) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== index)
    }));
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

  const renderResumeSheet = () => {
    // Styles based on settings
    const fontFam = templateFont === 'serif' ? 'Georgia, serif' : templateFont === 'mono' ? 'Courier New, monospace' : 'inherit';
    const padding = templateMargin === 'narrow' ? '2.5rem' : templateMargin === 'wide' ? '5.5rem' : '4rem';
    const fontSize = templateFontSize === 'compact' ? '0.85rem' : templateFontSize === 'large' ? '1.05rem' : '0.95rem';

    const containerStyle = {
      background: '#ffffff',
      color: '#111827',
      padding: padding,
      borderRadius: '16px',
      boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
      fontSize: fontSize,
      lineHeight: templateLineHeight,
      fontFamily: fontFam,
      borderTop: `8px solid ${templateAccent}`,
      maxWidth: '820px',
      margin: '0 auto',
      textAlign: 'left',
      transition: 'all 0.3s ease'
    };

    const hrStyle = {
      border: 'none',
      borderBottom: `2.5px solid ${templateAccent}22`,
      margin: '1.25rem 0'
    };

    const renderBullets = (bulletsText) => {
      if (!bulletsText) return null;
      return (
        <ul style={{ paddingLeft: '1.35rem', margin: '0.5rem 0' }}>
          {bulletsText.split('\n').filter(b => b.trim()).map((bullet, idx) => (
            <li key={idx} style={{ marginBottom: '0.45rem', color: '#374151', fontSize: 'inherit', lineHeight: 'inherit' }}>
              {bullet.replace(/^[-*]\s*/, '')}
            </li>
          ))}
        </ul>
      );
    };

    if (templateLayout === 'modern') {
      return (
        <div style={{ ...containerStyle, padding: 0, borderTop: 'none', display: 'grid', gridTemplateColumns: '250px 1fr', overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ background: '#f8fafc', padding: '2.5rem 2rem', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem', borderBottom: 'none' }}>{resumeData.name || 'Your Name'}</h2>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: templateAccent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{resumeData.title || 'Profession'}</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8rem', color: '#475569' }}>
              <span style={{ fontWeight: 600, borderBottom: `1.5px solid ${templateAccent}44`, paddingBottom: '0.2rem', color: templateAccent, fontSize: '0.75rem', letterSpacing: '0.05em' }}>CONTACT</span>
              {resumeData.email && <div style={{ wordBreak: 'break-all' }}>📧 {resumeData.email}</div>}
              {resumeData.phone && <div>📞 {resumeData.phone}</div>}
              {resumeData.linkedin && <div style={{ wordBreak: 'break-all' }}>🔗 {resumeData.linkedin}</div>}
              {resumeData.location && <div>📍 {resumeData.location}</div>}
            </div>

            {resumeData.skills && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <span style={{ fontWeight: 600, borderBottom: `1.5px solid ${templateAccent}44`, paddingBottom: '0.2rem', color: templateAccent, fontSize: '0.75rem', letterSpacing: '0.05em' }}>SKILLS</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {resumeData.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                    <span key={skill} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', background: '#f1f5f9', color: '#334155', borderRadius: '4px', borderLeft: `2.5px solid ${templateAccent}` }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resumeData.education && resumeData.education.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <span style={{ fontWeight: 600, borderBottom: `1.5px solid ${templateAccent}44`, paddingBottom: '0.2rem', color: templateAccent, fontSize: '0.75rem', letterSpacing: '0.05em' }}>EDUCATION</span>
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} style={{ fontSize: '0.75rem', color: '#475569' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{edu.degree}</div>
                    <div style={{ fontStyle: 'italic' }}>{edu.school}</div>
                    <div style={{ fontSize: '0.7rem', marginTop: '0.1rem' }}>{edu.year}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div style={{ padding: '2.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {resumeData.summary && (
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: templateAccent, letterSpacing: '0.05em', borderBottom: `1px solid #f1f5f9`, paddingBottom: '0.4rem' }}>PROFESSIONAL PROFILE</h3>
                <p style={{ color: '#334155', marginTop: '0.75rem', fontSize: '0.85rem' }}>{resumeData.summary}</p>
              </div>
            )}

            {resumeData.experiences && resumeData.experiences.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: templateAccent, letterSpacing: '0.05em', borderBottom: `1px solid #f1f5f9`, paddingBottom: '0.4rem', marginBottom: '1rem' }}>WORK HISTORY</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {resumeData.experiences.map((exp, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{exp.role} <span style={{ fontWeight: 400, color: '#64748b' }}>at {exp.company}</span></h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{exp.duration}</span>
                      </div>
                      {renderBullets(exp.bulletPoints)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (templateLayout === 'creative') {
      return (
        <div style={{ ...containerStyle, borderTop: `12px solid ${templateAccent}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: 0, borderBottom: 'none' }}>{resumeData.name || 'Your Name'}</h1>
              <p style={{ fontSize: '1rem', color: templateAccent, fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{resumeData.title}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: '#475569', textAlign: 'right' }}>
              {resumeData.email && <div>{resumeData.email} 📧</div>}
              {resumeData.phone && <div>{resumeData.phone} 📞</div>}
              {resumeData.linkedin && <div>{resumeData.linkedin} 🔗</div>}
              {resumeData.location && <div>{resumeData.location} 📍</div>}
            </div>
          </div>

          {resumeData.summary && (
            <div style={{ marginBottom: '2rem', background: `${templateAccent}06`, padding: '1.5rem', borderRadius: '12px', borderLeft: `4px solid ${templateAccent}` }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: templateAccent, textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>About Me</h3>
              <p style={{ margin: 0, color: '#334155' }}>{resumeData.summary}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2.5rem' }}>
            <div>
              {resumeData.experiences && resumeData.experiences.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', borderBottom: `2.5px solid ${templateAccent}`, paddingBottom: '0.3rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Professional Path</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {resumeData.experiences.map((exp, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <h4 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{exp.role} @ {exp.company}</h4>
                          <span style={{ fontSize: '0.7rem', color: templateAccent, fontWeight: 600 }}>{exp.duration}</span>
                        </div>
                        {renderBullets(exp.bulletPoints)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {resumeData.skills && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', borderBottom: `2.5px solid ${templateAccent}`, paddingBottom: '0.3rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Core Stack</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {resumeData.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                      <span key={skill} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: '#f1f5f9', color: '#1e293b', borderRadius: '20px', border: `1px solid ${templateAccent}22` }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resumeData.education && resumeData.education.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', borderBottom: `2.5px solid ${templateAccent}`, paddingBottom: '0.3rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Credentials</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx}>
                        <h4 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' }}>{edu.degree}</h4>
                        <div style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>{edu.school}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{edu.year}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (templateLayout === 'tech_elite') {
      const renderTechSection = (sectionId) => {
        if (sectionId === 'summary' && resumeData.summary) {
          return (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: templateAccent, textTransform: 'uppercase', letterSpacing: '0.08em', borderLeft: `4px solid ${templateAccent}`, paddingLeft: '0.75rem', marginBottom: '0.75rem' }}>Summary</h3>
              <p style={{ color: '#374151', fontSize: '0.85rem', margin: 0, paddingLeft: '1rem' }}>{resumeData.summary}</p>
            </div>
          );
        }
        if (sectionId === 'experience' && resumeData.experiences && resumeData.experiences.length > 0) {
          return (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: templateAccent, textTransform: 'uppercase', letterSpacing: '0.08em', borderLeft: `4px solid ${templateAccent}`, paddingLeft: '0.75rem', marginBottom: '1rem' }}>Experience</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '1rem' }}>
                {resumeData.experiences.map((exp, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem', margin: 0 }}>{exp.role} <span style={{ fontWeight: 400, color: '#4b5563' }}>// {exp.company}</span></h4>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{exp.duration}</span>
                    </div>
                    {renderBullets(exp.bulletPoints)}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (sectionId === 'education' && resumeData.education && resumeData.education.length > 0) {
          return (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: templateAccent, textTransform: 'uppercase', letterSpacing: '0.08em', borderLeft: `4px solid ${templateAccent}`, paddingLeft: '0.75rem', marginBottom: '1rem' }}>Education</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1rem' }}>
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem', margin: 0 }}>{edu.degree}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#4b5563', fontStyle: 'italic' }}>{edu.school}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'var(--font-mono)' }}>{edu.year}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (sectionId === 'skills' && resumeData.skills) {
          return (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: templateAccent, textTransform: 'uppercase', letterSpacing: '0.08em', borderLeft: `4px solid ${templateAccent}`, paddingLeft: '0.75rem', marginBottom: '0.75rem' }}>Skills</h3>
              <div style={{ paddingLeft: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {resumeData.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                    <span key={skill} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#f3f4f6', color: '#1f2937', borderRadius: '4px', border: '1px solid #e5e7eb', fontFamily: 'var(--font-mono)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return null;
      };

      return (
        <div style={containerStyle}>
          <div style={{ borderBottom: `2px solid ${templateAccent}22`, paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.2rem', color: '#111827', fontWeight: 800, margin: 0, borderBottom: 'none' }}>{resumeData.name || 'Your Name'}</h1>
            {resumeData.title && <p style={{ color: templateAccent, fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{resumeData.title}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: '#4b5563', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              {resumeData.email && <span>email: {resumeData.email}</span>}
              {resumeData.phone && <span>phone: {resumeData.phone}</span>}
              {resumeData.linkedin && <span>linkedin: {resumeData.linkedin}</span>}
              {resumeData.location && <span>loc: {resumeData.location}</span>}
            </div>
          </div>
          {sectionOrder.map(secId => renderTechSection(secId))}
        </div>
      );
    }

    // Classic Layout
    const renderClassicSection = (sectionId) => {
      if (sectionId === 'summary' && resumeData.summary) {
        return (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: templateAccent, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</h3>
            <hr style={hrStyle} />
            <p style={{ color: '#374151', fontSize: '0.9rem' }}>{resumeData.summary}</p>
          </div>
        );
      }
      if (sectionId === 'experience' && resumeData.experiences && resumeData.experiences.length > 0) {
        return (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: templateAccent, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience</h3>
            <hr style={hrStyle} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {resumeData.experiences.map((exp, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4 style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{exp.role} at {exp.company}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{exp.duration}</span>
                  </div>
                  {renderBullets(exp.bulletPoints)}
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (sectionId === 'education' && resumeData.education && resumeData.education.length > 0) {
        return (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: templateAccent, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Education</h3>
            <hr style={hrStyle} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {resumeData.education.map((edu, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{edu.degree}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>{edu.school}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (sectionId === 'skills' && resumeData.skills) {
        return (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: templateAccent, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</h3>
            <hr style={hrStyle} />
            <p style={{ color: '#374151', fontSize: '0.9rem' }}>{resumeData.skills}</p>
          </div>
        );
      }
      return null;
    };

    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', color: '#111827', fontWeight: 800, margin: 0, borderBottom: 'none' }}>{resumeData.name || 'Your Name'}</h1>
          {resumeData.title && <p style={{ color: templateAccent, fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>{resumeData.title}</p>}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', color: '#475569', marginTop: '0.5rem' }}>
            {resumeData.email && <span>{resumeData.email}</span>}
            {resumeData.email && (resumeData.phone || resumeData.linkedin || resumeData.location) && <span>•</span>}
            {resumeData.phone && <span>{resumeData.phone}</span>}
            {resumeData.phone && (resumeData.linkedin || resumeData.location) && <span>•</span>}
            {resumeData.linkedin && <span>{resumeData.linkedin}</span>}
            {resumeData.linkedin && resumeData.location && <span>•</span>}
            {resumeData.location && <span>{resumeData.location}</span>}
          </div>
        </div>
        {sectionOrder.map(secId => renderClassicSection(secId))}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <MeshBackground />
      
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal 
            onClose={() => setIsSettingsOpen(false)} 
            apiKey={apiKey} 
            setApiKey={setApiKey} 
            selectedModel={selectedModel} 
            setSelectedModel={setSelectedModel} 
          />
        )}
      </AnimatePresence>

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
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', alignItems: 'center', padding: '6rem 0', maxWidth: '900px', margin: '0 auto' }}
              >
                {/* Left side: Sci-Fi Hologram Ring */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                     <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} style={{ position: 'absolute', inset: 0, border: '2px dashed rgba(99, 102, 241, 0.2)', borderRadius: '50%' }} />
                     <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} style={{ position: 'absolute', inset: '15px', border: '3px solid transparent', borderTopColor: 'var(--accent-primary)', borderBottomColor: 'var(--accent-secondary)', borderRadius: '50%' }} />
                     <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ position: 'absolute', inset: '40px', border: '1px solid rgba(244, 63, 94, 0.15)', borderRadius: '50%', background: 'rgba(99,102,241,0.02)' }} />
                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <Cpu size={42} color="var(--accent-primary)" style={{ animation: 'pulse 1.5s infinite' }} />
                       <span style={{ fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)', marginTop: '0.5rem', letterSpacing: '0.2em' }}>NEURAL_LINK</span>
                     </div>
                  </div>
                </div>

                {/* Right side: High-Tech Log Terminal Console */}
                <SpotlightCard style={{ padding: '2rem', background: 'rgba(0,0,0,0.4)', minHeight: '280px', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontFamily: 'var(--font-mono)', border: '1px solid rgba(99, 102, 241, 0.15)', boxShadow: '0 0 30px rgba(99, 102, 241, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginLeft: '1rem' }}>SYSTEM_CORE_LOGS</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-primary)', flexGrow: 1, textAlign: 'left' }}>
                    {loadingStep >= 0 && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <span style={{ color: 'var(--accent-primary)' }}>[SYSTEM]</span> Initializing semantic engine... <span style={{ color: 'var(--success)' }}>OK</span>
                      </motion.div>
                    )}
                    {loadingStep >= 1 && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <span style={{ color: 'var(--accent-secondary)' }}>[PARSER]</span> Unpacking talent profile PDF vector structure...
                      </motion.div>
                    )}
                    {loadingStep >= 2 && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <span style={{ color: 'var(--accent-vibrant)' }}>[ALIGN]</span> Mapping job spec constraints & criteria...
                      </motion.div>
                    )}
                    {loadingStep >= 3 && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <span style={{ color: 'var(--accent-primary)' }}>[DENSITY]</span> Scoring keyword frequencies and vocabulary match...
                      </motion.div>
                    )}
                    {loadingStep >= 4 && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <span style={{ color: 'var(--accent-secondary)' }}>[COGNITIVE]</span> Triggering LLM rewrite recommendation algorithms...
                      </motion.div>
                    )}
                    {loadingStep >= 5 && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <span style={{ color: 'var(--success)' }}>[COMPLIANCE]</span> Executing ATS parsing checker compliance audit...
                      </motion.div>
                    )}
                    {loadingStep >= 6 && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                        &gt;&gt; PIPELINE COMPLETED. REDIRECTING TO ANALYTICS_MATRIX.
                      </motion.div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                    <span>$</span>
                    <motion.div
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ width: '8px', height: '14px', background: 'var(--accent-primary)' }}
                    />
                  </div>
                </SpotlightCard>
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
                    {[
                      { id: 'analytics', label: 'ANALYTICS_MATRIX', icon: <Activity size={16} /> },
                      { id: 'audit', label: 'ATS_AUDIT_COPILOT', icon: <CheckSquare size={16} /> },
                      { id: 'workspace', label: 'WORKSPACE_EDITOR', icon: <Edit size={16} /> },
                      { id: 'templates', label: 'TEMPLATE_CUSTOMIZER', icon: <Palette size={16} /> },
                      { id: 'interview', label: 'INTERVIEW_COPILOT', icon: <Brain size={16} /> }
                    ].map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          className={`tab-btn ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveTab(tab.id)}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeTabPill"
                              className="active-tab-bg"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            {tab.icon} {tab.label}
                          </span>
                        </button>
                      );
                    })}
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
                            <svg className="score-dial-glow" width="220" height="220" viewBox="0 0 100 100">
                               <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                               <motion.circle 
                                 cx="50" 
                                 cy="50" 
                                 r="45" 
                                 fill="none" 
                                 stroke="url(#scoreGrad)" 
                                 strokeWidth="6" 
                                 strokeDasharray="283" 
                                 initial={{ strokeDashoffset: 283 }}
                                 animate={{ strokeDashoffset: 283 - (283 * results.score) / 100 }}
                                 transition={{ duration: 1.5, ease: "easeOut" }}
                                 strokeLinecap="round" 
                                 transform="rotate(-90 50 50)" 
                               />
                               <defs>
                                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#6366f1" />
                                  <stop offset="100%" stopColor="#f43f5e" />
                                </linearGradient>
                               </defs>
                            </svg>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                              <span style={{ fontSize: '4rem', fontWeight: 800 }}>
                                <AnimatedCounter value={results.score} />
                              </span>
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

                      {/* Keyword Density / JD Term Frequency */}
                      <SpotlightCard style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                          <Search size={22} color="var(--accent-primary)" />
                          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>KEYWORD_DENSITY_ANALYSIS</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                          Critical keywords identified in the Job Description, compared with frequency in your resume. Optimizing these values will bypass automated ATS filter thresholds.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                          {getKeywordDensity(editedResume, jobDescription).map(item => (
                            <div 
                              key={item.word} 
                              style={{ 
                                background: 'rgba(255, 255, 255, 0.02)', 
                                border: '1px solid rgba(255, 255, 255, 0.05)', 
                                padding: '1.25rem', 
                                borderRadius: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)' }}>{item.word}</span>
                                <span 
                                  className={`badge ${item.status === 'optimal' ? 'badge-success' : item.status === 'low' ? 'badge-warning' : 'badge-danger'}`}
                                  style={{ fontSize: '0.6rem' }}
                                >
                                  {item.status.toUpperCase()}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <span>Found in Resume: <strong>{item.resumeCount}</strong></span>
                                <span>J.D. Requires: <strong>{item.jdCount}+</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </SpotlightCard>
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
                      {/* Left: Input Editor Section */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>WORKSPACE_INPUT_MODE</span>
                          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '6px' }}>
                            <button 
                              className={`hud-button ${!isFormWizard ? 'active' : ''}`} 
                              onClick={() => {
                                const data = parseMarkdownToData(editedResume);
                                setResumeData(data);
                                setIsFormWizard(false);
                              }}
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', height: 'auto', border: 'none', background: !isFormWizard ? 'var(--accent-primary)' : 'transparent', color: '#fff', borderRadius: '4px' }}
                            >
                              MARKDOWN
                            </button>
                            <button 
                              className={`hud-button ${isFormWizard ? 'active' : ''}`} 
                              onClick={() => {
                                setIsFormWizard(true);
                              }}
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', height: 'auto', border: 'none', background: isFormWizard ? 'var(--accent-primary)' : 'transparent', color: '#fff', borderRadius: '4px' }}
                            >
                              FORM_WIZARD
                            </button>
                          </div>
                        </div>

                        {isFormWizard ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '650px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              <div>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>FULL_NAME</label>
                                <input 
                                  type="text" 
                                  value={resumeData.name} 
                                  onChange={(e) => setResumeData(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="e.g. Sumit Kumar"
                                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>PROFESSIONAL_TITLE</label>
                                <input 
                                  type="text" 
                                  value={resumeData.title} 
                                  onChange={(e) => setResumeData(prev => ({ ...prev, title: e.target.value }))}
                                  placeholder="e.g. Senior Software Engineer"
                                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              <div>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>EMAIL</label>
                                <input 
                                  type="email" 
                                  value={resumeData.email} 
                                  onChange={(e) => setResumeData(prev => ({ ...prev, email: e.target.value }))}
                                  placeholder="e.g. sumit.kumar@example.com"
                                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>PHONE</label>
                                <input 
                                  type="text" 
                                  value={resumeData.phone} 
                                  onChange={(e) => setResumeData(prev => ({ ...prev, phone: e.target.value }))}
                                  placeholder="e.g. +91 98765 43210"
                                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              <div>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>LINKEDIN_URL</label>
                                <input 
                                  type="text" 
                                  value={resumeData.linkedin} 
                                  onChange={(e) => setResumeData(prev => ({ ...prev, linkedin: e.target.value }))}
                                  placeholder="e.g. linkedin.com/in/sumitkumar"
                                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>LOCATION</label>
                                <input 
                                  type="text" 
                                  value={resumeData.location} 
                                  onChange={(e) => setResumeData(prev => ({ ...prev, location: e.target.value }))}
                                  placeholder="e.g. New Delhi, India"
                                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                                />
                              </div>
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', margin: 0 }}>SUMMARY</label>
                                <button 
                                  onClick={handleTailorSummary}
                                  disabled={tailoringStatus.summary || !resumeData.summary}
                                  className="btn-secondary" 
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid rgba(99, 102, 241, 0.3)', color: 'var(--accent-primary)', cursor: 'pointer' }}
                                >
                                  {tailoringStatus.summary ? (
                                    <>
                                      <RefreshCw size={10} style={{ animation: 'spin 1s linear infinite' }} /> TAILORING...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles size={10} /> AI_TAILOR
                                    </>
                                  )}
                                </button>
                              </div>
                              <textarea 
                                rows={4}
                                value={resumeData.summary}
                                onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                                placeholder="Describe your executive summary..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.85rem' }}
                              />
                            </div>

                            {/* Experience Section */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>PROFESSIONAL_EXPERIENCE</label>
                                <button onClick={addExperience} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Plus size={10} /> ADD_EXP
                                </button>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {resumeData.experiences && resumeData.experiences.map((exp, idx) => (
                                  <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                    <button onClick={() => removeExperience(idx)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                      <Trash2 size={14} />
                                    </button>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                      <input 
                                        type="text" 
                                        placeholder="Role" 
                                        value={exp.role} 
                                        onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                                        style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem' }}
                                      />
                                      <input 
                                        type="text" 
                                        placeholder="Company" 
                                        value={exp.company} 
                                        onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                        style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem' }}
                                      />
                                    </div>
                                    <input 
                                      type="text" 
                                      placeholder="Duration (e.g. 2021 - Present)" 
                                      value={exp.duration} 
                                      onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                                      style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0 0.25rem 0' }}>
                                      <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>BULLET_POINTS</span>
                                      <button 
                                        onClick={() => handleTailorExperience(idx)}
                                        disabled={tailoringStatus.experiences?.[idx] || !exp.bulletPoints}
                                        className="btn-secondary" 
                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid rgba(99, 102, 241, 0.3)', color: 'var(--accent-primary)', cursor: 'pointer' }}
                                      >
                                        {tailoringStatus.experiences?.[idx] ? (
                                          <>
                                            <RefreshCw size={10} style={{ animation: 'spin 1s linear infinite' }} /> TAILORING...
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles size={10} /> AI_TAILOR
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <textarea 
                                      rows={3} 
                                      placeholder="Bullet points (one per line)" 
                                      value={exp.bulletPoints} 
                                      onChange={(e) => updateExperience(idx, 'bulletPoints', e.target.value)}
                                      style={{ padding: '0.5rem', width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem' }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Education Section */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>EDUCATION_CREDENTIALS</label>
                                <button onClick={addEducation} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Plus size={10} /> ADD_EDU
                                </button>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {resumeData.education && resumeData.education.map((edu, idx) => (
                                  <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                    <button onClick={() => removeEducation(idx)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                      <Trash2 size={14} />
                                    </button>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                      <input 
                                        type="text" 
                                        placeholder="Degree" 
                                        value={edu.degree} 
                                        onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                        style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem' }}
                                      />
                                      <input 
                                        type="text" 
                                        placeholder="School" 
                                        value={edu.school} 
                                        onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                                        style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem' }}
                                      />
                                    </div>
                                    <input 
                                      type="text" 
                                      placeholder="Year" 
                                      value={edu.year} 
                                      onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                                      style={{ padding: '0.5rem', width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem' }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Skills Section */}
                            <div>
                              <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>SKILLS (COMMA SEPARATED)</label>
                              <input 
                                type="text" 
                                value={resumeData.skills} 
                                onChange={(e) => setResumeData(prev => ({ ...prev, skills: e.target.value }))}
                                placeholder="e.g. React, Node.js, JavaScript, Docker"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <textarea
                            className="editor-textarea"
                            value={editedResume}
                            onChange={(e) => {
                              setEditedResume(e.target.value);
                              // Sync to form wizard in background
                              try {
                                const parsed = parseMarkdownToData(e.target.value);
                                setResumeData(parsed);
                              } catch {
                                // Ignore temporary parsing errors while typing
                              }
                            }}
                            placeholder="Your optimized markdown resume starts here..."
                          />
                        )}
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
                            minHeight: '650px',
                            width: '100%',
                            overflow: 'hidden'
                          }}
                        >
                          {renderResumeSheet()}
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

                          {/* Layout Template presets */}
                          <div className="customizer-section">
                            <span className="customizer-section-title">LAYOUT_TEMPLATE</span>
                            <div className="selector-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <button className={`selector-btn ${templateLayout === 'classic' ? 'active' : ''}`} onClick={() => setTemplateLayout('classic')}>Classic</button>
                              <button className={`selector-btn ${templateLayout === 'modern' ? 'active' : ''}`} onClick={() => setTemplateLayout('modern')}>Modern</button>
                              <button className={`selector-btn ${templateLayout === 'creative' ? 'active' : ''}`} onClick={() => setTemplateLayout('creative')}>Creative</button>
                              <button className={`selector-btn ${templateLayout === 'tech_elite' ? 'active' : ''}`} onClick={() => setTemplateLayout('tech_elite')}>Tech Elite</button>
                            </div>
                          </div>

                          {/* Section Reordering */}
                          <div className="customizer-section">
                            <span className="customizer-section-title">SECTION_ORDER</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                              {sectionOrder.map((sec, idx) => (
                                <div key={sec} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                                    {sec.toUpperCase()}
                                  </span>
                                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                                    <button 
                                      disabled={idx === 0} 
                                      onClick={() => moveSection(idx, -1)} 
                                      style={{ padding: '0.15rem 0.35rem', fontSize: '0.6rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                      ▲
                                    </button>
                                    <button 
                                      disabled={idx === sectionOrder.length - 1} 
                                      onClick={() => moveSection(idx, 1)} 
                                      style={{ padding: '0.15rem 0.35rem', fontSize: '0.6rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                      ▼
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

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
                            minHeight: '650px',
                            width: '100%',
                            overflow: 'hidden'
                          }}
                        >
                          {renderResumeSheet()}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 5: INTERVIEW_COPILOT */}
                  {activeTab === 'interview' && (
                    <motion.div
                      key="interview-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Brain size={22} color="var(--accent-primary)" /> INTERVIEW_PREPARATION_COPILOT
                          </h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            Prepare for your upcoming interview using AI-driven situational simulator or standard question maps.
                          </p>
                        </div>
                        
                        {/* MODE SELECTOR */}
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '6px' }}>
                          <button 
                            className={`hud-button ${interviewMode === 'questions' ? 'active' : ''}`} 
                            onClick={() => setInterviewMode('questions')}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', height: 'auto', border: 'none', background: interviewMode === 'questions' ? 'var(--accent-primary)' : 'transparent', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            QUESTION_BANK
                          </button>
                          <button 
                            className={`hud-button ${interviewMode === 'simulator' ? 'active' : ''}`} 
                            onClick={() => setInterviewMode('simulator')}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', height: 'auto', border: 'none', background: interviewMode === 'simulator' ? 'var(--accent-primary)' : 'transparent', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            AI_MOCK_SIMULATOR
                          </button>
                        </div>
                      </div>

                      {interviewMode === 'questions' ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleFetchInterviewQuestions(editedResume, jobDescription)} 
                              className="btn-primary-small"
                              disabled={isGeneratingQuestions}
                              style={{ background: 'var(--accent-primary)', border: 'none', color: '#fff', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              {isGeneratingQuestions ? (
                                <>
                                  <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> REGENERATING...
                                </>
                              ) : (
                                <>
                                  <RefreshCw size={14} /> RE-GENERATE
                                </>
                              )}
                            </button>
                          </div>

                          {isGeneratingQuestions ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6rem' }}>
                              <RefreshCw size={32} style={{ animation: 'spin 2s linear infinite', color: 'var(--accent-primary)' }} />
                              <p style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CREATING_INTERVIEW_MAP...</p>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                              {interviewQuestions && interviewQuestions.length > 0 ? (
                                interviewQuestions.map((q, idx) => (
                                  <SpotlightCard key={idx} style={{ padding: '2.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                      <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                                        {idx + 1}
                                      </div>
                                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                                          {q.question}
                                        </h4>
                                        
                                        <div style={{ borderLeft: '3px solid rgba(255,255,255,0.08)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>RATIONALE</span>
                                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                            {q.rationale}
                                          </p>
                                        </div>

                                        <div style={{ borderLeft: '3px solid var(--accent-secondary)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)', fontWeight: 600 }}>STAR_PREPARATION_TIP</span>
                                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                            {q.tip}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </SpotlightCard>
                                ))
                              ) : (
                                <SpotlightCard style={{ padding: '3rem', textAlign: 'center' }}>
                                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No questions generated yet. Click Re-generate to create interview prep questions.</p>
                                </SpotlightCard>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        /* INTERVIEW CHAT SIMULATOR PANEL */
                        <SpotlightCard style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '500px' }}>
                          {currentChatIndex === 0 ? (
                            /* START SCREEN */
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', gap: '1.5rem', flex: 1 }}>
                              <Brain size={48} color="var(--accent-primary)" style={{ filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.3))' }} />
                              <div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Simulated AI Mock Interview</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '500px', margin: '0.5rem auto 0 auto', lineHeight: '1.6' }}>
                                  Gemini will conduct a 3-question mock interview custom tailored to your target job profile. You will receive real-time recruiter scores and feedback after every response.
                                </p>
                              </div>
                              <button 
                                onClick={startMockInterview}
                                disabled={isGeneratingQuestions}
                                className="btn-primary-small"
                                style={{ background: 'var(--accent-primary)', border: 'none', color: '#fff', padding: '0.9rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                              >
                                {isGeneratingQuestions ? (
                                  <>
                                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> GENERATING_SIMULATION...
                                  </>
                                ) : (
                                  <>
                                    START_AI_INTERVIEW <ChevronRight size={14} />
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            /* CHAT INTERACTIVE VIEW */
                            <div style={{ display: 'flex', flexDirection: 'column', height: '550px', justifyContent: 'space-between', gap: '1.5rem' }}>
                              {/* Header Progress Info */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>SESSION_ACTIVE // GE_RECRUITER_AI</span>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  {currentChatIndex <= 3 ? `QUESTION_${currentChatIndex}_OF_3` : 'INTERVIEW_COMPLETE'}
                                </span>
                              </div>

                              {/* Message Logs */}
                              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem' }}>
                                {chatMessages.map((msg, i) => {
                                  const isLatestAi = msg.sender !== 'user' && i === chatMessages.length - 1;
                                  return (
                                    <motion.div 
                                      key={i} 
                                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                      style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
                                    >
                                      <div className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                                        {/* Sender tag */}
                                        <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--accent-secondary)', marginBottom: '0.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                          {msg.sender === 'user' ? 'CANDIDATE' : 'INTERVIEWER_AI'}
                                        </div>
                                        
                                        <div style={{ whiteSpace: 'pre-line' }}>
                                          {isLatestAi ? <AnimatedTextMessage text={msg.text} /> : msg.text}
                                        </div>

                                        {/* Individual score display */}
                                        {msg.score !== undefined && (
                                          <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(0,0,0,0.25)', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
                                          >
                                            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>RESPONSE_RATING:</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: msg.score >= 7 ? 'var(--success)' : 'var(--accent-secondary)' }}>
                                              {msg.score} / 10
                                            </div>
                                          </motion.div>
                                        )}
                                      </div>
                                    </motion.div>
                                  );
                                })}
                                {isSendingChatMessage && (
                                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                      <RefreshCw size={14} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--accent-primary)' }} />
                                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>EVALUATING_RESPONSE_AND_COMPILING...</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Input panel */}
                              {currentChatIndex <= 3 ? (
                                <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                  <textarea
                                    value={userChatInput}
                                    onChange={(e) => setUserChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendResponse();
                                      }
                                    }}
                                    placeholder="Type your situational answer using the STAR method (Situation, Task, Action, Result)..."
                                    disabled={isSendingChatMessage}
                                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.85rem', resize: 'none', height: '60px' }}
                                  />
                                  <button
                                    onClick={handleSendResponse}
                                    disabled={isSendingChatMessage || !userChatInput.trim()}
                                    className="btn-primary-small"
                                    style={{ background: 'var(--accent-primary)', border: 'none', color: '#fff', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer' }}
                                  >
                                    SEND
                                  </button>
                                </div>
                              ) : (
                                /* RESET INTERVIEW SCREEN */
                                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => {
                                      setCurrentChatIndex(0);
                                      setChatMessages([]);
                                    }}
                                    className="btn-secondary"
                                    style={{ padding: '0.75rem 2rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                                  >
                                    START_NEW_INTERVIEW
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </SpotlightCard>
                      )}
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
