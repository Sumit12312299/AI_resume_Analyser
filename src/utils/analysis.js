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
