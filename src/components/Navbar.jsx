import { Link } from 'react-router-dom';
import { Telescope } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#141120]/85 backdrop-blur-xl border-b border-outline-variant/15 flex items-center px-6 py-4 justify-between">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant/15 group-hover:shadow-[0_0_24px_rgba(255,225,109,0.15)] transition-all">
          <Telescope className="w-5 h-5 text-primary-container" />
        </div>
        <span className="font-heading font-bold text-xl tracking-wide uppercase text-on-surface">
          Ekalavya
        </span>
      </Link>
      
      <div className="flex items-center gap-6">
        <Link to="/ai-dashboard" className="text-sm font-heading font-medium text-on-surface hover:text-primary-container transition-colors uppercase tracking-widest">
          AI Mentor
        </Link>
        <Link to="/login" className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#FFD700] to-[#FFB77A] text-[#3A3000] font-heading font-bold text-sm tracking-wide hover:shadow-[0_0_32px_rgba(255,225,109,0.2)] transition-all">
          SIGN IN
        </Link>
      </div>
    </nav>
  );
}
