import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share2,
  ShieldCheck,
  Wifi,
  Volume2,
  Maximize2,
} from 'lucide-react';

export interface VideoConsultationScreenProps {
  doctorName?: string;
  patientName?: string;
  consultationId?: string;
  onEndCall?: () => void;
  className?: string;
}

export const VideoConsultationScreen: React.FC<VideoConsultationScreenProps> = ({
  doctorName = 'Dr. Vikramaditya Sen',
  patientName = 'Aarav Sharma',
  consultationId = 'CONS-2026-8812',
  onEndCall,
  className = '',
}) => {
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  return (
    <div
      data-testid="video-consultation-screen"
      className={`relative flex flex-col justify-between rounded-3xl bg-slate-950 text-white overflow-hidden border border-slate-800 shadow-2xl min-h-[440px] ${className}`}
    >
      {/* Top Overlay: Security & Connection Status */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Encrypted WebRTC</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/60">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>HD • 18ms Latency</span>
          </span>
        </div>

        <div className="pointer-events-auto">
          <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            {consultationId}
          </span>
        </div>
      </div>

      {/* Main Remote Feed Area */}
      <div className="relative flex-1 flex items-center justify-center p-6 bg-radial from-slate-900 to-slate-950">
        <div className="text-center space-y-3 z-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-600 to-emerald-500 mx-auto p-1 shadow-xl">
            <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-teal-300 text-3xl font-black">
              {doctorName.split(' ').map((n) => n[0]).join('')}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">{doctorName}</h3>
            <p className="text-xs text-teal-300/80 font-medium">Consulting with {patientName}</p>
          </div>
        </div>

        {/* Local Picture-in-Picture Preview */}
        <div className="absolute bottom-20 right-4 z-20 w-36 h-24 rounded-2xl bg-slate-900 border border-teal-500/40 overflow-hidden shadow-xl flex items-center justify-center">
          {videoActive ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/80">
              <span className="text-[10px] font-bold text-teal-300">You (Local Video)</span>
              <span className="text-[9px] text-slate-400">{patientName}</span>
            </div>
          ) : (
            <div className="text-slate-500 text-xs font-semibold flex items-center gap-1">
              <VideoOff className="w-4 h-4" />
              <span>Camera Off</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Floating Media Controls Bar */}
      <div className="p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800/80 z-20 flex items-center justify-center gap-3">
        {/* Mic Toggle */}
        <button
          onClick={() => setMicActive(!micActive)}
          aria-label={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
          className={`p-3 rounded-2xl font-bold transition-all cursor-pointer ${
            micActive
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-rose-600 text-white shadow-md'
          }`}
        >
          {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={() => setVideoActive(!videoActive)}
          aria-label={videoActive ? 'Turn Video Off' : 'Turn Video On'}
          className={`p-3 rounded-2xl font-bold transition-all cursor-pointer ${
            videoActive
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-rose-600 text-white shadow-md'
          }`}
        >
          {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={() => setScreenSharing(!screenSharing)}
          aria-label={screenSharing ? 'Stop Screen Share' : 'Share Screen'}
          className={`p-3 rounded-2xl font-bold transition-all cursor-pointer ${
            screenSharing
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          <Share2 className="w-5 h-5" />
        </button>

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          aria-label="End Consultation Call"
          className="px-6 py-3 rounded-2xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="text-xs font-bold">End Call</span>
        </button>
      </div>
    </div>
  );
};
