import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { VideoConsultationScreen } from './components/VideoConsultationScreen';
import { LiveChatPanel } from './components/LiveChatPanel';
import { LivePrescriptionPanel } from './components/LivePrescriptionPanel';
import { ConsultationTimeline } from './components/ConsultationTimeline';
import { MessageSquare, Pill, Clock, ArrowLeft } from 'lucide-react';

export const TelemedicineRoom: React.FC = () => {
  const navigate = useNavigate();
  const { consultationId = 'CONS-2026-8812' } = useParams();
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'rx' | 'timeline'>('chat');

  const handleEndCall = () => {
    navigate('/dashboard');
  };

  return (
    <div data-testid="telemedicine-room-page" className="space-y-6 pb-12">
      {/* Top Breadcrumb & Call Meta */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/appointments')}
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Appointments</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Session ID:</span>
          <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
            {consultationId}
          </span>
        </div>
      </div>

      {/* Main Grid: Video Stream (65%) & Clinical Workspace (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Video Consultation Screen */}
        <div className="lg:col-span-2 space-y-4">
          <VideoConsultationScreen
            consultationId={consultationId}
            onEndCall={handleEndCall}
          />
        </div>

        {/* Clinical Workspace Sidebar */}
        <div className="space-y-4">
          {/* Workspace Tab Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-850 text-xs font-bold">
            <button
              onClick={() => setActiveSideTab('chat')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSideTab === 'chat'
                  ? 'bg-white dark:bg-slate-750 text-teal-700 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setActiveSideTab('rx')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSideTab === 'rx'
                  ? 'bg-white dark:bg-slate-750 text-teal-700 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Rx Pad</span>
            </button>

            <button
              onClick={() => setActiveSideTab('timeline')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSideTab === 'timeline'
                  ? 'bg-white dark:bg-slate-750 text-teal-700 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </div>

          {/* Active Workspace View */}
          {activeSideTab === 'chat' && <LiveChatPanel isOtherTyping={false} />}
          {activeSideTab === 'rx' && <LivePrescriptionPanel onDownload={() => {}} />}
          {activeSideTab === 'timeline' && <ConsultationTimeline />}
        </div>
      </div>
    </div>
  );
};

export default TelemedicineRoom;
