import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { VideoConsultationScreen } from '@/pages/telemedicine/components/VideoConsultationScreen';
import { LiveChatPanel, DEFAULT_TELEMEDICINE_MESSAGES } from '@/pages/telemedicine/components/LiveChatPanel';
import { LivePrescriptionPanel } from '@/pages/telemedicine/components/LivePrescriptionPanel';
import { ConsultationTimeline } from '@/pages/telemedicine/components/ConsultationTimeline';
import { TelemedicineRoom } from '@/pages/telemedicine/TelemedicineRoom';

describe('F26 — Telemedicine UI Suite', () => {
  it('1. VideoConsultationScreen renders connection metadata and handles media toggles and end call', () => {
    const handleEndCall = vi.fn();
    render(
      <VideoConsultationScreen
        doctorName="Dr. Vikramaditya Sen"
        patientName="Aarav Sharma"
        consultationId="CONS-TEST-001"
        onEndCall={handleEndCall}
      />
    );

    expect(screen.getByTestId('video-consultation-screen')).toBeInTheDocument();
    expect(screen.getByText('Dr. Vikramaditya Sen')).toBeInTheDocument();
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

  it('3. LivePrescriptionPanel displays live synced medications and triggers download', () => {
    const handleDownload = vi.fn();
    render(
      <LivePrescriptionPanel
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

  it('4. ConsultationTimeline renders chronological milestones', () => {
    render(<ConsultationTimeline />);

    expect(screen.getByTestId('consultation-timeline')).toBeInTheDocument();
    expect(screen.getByText('Consultation Session Connected')).toBeInTheDocument();
    expect(screen.getByText('Biometric Telemetry Ingested')).toBeInTheDocument();
    expect(screen.getByText('Clinical Assessment Documented')).toBeInTheDocument();
    expect(screen.getByText('Digital Prescription Signed')).toBeInTheDocument();
  });

  it('5. TelemedicineRoom page switches workspace tabs between Chat, Rx Pad, and Timeline', () => {
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
