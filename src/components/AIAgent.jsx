import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  RotateCcw,
  User,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { safeHref } from '../utils/safeHref';

const QUICK_PROMPTS = [
  { label: '🚀 YOLOv8 & Projects', query: 'Tell me about your featured engineering projects.' },
  { label: '📜 Certifications', query: 'What certifications and verified credentials do you have?' },
  { label: '🏆 Hackathon Wins', query: 'What hackathons, awards, and prizes have you won?' },
  { label: '⚡ Core Tech Stack', query: 'What is your core technical stack and skills?' },
  { label: '🎪 Fest Leadership', query: 'Tell me about your fest leadership at NIT Nagaland.' },
  { label: '📫 Contact Info', query: 'How can I contact or collaborate with Divyanshu?' },
];

function generateResponse(userText, liveData) {
  const q = userText.toLowerCase().trim();
  const portfolio = liveData || portfolioData;
  const certs = portfolio.certifications || [];
  const projects = portfolio.projects || [];
  const achievements = portfolio.achievements || [];
  const positions = portfolio.positions || [];
  const education = portfolio.education || [];
  const skills = portfolio.skills || [];
  const profile = portfolio.profile || portfolioData.profile || {};

  // 1. SPECIFIC CERTIFICATION QUERY MATCHING
  // Check if query asks for a specific certification by name, org, or topic
  const matchingCert = certs.find(c => {
    const name = (c.name || '').toLowerCase();
    const org = (c.issuingOrganization || c.issuing_organization || '').toLowerCase();
    const id = (c.credentialId || c.credential_id || '').toLowerCase();
    if (q.includes('bharat') || q.includes('academix')) return org.includes('bharat') || name.includes('bharat');
    if (q.includes('energy') || q.includes('sustainable') || q.includes('ecsbc') || q.includes('ens') || q.includes('nsda')) {
      return name.includes('energy') || org.includes('nsda') || name.includes('ecsbc');
    }
    if ((q.includes('agentic') || q.includes('saksham')) && (name.includes('agentic') || name.includes('saksham'))) {
      return true;
    }
    // General keyword check for new certifications
    const words = name.split(/\s+/).filter(w => w.length > 3);
    return words.some(w => q.includes(w)) || (org.length > 2 && q.includes(org));
  });

  // If asking generally about certifications, licenses, courses, training
  const isGeneralCertQuery = q.includes('certif') || q.includes('license') || q.includes('credential') || q.includes('course') || q.includes('training') || q.includes('accreditation');

  if (matchingCert && !isGeneralCertQuery) {
    const issuer = matchingCert.issuingOrganization || matchingCert.issuing_organization || 'Accredited Organization';
    const date = matchingCert.issueDate || matchingCert.issue_date || '2026';
    const credId = matchingCert.credentialId || matchingCert.credential_id;
    const credUrl = matchingCert.credentialUrl || matchingCert.credential_url;
    let res = `**${matchingCert.name}**:\n` +
      `- **Issuing Organization**: ${issuer}\n` +
      `- **Issued**: ${date}\n`;
    if (credId) res += `- **Credential ID**: \`${credId}\`\n`;
    if (credUrl) res += `- **Verification Link**: [Verify Online](${credUrl})\n`;
    if (matchingCert.description) res += `- **Details**: ${matchingCert.description}\n`;
    return res;
  }

  if (isGeneralCertQuery) {
    if (certs.length === 0) {
      return `Divyanshu has actively participated in technical training and hackathons. Certifications are updated regularly via the admin console.`;
    }
    let res = `**Verified Licenses & Certifications (${certs.length} Credentials)**:\n\n`;
    certs.forEach((c, idx) => {
      const issuer = c.issuingOrganization || c.issuing_organization || 'Accredited Organization';
      const date = c.issueDate || c.issue_date || '2026';
      const credId = c.credentialId || c.credential_id;
      const credUrl = c.credentialUrl || c.credential_url;
      res += `${idx + 1}. 📜 **${c.name}**\n`;
      res += `   - **Organization**: ${issuer} | **Year**: ${date}\n`;
      if (credId) res += `   - **Credential ID**: \`${credId}\`\n`;
      if (credUrl) res += `   - **Verification**: [Credential Link](${credUrl})\n`;
      if (c.description) res += `   - **Summary**: ${c.description}\n`;
      res += `\n`;
    });
    return res.trim();
  }

  // 2. SPECIFIC PROJECT QUERIES (Dynamic check first, then specialized summaries)
  if (q.includes('osteo') || q.includes('arthritis') || q.includes('collider') || q.includes('knee') || q.includes('gait')) {
    const proj = projects.find(p => p.id?.includes('osteo') || p.title?.toLowerCase().includes('osteo'));
    return `**AI-Assisted Early Osteoarthritis (OA) Screening System (SIH 2026)**:
- **Problem Statement ID**: 26004 | **Team**: Colliders | **Theme**: MedTech & Hardware
- **Multimodal AI Pipeline**: Fuses clinical questionnaires (WOMAC-aligned), computer vision gait analysis via MediaPipe Pose (**92.64% XGBoost accuracy**), knee radiograph screening with **DenseNet-121 (84% accuracy)**, and real-time range-of-motion (ROM) and plantar pressure sensing using **ESP32, IMU, and FSR sensors**.
- **Impact**: Low-cost, offline-capable multilingual diagnostic dashboard for rural and North Eastern Region healthcare.` +
    (proj?.github ? `\n- **GitHub Repository**: [View Source](${proj.github})` : '');
  }

  if (q.includes('border') || q.includes('surveillance') || q.includes('ibvap') || q.includes('cctv') || q.includes('perceptron')) {
    const proj = projects.find(p => p.id?.includes('border') || p.title?.toLowerCase().includes('border'));
    return `**IBVAP: Intelligent Border Video Analytics Platform (SIH 2026)**:
- **Problem Statement ID**: SIH26187 | **Team**: Perceptrons | **Theme**: Cybersecurity & Software
- **Core Architecture**: Converts existing CCTV / RTSP camera infrastructure into an intelligent multi-camera security network without new hardware.
- **Key Capabilities**: Real-time object detection & tracking (YOLO + ByteTrack at 10–15 FPS inference), spatial virtual fencing, loitering/night movement detection, and tamper-evident **SHA-256 blockchain-anchored evidence logging** (<3s alert latency).` +
    (proj?.github ? `\n- **GitHub Repository**: [View Source](${proj.github})` : '');
  }

  if (q.includes('f1') || q.includes('formula') || q.includes('race') || q.includes('telemetry')) {
    const proj = projects.find(p => p.id?.includes('formula') || p.title?.toLowerCase().includes('formula'));
    return `**Formula 1 Race & Telemetry Predictor (Data Science & ML)**:
- **Dataset & Pipeline**: Leverages 70+ years of F1 historical race data and real-time telemetry via **FastF1** and Ergast APIs.
- **Machine Learning**: Engineered features across qualifying pace deltas, tire compound degradation curves, circuit speed traps, and weather conditions.
- **Models**: Ensemble classifiers (XGBoost, LightGBM, Random Forest) forecasting race winners and podium finishes, coupled with an interactive Streamlit telemetry analytics dashboard.` +
    (proj?.github ? `\n- **GitHub Repository**: [View Source](${proj.github})` : '');
  }

  if (q.includes('traffic') || q.includes('vision') || q.includes('yolo') || q.includes('anpr') || q.includes('plate')) {
    const proj = projects.find(p => p.id?.includes('traffic') || p.title?.toLowerCase().includes('traffic'));
    return `**Traffic Violation Detection System (YOLOv8 & Computer Vision)**:
- **Core Stack**: Python, YOLOv8, OpenCV, EasyOCR, Flask, SQLite.
- **Accuracy**: Achieved **84%+ detection accuracy** across multi-class violations.
- **Edge ANPR**: Automatic Number Plate Recognition with **80% accuracy** optimized for low-latency CPU inference on edge devices.
- **Deduplication**: Built multi-object tracking (MOT) reducing redundant detections by **40%** on high-traffic camera feeds.
- **Live System**: Logs 100+ detections in real time via a web admin dashboard.` +
    (proj?.github ? `\n- **GitHub Repository**: [View Source](${proj.github})` : '');
  }

  if (q.includes('weather') || q.includes('forecast')) {
    return `**Weather Forecast Web App**:
- Built a real-time weather platform serving **200,000+ cities** globally.
- Features browser Geolocation API, responsive dynamic conditions UI, and low latency (<150ms) API requests with robust client-side fallback handling.`;
  }

  // Check if query matches any newly created or custom projects
  const matchingCustomProj = projects.find(p => {
    const title = (p.title || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const words = title.split(/\s+/).filter(w => w.length > 3);
    return words.some(w => q.includes(w)) || (words.length > 0 && desc.includes(q));
  });

  if (matchingCustomProj) {
    let res = `**${matchingCustomProj.title}**:\n` +
      `- **Tagline / Category**: ${matchingCustomProj.tagline || matchingCustomProj.category || 'Engineering Project'}\n` +
      `- **Role / Architecture**: ${matchingCustomProj.role || 'Lead Developer'}\n`;
    if (matchingCustomProj.description) res += `- **Overview**: ${matchingCustomProj.description}\n`;
    if (matchingCustomProj.fullDescription) res += `- **Architecture**: ${matchingCustomProj.fullDescription}\n`;
    if (matchingCustomProj.tags?.length > 0) res += `- **Tech Stack**: ${matchingCustomProj.tags.join(', ')}\n`;
    if (matchingCustomProj.github) res += `- **GitHub Repository**: [View Code](${matchingCustomProj.github})\n`;
    if (matchingCustomProj.demo) res += `- **Live Demo**: [Launch Demo](${matchingCustomProj.demo})\n`;
    return res;
  }

  // General Projects Query
  if (q.includes('project') || q.includes('build') || q.includes('work') || q.includes('portfolio')) {
    let res = `**Featured Engineering Projects (${projects.length} Total)**:\n\n`;
    projects.forEach((p, idx) => {
      res += `${idx + 1}. 🚀 **${p.title}**\n`;
      if (p.tagline) res += `   - **Focus**: ${p.tagline}\n`;
      if (p.tags && p.tags.length > 0) res += `   - **Tech Stack**: ${p.tags.slice(0, 5).join(', ')}\n`;
      if (p.github) res += `   - **Source Code**: [GitHub Link](${p.github})\n`;
      res += `\n`;
    });
    return res.trim();
  }

  // 3. HACKATHONS & ACHIEVEMENTS
  if (q.includes('hackathon') || q.includes('award') || q.includes('prize') || q.includes('win') || q.includes('honor') || q.includes('achievement')) {
    let res = `Divyanshu has won multiple prestigious competitive awards & podium finishes:\n\n`;
    achievements.forEach((a, idx) => {
      res += `${idx + 1}. 🏆 **${a.title}** (${a.year || 'Recent'})\n`;
      if (a.badge) res += `   - **Award Tier**: ${a.badge}\n`;
      if (a.desc) res += `   - **Summary**: ${a.desc}\n`;
      if (a.keyHighlights && a.keyHighlights.length > 0) {
        res += `   - **Highlight**: ${a.keyHighlights[0]}\n`;
      }
      res += `\n`;
    });

    if (certs.length > 0) {
      res += `**Additional Verified Hackathon & Program Credentials**:\n`;
      certs.forEach(c => {
        const issuer = c.issuingOrganization || c.issuing_organization;
        res += `- 📜 **${c.name}** (@${issuer})\n`;
      });
    }
    return res.trim();
  }

  // 4. LEADERSHIP & POSITIONS OF RESPONSIBILITY
  if (q.includes('fest') || q.includes('lead') || q.includes('secretary') || q.includes('avinya') || q.includes('ekarikthin') || q.includes('bootcamp') || q.includes('sih') || q.includes('hackdays') || q.includes('brahma') || q.includes('position') || q.includes('responsibility')) {
    if (positions.length > 0) {
      let res = `**Positions of Responsibility & Leadership**:\n\n`;
      positions.forEach((pos, idx) => {
        res += `${idx + 1}. 🎪 **${pos.title}** — *${pos.organization}* (${pos.period || '2024–Present'})\n`;
        if (pos.role) res += `   - **Role**: ${pos.role}\n`;
        if (pos.points && pos.points.length > 0) {
          res += `   - **Key Impact**: ${pos.points[0]}\n`;
        } else if (pos.desc) {
          res += `   - **Description**: ${pos.desc}\n`;
        }
        res += `\n`;
      });
      return res.trim();
    }
    return `**Leadership & Hackathon Organization**:
- **Smart India Hackathon (SIH) Student Coordinator**: Appointed by NIT Nagaland & MoE Innovation Cell to lead university internal hackathons and mentor 20+ teams across hardware and software tracks.
- **Lead Organizer — Hackdays Nagaland & Hack $ Brahma**: Founded and organized regional hackathons empowering 200+ developers across the North East with live judging, mentoring, and sponsor partnerships.
- **Technical Secretary at NIT Nagaland (2025–Present)**: Co-organized **Tech Avinya** (1st Tech Fest) and **Ekarikthin** (Nagaland's 2nd largest fest), managing 30+ team members, 15+ sponsors, and 200+ participants.
- **Student Coordinator — Ministry of Education, Govt of India**: Managed government IDE bootcamps for PM SHRI Educators (250+ participants across 5 days).`;
  }

  // 5. TECHNICAL SKILLS & STACK
  if (q.includes('skill') || q.includes('stack') || q.includes('language') || q.includes('tool') || q.includes('technology') || q.includes('python') || q.includes('react') || q.includes('c++')) {
    if (skills.length > 0) {
      // Group skills by category
      const categories = {};
      skills.forEach(s => {
        const cat = s.category || 'General';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(s.name);
      });

      let res = `**Core Technical Toolkit (${skills.length} Technologies)**:\n`;
      Object.entries(categories).forEach(([cat, list]) => {
        res += `- **${cat}**: ${list.join(', ')}\n`;
      });
      return res.trim();
    }
    return `**Core Technical Toolkit**:
- **Languages**: Python, C++, C, JavaScript (ES6+), HTML5, CSS3.
- **Computer Vision & AI**: YOLOv8, OpenCV, MediaPipe Pose, PyTorch, EasyOCR, Agentic AI Workflows, n8n Orchestration.
- **Data Science & ML**: Pandas, NumPy, Scikit-Learn, XGBoost, LightGBM, FastF1 API, Streamlit.
- **Web & Backend**: React.js, Tailwind CSS, FastAPI, Flask, REST APIs, PostgreSQL, SQLite.
- **Embedded & Systems**: ESP32, FreeRTOS, IMU / FSR Sensors, ADC calibration.
- **Developer Tools**: Git, GitHub, VS Code, Linux/macOS.`;
  }

  // 6. CONTACT & PROFILES
  if (q.includes('contact') || q.includes('email') || q.includes('hire') || q.includes('reach') || q.includes('phone') || q.includes('linkedin') || q.includes('github') || q.includes('resume')) {
    return `You can reach out to Divyanshu directly through any of these verified channels:
- 📧 **Email**: [${profile.email || 'divyanshu.nit.28@gmail.com'}](mailto:${profile.email || 'divyanshu.nit.28@gmail.com'})
- 📞 **Phone**: ${profile.phone || '+91-77******53'} (Available upon request)
- 💻 **GitHub**: [${profile.github ? profile.github.replace('https://', '') : 'github.com/divyanshu-mishra-19'}](${profile.github || 'https://github.com/divyanshu-mishra-19'})
- 💼 **LinkedIn**: [${profile.linkedin ? profile.linkedin.replace('https://', '') : 'linkedin.com/in/divyanshu-mishra-nit20241033'}](${profile.linkedin || 'https://www.linkedin.com/in/divyanshu-mishra-nit20241033/'})
- 🎓 **Campus**: National Institute of Technology, Nagaland (CGPA: 8.81).`;
  }

  // 7. EDUCATION
  if (q.includes('education') || q.includes('college') || q.includes('nit') || q.includes('cgpa') || q.includes('degree') || q.includes('school')) {
    if (education.length > 0) {
      let res = `**Education & Academic Profile**:\n\n`;
      education.forEach((edu, idx) => {
        res += `${idx + 1}. 🎓 **${edu.degree}**\n`;
        res += `   - **Institution**: ${edu.institution} (${edu.period || '2024–2028'})\n`;
        if (edu.grade) res += `   - **Academic Merit**: **${edu.grade}**\n`;
        if (edu.description) res += `   - **Overview**: ${edu.description}\n`;
        res += `\n`;
      });
      return res.trim();
    }
    return `**Education Profile**:
- **Degree**: B.Tech in Electrical and Electronics Engineering (EEE).
- **Institution**: National Institute of Technology (NIT), Nagaland.
- **Academic Merit**: **CGPA: 8.81 / 10.0**
- Combines rigorous circuit and systems engineering foundations with self-driven Computer Vision, Data Science, and Full-Stack software engineering.`;
  }

  // 8. UNIVERSAL FUZZY SEARCH ACROSS ALL DATA ENTITIES
  // If the query contains any word that matches any project, certification, or skill
  const words = q.split(/\s+/).filter(w => w.length > 3);
  for (const word of words) {
    const matchedCert = certs.find(c => (c.name || '').toLowerCase().includes(word) || (c.description || '').toLowerCase().includes(word));
    if (matchedCert) {
      const issuer = matchedCert.issuingOrganization || matchedCert.issuing_organization;
      return `Found related certification **${matchedCert.name}** issued by **${issuer}** (${matchedCert.issueDate || '2026'}).\n\n- ${matchedCert.description || 'Verified certificate available in the Certifications section.'}`;
    }
    const matchedProj = projects.find(p => (p.title || '').toLowerCase().includes(word) || (p.description || '').toLowerCase().includes(word));
    if (matchedProj) {
      return `Found related project **${matchedProj.title}**: ${matchedProj.description}\n\n- **Tech Stack**: ${matchedProj.tags?.join(', ') || 'N/A'}\n- **Repository**: [GitHub Link](${matchedProj.github || '#'})`;
    }
  }

  // 9. DEFAULT OVERVIEW
  return `I can help you explore Divyanshu's portfolio! Feel free to ask about:
- 🚀 **Projects (${projects.length})**: Osteoarthritis Screening AI, IBVAP Border Surveillance, F1 Telemetry, Traffic Vision YOLOv8.
- 📜 **Licenses & Certifications (${certs.length})**: AI Innovation Hackathon @ Bharat Academix, Energy Conservation @ NSDA, Capabl Agentic AI.
- 🏆 **Hackathons & Podium Finishes (${achievements.length})**: Capabl India Top 5, 1st Prize Ideathon, SIH 2026.
- 🎪 **Leadership & Organizing (${positions.length})**: SIH Coordinator, Organizer of Hackdays Nagaland & Hack $ Brahma.
- ⚙️ **Technical Stack (${skills.length})**: Python, C++, React, PyTorch, MediaPipe, XGBoost, YOLOv8.
- 📫 **Contact & Opportunities**: Email, LinkedIn, or GitHub.`;
}

// Markdown Formatter: parses bold, links, code, and list items cleanly with zero stray asterisks
export function FormattedMessage({ content, isUser }) {
  if (isUser) {
    return (
      <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed !text-white" style={{ color: '#ffffff' }}>
        {content}
      </div>
    );
  }

  const renderInlineFormatted = (text) => {
    const parts = [];
    // Matches [label](url), **bold**, *italic*, or `code`
    const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      if (match[2] && match[3]) {
        // Markdown Link [text](url)
        parts.push(
          <a
            key={match.index}
            href={safeHref(match[3])}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-semibold underline underline-offset-2 transition-colors"
          >
            {match[2]}
            <ExternalLink className="w-2.5 h-2.5 inline ml-0.5" />
          </a>
        );
      } else if (match[4]) {
        // Bold **text**
        parts.push(
          <strong key={match.index} className="font-bold text-cyan-800 dark:text-cyan-300">
            {match[4]}
          </strong>
        );
      } else if (match[5]) {
        // Italic *text*
        parts.push(
          <em key={match.index} className="italic text-slate-700 dark:text-slate-200">
            {match[5]}
          </em>
        );
      } else if (match[6]) {
        // Inline code `code`
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded bg-slate-200/90 dark:bg-black/40 border border-slate-300/80 dark:border-white/10 text-cyan-900 dark:text-amber-300 font-mono text-[11px]"
          >
            {match[6]}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 font-sans leading-relaxed text-xs text-slate-800 dark:text-slate-200">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1" />;
        }

        // Bullet item (- or *)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.substring(2);
          return (
            <div key={i} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 mt-1.5 shrink-0 shadow-sm" />
              <div className="flex-1 text-slate-800 dark:text-slate-200">
                {renderInlineFormatted(bulletText)}
              </div>
            </div>
          );
        }

        // Numbered list item (e.g. 1. )
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1 my-1">
              <span className="text-[11px] font-mono font-bold text-cyan-800 bg-cyan-100 border border-cyan-300/60 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/30 px-1 rounded shrink-0 mt-0.5">
                {numMatch[1]}.
              </span>
              <div className="flex-1 text-slate-800 dark:text-slate-200">
                {renderInlineFormatted(numMatch[2])}
              </div>
            </div>
          );
        }

        // Regular paragraph / Heading line
        return (
          <p key={i} className="text-slate-800 dark:text-slate-200">
            {renderInlineFormatted(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function AIAgent() {
  const { data } = usePortfolioData();
  const liveData = data || portfolioData;
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      text: `Hello! I am **Divyanshu AI**, an intelligent assistant trained on Divyanshu Mishra's engineering projects, computer vision research, hackathons, and leadership credentials. Ask me anything or select a prompt below!`,
      time: 'Just now',
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateResponse(textToSend, liveData);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 550);
  };

  const handleReset = () => {
    setMessages([
      {
        sender: 'agent',
        text: `Conversation reset. How can I help you explore Divyanshu's portfolio?`,
        time: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* Floating Agent Launch Button (Bottom Right) - Calm, sleek, no flashing or beeping */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-full border shadow-2xl backdrop-blur-2xl cursor-pointer select-none transition-all"
          style={{
            background: 'var(--theme-card-solid, rgba(15, 23, 42, 0.92))',
            borderColor: 'var(--theme-border, rgba(56, 189, 248, 0.35))',
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
          aria-label="Open AI Portfolio Assistant"
          title="Divyanshu AI Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </div>

          <div className="text-left leading-tight hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">DIVYANSHU AI</span>
              {/* Calm, steady status dot with no flashing or ping */}
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            </div>
            <span className="text-[10px] font-mono font-semibold text-cyan-700 dark:text-cyan-300/80">Ask AI Agent</span>
          </div>
        </motion.button>
      </div>

      {/* Interactive AI Agent Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-18 sm:bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[440px] max-h-[82dvh] h-[520px] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-cyan-500/30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.25), 0 0 30px rgba(14,165,233,0.15)',
            }}
          >
            {/* Modal Header */}
            <div className="p-4 px-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-100/90 dark:bg-slate-900/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-white">Divyanshu AI</h3>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-[9px] uppercase font-semibold">
                      READY
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    Agentic AI Assistant • Trained on Portfolio
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  type="button"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                  title="Close"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar text-xs bg-slate-50/50 dark:bg-transparent">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'agent' && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}

                  <div
                    className={`max-w-[86%] rounded-2xl p-3.5 leading-relaxed chat-bubble ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 rounded-br-none shadow !text-white chat-user-bubble'
                        : 'bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-xs'
                    }`}
                    style={m.sender === 'user' ? { color: '#ffffff' } : undefined}
                  >
                    <FormattedMessage content={m.text} isUser={m.sender === 'user'} />
                    <div
                      className={`text-[9px] font-mono mt-1.5 ${
                        m.sender === 'user' ? 'text-right opacity-80' : 'text-slate-400 dark:text-slate-500'
                      }`}
                      style={m.sender === 'user' ? { color: 'rgba(255, 255, 255, 0.85)' } : undefined}
                    >
                      {m.time}
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 items-center">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 border-t border-slate-200/80 dark:border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar bg-slate-100/70 dark:bg-slate-950/60">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(qp.query)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white hover:bg-cyan-50 border border-slate-300/80 hover:border-cyan-400 text-slate-700 hover:text-cyan-800 dark:bg-white/5 dark:hover:bg-cyan-500/20 dark:border-white/10 dark:hover:border-cyan-400/40 dark:text-slate-300 dark:hover:text-cyan-200 transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-2xs font-medium"
                  type="button"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-slate-100/90 dark:bg-slate-900/80 border-t border-slate-200 dark:border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about projects, hackathons, skills..."
                className="flex-1 bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors font-sans shadow-2xs"
              />

              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                title="Send message"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
