import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AiDashboardPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'ai', label: 'AI MENTOR', text: "Hello Observer. I've finished scanning your latest repositories. Your architectural patterns are strong, but I've detected a significant drop in testing coverage in the core modules." },
    { role: 'user', label: 'OBSERVER_01', text: 'What should I focus on this week?' },
    { role: 'ai', label: 'AI MENTOR', text: "Prioritise adding unit tests to the async data layer. Your GitHub activity shows 3 commits with failing CI pipelines due to mock injection errors. Let's fix that first." },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', label: 'OBSERVER_01', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        label: 'AI MENTOR',
        text: 'Processing telemetry... Your trajectory has been recalibrated. Focus on the auth-service module for maximum gravity boost.'
      }]);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="antialiased overflow-x-hidden bg-[#02010A]"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.02) 0%, transparent 80%)' }}
    >
      {/* Top App Bar */}
      <header className="bg-[#02010A]/80 backdrop-blur-xl fixed top-0 z-50 flex justify-between items-center px-8 py-4 w-full h-[80px]">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <button onClick={() => navigate('/')} className="text-xl font-bold tracking-tighter bg-gradient-to-r from-[#FFD700] to-[#FFB77A] bg-clip-text text-transparent font-headline">
              EKALAVYA
            </button>
            <div className="flex items-center gap-2 font-label text-[10px] tracking-widest mt-0.5">
              <span className="text-secondary cursor-pointer hover:text-on-surface transition-colors" onClick={() => navigate('/')}>HOME</span>
              <span className="text-outline-variant">/</span>
              <span className="text-primary-container">AI MENTOR</span>
            </div>
          </div>
          <nav className="hidden md:flex gap-8 ml-12">
            <button onClick={() => navigate('/')} className="font-label tracking-tight uppercase text-xs font-bold text-[#E6DFF5]/60 hover:text-[#E6DFF5] transition-all duration-300">HOME</button>
            <button onClick={() => navigate('/')} className="font-label tracking-tight uppercase text-xs font-bold text-[#E6DFF5]/60 hover:text-[#E6DFF5] transition-all duration-300">GALAXY</button>
            <span className="font-label tracking-tight uppercase text-xs font-bold text-[#FFD700] border-b-2 border-[#FFD700] pb-1">MENTOR</span>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary-container transition-colors">notifications</button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary-container transition-colors">settings</button>
          <div className="relative group">
            <div className="w-10 h-10 rounded-full border border-primary-container p-0.5 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FFD700]/40 to-[#FFB77A]/20" />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-[80px] min-h-screen flex flex-col md:flex-row">
        {/* LEFT COLUMN */}
        <section className="w-full md:w-[60%] p-10 flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="font-label text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">YOUR MENTOR</span>
            </div>
            <h1 className="font-headline text-5xl font-bold text-on-surface tracking-tight">AI Mentor</h1>
          </div>

          {/* Profile Data Section */}
          <div className="flex flex-col gap-6">
            <h3 className="font-label text-xs tracking-widest text-outline-variant uppercase">PROFILE DATA</h3>
            <div className="grid grid-cols-1 gap-8">
              {/* Resume Field */}
              <div className="group border-b-2 border-primary-container pb-2 transition-all">
                <label className="font-label text-[10px] text-primary-container tracking-wider uppercase">RESUME</label>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-on-surface font-body text-sm">resume_2024.pdf uploaded</span>
                  <span className="material-symbols-outlined text-primary-container text-sm">attach_file</span>
                </div>
              </div>
              <button className="w-fit px-4 py-2 bg-transparent border border-outline-variant/30 rounded-lg text-xs font-label tracking-widest text-on-surface hover:bg-surface-container-high transition-all">
                UPLOAD RESUME
              </button>
              <div className="border-b border-outline-variant/30 pb-2">
                <label className="font-label text-[10px] text-outline-variant tracking-wider uppercase">GITHUB USERNAME</label>
                <input className="w-full bg-transparent border-none p-0 mt-1 text-on-surface font-body text-sm focus:outline-none focus:ring-0" type="text" defaultValue="observer_void_01" />
              </div>
              <div className="border-b border-outline-variant/30 pb-2">
                <label className="font-label text-[10px] text-outline-variant tracking-wider uppercase">LEETCODE USERNAME</label>
                <input className="w-full bg-transparent border-none p-0 mt-1 text-on-surface/40 font-body text-sm focus:outline-none focus:ring-0" placeholder="Not linked" type="text" />
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="mt-4 flex flex-col gap-4">
            <div className="h-[340px] bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-6 overflow-y-auto ghost-border">
              {messages.map((msg, idx) => (
                msg.role === 'ai' ? (
                  <div key={idx} className="flex flex-col gap-2 max-w-[85%]">
                    <span className="font-label text-[9px] text-primary-container tracking-widest">{msg.label}</span>
                    <div className="bg-surface-container-high p-4 rounded-xl rounded-tl-none text-sm text-on-surface-variant leading-relaxed">
                      {msg.text}
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
            </div>
            <div className="relative">
              <input
                className="w-full h-14 bg-surface-container-low border-none rounded-xl px-6 pr-14 text-on-surface font-body focus:outline-none focus:ring-1 focus:ring-primary-container/30 transition-all"
                placeholder="Ask your mentor..."
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 solar-gradient rounded-lg flex items-center justify-center text-on-primary shadow-lg active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="w-full md:w-[40%] bg-surface-container-lowest p-10 flex flex-col gap-12 min-h-full">
          <div className="flex flex-col gap-8 items-center">
            <div className="w-full flex justify-start">
              <span className="font-label text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">GRAVITY SCORE</span>
            </div>
            {/* Gauge */}
            <div className="relative flex items-center justify-center w-[200px] h-[200px]">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" fill="transparent" r="90" stroke="#2A2A3A" strokeWidth="12" />
                <circle className="gauge-ring" cx="100" cy="100" fill="transparent" r="90" stroke="#FFD700" strokeLinecap="round" strokeWidth="12" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-headline text-5xl font-bold text-primary-container">7.4</span>
                <span className="font-label text-xs text-outline-variant tracking-widest uppercase">/ 10</span>
              </div>
              <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(255,215,0,0.05)] pointer-events-none" />
            </div>
          </div>

          {/* Breakdown */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
              {[
                { label: 'GitHub Activity', score: '8.0', width: '80%' },
                { label: 'Resume Density', score: '6.5', width: '65%' },
                { label: 'Problem Solving', score: '7.0', width: '70%' },
                { label: 'Role Alignment', score: '7.8', width: '78%' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between group">
                  <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">{item.label}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full solar-gradient" style={{ width: item.width }} />
                    </div>
                    <span className="font-label text-[10px] text-primary-container">{item.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-auto bg-surface-container-low p-6 rounded-xl border border-primary-container/20 shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-lg">bolt</span>
                <span className="font-label text-[10px] text-primary-container tracking-[0.2em] uppercase">WHAT TO FIX NEXT</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body">
                Add unit tests to your last 3 repositories to improve your Gravity Score. The AI detected lack of coverage in <span className="text-on-surface font-medium">auth-service</span>.
              </p>
              <button className="flex items-center gap-2 text-[10px] font-label text-primary-container uppercase tracking-widest mt-2 group">
                Begin Optimization
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Side Nav Bar (Collapsible) */}
      <nav className="h-screen w-20 hover:w-64 transition-all duration-500 fixed left-0 top-0 z-40 bg-[#141120] flex flex-col py-6 items-center overflow-hidden shadow-[4px_0_24px_rgba(255,215,0,0.02)] -translate-x-full md:translate-x-0 group/sidenav">
        <div className="flex flex-col gap-10 items-center w-full">
          <div className="w-10 h-10 rounded-lg solar-gradient flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          </div>
          <div className="flex flex-col gap-8 w-full px-4">
            <div className="flex items-center gap-4 px-3 py-3 rounded-lg bg-[#363343] text-[#FFD700] shadow-[inset_4px_0_0_#FFD700]">
              <span className="material-symbols-outlined">rocket_launch</span>
              <span className="font-label text-[10px] tracking-[0.1em] uppercase opacity-0 group-hover/sidenav:opacity-100 transition-opacity whitespace-nowrap">Core</span>
            </div>
            {[
              { icon: 'analytics', label: 'Pulse' },
              { icon: 'history', label: 'Archive' },
              { icon: 'hub', label: 'Nexus' },
              { icon: 'terminal', label: 'Log' },
            ].map(item => (
              <div key={item.icon} className="flex items-center gap-4 px-3 py-3 rounded-lg text-[#E6DFF5]/40 hover:bg-[#2B2838] hover:text-[#FFD700] transition-all cursor-pointer">
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label text-[10px] tracking-[0.1em] uppercase opacity-0 group-hover/sidenav:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-4 w-full px-4">
          <button className="w-full py-3 solar-gradient rounded-lg text-on-primary font-label text-[10px] tracking-widest uppercase opacity-0 group-hover/sidenav:opacity-100 transition-opacity whitespace-nowrap">
            INITIATE SYNC
          </button>
          <button onClick={() => navigate('/login')} className="flex items-center gap-4 px-3 py-3 rounded-lg text-[#E6DFF5]/40 hover:text-error transition-all">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label text-[10px] tracking-[0.1em] uppercase opacity-0 group-hover/sidenav:opacity-100 transition-opacity whitespace-nowrap">Logout</span>
          </button>
        </div>
      </nav>
    </motion.div>
  );
}
