import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationCenter from '@/pages/notifications/NotificationCenter';

describe('F30 — Notifications Center UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders NotificationCenter header, live stream badge, and tabs', () => {
    render(
      <BrowserRouter>
        <NotificationCenter />
      </BrowserRouter>
    );

    expect(screen.getByTestId('notification-center-page')).toBeInTheDocument();
    expect(
      screen.getByText(/Notification Center & Real-Time Activity Feed/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Live Stream Connected/i)).toBeInTheDocument();
    expect(screen.getByText(/Mark All Read/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All Notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Activity Feed/i })).toBeInTheDocument();
  });

  it('filters notifications by search query', () => {
    render(
      <BrowserRouter>
        <NotificationCenter />
      </BrowserRouter>
    );

    expect(screen.getByText(/Critical Emergency Triage Dispatched/i)).toBeInTheDocument();
    expect(screen.getByText(/Medication Due: Metformin 500mg/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search notifications.../i);
    fireEvent.change(searchInput, { target: { value: 'Metformin' } });

    expect(screen.getByText(/Medication Due: Metformin 500mg/i)).toBeInTheDocument();
    expect(screen.queryByText(/Critical Emergency Triage Dispatched/i)).not.toBeInTheDocument();
  });

  it('filters by category chip button', () => {
    render(
      <BrowserRouter>
        <NotificationCenter />
      </BrowserRouter>
    );

    const medicationChip = screen.getByRole('button', { name: /^Medications$/i });
    fireEvent.click(medicationChip);

    expect(screen.getByText(/Medication Due: Metformin 500mg/i)).toBeInTheDocument();
    expect(screen.queryByText(/Critical Emergency Triage Dispatched/i)).not.toBeInTheDocument();
  });

  it('switches to unread and critical tabs correctly', () => {
    render(
      <BrowserRouter>
        <NotificationCenter />
      </BrowserRouter>
    );

    // Switch to Critical tab
    const criticalTab = screen.getByRole('button', { name: /Critical Alerts/i });
    fireEvent.click(criticalTab);

    expect(screen.getByText(/Critical Emergency Triage Dispatched/i)).toBeInTheDocument();
    expect(screen.queryByText(/Medication Due: Metformin 500mg/i)).not.toBeInTheDocument();
  });

  it('marks all notifications as read', () => {
    render(
      <BrowserRouter>
        <NotificationCenter />
      </BrowserRouter>
    );

    const markAllBtn = screen.getByRole('button', { name: /Mark All Read/i });
    fireEvent.click(markAllBtn);

    // After marking all as read, button is disabled
    expect(markAllBtn).toBeDisabled();
  });

  it('switches to Activity Feed view and renders chronological events', () => {
    render(
      <BrowserRouter>
        <NotificationCenter />
      </BrowserRouter>
    );

    const activityTab = screen.getByRole('button', { name: /Activity Feed/i });
    fireEvent.click(activityTab);

    expect(screen.getByTestId('activity-feed-section')).toBeInTheDocument();
    expect(screen.getByText(/Chronological Patient Activity Stream/i)).toBeInTheDocument();
    expect(screen.getByText(/Prescription Digital Signature/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Dr. Sarah Mitchell/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Lab Report Uploaded & Processed/i)).toBeInTheDocument();
  });
});
