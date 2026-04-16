import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';

const COMPANIES = [
  { name: 'Microsoft', icon: 'potted_plant' },
  { name: 'Google', icon: 'adjust' },
  { name: 'Razorpay', icon: 'payments' },
  { name: 'Flipkart', icon: 'shopping_bag' },
  { name: 'Amazon', icon: 'rocket_launch' },
];

export default function OrbitPage() {
  const { orbitId } = useParams();
  const navigate = useNavigate();

  const orbitName = orbitId.charAt(0).toUpperCase() + orbitId.slice(1);
  const orbitDisplay = orbitId === 'backend' ? 'Backend Engineering'
    : orbitId === 'frontend' ? 'Frontend Engineering'
    : orbitId === 'data' ? 'Data Science'
    : orbitId === 'product' ? 'Product Management'
    : orbitName;

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
      {/* Top Nav Bar */}
      <nav className="fixed top-0 w-full z-50 h-[80px] flex justify-between items-center px-8 bg-[#02010A]/85 backdrop-blur-xl shadow-[0_0_20px_rgba(255,215,0,0.04)]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 solar-gradient rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#3a3000] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>deployed_code</span>
            </div>
            <button onClick={() => navigate('/')} className="text-2xl font-bold tracking-tighter text-[#FFD700] font-headline">EKALAVYA</button>
          </div>
          <div className="hidden md:flex items-center gap-2 font-label text-[10px] tracking-[0.2em] text-[#E6DFF5]/40 uppercase">
            <span className="cursor-pointer hover:text-[#FFD700] transition-colors" onClick={() => navigate('/')}>HOME</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-[#FFD700]">{orbitDisplay.toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button className="text-[#E6DFF5]/60 hover:text-[#FFD700] transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-[#E6DFF5]/60 hover:text-[#FFD700] transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div className="w-10 h-10 rounded-lg ghost-border bg-surface-container-high overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[#FFD700]/30 to-[#FFB77A]/20" />
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-20 text-center md:text-left">
          <span className="font-label text-xs tracking-[0.3em] text-[#FFD700] uppercase block mb-4">ORBIT</span>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-on-surface mb-6">{orbitDisplay}</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">Select a company ring to explore their community, architecture patterns, and engineering culture within the celestial ecosystem.</p>
        </header>

        {/* Company Rings Section */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-label text-xs tracking-[0.3em] text-[#E6DFF5]/60 uppercase">COMPANY RINGS</h2>
            <div className="h-px flex-grow mx-8 bg-outline-variant/20" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {COMPANIES.map(company => (
              <div
                key={company.name}
                onClick={() => navigate(`/community/${orbitId}/${company.name.toLowerCase()}`)}
                className="group h-[180px] w-full bg-[#1C1A29] rounded-lg p-6 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] hover:bg-[#2B2838] cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-[#FFD700]" style={{ fontVariationSettings: "'FILL' 1" }}>{company.icon}</span>
                  <span className="material-symbols-outlined text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity">arrow_outward</span>
                </div>
                <div>
                  <p className="font-headline text-lg font-bold text-on-surface">{company.name}</p>
                  <p className="font-label text-[10px] tracking-widest text-[#E6DFF5]/40 uppercase">RING</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Modules Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Forum Card */}
          <div
            onClick={() => navigate(`/forum/${orbitId}`)}
            className="relative overflow-hidden group rounded-xl bg-surface-container-low p-10 flex flex-col justify-between min-h-[360px] ghost-border transition-all duration-500 hover:bg-surface-container cursor-pointer"
          >
            <div className="absolute -right-16 -top-16 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
              <span className="material-symbols-outlined text-[240px]" style={{ fontVariationSettings: "'opsz' 48" }}>auto_awesome_mosaic</span>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-[#FFD700]">all_inclusive</span>
              </div>
              <h3 className="font-headline text-3xl font-bold mb-4">{orbitDisplay} Forum</h3>
              <p className="text-on-surface-variant leading-relaxed max-w-sm">Join the constellation of architects. Share patterns, debug complex microservices, and evolve the collective knowledge.</p>
            </div>
            <div className="relative z-10 mt-12">
              <button className="solar-gradient text-[#3a3000] font-headline font-bold py-4 px-8 rounded-lg tracking-tight hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all active:scale-95">
                OPEN FORUM
              </button>
            </div>
          </div>

          {/* AI Mentor Card */}
          <div
            onClick={() => navigate('/ai-dashboard')}
            className="relative overflow-hidden group rounded-xl bg-surface-container-low p-10 flex flex-col justify-between min-h-[360px] ghost-border transition-all duration-500 hover:bg-surface-container cursor-pointer"
          >
            <div className="absolute -right-16 -top-16 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
              <span className="material-symbols-outlined text-[240px]" style={{ fontVariationSettings: "'opsz' 48" }}>wb_sunny</span>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-[#FFD700]">psychology</span>
              </div>
              <h3 className="font-headline text-3xl font-bold mb-4">AI Mentor — {orbitName} Mode</h3>
              <p className="text-on-surface-variant leading-relaxed max-w-sm">Accelerate your trajectory with our synthetic intelligence. Real-time code reviews, system design audits, and growth mapping.</p>
            </div>
            <div className="relative z-10 mt-12">
              <button className="glass-panel ghost-border text-[#FFD700] font-headline font-bold py-4 px-8 rounded-lg tracking-tight hover:bg-surface-container-highest transition-all active:scale-95">
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

      {/* Side Navigation (Desktop) */}
      <aside className="hidden xl:flex flex-col py-6 px-4 gap-8 h-screen w-20 fixed left-0 top-0 bg-[#02010A] border-r border-outline-variant/5 z-40">
        <div className="flex flex-col items-center gap-12 mt-20">
          <div className="flex flex-col items-center gap-6">
            <button onClick={() => navigate('/')} className="w-10 h-10 rounded-lg bg-surface-container-highest text-[#FFD700] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
            </button>
            <button className="w-10 h-10 rounded-lg text-[#E6DFF5]/40 hover:bg-[#2B2838] hover:text-[#E6DFF5] flex items-center justify-center transition-all">
              <span className="material-symbols-outlined">adjust</span>
            </button>
            <button onClick={() => navigate(`/forum/${orbitId}`)} className="w-10 h-10 rounded-lg text-[#E6DFF5]/40 hover:bg-[#2B2838] hover:text-[#E6DFF5] flex items-center justify-center transition-all">
              <span className="material-symbols-outlined">forum</span>
            </button>
            <button onClick={() => navigate('/ai-dashboard')} className="w-10 h-10 rounded-lg text-[#E6DFF5]/40 hover:bg-[#2B2838] hover:text-[#E6DFF5] flex items-center justify-center transition-all">
              <span className="material-symbols-outlined">psychology</span>
            </button>
          </div>
        </div>
      </aside>
    </motion.div>
  );
}
