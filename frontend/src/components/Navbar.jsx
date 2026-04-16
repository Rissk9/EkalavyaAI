import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isGalaxy = location.pathname === '/';
  const isMentor = location.pathname.startsWith('/ai-dashboard');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-[#141120]/90 backdrop-blur-md border-b border-[#FFD700]/10 shadow-[0_4px_24px_rgba(255,215,0,0.04)]">
      <div className="h-full px-6 md:px-8 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 group">
          <h2 className="text-2xl font-bold tracking-tighter text-[#FFD700] font-headline uppercase group-hover:text-[#FFF] transition-colors">
            EKALAVYA
          </h2>
        </Link>

        <nav>
          <ul className="flex items-center gap-2 md:gap-4">
            <li>
              <Link
                to="/"
                className={`flex items-center gap-3 px-4 py-3 font-label uppercase tracking-[0.1em] text-xs transition-all duration-300 ${
                  isGalaxy
                    ? 'text-[#FFD700] border-b-2 border-[#FFD700] bg-gradient-to-b from-[#FFD700]/10 to-transparent'
                    : 'text-[#E6DFF5]/70 hover:bg-[#2B2838] hover:text-[#E6DFF5]'
                }`}
              >
                <span className="material-symbols-outlined">explore</span>
                <span>GALAXY VIEW</span>
              </Link>
            </li>
            <li>
              <Link
                to="/ai-dashboard"
                className={`flex items-center gap-3 px-4 py-3 font-label uppercase tracking-[0.1em] text-xs transition-all duration-300 ${
                  isMentor
                    ? 'text-[#FFD700] border-b-2 border-[#FFD700] bg-gradient-to-b from-[#FFD700]/10 to-transparent'
                    : 'text-[#E6DFF5]/70 hover:bg-[#2B2838] hover:text-[#E6DFF5]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">psychology</span>
                <span>AI MENTOR</span>
              </Link>
            </li>
            {isMentor && (
              <li>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-resume-helper'))}
                  className="flex items-center gap-2 px-6 py-2.5 ml-4 solar-gradient rounded-xl text-on-primary font-label uppercase tracking-[0.15em] text-[11px] font-bold shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all duration-300 animate-pulse-solar active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
                  <span>RESUME HELPER</span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        <div className="w-10 h-10 rounded-full border-2 border-[#FFD700]/30 p-0.5 bg-surface-container-high shrink-0">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FFD700]/30 to-[#FFB77A]/20" />
        </div>
      </div>
    </nav>
  );
}
