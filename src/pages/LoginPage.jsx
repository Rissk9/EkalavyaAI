import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full h-[80px] px-12 flex justify-between items-center z-50 bg-[#02010A]/85 backdrop-blur-xl">
        <Link to="/" className="w-[120px] h-[32px] border border-[#FFD700] flex items-center justify-center rounded-sm">
          <span className="text-[10px] font-headline font-bold text-[#FFD700] tracking-widest">EKALAVYA</span>
        </Link>
        <div></div>
      </nav>

      {/* Background Star Field */}
      <div className="absolute inset-0 star-field pointer-events-none" />

      {/* Orbit Rings */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="orbit-ring w-[1200px] h-[1200px] opacity-40 border-[#1A1A2E]" style={{ transform: 'rotateX(75deg)' }} />
        <div className="orbit-ring w-[1600px] h-[1600px] opacity-30 border-[#1A1A2E]" style={{ transform: 'rotateX(75deg)' }} />
        <div className="orbit-ring w-[2000px] h-[2000px] opacity-20 border-[#1A1A2E]" style={{ transform: 'rotateX(75deg)' }} />
      </div>

      {/* Halo Glow */}
      <div className="absolute w-[480px] h-[480px] rounded-full bg-[#FFD700]/[0.06] blur-[64px] pointer-events-none" />

      {/* Login Card */}
      <main className="relative z-10 w-[420px] bg-[#0A081C]/85 backdrop-blur-[20px] p-[48px] rounded-[24px] shadow-[0px_24px_48px_rgba(0,0,0,0.5)] border border-outline-variant/15 flex flex-col items-center">
        <label className="font-label text-[10px] tracking-[0.1em] text-secondary font-bold mb-6">IDENTIFY YOURSELF</label>
        <h1 className="font-headline font-bold text-[28px] text-on-surface mb-2 leading-tight">Sign in to Orbit</h1>
        <p className="font-body text-[13px] text-secondary text-center mb-8">Use your professional identity to enter the universe.</p>

        {/* Social Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button className="w-full h-[48px] bg-[#E6DFF5] hover:bg-white transition-colors duration-300 rounded-[12px] flex items-center justify-center gap-3 group">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-background font-body font-semibold text-[14px]">Continue with Google</span>
          </button>

          <button className="w-full h-[48px] bg-[#0A66C2] hover:bg-[#0077B5] transition-colors duration-300 rounded-[12px] flex items-center justify-center gap-3">
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            <span className="text-white font-body font-semibold text-[14px]">Continue with LinkedIn</span>
          </button>
        </div>

        {/* Footer Text */}
        <footer className="mt-8">
          <p className="font-body text-[11px] text-secondary/40 text-center leading-relaxed max-w-[280px]">
            Your identity stays yours. Orbit never posts on your behalf.
          </p>
        </footer>
      </main>

      {/* Footer Shell */}
      <footer className="fixed bottom-0 w-full flex justify-between items-center px-12 py-6 opacity-50 bg-transparent text-[#E6DFF5] font-body text-xs tracking-widest uppercase">
        <div className="flex gap-6">
          <a className="hover:text-[#E6DFF5] transition-opacity opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
          <a className="hover:text-[#E6DFF5] transition-opacity opacity-80 hover:opacity-100" href="#">Terms of Service</a>
          <a className="hover:text-[#E6DFF5] transition-opacity opacity-80 hover:opacity-100" href="#">Security</a>
        </div>
        <div className="text-[#E6DFF5]/40">
          © 2024 Orbit Celestial Systems
        </div>
      </footer>
    </motion.div>
  );
}
