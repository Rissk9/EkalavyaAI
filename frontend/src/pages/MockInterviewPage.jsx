import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';

const API_BASE = import.meta.env.VITE_INTERVIEW_API_URL || 'http://localhost:8000';

// ─── Main MockInterviewPage ───────────────────────────────────────────────────
export default function MockInterviewPage() {
  const { orbitId } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('idle'); // idle | connecting | live | complete
  const [token, setToken] = useState(null);
  const [livekitUrl, setLivekitUrl] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState(null);
  const [jobRole, setJobRole] = useState('');

  // Fetch the actual role name from the backend API
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const apiBase = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBase}/orbit-data/${orbitId}`);
        const data = await response.json();
        if (data.role?.name) {
          setJobRole(data.role.name);
        } else {
          // Fallback: format the orbitId slug into a readable name
          setJobRole(orbitId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        }
      } catch (err) {
        console.error('Error fetching role:', err);
        setJobRole(orbitId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
      }
    };
    if (orbitId) fetchRole();
  }, [orbitId]);

  const startInterview = useCallback(async () => {
    setError(null);
    setPhase('connecting');
    try {
      const res = await fetch(`${API_BASE}/api/interview/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_role: jobRole }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || `Token request failed (${res.status})`);
      }
      const data = await res.json();
      setToken(data.token);
      setRoomName(data.room_name);
      setLivekitUrl(data.livekit_url);
      setPhase('live');
    } catch (e) {
      console.error('Failed to start interview:', e);
      setError(e.message);
      setPhase('idle');
    }
  }, [jobRole]);

  const handleEnd = useCallback(() => {
    setPhase('complete');
  }, []);

  const handleDisconnected = useCallback(() => {
    setPhase('complete');
  }, []);

  // ─── Idle Phase ────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div
        className="font-body text-on-surface min-h-screen"
        style={{
          backgroundColor: '#02010A',
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      >
        <main className="pt-10 pb-16 px-8 max-w-3xl mx-auto">
          <div className="hidden md:flex items-center gap-2 font-label text-[10px] tracking-[0.2em] text-[#E6DFF5]/40 uppercase mb-8">
            <span className="cursor-pointer hover:text-[#FFD700] transition-colors" onClick={() => navigate('/')}>HOME</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="cursor-pointer hover:text-[#FFD700] transition-colors" onClick={() => navigate(`/orbit/${orbitId}`)}>{orbitId?.toUpperCase()}</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-[#FFD700]">MOCK INTERVIEW</span>
          </div>

          <div className="text-center mb-12">
            <span className="font-label text-xs tracking-[0.3em] text-[#FFD700] uppercase block mb-4">MOCK INTERVIEW</span>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
              AI Voice Interview
            </h1>
            <p className="text-on-surface-variant text-base max-w-lg mx-auto leading-relaxed">
              Practice with Alex, our AI interviewer. Get real-time voice-based mock interviews tailored for {jobRole} roles.
            </p>
          </div>

          <div className="bg-surface-container-low rounded-xl p-8 ghost-border max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-[#FFD700] text-2xl">mic</span>
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold">{jobRole} Interview</h3>
                <p className="text-xs text-on-surface-variant">5 questions · ~15 min</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FFD700] text-base">check_circle</span>
                <span>Structured interview with 5 questions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FFD700] text-base">check_circle</span>
                <span>Real-time voice conversation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FFD700] text-base">check_circle</span>
                <span>Answers saved for review</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={startInterview}
              disabled={!jobRole}
              className="w-full solar-gradient text-[#3a3000] font-headline font-bold py-3 px-6 rounded-lg tracking-tight hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!jobRole ? 'LOADING ROLE...' : 'START INTERVIEW'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── Connecting Phase ──────────────────────────────────────────────────────
  if (phase === 'connecting') {
    return (
      <div
        className="font-body text-on-surface min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#02010A' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mx-auto mb-6" />
          <p className="text-on-surface-variant">Connecting to interview room...</p>
        </div>
      </div>
    );
  }

  // ─── Complete Phase ────────────────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <div
        className="font-body text-on-surface min-h-screen"
        style={{
          backgroundColor: '#02010A',
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      >
        <main className="pt-10 pb-16 px-8 max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <span className="material-symbols-outlined text-[#FFD700] text-6xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <span className="font-label text-xs tracking-[0.3em] text-[#FFD700] uppercase block mb-4">INTERVIEW COMPLETE</span>
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">Great Session!</h1>
            <p className="text-on-surface-variant">Your {jobRole} mock interview has been saved for review.</p>
          </div>

          <div className="bg-surface-container-low rounded-xl p-6 ghost-border max-w-sm mx-auto mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-on-surface-variant">Role</span>
              <span className="font-headline font-bold">{jobRole}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Room</span>
              <span className="text-sm text-on-surface-variant font-mono">{roomName}</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(`/orbit/${orbitId}`)}
              className="glass-panel ghost-border text-[#FFD700] font-headline font-bold py-3 px-6 rounded-lg tracking-tight hover:bg-surface-container-highest transition-all active:scale-95"
            >
              BACK TO ORBIT
            </button>
            <button
              onClick={() => { setPhase('idle'); setToken(null); setRoomName(''); setLivekitUrl(''); }}
              className="solar-gradient text-[#3a3000] font-headline font-bold py-3 px-6 rounded-lg tracking-tight hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all active:scale-95"
            >
              TRY AGAIN
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── Live Phase — LiveKit VideoConference UI ─────────────────────────────
  return (
    <div className="font-body text-on-surface min-h-screen" style={{ backgroundColor: '#02010A' }}>
      {token && (
        <LiveKitRoom
          token={token}
          serverUrl={livekitUrl}
          connect={true}
          onDisconnected={handleDisconnected}
          audio={true}
          video={false}
        >
          <div className="lk-room-container" style={{ height: '100vh' }}>
            <VideoConference />
          </div>
        </LiveKitRoom>
      )}
    </div>
  );
}
