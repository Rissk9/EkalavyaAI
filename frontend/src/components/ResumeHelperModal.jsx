import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const OVERLEAF_TEMPLATES = [
  {
    name: 'IIT DHANBAD',
    desc: 'Professional On-Campus Template',
    link: 'https://www.overleaf.com/latex/templates/iit-dhanbad-resume-oncampus/sdtkcgtgxhtg',
    image: 'https://res.cloudinary.com/practo/image/upload/v1712123456/iit_dhanbad_preview.png' // Placeholder for UI logic
  },
  {
    name: 'IIT PATNA',
    desc: 'Clean Academic & Industry Layout',
    link: 'https://www.overleaf.com/latex/templates/iit-patna-resume/ddnnnxjgzckp',
  },
  {
    name: 'IIT BOMBAY',
    desc: 'The Gold Standard 2021 Template',
    link: 'https://www.overleaf.com/latex/templates/iit-bombay-resume-template-2021/fndpyhthjqpm',
  }
];

export default function ResumeHelperModal({ isOpen, onClose, githubUsername, leetcodeUsername, initialJD }) {
  const [step, setStep] = useState('config'); // 'config' | 'loading' | 'roadmap'
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [roadmap, setRoadmap] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    'Analyzing commit history...',
    'Evaluating DSA proficiency...',
    'Drafting impact statements...',
    'Aligning with target role...',
    'Finalizing professional roadmap...'
  ];

  const handleGenerate = async () => {
    setStep('loading');
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingMessages.length);
    }, 2500);

    try {
      const apiBase = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBase}/resume/generate-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_username: githubUsername,
          leetcode_username: leetcodeUsername,
          target_role: targetRole,
          job_description: initialJD
        })
      });

      const data = await response.json();
      if (data.success) {
        setRoadmap(data.markdown);
        setStep('roadmap');
      } else {
        alert(data.message || 'Generation failed');
        setStep('config');
      }
    } catch (err) {
      console.error(err);
      setStep('config');
    } finally {
      clearInterval(interval);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#02010A]/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-surface-container-low rounded-2xl border border-[#FFD700]/20 shadow-[0_0_50px_rgba(255,215,0,0.1)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#FFD700]/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">auto_awesome</span>
              <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface uppercase">Resume Roadmapper</h2>
            </div>
            <button onClick={onClose} className="text-outline-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {step === 'config' && (
              <div className="flex flex-col gap-8 max-w-md mx-auto py-10">
                <div className="text-center flex flex-col gap-3">
                  <h3 className="text-2xl font-bold text-primary-container">Target your future.</h3>
                  <p className="text-sm text-on-surface-variant font-body">Tell us what role you're aiming for, and we'll translate your stats into a winning resume structure.</p>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-xs uppercase tracking-widest text-outline-variant">Target Role</label>
                    <input 
                      type="text" 
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      placeholder="e.g. Frontend Engineer, ML Engineer"
                      className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container/30 transition-all font-body"
                    />
                  </div>
                  
                  <button 
                    onClick={handleGenerate}
                    className="w-full py-4 solar-gradient rounded-xl font-label tracking-widest text-sm text-on-primary font-bold shadow-xl active:scale-95 transition-transform"
                  >
                    GENERATE ROADMAP
                  </button>
                </div>
              </div>
            )}

            {step === 'loading' && (
              <div className="flex flex-col items-center justify-center py-20 gap-10">
                <div className="celestial-loader scale-150">
                  <div className="loader-sun"></div>
                  <div className="loader-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="loader-pulse" style={{ animationDelay: '0.8s' }}></div>
                  <div className="loader-pulse" style={{ animationDelay: '1.6s' }}></div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xl font-headline font-bold text-primary-container tracking-wide animate-pulse uppercase">
                    {loadingMessages[loadingStep]}
                  </p>
                  <p className="text-xs text-outline-variant font-label tracking-widest">LAKSHYA IS SCANNING YOUR DIGITAL LEGACY</p>
                </div>
              </div>
            )}

            {step === 'roadmap' && (
              <div className="flex flex-col gap-10">
                <div className="bg-surface-container-highest/30 rounded-2xl p-8 border border-primary-container/10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-label text-xs text-primary-container uppercase tracking-widest">Personalized Content Draft</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(roadmap);
                        alert('Markdown copied to clipboard!');
                      }}
                      className="flex items-center gap-2 text-[10px] font-label uppercase tracking-widest text-[#FFD700] hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      Copy Markdown
                    </button>
                  </div>
                  <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-primary-container prose-strong:text-[#FFD700]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {roadmap}
                    </ReactMarkdown>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-lg font-bold text-on-surface">Step 2: Choose a Professional Template</h4>
                    <p className="text-xs text-outline-variant font-body">Copy the text above into one of these industry-standard LaTeX templates on Overleaf.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {OVERLEAF_TEMPLATES.map((tmpl, i) => (
                      <a 
                        key={i} 
                        href={tmpl.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group bg-surface-container-high rounded-xl p-6 border border-outline-variant/20 hover:border-primary-container/40 transition-all flex flex-col gap-4"
                      >
                        <div className="h-24 bg-surface-container-highest rounded-lg flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
                           <span className="material-symbols-outlined text-4xl text-outline-variant group-hover:text-primary-container">article</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-headline font-bold text-on-surface group-hover:text-primary-container transition-colors uppercase tracking-tight">{tmpl.name}</span>
                          <span className="text-[10px] text-outline-variant font-body">{tmpl.desc}</span>
                        </div>
                        <div className="mt-auto pt-2 flex items-center justify-between">
                          <span className="text-[10px] font-label text-primary-container uppercase tracking-widest">Open in Overleaf</span>
                          <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-6 bg-primary-container/5 rounded-xl border border-primary-container/20 text-center">
                   <p className="text-xs text-on-surface-variant leading-relaxed">
                     <strong className="text-primary-container">Pro-Tip:</strong> Once you've created your resume on Overleaf, download the PDF and upload it back here to get a detailed ATS score!
                   </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
