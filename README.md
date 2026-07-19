# 🚀 Enterprise AI Career Suite (AI Resume Analyzer)

A state-of-the-art, high-tech, responsive web application designed to empower job seekers by analyzing resumes against Job Descriptions (JD) in real-time. Features an interactive dual-mode editor, ATS compliance checker, design template customizer, keyword frequency analyzer, and an AI-driven Career Suite.

---

## ✨ Key Features & Capabilities

### 📊 ATS Compliance Audit & Score Dial
- **Live Vector Match Rate:** Get immediate, detailed scoring on how well your resume matches the target job spec.
- **Biometric Ring Dial:** Features a glowing, rotating, and pulsing circle dial showcasing your ATS score.
- **Actionable Insights:** Receive line-by-line recommendations for layout fixes, styling improvements, and core credential alignments.

### 📋 Dual-Mode Workspace Editor
- **Visual Form Wizard:** Edit your resume details (experiences list, educational history, credentials, skills list) in an intuitive form-based interface.
- **Markdown Editor:** Toggle to a raw Markdown text-area for fast copy-pasting, custom formatting, and deep edits.
- **Bi-directional Sync:** Form Wizard state and Markdown code automatically compile and parse into one another in real-time.

### 🤖 Interactive Mock Interview Simulator
- **Dual-Mode Preparator:** Toggle between a structured behavior-based `QUESTION_BANK` and an interactive `AI_MOCK_SIMULATOR`.
- **Recruiter Chat Interface:** Gemini simulates a live recruiter asking situational interview questions based on the gaps identified between your resume and the Job Description.
- **Real-Time Evaluation:** Submitting answers scores them (out of 10) on compliance with the **STAR Method** (Situation, Task, Action, Result) with recruiter feedback.
- **Performance Scorecard:** End the session to receive your average score, strengths, and recommendations.

### ⚡ One-Click AI Resume Tailoring
- **Summary Optimizer:** Use AI to refine and re-align your executive summary targeting the Job Description keywords in one click.
- **Experience Bullets Optimizer:** Polish individual professional role bullet points, embedding high-value ATS keyword alignments and impact-focused metrics.
- **API Status Goggles:** Visual loaders (`TAILORING...`) give real-time feedback during optimization cycles.

### 💼 Multi-Layout Printable Templates
- **Classic Executive:** Elegant, professional centered layouts.
- **Modern Two-Column:** High-impact sidebar structure splitting profile details and experiences.
- **Creative Minimalist:** Accent-colored minimalist aesthetic for designers and modern job roles.
- **Tech Elite (New):** Sleek, developer-centric layout featuring clean typography separators, inline markers, and monospace accent styles.
- **Dynamic Section Ordering:** Drag-and-drop style `SECTION_ORDER` controls allowing you to rearrange, promote, or swap sections instantly.
- **Design Controls:** Control Accent Colors, Fonts (Outfit, Georgia, Mono), Font sizes, margin spacings, and line heights.
- **One-click Export:** High-quality PDF export target using `html2pdf.js`.

---

## 🛠️ Tech Stack & Key Libraries

- **Frontend Core:** [React](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling:** Custom Glassmorphism CSS with high-tech vibrant dark-mode color themes.
- **Animations:** [Framer Motion](https://www.framer.com/motion/) (3D Card Tilt, Hologram rings, Terminal Log updates).
- **Icons:** [Lucide React](https://lucide.dev/)
- **Markdown Processing:** [React Markdown](https://github.com/remarkjs/react-markdown)
- **PDF Parser:** [PDF.js](https://mozilla.github.io/pdf.js/) (extract text directly from uploaded PDF resumes).
- **PDF Export:** [html2pdf.js](https://github.com/eKoopmans/html2pdf.js/)

---

## 🔧 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sumit12312299/AI_resume_Analyser.git
   cd AI_resume_Analyser
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 💡 Gemini API Configuration

To enable LLM-powered deep resume re-writing, keyword matching, and situational interview question generation:
1. Click the **Settings Gear Icon** in the bottom-right corner of the application.
2. Provide your **Gemini API Key** (obtainable for free from [Google AI Studio](https://aistudio.google.com/)).
3. Select your preferred model (e.g., `gemini-2.5-flash` or `gemini-2.5-pro`).
4. Click **Save Changes**. The configuration is saved locally inside `localStorage` for privacy and ease of use.
