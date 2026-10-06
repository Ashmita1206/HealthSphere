import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { VideoConsultationScreen } from '@/pages/telemedicine/components/VideoConsultationScreen';
import { LiveChatPanel, DEFAULT_TELEMEDICINE_MESSAGES } from '@/pages/telemedicine/components/LiveChatPanel';
import { LivePrescriptionPanel, type TelemedicinePrescriptionItem } from '@/pages/telemedicine/components/LivePrescriptionPanel';
import { ConsultationTimeline, type TimelineMilestone } from '@/pages/telemedicine/components/ConsultationTimeline';
import { TelemedicineRoom } from '@/pages/telemedicine/TelemedicineRoom';

const realPrescriptions: TelemedicinePrescriptionItem[] = [
  {
    id: 'rx-real-1',
    name: 'Telmisartan Tablets IP',
    dosage: '40 mg',
    frequency: 'Once Daily (Night)',
    duration: '30 Days',
    instructions: 'Take 30 minutes before bedtime with water',
  },
];

const realMilestones: TimelineMilestone[] = [
  {
    id: 'm-1',
    time: '10:00 AM',
    title: 'Consultation Session Connected',
    description: 'Encrypted WebRTC high-definition channel established.',
  },
];

describe('F26 — Telemedicine UI & Clinical Integrity Suite', () => {
  it('1. VideoConsultationScreen renders connection metadata and handles media toggles and end call', () => {
    const handleEndCall = vi.fn();
    render(
      <VideoConsultationScreen
        doctorName="Dr. Anita Desai"
        patientName="Rohan Gupta"
        consultationId="CONS-TEST-001"
        onEndCall={handleEndCall}
      />
    );

    expect(screen.getByTestId('video-consultation-screen')).toBeInTheDocument();
    expect(screen.getByText('Dr. Anita Desai')).toBeInTheDocument();
    expect(screen.getByText(/Live Encrypted WebRTC/i)).toBeInTheDocument();
    expect(screen.getByText('CONS-TEST-001')).toBeInTheDocument();

    // Toggle Mic
    const micBtn = screen.getByRole('button', { name: /mute microphone/i });
    fireEvent.click(micBtn);
    expect(screen.getByRole('button', { name: /unmute microphone/i })).toBeInTheDocument();

    // Toggle Video
    const videoBtn = screen.getByRole('button', { name: /turn video off/i });
    fireEvent.click(videoBtn);
    expect(screen.getByRole('button', { name: /turn video on/i })).toBeInTheDocument();

    // End call
    const endCallBtn = screen.getByRole('button', { name: /end consultation call/i });
    fireEvent.click(endCallBtn);
    expect(handleEndCall).toHaveBeenCalledTimes(1);
  });

  it('2. LiveChatPanel renders messages, shows typing indicator, and dispatches messages', () => {
    const handleSend = vi.fn();
    render(
      <LiveChatPanel
        initialMessages={DEFAULT_TELEMEDICINE_MESSAGES}
        isOtherTyping={true}
        onSendMessage={handleSend}
      />
    );

    expect(screen.getByTestId('live-chat-panel')).toBeInTheDocument();
    expect(screen.getByText(/Encrypted consultation channel established/i)).toBeInTheDocument();
    expect(screen.getByText(/Doctor is typing/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/type message to doctor/i);
    const sendBtn = screen.getByRole('button', { name: /send consultation message/i });

    fireEvent.change(input, { target: { value: 'Understood Doctor, will check my vitals now.' } });
    fireEvent.click(sendBtn);

    expect(handleSend).toHaveBeenCalledWith('Understood Doctor, will check my vitals now.');
    expect(screen.getByText('Understood Doctor, will check my vitals now.')).toBeInTheDocument();
  });

  it('3. LivePrescriptionPanel renders honest drafting state when no prescriptions are drafted', () => {
    render(<LivePrescriptionPanel prescriptions={[]} isSigned={false} />);
    expect(screen.getByTestId('live-prescription-empty')).toBeInTheDocument();
    expect(screen.getByText(/No Prescriptions Drafted/i)).toBeInTheDocument();
    expect(screen.getByText(/Drafting In Call/i)).toBeInTheDocument();
  });

  it('4. LivePrescriptionPanel displays real synced medications and handles download when signed', () => {
    const handleDownload = vi.fn();
    render(
      <LivePrescriptionPanel
        prescriptions={realPrescriptions}
        isSigned={true}
        onDownload={handleDownload}
      />
    );

    expect(screen.getByTestId('live-prescription-panel')).toBeInTheDocument();
    expect(screen.getByText('Telmisartan Tablets IP')).toBeInTheDocument();
    expect(screen.getByText('Digitally Signed')).toBeInTheDocument();

    const downloadBtn = screen.getByRole('button', { name: /download signed rx/i });
    fireEvent.click(downloadBtn);
    expect(handleDownload).toHaveBeenCalledTimes(1);
  });

  it('5. ConsultationTimeline renders honest session state when no milestones yet', () => {
    render(<ConsultationTimeline milestones={[]} />);
    expect(screen.getByTestId('consultation-timeline-empty')).toBeInTheDocument();
    expect(screen.getByText(/Session Initialized/i)).toBeInTheDocument();
  });

  it('6. ConsultationTimeline renders chronological milestones when provided', () => {
    render(<ConsultationTimeline milestones={realMilestones} />);
    expect(screen.getByTestId('consultation-timeline')).toBeInTheDocument();
    expect(screen.getByText('Consultation Session Connected')).toBeInTheDocument();
  });

  it('7. TelemedicineRoom page switches workspace tabs between Chat, Rx Pad, and Timeline', () => {
    render(
      <BrowserRouter>
        <TelemedicineRoom />
      </BrowserRouter>
    );

    expect(screen.getByTestId('telemedicine-room-page')).toBeInTheDocument();
    expect(screen.getByTestId('video-consultation-screen')).toBeInTheDocument();
    expect(screen.getByTestId('live-chat-panel')).toBeInTheDocument();

    // Switch to Rx Pad
    const rxTab = screen.getByRole('button', { name: /rx pad/i });
    fireEvent.click(rxTab);
    expect(screen.getByTestId('live-prescription-panel')).toBeInTheDocument();

    // Switch to Timeline
    const timelineTab = screen.getByRole('button', { name: /timeline/i });
    fireEvent.click(timelineTab);
    expect(screen.getByTestId('consultation-timeline')).toBeInTheDocument();
  });
});
