// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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

const getCommentsForPost = (post, idx) => {
  // Placeholder comments until backend wiring exists.
  return Array.from({ length: 16 }).map((_, i) => ({
    id: `${idx}-${i}`,
    author: `@member_${idx + 1}_${i + 1}`,
    time: `${Math.max(1, 16 - i)}m ago`,
    text:
      i % 3 === 0
        ? `Interesting take on "${post.title}". What trade-offs did you consider?`
        : i % 3 === 1
          ? `I agree. Could you share a concrete example for this use-case?`
          : `How would you measure success and prevent regressions in production?`,
  }));
};

export default function CompanyForumPage() {
  const { orbitId, companyId } = useParams();
  const navigate = useNavigate();
  const [openCommentsIdx, setOpenCommentsIdx] = useState(null);
  const [roleData, setRoleData] = useState(null);

  useEffect(() => {
    const fetchOrbitData = async () => {
      try {
        const apiBase = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBase}/orbit-data/${orbitId}`);
        const data = await response.json();
        
        if (data.role) {
          setRoleData(data.role);
        }
      } catch (error) {
        console.error('Error fetching orbit data:', error);
      }
    };
    
    fetchOrbitData();
  }, [orbitId]);

  const companyName = companyId.charAt(0).toUpperCase() + companyId.slice(1);
  const orbitName = orbitId ? orbitId.charAt(0).toUpperCase() + orbitId.slice(1) : 'Orbit';
  const orbitDisplay = roleData?.name ? roleData.name : orbitName;

  const handleGoToAiMentor = () => {
    const promptText = `You are an expert career mentor and hiring strategist.

Give a detailed, practical, and structured analysis for a candidate preparing for the role of ${orbitDisplay} at ${companyName}.

Your response must be highly actionable, realistic, and tailored to current industry expectations.

Candidate Context:
- Resume Summary: {Evaluate based on loaded resume data}
- GitHub Profile: {Evaluate based on mapped Github context}
- LeetCode Profile: {Evaluate based on mapped LeetCode context}

Your task is NOT just to explain the role, but to evaluate the candidate against real hiring expectations and provide a clear reality check.

Cover the following sections:

1. Role Expectations
- What skills and knowledge are expected for this role at ${companyName}?
- What differentiates this role from similar roles in other companies?

2. Required Skills Breakdown
- Core technical skills (e.g., DSA, system design, ML, etc.)
- Tools, languages, and frameworks commonly expected
- Level of depth expected (beginner / intermediate / advanced)

3. Candidate vs Role Gap Analysis (VERY IMPORTANT)
- Based on the candidate context, where does the candidate currently stand?
- What are their strengths?
- What are the critical gaps?
- Are they underprepared, moderately prepared, or close to ready?

4. Interview Process Insights
- Typical interview rounds (OA, DSA, system design, behavioral, etc.)
- What each round tests
- Common mistakes candidates make

5. Preparation Strategy (PERSONALIZED)
- Step-by-step plan based on the candidate's current level
- What to prioritize first
- What to ignore for now
- Realistic timeline to reach interview-ready level

6. Resume & Profile Feedback
- What is missing in the candidate's profile?
- How to improve resume specifically for ${companyName}
- What projects or signals would significantly improve chances

7. Realistic Difficulty Level
- How competitive this role is
- Approximate level of candidates typically selected
- Honest assessment of how far the candidate is from that level

8. Final Verdict
- A clear statement:
  - "Not ready"
  - "Partially ready"
  - "Interview ready"
- One-line reasoning for the verdict

Important:
- Be brutally honest but constructive
- Do NOT give generic advice
- Base evaluation on real hiring standards
- Avoid vague statements like "practice more"
- Focus on actionable improvements`;

    navigate('/ai-dashboard', { state: { initialPrompt: promptText, maskPrompt: true } });
  };

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

        {/* Frequency Bands removed (keeps only context + CTA). */}
        <div className="flex-grow" />

        <div className="mt-auto">
          <button
            onClick={handleGoToAiMentor}
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
          
        </header>

        {/* Filters/Sort */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4">
          <button className="px-6 py-2 bg-[#363343] text-[#FFD700] rounded-full text-[10px] font-headline tracking-widest font-bold border border-[#FFD700]/10">TRENDING</button>
          <button className="px-6 py-2 bg-transparent text-[#E6DFF5]/40 hover:text-[#E6DFF5] rounded-full text-[10px] font-headline tracking-widest hover:bg-[#141120] transition-all">NEWEST</button>
          <button className="px-6 py-2 bg-transparent text-[#E6DFF5]/40 hover:text-[#E6DFF5] rounded-full text-[10px] font-headline tracking-widest hover:bg-[#141120] transition-all">MOST UPVOTES</button>
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
                  <span className="text-[9px] font-headline tracking-widest text-[#E6DFF5]/20 uppercase">UPVOTE</span>
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
                    <button
                      type="button"
                      onClick={() => setOpenCommentsIdx(prev => (prev === idx ? null : idx))}
                      className="flex items-center gap-2 text-[#E6DFF5]/40 text-xs hover:text-[#FFD700] transition-colors"
                      aria-expanded={openCommentsIdx === idx}
                    >
                      <span className="material-symbols-outlined text-sm">chat_bubble</span>
                      {post.echo} Comments
                    </button>
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

              {openCommentsIdx === idx && (
                <div className="mt-5 bg-[#141120]/60 border border-[#4D4732]/30 rounded-xl p-4 max-h-[240px] overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary-container/90">
                      Comments
                    </h4>
                    <span className="text-[10px] font-headline text-[#E6DFF5]/60">
                      {getCommentsForPost(post, idx).length} total
                    </span>
                  </div>

                  <div className="space-y-3">
                    {getCommentsForPost(post, idx).map(comment => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#1C1A29] border border-[#4D4732]/40 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[14px] text-[#FFD700]">person</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-headline font-bold tracking-[0.1em] uppercase text-[#FFD700]">
                              {comment.author}
                            </span>
                            <span className="text-[10px] text-[#E6DFF5]/50">{comment.time}</span>
                          </div>
                          <p className="text-xs text-[#E6DFF5]/80 leading-relaxed break-words">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
