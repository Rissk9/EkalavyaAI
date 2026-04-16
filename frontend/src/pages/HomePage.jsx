// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_ORBITS = [
  { w: 540, h: 300, seconds: 60, delay: 0 },
  { w: 300, h: 540, seconds: 80, delay: -30 },
  { w: 780, h: 420, seconds: 100, delay: -70 },
  { w: 420, h: 780, seconds: 120, delay: -110 },
  { w: 660, h: 540, seconds: 90, delay: -50 },
  { w: 540, h: 660, seconds: 110, delay: -90 },
  { w: 900, h: 300, seconds: 130, delay: -20 },
  { w: 300, h: 900, seconds: 140, delay: -80 },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [orbits, setOrbits] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const apiBase = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBase}/roles`);
        const data = await response.json();
        
        if (data.roles) {
          const dynamicOrbits = data.roles.map((roleObj, index) => {
            const base = BASE_ORBITS[index % BASE_ORBITS.length];
            // Provide a random-like mix to visual values to ensure they do not clump tightly
            // if you have many roles fetched from the db.
            const mixW = base.w + (index * 15 % 80);
            const mixH = base.h + (index * 20 % 90);
            
            return {
               id: roleObj.id,
               role: roleObj.name,
               label: roleObj.name.toUpperCase(),
               w: mixW,
               h: mixH,
               seconds: base.seconds + (index % 5) * 5,
               delay: base.delay - (index % 10) * 2
            };
          });
          setOrbits(dynamicOrbits);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    
    fetchRoles();
  }, []);

  const filteredOrbits = orbits.filter(o =>
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

      {/* Left search panel */}
      <aside className="fixed left-0 top-20 bottom-0 w-64 flex flex-col py-8 z-40 bg-[#141120] shadow-[4px_0_24px_rgba(255,215,0,0.04)]">
        <div className="px-6">
          <div className="mb-3">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#E6DFF5]/40">
              Search Orbits
            </p>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orbits..."
            className="w-full bg-[#0f0c1b] border border-outline-variant/30 rounded-lg py-2 px-4 text-sm text-on-surface focus:outline-none focus:border-primary-container transition-colors placeholder:text-[#E6DFF5]/30 font-body"
          />
        </div>
      </aside>

      {/* Main Content - Galaxy View */}
      <main className="ml-64 pt-20 min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="relative w-[1200px] h-[800px] flex items-center justify-center">
          {/* Orbit Elements */}
          {filteredOrbits.map((orbit) => (
            <div 
              key={orbit.id}
              className="absolute w-0 h-0 flex items-center justify-center pointer-events-none z-30"
              style={{ 
                animation: `custom-spin ${orbit.seconds}s linear infinite`,
                animationDelay: `${orbit.delay}s` 
              }}
            >
              {/* Elliptical Ring */}
              <div 
                className="absolute orbit-ring border-[#FFD700] opacity-20 -translate-x-1/2 -translate-y-1/2"
                style={{ width: `${orbit.w}px`, height: `${orbit.h}px`, top: '0', left: '0' }}
              />

              {/* Label container floating on the rightmost edge */}
              <div 
                className="absolute pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${orbit.w / 2}px`, top: '0' }}
                onClick={() => navigate(`/orbit/${orbit.id}`)}
              >
                {/* Counter-spin so text stays horizontal */}
                <div style={{ 
                  animation: `custom-spin ${orbit.seconds}s linear infinite reverse`,
                  animationDelay: `${orbit.delay}s` 
                }}>
                  <div className="px-5 py-2.5 bg-[#141120] border border-[#FFD700]/30 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.1)] hover:shadow-[0_0_25px_rgba(255,215,0,0.2)] transition-all">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] animate-pulse" />
                    <span className="font-label text-xs tracking-widest text-[#FFD700] whitespace-nowrap">{orbit.label}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Central Sun - AI Mentor (Enlarged) */}
          <div
            onClick={() => navigate('/ai-dashboard')}
            className="relative w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#FFF5DE] via-[#FFD700] to-[#FFB77A] solis-core-glow group cursor-pointer flex flex-col items-center justify-center p-6 text-center transition-all duration-500 hover:scale-105 active:scale-95 z-20 pointer-events-auto"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 blur-md group-hover:blur-xl transition-all" />
            <h3 className="font-headline font-extrabold text-[#3A3000] text-2xl tracking-tighter leading-tight relative z-10">AI MENTOR</h3>
            <div className="h-px w-8 bg-[#3A3000]/30 my-2 relative z-10" />
            <p className="font-label text-[10px] font-bold text-[#3A3000]/60 tracking-[0.15em] relative z-10">CLICK TO ENTER</p>
            <div className="absolute -inset-3 border border-[#FFD700]/20 rounded-full" />
            <div className="absolute -inset-6 border border-[#FFD700]/10 rounded-full" />
          </div>
        </div>


      </main>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-64 right-0 h-24 pointer-events-none bg-gradient-to-t from-[#02010A] to-transparent" />
    </motion.div>
  );
}
