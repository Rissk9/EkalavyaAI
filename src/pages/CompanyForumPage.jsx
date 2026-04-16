import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';

const POSTS = [
  {
    category: 'Interview Signals',
    author: '@vikram_m',
    title: 'SDE-2 Backend — Behavioural round questions',
    amplify: 201,
    echo: 34,
    time: '2h ago',
    views: '1.2k views',
  },
  {
    category: 'Internal Transmissions',
    author: '@priya_msft',
    title: 'Backend team culture',
    amplify: 315,
    echo: 58,
    time: '5h ago',
    views: '2.4k views',
  },
  {
    category: 'Offer & Joins',
    author: '@ankit_got_in',
    title: 'Got the SDE-2 offer — prep timeline',
    amplify: 489,
    echo: 92,
    time: '8h ago',
    views: '4.1k views',
    highlighted: true,
  },
];

export default function CompanyForumPage() {
  const { orbitId, companyId } = useParams();
  const navigate = useNavigate();

  const companyName = companyId.charAt(0).toUpperCase() + companyId.slice(1);
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
      className="bg-[#02010A] min-h-screen"
    >
      {/* Particle Field */}
      <div className="particle-field" />

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full h-20 px-8 flex items-center justify-between z-[100] bg-[#02010a]/85 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <div className="w-[120px] h-8 border border-[#FFD700] rounded flex items-center justify-center">
            <button onClick={() => navigate('/')} className="font-headline font-bold text-[#FFD700] tracking-tighter text-sm">EKALAVYA</button>
          </div>
          <nav className="hidden md:flex items-center gap-2 font-headline text-[10px] uppercase tracking-[0.2em]">
            <span className="text-[#E6DFF5]/40 hover:text-[#FFD700] transition-colors cursor-pointer" onClick={() => navigate('/')}>HOME</span>
            <span className="text-[#E6DFF5]/20 font-light">›</span>
            <span className="text-[#E6DFF5]/40 hover:text-[#FFD700] transition-colors cursor-pointer" onClick={() => navigate(`/orbit/${orbitId}`)}>{orbitDisplay.toUpperCase()}</span>
            <span className="text-[#E6DFF5]/20 font-light">›</span>
            <span className="text-[#FFD700]">{companyName.toUpperCase()} RING</span>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-[#E6DFF5]/60">
            <span className="material-symbols-outlined hover:text-[#FFD700] transition-all cursor-pointer">notifications</span>
            <span className="material-symbols-outlined hover:text-[#FFD700] transition-all cursor-pointer">settings</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#FFD700]/30 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[#FFD700]/40 to-[#FFB77A]/20" />
          </div>
        </div>
      </header>

      {/* Side Navigation Bar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] pt-28 pb-8 px-6 flex flex-col z-50 bg-[#02010a]/90 backdrop-blur-md">
        <div className="mb-10 px-2">
          <p className="font-headline text-[10px] tracking-[0.2em] text-[#E6DFF5]/40 uppercase mb-1">{orbitDisplay}</p>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FFD700] text-xl">hub</span>
            <h2 className="font-headline font-bold text-lg text-[#FFD700] tracking-tight">{companyName} Ring</h2>
          </div>
        </div>

        <nav className="flex-grow space-y-1">
          <p className="px-2 font-headline text-[9px] tracking-[0.2em] text-[#E6DFF5]/20 uppercase mb-4">Frequency Bands</p>
          <a className="flex items-center gap-3 px-4 py-3 bg-[#363343] text-[#FFD700] rounded-lg group transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">settings_input_antenna</span>
            <span className="font-headline text-[11px] tracking-widest uppercase font-medium">All Transmissions</span>
          </a>
          {[
            { icon: 'sensors', label: 'Interview Signals' },
            { icon: 'hub', label: 'Internal Transmissions' },
            { icon: 'auto_awesome', label: 'Offer & Joins' },
            { icon: 'emergency', label: 'Distress Beacons' },
          ].map(item => (
            <a key={item.icon} className="flex items-center gap-3 px-4 py-3 text-[#E6DFF5]/40 hover:bg-[#141120] hover:text-[#E6DFF5] rounded-lg transition-all cursor-pointer" href="#">
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-headline text-[11px] tracking-widest uppercase">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => navigate('/ai-dashboard')}
            className="w-full py-4 px-4 glass-void border border-[#FFD700]/20 text-[#FFD700] rounded-lg font-headline text-[10px] tracking-widest uppercase flex items-center justify-between hover:bg-[#FFD700] hover:text-[#0a081c] transition-all group"
          >
            GO TO AI MENTOR
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-[260px] pt-32 px-12 pb-20 max-w-6xl">
        {/* Feed Header */}
        <header className="mb-12 flex items-end justify-between">
          <div className="space-y-1">
            <p className="font-headline text-[10px] tracking-[0.3em] text-[#FFD700] uppercase font-bold">{companyName.toUpperCase()} RING</p>
            <h1 className="font-headline text-5xl font-black text-[#E6DFF5] tracking-tighter">{orbitDisplay}</h1>
          </div>
          <button className="solar-gradient text-[#3a3000] px-8 py-3 rounded-lg font-headline font-bold text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(255,215,0,0.1)] hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            Transmit Signal
          </button>
        </header>

        {/* Filters/Sort */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4">
          <button className="px-6 py-2 bg-[#363343] text-[#FFD700] rounded-full text-[10px] font-headline tracking-widest font-bold border border-[#FFD700]/10">TRENDING</button>
          <button className="px-6 py-2 bg-transparent text-[#E6DFF5]/40 hover:text-[#E6DFF5] rounded-full text-[10px] font-headline tracking-widest hover:bg-[#141120] transition-all">NEWEST</button>
          <button className="px-6 py-2 bg-transparent text-[#E6DFF5]/40 hover:text-[#E6DFF5] rounded-full text-[10px] font-headline tracking-widest hover:bg-[#141120] transition-all">MOST AMPLIFIED</button>
          <button className="px-6 py-2 bg-transparent text-[#E6DFF5]/40 hover:text-[#E6DFF5] rounded-full text-[10px] font-headline tracking-widest hover:bg-[#141120] transition-all">UNANSWERED</button>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 gap-6">
          {POSTS.map((post, idx) => (
            <article key={idx} className="bg-[#1C1A29] p-8 rounded-2xl hover:bg-[#2B2838] transition-all group relative overflow-hidden cursor-pointer">
              {(idx === 0 || idx === 2) && (
                <div className={`absolute ${idx === 0 ? 'top-0 right-0 translate-x-16 -translate-y-16' : 'bottom-0 right-0 translate-x-24 translate-y-24'} w-32 h-32 bg-[#FFD700]/5 blur-3xl rounded-full`} />
              )}
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-2 pt-1">
                  <button className={`flex flex-col items-center ${post.highlighted ? 'text-[#FFD700]' : 'text-[#E6DFF5]/40 hover:text-[#FFD700]'} transition-colors`}>
                    <span className="material-symbols-outlined" style={post.highlighted ? { fontVariationSettings: "'wght' 600" } : {}}>expand_less</span>
                    <span className="font-headline font-bold text-xs">{post.amplify}</span>
                  </button>
                  <span className="text-[9px] font-headline tracking-widest text-[#E6DFF5]/20 uppercase">Amplify</span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-3 py-1 bg-[#4D4732]/20 border border-[#4D4732]/40 rounded-md">
                      <span className="font-headline text-[9px] text-[#FFD700] tracking-widest uppercase">{post.category}</span>
                    </div>
                    <span className="text-[#E6DFF5]/20 text-xs">•</span>
                    <span className="text-[#E6DFF5]/40 text-xs font-medium">{post.author}</span>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-[#E6DFF5] group-hover:text-white transition-colors mb-4 leading-tight">
                    {companyName} {post.title}
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[#E6DFF5]/40 text-xs">
                      <span className="material-symbols-outlined text-sm">chat_bubble</span>
                      {post.echo} Echo
                    </div>
                    <div className="flex items-center gap-2 text-[#E6DFF5]/40 text-xs">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {post.time}
                    </div>
                    <div className="flex items-center gap-2 text-[#E6DFF5]/40 text-xs">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      {post.views}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Floating UI Decoration */}
      <div className="fixed bottom-12 right-12 flex flex-col gap-4 z-50">
        <button className="w-14 h-14 bg-[#1C1A29] rounded-full flex items-center justify-center border border-[#4D4732]/30 shadow-2xl text-[#FFD700] hover:scale-110 transition-transform">
          <span className="material-symbols-outlined">bolt</span>
        </button>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-[#FFD700]/[0.02] rounded-full blur-[160px] -z-10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-primary-container/[0.02] rounded-full blur-[140px] -z-10 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
    </motion.div>
  );
}
