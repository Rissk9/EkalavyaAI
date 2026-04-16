// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function AiDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [githubUsername, setGithubUsername] = useState(() => localStorage.getItem('ekalavya_github') || '');
  const [leetcodeUsername, setLeetcodeUsername] = useState(() => localStorage.getItem('ekalavya_leetcode') || '');
  const [summary, setSummary] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [hasResume, setHasResume] = useState(() => localStorage.getItem('ekalavya_resume_exists') === 'true');
  const [atsData, setAtsData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ekalavya_ats')) || null; } 
    catch { return null; }
  });
  const [messages, setMessages] = useState([
    { role: 'ai', label: 'AI MENTOR', text: "Hello this is Lakshya, your personal AI mentor who is here to help you in all your job related endeavours" },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const hasTriggeredRef = useRef(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    'Synthesizing career telemetry',
    'Analyzing skill signatures',
    'Consulting hiring algorithms',
    'Mapping preparation trajectory',
    'Finalizing mentor feedback'
  ];

  useEffect(() => {
    let interval;
    if (isSending) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isSending, loadingMessages.length]);

  useEffect(() => {
    if (location.state?.initialPrompt && !hasTriggeredRef.current && !isSending) {
      hasTriggeredRef.current = true; 
      // Need a tiny timeout to ensure react state (like github/leetcode names) is loaded 
      // if they are fetched from somewhere, though in this component they are typed.
      setTimeout(() => {
        handleSend(location.state.initialPrompt, location.state.maskPrompt);
      }, 500);
      navigate(location.pathname, { replace: true, state: {} });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleSend = (overrideText = null, isMasked = false) => {
    if (isSending) return;
    const userText = typeof overrideText === 'string' ? overrideText : input;
    if (!userText.trim()) return;

    // Send values exactly as the user typed them (no trimming),
    // so the backend receives the same string in the request body.
    const github = githubUsername;
    const leetcode = leetcodeUsername;

    const displayMessage = isMasked ? 'MASTER PROMPT SENT 🔥' : userText;

    setMessages(prev => [...prev, { role: 'user', label: 'You', text: displayMessage }]);
    setInput('');
    setIsSending(true);

    const apiBase = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:8000';

    fetch(`${apiBase}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        github_username: github ? github : null,
        leetcode_username: leetcode ? leetcode : null,
        summary,
      }),
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Request failed: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then(data => {
        const aiText = data?.output ?? '';
        const nextSummary = data?.summary ?? summary;
        setSummary(nextSummary);
        setMessages(prev => [...prev, { role: 'ai', label: 'AI MENTOR', text: aiText }]);
      })
      .catch(err => {
        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            label: 'AI MENTOR',
            text: `Error contacting mentor API. ${String(err?.message || err)}`,
          },
        ]);
      })
      .finally(() => setIsSending(false));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const apiBase = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:8000';
    console.log('API Base URL:', apiBase);
    console.log('Saving usernames:', { github: githubUsername, leetcode: leetcodeUsername });

    try {
      // Step 1: Update usernames
      const usernamesResponse = await fetch(`${apiBase}/update-usernames`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github: githubUsername,
          leetcode: leetcodeUsername
        }),
      });

      console.log('Usernames response status:', usernamesResponse.status);
      const responseText = await usernamesResponse.text();
      console.log('Usernames response:', responseText);

      if (!usernamesResponse.ok) {
        throw new Error(`Failed to update usernames: ${responseText}`);
      }

      // Persist locally
      localStorage.setItem('ekalavya_github', githubUsername);
      localStorage.setItem('ekalavya_leetcode', leetcodeUsername);

      // Step 2: Upload resume if selected
      if (resumeFile) {
        console.log('Uploading resume file:', resumeFile.name, 'Size:', resumeFile.size);
        const formData = new FormData();
        formData.append('file', resumeFile);

        console.log('Sending FormData to:', `${apiBase}/upload-resume`);

        const resumeResponse = await fetch(`${apiBase}/upload-resume`, {
          method: 'POST',
          body: formData
        });

        console.log('Resume upload response status:', resumeResponse.status);

        // Parse JSON body — backend returns { success, message, file_path }
        let resumeData;
        try {
          resumeData = await resumeResponse.json();
        } catch {
          const rawText = await resumeResponse.text().catch(() => '');
          throw new Error(`Unexpected response from server: ${rawText}`);
        }

        console.log('Resume upload response body:', resumeData);

        if (!resumeResponse.ok || resumeData.success === false) {
          throw new Error(`Resume upload failed: ${resumeData.detail || resumeData.message || 'Unknown error'}`);
        }

        // Persist locally
        setAtsData(resumeData.ats_data);
        localStorage.setItem('ekalavya_ats', JSON.stringify(resumeData.ats_data));
        setHasResume(true);
        localStorage.setItem('ekalavya_resume_exists', 'true');
        
        setMessages(prev => [...prev, {
          role: 'ai',
          label: 'SYSTEM',
          text: 'Profile data saved and resume securely uploaded. New AST score generated.'
        }]);
      } else {
        console.log('No resume file selected');
      }

      // Success message
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          label: 'AI MENTOR',
          text: 'Great! Your profile data has been saved successfully. I can now provide more personalized advice based on your GitHub, LeetCode, and resume information.',
        },
      ]);

    } catch (error) {
      console.error('Error saving data:', error);
      console.error('Full error object:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          label: 'AI MENTOR',
          text: `Error saving your data: ${error.message}. Please check if backend is running on port 8000.`,
        },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file || file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      setResumeFile(null);
      return;
    }

    // Just store the file — it will be uploaded when the user clicks "Save Profile Data"
    setResumeFile(file);
    setMessages(prev => [
      ...prev,
      {
        role: 'ai',
        label: 'AI MENTOR',
        text: `📎 Resume "${file.name}" selected. Click **Save Profile Data** to upload it.`,
      },
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="antialiased bg-[#02010A] h-screen overflow-hidden"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.02) 0%, transparent 80%)' }}
    >
      <main className="h-full flex flex-col md:flex-row overflow-hidden">
        {/* LEFT COLUMN */}
        <section className="w-full md:w-[60%] p-8 md:p-10 flex flex-col gap-6 h-full min-h-0 overflow-hidden">
          <div className="flex flex-col gap-4 shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 w-fit group"
            >
              <span className="text-4xl font-bold tracking-tighter text-[#FFD700] font-headline uppercase group-hover:text-[#FFF] transition-colors">EKALAVYA</span>
            </button>
          </div>

          {/* Chat Section */}
          <div className="flex-1 min-h-0 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-label text-[10px] text-primary-container tracking-[0.2em] uppercase">AI Mentor</span>
            </div>
            <div className="flex-1 min-h-0 bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-6 overflow-y-auto ghost-border">
              {messages.map((msg, idx) => (
                msg.role === 'ai' ? (
                  <div key={idx} className="flex flex-col gap-2 max-w-[85%]">
                    <span className="font-label text-[9px] text-primary-container tracking-widest">{msg.label}</span>
                    <div className="bg-surface-container-high p-4 rounded-xl rounded-tl-none text-sm text-on-surface-variant leading-relaxed">
                      <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-td:border prose-th:border prose-td:border-outline-variant/30 prose-th:border-outline-variant/30 prose-th:bg-surface-container-highest prose-table:border-collapse">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={idx} className="flex flex-col gap-2 max-w-[85%] self-end items-end">
                    <span className="font-label text-[9px] text-outline-variant tracking-widest">{msg.label}</span>
                    <div className="bg-primary-container text-on-primary p-4 rounded-xl rounded-tr-none text-sm font-medium leading-relaxed shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                      {msg.text}
                    </div>
                  </div>
                )
              ))}
              
              {isSending && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3 max-w-[85%] animate-pulse"
                >
                  <span className="font-label text-[9px] text-primary-container tracking-widest uppercase">Lakshya is synthesizing...</span>
                  <div className="bg-surface-container-high/40 p-6 rounded-xl rounded-tl-none border border-[#FFD700]/10 backdrop-blur-sm">
                    <div className="celestial-loader mx-auto">
                      <div className="loader-sun"></div>
                      <div className="loader-pulse"></div>
                      <div className="loader-pulse" style={{ animationDelay: '0.6s' }}></div>
                      <div className="loader-pulse" style={{ animationDelay: '1.2s' }}></div>
                      <div className="loader-particle"></div>
                      <div className="loader-particle"></div>
                      <div className="loader-particle"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-[#FFD700]/5 rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-center text-on-surface-variant/60 font-label tracking-widest mt-4 uppercase animate-pulse">
                      {loadingMessages[loadingStep]}
                    </p>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            <div className="relative">
              <input
                className="w-full h-14 bg-surface-container-low border-none rounded-xl px-6 pr-14 text-on-surface font-body focus:outline-none focus:ring-1 focus:ring-primary-container/30 transition-all"
                placeholder="Ask your mentor..."
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={isSending}
              />
              <button
                onClick={handleSend}
                disabled={isSending || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 solar-gradient rounded-lg flex items-center justify-center text-on-primary shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="w-full md:w-[40%] bg-surface-container-lowest p-8 md:p-10 flex flex-col gap-8 h-full min-h-0 overflow-hidden">
          {/* Profile Data */}
          <div className="flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-lg">tune</span>
              <span className="font-label text-[10px] tracking-[0.2em] text-primary-container uppercase">Profile Data</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="group border-b-2 border-primary-container pb-2 transition-all flex flex-col gap-2">
                <label className="font-label text-[10px] text-primary-container tracking-wider uppercase">Resume</label>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-on-surface font-body text-sm">
                    {resumeFile ? resumeFile.name : hasResume ? 'Resume currently uploaded ✓' : 'No file selected'}
                  </span>
                  <span className="material-symbols-outlined text-primary-container text-sm">attach_file</span>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => setResumeFile(e.target.files[0])}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="w-fit px-4 py-2 bg-transparent border border-outline-variant/30 rounded-lg text-xs font-label tracking-widest text-on-surface hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  {resumeFile ? 'CHANGE RESUME' : hasResume ? 'REPLACE CURRENT RESUME' : 'UPLOAD RESUME'}
                </label>
              </div>
              <div className="border-b border-outline-variant/30 pb-2">
                <label className="font-label text-[10px] text-outline-variant tracking-wider uppercase">GitHub Username</label>
                <input
                  className="w-full bg-transparent border-none p-0 mt-1 text-on-surface font-body text-sm focus:outline-none focus:ring-0"
                  type="text"
                  value={githubUsername}
                  onChange={e => setGithubUsername(e.target.value)}
                />
              </div>
              <div className="border-b border-outline-variant/30 pb-2">
                <label className="font-label text-[10px] text-outline-variant tracking-wider uppercase">LeetCode Username</label>
                <input
                  className="w-full bg-transparent border-none p-0 mt-1 text-on-surface/40 font-body text-sm focus:outline-none focus:ring-0"
                  placeholder="Not linked"
                  type="text"
                  value={leetcodeUsername}
                  onChange={e => setLeetcodeUsername(e.target.value)}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full px-4 py-3 solar-gradient rounded-lg text-xs font-label tracking-widest text-on-primary font-medium shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'SAVING...' : 'SAVE PROFILE DATA'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 items-center shrink-0 overflow-y-auto">
            <div className="w-full flex justify-start">
              <span className="font-label text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">ATS SCORE</span>
            </div>
            
            <div className="flex flex-row w-full gap-6 items-start">
              {/* Left Column: Gauge and Breakdown */}
              <div className="flex flex-col gap-6 shrink-0 w-[180px]">
                <div className="relative flex items-center justify-center w-[160px] h-[160px] mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" fill="transparent" r="90" stroke="#2A2A3A" strokeWidth="12" />
                    <circle className="gauge-ring" cx="100" cy="100" fill="transparent" r="90" stroke="#FFD700" strokeLinecap="round" strokeWidth="12" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline text-4xl font-bold text-primary-container">
                      {atsData?.component_breakdown?.total_score?.toFixed(1) || '0.0'}
                    </span>
                    <span className="font-label text-[10px] text-outline-variant tracking-widest uppercase">/ 10</span>
                  </div>
                  <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(255,215,0,0.05)] pointer-events-none" />
                </div>

                <div className="flex flex-col gap-3 w-full">
                  {[
                    { label: 'Skill Match', score: ((atsData?.component_breakdown?.skill_match || 0) / 10).toFixed(1), width: `${atsData?.component_breakdown?.skill_match || 0}%` },
                    { label: 'Experience Quality', score: ((atsData?.component_breakdown?.experience_quality || 0) / 10).toFixed(1), width: `${atsData?.component_breakdown?.experience_quality || 0}%` },
                    { label: 'Project Quality', score: ((atsData?.component_breakdown?.project_quality || 0) / 10).toFixed(1), width: `${atsData?.component_breakdown?.project_quality || 0}%` },
                    { label: 'Resume Structure', score: ((atsData?.component_breakdown?.resume_structure || 0) / 10).toFixed(1), width: `${atsData?.component_breakdown?.resume_structure || 0}%` },
                    { label: 'Job Relevance', score: ((atsData?.component_breakdown?.job_relevance || 0) / 10).toFixed(1), width: `${atsData?.component_breakdown?.job_relevance || 0}%` },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col gap-1.5 w-full group">
                      <div className="flex items-center justify-between">
                        <span className="font-label text-[9px] text-on-surface-variant uppercase tracking-wider">{item.label}</span>
                        <span className="font-label text-[9px] text-primary-container">{item.score}</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full solar-gradient" style={{ width: item.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Insights */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">
                {atsData?.matched_skills && atsData.matched_skills.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="font-label text-[9px] text-[#4ade80] uppercase tracking-wider">Matched Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {atsData.matched_skills.map(skill => (
                        <span key={skill} className="text-[10px] px-2 py-1 bg-[#4ade80]/10 text-[#4ade80] rounded border border-[#4ade80]/20 whitespace-nowrap">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {atsData?.missing_critical_skills && atsData.missing_critical_skills.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="font-label text-[9px] text-[#f87171] uppercase tracking-wider">Missing Critical Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {atsData.missing_critical_skills.map(skill => (
                        <span key={skill} className="text-[10px] px-2 py-1 bg-[#f87171]/10 text-[#f87171] rounded border border-[#f87171]/20 whitespace-nowrap">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {atsData?.gaps_identified && atsData.gaps_identified.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="font-label text-[9px] text-[#fbbf24] uppercase tracking-wider">Gaps Identified</span>
                    <ul className="flex flex-col gap-1 list-disc pl-3 m-0">
                      {atsData.gaps_identified.map((gap, i) => (
                        <li key={i} className="text-xs text-on-surface-variant font-body">{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {atsData?.recommendations && atsData.recommendations.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="font-label text-[9px] text-primary-container uppercase tracking-wider">Recommendations</span>
                    <div className="flex flex-col gap-1.5">
                       {atsData.recommendations.map((rec, i) => (
                         <div key={i} className="text-xs text-on-surface font-body p-2 bg-surface-container-high rounded border border-outline-variant/10">
                           {rec}
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {!atsData && (
                  <div className="text-xs text-outline-variant font-body italic flex h-full items-center">
                    Upload a resume to see detailed skill insights and gap analysis here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </main>

    </motion.div>
  );
}
