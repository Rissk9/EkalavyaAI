// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const FALLBACK_ICONS = ['domain', 'business', 'corporate_fare', 'apartment', 'location_city', 'work', 'rocket_launch', 'lightbulb'];

export default function OrbitPage() {
  const { orbitId } = useParams();
  const navigate = useNavigate();
  const [roleData, setRoleData] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchOrbitData = async () => {
      try {
        const apiBase = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBase}/orbit-data/${orbitId}`);
        const data = await response.json();
        
        if (data.role) {
          setRoleData(data.role);
        }
        
        if (data.companies) {
          const mappedCompanies = data.companies.map((company, i) => {
             const nameLower = company.name.toLowerCase();
             let icon = FALLBACK_ICONS[i % FALLBACK_ICONS.length];
             if (nameLower.includes('google')) icon = 'adjust';
             if (nameLower.includes('microsoft')) icon = 'potted_plant';
             if (nameLower.includes('razorpay')) icon = 'payments';
             if (nameLower.includes('amazon')) icon = 'rocket_launch';
             if (nameLower.includes('flipkart') || nameLower.includes('myntra')) icon = 'shopping_bag';
             return { name: company.name, icon };
          });
          setCompanies(mappedCompanies);
        }
      } catch (error) {
        console.error('Error fetching orbit data:', error);
      }
    };
    
    fetchOrbitData();
  }, [orbitId]);

  const orbitName = orbitId.charAt(0).toUpperCase() + orbitId.slice(1);
  const orbitDisplay = roleData?.name ? roleData.name : orbitName;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="font-body text-on-surface min-h-screen"
      style={{
        backgroundColor: '#02010A',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }}
    >
      {/* Page content */}
      <main className="pt-10 pb-16 px-8 max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 font-label text-[10px] tracking-[0.2em] text-[#E6DFF5]/40 uppercase mb-8">
          <span className="cursor-pointer hover:text-[#FFD700] transition-colors" onClick={() => navigate('/')}>HOME</span>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-[#FFD700]">{orbitDisplay.toUpperCase()}</span>
        </div>
        {/* Header Section */}
        <header className="mb-12 text-center md:text-left">
          <span className="font-label text-xs tracking-[0.3em] text-[#FFD700] uppercase block mb-4">ORBIT</span>
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-on-surface mb-4">{orbitDisplay}</h1>
          <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">Select a company ring to explore their community, architecture patterns, and engineering culture within the celestial ecosystem.</p>
        </header>

        {/* Company Rings Section */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-label text-xs tracking-[0.3em] text-[#E6DFF5]/60 uppercase">COMPANY RINGS</h2>
            <div className="h-px flex-grow mx-8 bg-outline-variant/20" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {companies.map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                onClick={() => navigate(`/community/${orbitId}/${company.name.toLowerCase()}`)}
                className="group h-[118px] w-full bg-[#1C1A29] rounded-lg p-3 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-2px] hover:bg-[#2B2838] cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-[#FFD700] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {company.icon}
                  </span>
                  <span className="material-symbols-outlined text-[#FFD700] text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">
                    arrow_outward
                  </span>
                </div>
                <div>
                  <p className="font-headline text-sm font-bold text-on-surface">{company.name}</p>
                  <p className="font-label text-[10px] tracking-widest text-[#E6DFF5]/40 uppercase">RING</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Modules Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Forum Card */}
          <div
            onClick={() => navigate(`/forum/${orbitId}`)}
            className="relative overflow-hidden group rounded-xl bg-surface-container-low p-7 flex flex-col justify-between min-h-[280px] max-w-[520px] w-full ghost-border transition-all duration-500 hover:bg-surface-container cursor-pointer"
          >
            <div className="absolute -right-16 -top-16 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
              <span className="material-symbols-outlined text-[240px]" style={{ fontVariationSettings: "'opsz' 48" }}>auto_awesome_mosaic</span>
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#FFD700] text-[20px]">all_inclusive</span>
              </div>
              <h3 className="font-headline text-2xl font-bold mb-3">{orbitDisplay} Forum</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm">Join the constellation of architects. Share patterns, debug complex microservices, and evolve the collective knowledge.</p>
            </div>
            <div className="relative z-10 mt-8 flex justify-start">
              <button className="solar-gradient text-[#3a3000] font-headline font-bold py-3 px-6 rounded-lg tracking-tight hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all active:scale-95">
                OPEN FORUM
              </button>
            </div>
          </div>

          {/* AI Mentor Card */}
          <div
            onClick={() => navigate('/ai-dashboard')}
            className="relative overflow-hidden group rounded-xl bg-surface-container-low p-7 flex flex-col justify-between min-h-[280px] max-w-[520px] w-full ghost-border transition-all duration-500 hover:bg-surface-container cursor-pointer"
          >
            <div className="absolute -right-16 -top-16 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
              <span className="material-symbols-outlined text-[240px]" style={{ fontVariationSettings: "'opsz' 48" }}>wb_sunny</span>
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#FFD700] text-[20px]">psychology</span>
              </div>
              <h3 className="font-headline text-2xl font-bold mb-3">AI Mentor - {orbitDisplay} Mode</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm">Accelerate your trajectory with our synthetic intelligence. Real-time code reviews, system design audits, and growth mapping.</p>
            </div>
            <div className="relative z-10 mt-8 flex justify-start">
              <button className="glass-panel ghost-border text-[#FFD700] font-headline font-bold py-3 px-6 rounded-lg tracking-tight hover:bg-surface-container-highest transition-all active:scale-95">
                OPEN AI DASHBOARD
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-[#02010A] mt-auto border-t border-outline-variant/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center gap-8">
          <div className="flex items-center gap-8 font-label text-[10px] tracking-[0.2em] text-[#E6DFF5]/30 uppercase">
            <a className="hover:text-[#FFD700] transition-colors" href="#">Protocol</a>
            <a className="hover:text-[#FFD700] transition-colors" href="#">Void Status</a>
            <a className="hover:text-[#FFD700] transition-colors" href="#">Directives</a>
          </div>
          <div className="text-[#FFD700] font-headline font-bold text-sm tracking-tighter">ORBIT {orbitDisplay.toUpperCase()}</div>
          <p className="font-label text-[9px] tracking-[0.3em] text-[#E6DFF5]/20 uppercase">© 2024 ORBIT SYSTEMS. ALL RADIANCE RESERVED.</p>
        </div>
      </footer>

    </motion.div>
  );
}
