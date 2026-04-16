import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';

const POSTS = [
  {
    category: 'INTERVIEW SIGNALS',
    author: '@arjun_dev',
    time: '3h ago',
    title: 'Google L4 Backend — System Design round breakdown',
    amplify: 124,
    echo: 42,
  },
  {
    category: 'MISSION BRIEFINGS',
    author: '@neha_codes',
    time: '7h ago',
    title: 'Razorpay hiring process — 2024 updated timeline',
    amplify: 89,
    echo: 15,
  },
  {
    category: 'OPEN DISCUSSIONS',
    author: '@rohan_backend',
    time: '1d ago',
    title: 'Is microservices still the right answer for mid-stage startups?',
    amplify: 256,
    echo: 112,
  },
];

export default function RoleForumPage() {
  const { orbitId } = useParams();
  const navigate = useNavigate();

  const orbitDisplay = orbitId === 'backend' ? 'Backend Engineering'
    : orbitId === 'frontend' ? 'Frontend Engineering'
    : orbitId === 'data' ? 'Data Science'
    : orbitId === 'product' ? 'Product Management'
    : orbitId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-on-surface min-h-screen"
      style={{
        backgroundColor: '#02010A',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.03) 0%, transparent 80%)',
      }}
    >
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 right-0 left-0 h-16 z-50 bg-[#02010A]/85 backdrop-blur-md flex items-center justify-between px-8">
        <div className="flex items-center gap-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary-container rounded flex items-center justify-center">
              <div className="w-4 h-4 border border-primary-container rotate-45" />
            </div>
            <button onClick={() => navigate('/')} className="text-xl font-bold tracking-tighter text-primary-container font-headline">CELESTIAL_VOID</button>
          </div>
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-[10px] font-headline uppercase tracking-widest opacity-40">
            <span className="cursor-pointer hover:opacity-100 transition-opacity" onClick={() => navigate('/')}>HOME</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="cursor-pointer hover:opacity-100 transition-opacity" onClick={() => navigate(`/orbit/${orbitId}`)}>{orbitDisplay.toUpperCase()}</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary-container opacity-100">FORUM</span>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="hidden lg:flex items-center gap-8 text-xs font-headline uppercase tracking-widest font-medium">
            <button onClick={() => navigate('/')} className="text-primary-container border-b border-primary-container pb-1">HOME</button>
            <button onClick={() => navigate('/')} className="opacity-70 hover:opacity-100 transition-opacity">GALAXY</button>
            <button onClick={() => navigate('/ai-dashboard')} className="opacity-70 hover:opacity-100 transition-opacity">MENTOR</button>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined opacity-70 hover:text-primary-container transition-colors">notifications</button>
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                <div className="w-full h-full bg-gradient-to-br from-[#FFD700]/40 to-[#FFB77A]/20" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#02010A] rounded-full" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-screen pt-16">
        {/* Sidebar Navigation */}
        <aside className="w-64 fixed left-0 top-16 bottom-0 glass-panel z-40 flex flex-col py-8 px-6">
          {/* Context Block */}
          <div className="mb-10">
            <p className="text-[10px] font-headline uppercase tracking-[0.2em] opacity-40 mb-1">CURRENT ORBIT</p>
            <h2 className="text-xl font-headline font-bold text-primary-container leading-tight mb-1">{orbitDisplay}</h2>
            <p className="text-[10px] font-headline uppercase tracking-[0.2em] opacity-40">ROLE FORUM</p>
          </div>

          {/* Navigation Links */}
          <div className="flex-grow">
            <p className="text-[10px] font-headline uppercase tracking-[0.2em] opacity-30 mb-6">FREQUENCY BANDS</p>
            <nav className="space-y-2">
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg solar-gradient text-on-primary font-bold transition-transform active:scale-[0.98]" href="#">
                <span className="material-symbols-outlined text-lg">radar</span>
                <span className="text-[11px] font-headline uppercase tracking-widest">ALL TRANSMISSIONS</span>
              </a>
              {[
                { icon: 'sensors', label: 'INTERVIEW SIGNALS' },
                { icon: 'rocket_launch', label: 'MISSION BRIEFINGS' },
                { icon: 'monitoring', label: 'OPEN DISCUSSIONS' },
                { icon: 'warning', label: 'DISTRESS BEACONS' },
              ].map(item => (
                <a key={item.icon} className="flex items-center gap-3 px-4 py-3 rounded-lg opacity-60 hover:opacity-100 hover:bg-surface-container-high transition-all text-on-surface cursor-pointer" href="#">
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span className="text-[11px] font-headline uppercase tracking-widest">{item.label}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Sidebar Bottom CTA */}
          <button
            onClick={() => navigate('/ai-dashboard')}
            className="mt-auto glass-panel ghost-border rounded-lg py-4 px-4 flex items-center justify-between group hover:border-primary-container/50 transition-colors"
          >
            <span className="text-[11px] font-headline font-bold uppercase tracking-widest">GO TO AI MENTOR</span>
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </aside>

        {/* Main Feed Area */}
        <main className="ml-64 flex-grow overflow-y-auto scroll-smooth">
          <div className="max-w-4xl mx-auto py-12 px-8">
            {/* Feed Header */}
            <header className="flex items-end justify-between mb-12">
              <div>
                <h1 className="text-4xl font-headline font-bold tracking-tight mb-2">SIGNAL FEED</h1>
                <p className="text-on-surface-variant/60 font-body text-sm">Monitoring real-time telemetry from the {orbitId} engineering void.</p>
              </div>
              <button className="solar-gradient text-on-primary px-6 py-3 rounded-lg font-headline font-bold text-xs uppercase tracking-widest flex items-center gap-2 glow-hover shadow-lg">
                <span className="material-symbols-outlined text-lg">broadcast_on_home</span>
                TRANSMIT SIGNAL
              </button>
            </header>

            {/* Filter Pills */}
            <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2">
              <button className="px-5 py-2 rounded-full solar-gradient text-on-primary font-headline text-[10px] font-bold uppercase tracking-widest">TRENDING</button>
              <button className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface/60 hover:text-on-surface font-headline text-[10px] font-bold uppercase tracking-widest transition-colors">NEWEST</button>
              <button className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface/60 hover:text-on-surface font-headline text-[10px] font-bold uppercase tracking-widest transition-colors">MOST AMPLIFIED</button>
              <button className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface/60 hover:text-on-surface font-headline text-[10px] font-bold uppercase tracking-widest transition-colors">UNANSWERED</button>
            </div>

            {/* Posts Stack */}
            <div className="space-y-6">
              {POSTS.map((post, idx) => (
                <article key={idx} className="bg-surface-container-low ghost-border rounded-xl p-8 hover:bg-surface-container-high transition-colors group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-headline font-bold text-primary-container tracking-[0.15em]">{post.category}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      <span className="text-xs text-on-surface-variant opacity-60">{post.author}</span>
                      <span className="text-xs text-on-surface-variant opacity-40">{post.time}</span>
                    </div>
                    <button className="material-symbols-outlined opacity-30 hover:opacity-100 transition-opacity">more_horiz</button>
                  </div>
                  <h3 className="text-2xl font-headline font-semibold mb-6 group-hover:text-primary-container transition-colors">{post.title}</h3>
                  <div className="flex items-center gap-8 pt-6 border-t border-outline-variant/10">
                    <button className="flex items-center gap-2 text-xs font-headline uppercase tracking-widest font-bold opacity-60 hover:opacity-100 hover:text-primary-container transition-all">
                      <span className="material-symbols-outlined text-lg">bolt</span> AMPLIFY <span className="opacity-40">{post.amplify}</span>
                    </button>
                    <button className="flex items-center gap-2 text-xs font-headline uppercase tracking-widest font-bold opacity-60 hover:opacity-100 hover:text-primary-container transition-all">
                      <span className="material-symbols-outlined text-lg">forum</span> ECHO <span className="opacity-40">{post.echo}</span>
                    </button>
                    <button className="flex items-center gap-2 text-xs font-headline uppercase tracking-widest font-bold opacity-60 hover:opacity-100 hover:text-primary-container transition-all">
                      <span className="material-symbols-outlined text-lg">share</span> RELAY
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Footer Stats */}
            <footer className="mt-20 pt-10 border-t border-outline-variant/10 flex items-center justify-between text-[10px] font-headline uppercase tracking-widest opacity-30">
              <div className="flex items-center gap-4">
                <span>SYSTEM STATUS: NOMINAL</span>
                <span>RECEPTION: 98%</span>
              </div>
              <span>TERMINAL V4.2.0</span>
            </footer>
          </div>
        </main>

        {/* Right Side - Contextual Data */}
        <aside className="hidden xl:flex w-80 fixed right-0 top-16 bottom-0 p-8 flex-col gap-8">
          <div className="bg-surface-container-low/40 rounded-xl p-6 ghost-border">
            <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary-container mb-6">VOID STATS</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs opacity-60">ACTIVE OBSERVERS</span>
                <span className="text-xl font-headline font-bold">1.2K</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div className="solar-gradient h-full w-2/3" />
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs opacity-60">SIGNALS BROADCAST</span>
                <span className="text-xl font-headline font-bold">48.9K</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div className="solar-gradient h-full w-5/6" />
              </div>
            </div>
          </div>
          <div className="rounded-xl p-6 ghost-border relative overflow-hidden group bg-surface-container-low/20">
            <div className="relative z-10">
              <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary-container mb-2">PRO-TIP</h4>
              <p className="text-sm opacity-80 leading-relaxed font-body">Use 'AMPLIFY' to push high-quality technical signals to the top of the global orbit.</p>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
