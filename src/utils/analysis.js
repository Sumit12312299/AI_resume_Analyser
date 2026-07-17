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

