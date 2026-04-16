import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ORBITS = [
  { id: 'backend', role: 'Backend Engineering', label: 'BACKEND ENGINEERING' },
  { id: 'frontend', role: 'Frontend Engineering', label: 'FRONTEND ENGINEERING' },
  { id: 'data', role: 'Data Science', label: 'DATA SCIENCE' },
  { id: 'product', role: 'Product Management', label: 'PRODUCT MANAGEMENT' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredOrbits = ORBITS.filter(o =>
    o.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#02010A] relative min-h-screen"
    >
      {/* Background effects */}
      <div className="fixed inset-0 star-field" />
      <div className="fixed inset-0 geometric-grid" />

      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col py-8 z-40 bg-[#141120] shadow-[4px_0_24px_rgba(255,215,0,0.04)]">
        <div className="px-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#FFD700]/20 flex items-center justify-center bg-surface-container-low overflow-hidden">
              <span className="material-symbols-outlined text-[#FFD700]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            </div>
            <div>
              <h2 className="font-headline text-[#FFD700] text-sm font-bold tracking-widest">SOLIS AI</h2>
              <p className="font-label text-[#E6DFF5]/40 text-[10px] uppercase tracking-[0.2em]">Core System</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orbits..."
            className="w-full bg-[#0f0c1b] border border-outline-variant/30 rounded-lg py-2 px-4 text-sm text-on-surface focus:outline-none focus:border-primary-container transition-colors placeholder:text-[#E6DFF5]/30 font-body"
          />
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            <li className="px-4">
              <button onClick={() => navigate('/')} className="w-full flex items-center gap-4 px-4 py-3 text-[#FFD700] border-r-2 border-[#FFD700] bg-gradient-to-r from-[#FFD700]/10 to-transparent font-label uppercase tracking-[0.1em] text-xs transition-all duration-300 text-left">
                <span className="material-symbols-outlined">explore</span>
                <span>GALAXY VIEW</span>
              </button>
            </li>
            <li className="px-4">
              <button onClick={() => navigate('/ai-dashboard')} className="w-full flex items-center gap-4 px-4 py-3 text-[#E6DFF5]/40 font-label uppercase tracking-[0.1em] text-xs hover:bg-[#2B2838] hover:text-[#E6DFF5] transition-all duration-300 text-left">
                <span className="material-symbols-outlined">psychology</span>
                <span>INTELLIGENCE HUB</span>
              </button>
            </li>
            <li className="px-4">
              <button onClick={() => navigate('/ai-dashboard')} className="w-full flex items-center gap-4 px-4 py-3 text-[#E6DFF5]/40 font-label uppercase tracking-[0.1em] text-xs hover:bg-[#2B2838] hover:text-[#E6DFF5] transition-all duration-300 text-left">
                <span className="material-symbols-outlined">wb_sunny</span>
                <span>MENTOR SUN</span>
              </button>
            </li>
            <li className="px-4">
              <button className="w-full flex items-center gap-4 px-4 py-3 text-[#E6DFF5]/40 font-label uppercase tracking-[0.1em] text-xs hover:bg-[#2B2838] hover:text-[#E6DFF5] transition-all duration-300 text-left">
                <span className="material-symbols-outlined">lock</span>
                <span>VAULT</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="px-8 mt-auto">
          <button
            onClick={() => navigate('/ai-dashboard')}
            className="w-full py-4 bg-gradient-to-br from-[#FFD700] to-[#FFB77A] text-[#3A3000] font-headline font-bold text-xs tracking-widest rounded-lg shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:scale-105 transition-transform duration-300"
          >
            STRIKE CORE
          </button>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md flex justify-between items-center px-8 h-16 pl-72">
        <h1 className="text-2xl font-bold tracking-tighter text-[#FFD700] font-headline">SOLIS</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-label text-[10px] text-[#E6DFF5]/60 uppercase tracking-widest">Gravity Score</p>
              <p className="font-headline font-bold text-[#FFD700]">9.81 m/s²</p>
            </div>
            <div className="flex gap-2">
              <button className="text-[#E6DFF5]/60 hover:text-[#FFD700] transition-colors p-2">
                <span className="material-symbols-outlined">star_half</span>
              </button>
              <button className="text-[#E6DFF5]/60 hover:text-[#FFD700] transition-colors p-2 relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#FFD700] rounded-full ring-4 ring-black/20" />
              </button>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#FFD700]/30 p-0.5 bg-surface-container-high">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FFD700]/30 to-[#FFB77A]/20" />
          </div>
        </div>
      </header>

      {/* Main Content - Galaxy View */}
      <main className="ml-64 pt-16 min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="relative w-[800px] h-[600px] flex items-center justify-center">
          {/* Orbit Rings */}
          <div className="orbit-ring w-[350px] h-[180px] -rotate-[15deg] opacity-20 border-[#FFD700]" />
          <div className="orbit-ring w-[500px] h-[260px] rotate-[10deg] opacity-15 border-[#FFD700]" />
          <div className="orbit-ring w-[650px] h-[340px] -rotate-[5deg] opacity-10 border-[#FFD700]" />
          <div className="orbit-ring w-[800px] h-[420px] rotate-[20deg] opacity-5 border-[#FFD700]" />

          {/* Orbit Labels (filtered) */}
          {filteredOrbits.map((orbit, index) => {
            const positions = [
              { className: 'absolute top-[80px] left-1/2 -translate-x-1/2' },
              { className: 'absolute right-[40px] top-1/2 -translate-y-1/2' },
              { className: 'absolute left-[40px] top-1/2 -translate-y-1/2' },
              { className: 'absolute bottom-[80px] left-1/2 -translate-x-1/2' },
            ];
            const pos = positions[index] || positions[0];

            return (
              <div key={orbit.id} className={`${pos.className} flex items-center gap-3 cursor-pointer`} onClick={() => navigate(`/orbit/${orbit.id}`)}>
                <div className="px-4 py-1.5 bg-[#141120] border border-[#FFD700]/30 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.1)] hover:shadow-[0_0_25px_rgba(255,215,0,0.2)] transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
                  <span className="font-label text-[10px] tracking-widest text-[#FFD700]">{orbit.label}</span>
                </div>
              </div>
            );
          })}

          {/* Central Sun - AI Mentor */}
          <div
            onClick={() => navigate('/ai-dashboard')}
            className="relative w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#FFF5DE] via-[#FFD700] to-[#FFB77A] solis-core-glow group cursor-pointer flex flex-col items-center justify-center p-8 text-center transition-all duration-500 hover:scale-105 active:scale-95 z-20"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 blur-md group-hover:blur-xl transition-all" />
            <h3 className="font-headline font-extrabold text-[#3A3000] text-xl tracking-tighter leading-tight relative z-10">AI MENTOR</h3>
            <div className="h-px w-8 bg-[#3A3000]/30 my-2 relative z-10" />
            <p className="font-label text-[10px] font-bold text-[#3A3000]/60 tracking-[0.2em] relative z-10">CLICK TO ENTER</p>
            <div className="absolute -inset-4 border border-[#FFD700]/20 rounded-full" />
            <div className="absolute -inset-8 border border-[#FFD700]/10 rounded-full" />
          </div>
        </div>

        {/* System Bulletin */}
        <div className="fixed bottom-12 right-12 w-80 glass-panel rounded-xl border border-outline-variant/15 p-6 z-30 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div>
              <h4 className="font-headline font-bold text-[#FFD700] tracking-widest text-xs uppercase mb-1">SYSTEM BULLETIN</h4>
              <p className="font-label text-[10px] text-[#E6DFF5]/40 tracking-wider">SECURE TRANSMISSION</p>
            </div>
            <span className="material-symbols-outlined text-[#FFD700]/40">broadcast_on_home</span>
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex gap-4">
              <div className="w-1 h-auto bg-gradient-to-b from-[#FFD700] to-transparent rounded-full" />
              <div>
                <p className="text-xs font-bold text-[#E6DFF5] mb-1">Backend Engineering</p>
                <p className="text-[11px] text-[#E6DFF5]/60 leading-relaxed">System architecture update pending. New data nodes detected in Segment 7G.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/orbit/backend')}
              className="w-full py-3 bg-[#2B2838] hover:bg-[#363343] border border-outline-variant/30 rounded-lg flex items-center justify-center gap-2 group transition-all duration-300"
            >
              <span className="font-label text-[10px] font-bold text-[#FFD700] tracking-[0.2em]">INTERCEPT</span>
              <span className="material-symbols-outlined text-sm text-[#FFD700] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-64 right-0 h-24 pointer-events-none bg-gradient-to-t from-[#02010A] to-transparent" />
    </motion.div>
  );
}
