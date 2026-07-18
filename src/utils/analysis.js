/**
 * Simplified Analysis Engine based on Heuristics
 * Extracts keywords, calculated overlap, and generates suggestions.
 */

const KEYWORD_BANK = [
  'react', 'javascript', 'typescript', 'node.js', 'python', 'java', 'c++', 'aws', 'azure', 'docker', 
  'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql', 'graphql', 'rest api', 'frontend', 'backend',
  'fullstack', 'ui/ux', 'figma', 'agile', 'scrum', 'ci/cd', 'git', 'testing', 'jest', 'cypress', 'selenium',
  'accessibility', 'wcag', 'performance', 'optimization', 'seo', 'cloud', 'devops', 'microservices'
];

export const analyzeResume = (resumeText, jdText) => {
  const resume = resumeText.toLowerCase();
  const jd = jdText.toLowerCase();

  // 1. Extract Keywords present in JD
  const requiredKeywords = KEYWORD_BANK.filter(kw => jd.includes(kw));
  
  // 2. Identify Matches and Gaps
  const matchingSkills = requiredKeywords.filter(kw => resume.includes(kw));
  const missingSkills = requiredKeywords.filter(kw => !resume.includes(kw));

  // 3. Calculate Score (Keyword weighted)
  let score = 0;
  if (requiredKeywords.length > 0) {
    score = Math.round((matchingSkills.length / requiredKeywords.length) * 100);
  } else {
    // If no keywords found in JD, give a baseline based on presence of any keywords
    const anyKeywords = KEYWORD_BANK.filter(kw => resume.includes(kw));
    score = Math.min(Math.round((anyKeywords.length / 5) * 100), 100);
  }

  // Ensure score isn't too low if there's significant text
  if (resume.length > 500 && score < 40) score += 15;
  score = Math.min(score, 98); // Top out at 98 for mock

  // 4. Generate Realistic Suggestions
  const suggestions = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Integrate missing technical keywords: ${missingSkills.slice(0, 3).join(', ')}.`);
  }
  if (resumeText.split(' ').length < 300) {
    suggestions.push("The resume is too brief. Expand on your impact with measurable achievements.");
  }
  if (!resume.includes('achieved') && !resume.includes('improved')) {
    suggestions.push("Focus on results using action verbs like 'Optimized', 'Reduced', or 'Led'.");
  } else {
    suggestions.push("Quantify your successes with percentages or dollar amounts where possible.");
  }

  // 5. Generate Improved Summary (Dynamic Injection)
  const topMatches = matchingSkills.slice(0, 3).join(', ');
  const topGaps = missingSkills.slice(0, 2).join(' and ');
  
  const improvedSummary = `Highly skilled professional with expertise in ${topMatches || 'core industry standards'}. 
    Proven ability to deliver high-quality results and drive operational excellence. 
    ${missingSkills.length > 0 ? `Currently expanding proficiency in ${topGaps} to better serve enterprise-scale requirements.` : ''} 
    Focusing on high-performance architectures and efficient project lifecycles.`;

  return {
    score,
    percentile: Math.round(score * 1.05 + 2),
    matches: matchingSkills.length,
    gaps: missingSkills.length,
    matchingSkills: matchingSkills.length > 0 ? matchingSkills : ['Professionalism', 'Communication'],
    missingSkills: missingSkills.length > 0 ? missingSkills : ['N/A'],
    suggestions: suggestions.length > 0 ? suggestions : ["Your resume is strongly aligned. Focus on interview prep."],
    improvedSummary,
    finalResume: generateImprovedResumeText(resumeText, matchingSkills, missingSkills)
  };
};

const generateImprovedResumeText = (originalText, matches, gaps) => {
  // Mocking the generation by prepending a professional header and key achievements
  // In a real app, this would be a full LLM rewrite.
  return `
# PROFESSIONAL_OUTPUT_ENHANCED
**System Generated // Alignment Optimized**

## Summary
Expert professional recognized for excellence in ${matches.slice(0, 2).join(' & ')}. Specializing in high-impact solutions with a focus on ${matches.slice(2, 4).join(', ') || 'industry best practices'}. Committed to data-driven decision making and cross-functional collaboration.

## Core Competencies (Verified Matches)
${matches.map(m => `- ${m.toUpperCase()}`).join('\n')}

## Strategic Enhancements (Added for JD Alignment)
${gaps.map(g => `- Integrated Proficiency: ${g.toUpperCase()}`).join('\n')}

## Original History & Details (Modified for Impact)
${originalText.substring(0, 1500)}${originalText.length > 1500 ? '...' : ''}

---
*Document optimized for ATS parsing systems.*
  `;
};

export const analyzeResumeWithGemini = async (resumeText, jdText, apiKey, modelName = 'gemini-2.5-flash') => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const prompt = `You are an expert Applicant Tracking System (ATS) optimization engine and resume strategist.
Your task is to analyze the resume text against the provided job description (JD) to compute compatibility and generate a highly optimized resume rewrite.

### Resume:
${resumeText}

### Job Description:
${jdText}

### Expected JSON Output Schema:
Provide your response strictly in the following JSON format:
{
  "score": (integer, 0 to 100 representing how well the resume aligns with the JD),
  "percentile": (integer, 0 to 100 representing how this candidate ranks compared to typical applicants for this role),
  "matches": (integer, count of skills/technologies matching between resume and JD),
  "gaps": (integer, count of skills/technologies requested in JD but missing in resume),
  "matchingSkills": [array of strings, matching skills/keywords],
  "missingSkills": [array of strings, critical missing skills/keywords],
  "suggestions": [array of strings, actionable recommendations to improve the resume],
  "improvedSummary": "A concise, professional, ATS-optimized summary (3-4 sentences) highlighting matches and strategically addressing gaps",
  "finalResume": "Full optimized resume in professional Markdown format. Rewrite the resume, maintaining all original details but enhancing wording, structure, and readability, integrating relevant skills naturally."
}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            score: { type: 'integer' },
            percentile: { type: 'integer' },
            matches: { type: 'integer' },
            gaps: { type: 'integer' },
            matchingSkills: { type: 'array', items: { type: 'string' } },
            missingSkills: { type: 'array', items: { type: 'string' } },
            suggestions: { type: 'array', items: { type: 'string' } },
            improvedSummary: { type: 'string' },
            finalResume: { type: 'string' }
          },
          required: ['score', 'percentile', 'matches', 'gaps', 'matchingSkills', 'missingSkills', 'suggestions', 'improvedSummary', 'finalResume']
        }
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const textResponse = data.candidates[0].content.parts[0].text;
  return JSON.parse(textResponse);
};

export const checkAtsCompliance = (resumeText) => {
  const text = (resumeText || '').toLowerCase();
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const linkedinRegex = /linkedin\.com/;
  // Simple regex for phone: look for 7 to 15 digits with optional spaces, dashes, parentheses
  const phoneRegex = /(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/;

  const hasEmail = emailRegex.test(resumeText);
  const hasLinkedIn = linkedinRegex.test(text);
  const hasPhone = phoneRegex.test(resumeText);

  // Common Action Verbs
  const actionVerbs = ['led', 'managed', 'developed', 'designed', 'optimized', 'spearheaded', 'built', 'created', 'implemented', 'improved', 'reduced', 'achieved', 'increased', 'coordinated'];
  const foundVerbs = actionVerbs.filter(v => text.includes(v));

  // Measurable Metrics
  const hasMetrics = /%\s*|\$\s*|\b(reduced|increased|saved|grew|revenue|millions|thousands)\b/i.test(resumeText) || /\d+/.test(resumeText);

  // Word count check
  const wordCount = (resumeText || '').trim().split(/\s+/).filter(Boolean).length;
  const isGoodLength = wordCount >= 300 && wordCount <= 1200;

  // Formatting warnings (e.g. check if text looks too short or lacks structure)
  const hasStructure = text.includes('education') || text.includes('experience') || text.includes('skills') || text.includes('projects') || text.includes('summary');

  const checks = [
    { id: 'email', label: 'Email Address Found', status: hasEmail ? 'pass' : 'fail', desc: 'Crucial for recruiters to reach out to you.' },
    { id: 'phone', label: 'Phone Number Found', status: hasPhone ? 'pass' : 'fail', desc: 'Allows direct communication.' },
    { id: 'linkedin', label: 'LinkedIn Profile Link', status: hasLinkedIn ? 'pass' : 'warning', desc: 'Recruiters check online professional presence.' },
    { id: 'verbs', label: 'Action Verbs Usage', status: foundVerbs.length >= 4 ? 'pass' : 'warning', desc: `Found ${foundVerbs.length} action verbs (ideal: 4+).` },
    { id: 'metrics', label: 'Quantifiable Metrics (%)', status: hasMetrics ? 'pass' : 'fail', desc: 'Include percentages or numbers to show impact.' },
    { id: 'length', label: 'Ideal Resume Length', status: isGoodLength ? 'pass' : 'warning', desc: `Word count: ${wordCount} (ideal: 300-1200 words).` },
    { id: 'structure', label: 'Clear Section Headings', status: hasStructure ? 'pass' : 'fail', desc: 'Requires standard titles: Education, Experience, Skills, Summary.' }
  ];

  const passed = checks.filter(c => c.status === 'pass').length;
  const complianceScore = Math.round((passed / checks.length) * 100);

  return {
    complianceScore,
    checks
  };
};

export const revampBulletPoint = async (bulletText, apiKey, modelName = 'gemini-2.5-flash') => {
  if (!apiKey) {
    // Return local heuristic revamped templates randomly
    const fallbacks = [
      `Spearheaded design and delivery of key features, optimizing performance metrics by 25% and reducing system latency.`,
      `Orchestrated application lifecycle management, boosting deployment frequency by 40% and enhancing user retention.`,
      `Managed database schema optimizations and queries, resulting in a 30% reduction in query runtimes under peak loads.`,
      `Collaborated with cross-functional teams to integrate secure API endpoints, accelerating delivery velocity by 15%.`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const prompt = `You are an expert resume writer. Revamp the following resume bullet point to use the STAR method (Situation, Task, Action, Result). Make it highly impactful, action-oriented, and include realistic metrics or percentages where appropriate. Keep it to one strong, professional sentence. Return ONLY the revamped bullet point text without any other introductory text, markdown bold, or quotes.
  
  Bullet Point: "${bulletText}"`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
};

export const getKeywordDensity = (resumeText = '', jobDescription = '') => {
  if (!resumeText || !jobDescription) return [];
  
  const cleanAndTokenize = (txt) => {
    return txt.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2);
  };
  
  const resumeWords = cleanAndTokenize(resumeText);
  const jdWords = cleanAndTokenize(jobDescription);
  
  const stopwords = new Set([
    'and', 'the', 'for', 'with', 'from', 'our', 'your', 'this', 'that', 'with', 'about', 
    'are', 'was', 'were', 'will', 'been', 'have', 'has', 'had', 'should', 'could', 'would',
    'but', 'not', 'you', 'they', 'them', 'their', 'who', 'whom', 'which', 'what', 'why', 'how',
    'can', 'may', 'its', 'their', 'into', 'onto', 'upon', 'than', 'then', 'once', 'here', 'there',
    'when', 'where', 'both', 'each', 'more', 'most', 'some', 'such', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'should', 'now', 'any', 'other', 'the',
    'we', 'our', 'you', 'your', 'their', 'they', 'them', 'our', 'who', 'whom', 'which'
  ]);
  
  const jdFreq = {};
  jdWords.forEach(w => {
    if (!stopwords.has(w)) {
      jdFreq[w] = (jdFreq[w] || 0) + 1;
    }
  });
  
  const resumeFreq = {};
  resumeWords.forEach(w => {
    if (!stopwords.has(w)) {
      resumeFreq[w] = (resumeFreq[w] || 0) + 1;
    }
  });
  
  const topJdKeywords = Object.entries(jdFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word, jdCount]) => {
      const resumeCount = resumeFreq[word] || 0;
      return {
        word,
        jdCount,
        resumeCount,
        match: resumeCount > 0,
        status: resumeCount >= jdCount ? 'optimal' : resumeCount > 0 ? 'low' : 'missing'
      };
    });
    
  return topJdKeywords;
};

export const getInterviewPrepQuestions = async (resumeText, jobDescription, apiKey, modelName = 'gemini-2.5-flash') => {
  if (!apiKey) {
    return [
      {
        question: "Can you detail a situation where you had to quickly learn or apply technologies that were missing from your active stack?",
        rationale: "Addresses technical skill gaps highlighted in the JD match report.",
        tip: "Explain your learning strategy, resources utilized, and show a fast time-to-value."
      },
      {
        question: "Describe a project where you successfully improved front-end performance or scalability. What metrics did you track?",
        rationale: "Measures frontend core competency alignment.",
        tip: "Talk about metrics like page load speed, bundle sizes, lighthouse scores, or API response latency."
      },
      {
        question: "How do you handle conflict or prioritize features when collaborating in a cross-functional product team?",
        rationale: "Validates agility and product lifecycle knowledge.",
        tip: "Use the STAR method: describe a situation, the task to achieve, the negotiation actions you took, and the positive project outcome."
      }
    ];
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const prompt = `You are an expert technical interviewer. Compare the candidate's resume with the job description. Identify critical skill gaps and key responsibilities. 
  Generate 3 high-yield behavioral or technical interview questions tailored specifically for this candidate to prepare them for the role.
  For each question, provide:
  1. The question itself.
  2. Rationale (why the interviewer is asking this based on their gaps or JD requirements).
  3. Tips to answer using the STAR method.
  
  Format the response ONLY as a JSON array of objects with the keys "question", "rationale", and "tip". Return nothing but valid raw JSON.
  
  Resume:
  "${resumeText}"
  
  Job Description:
  "${jobDescription}"`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates[0].content.parts[0].text.trim();
  const cleaned = rawText.replace(/```json/i, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};


