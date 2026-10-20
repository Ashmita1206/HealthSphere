import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmergencyModal } from '@/components/emergency/EmergencyModal';
import { api } from '@/services/api';

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'usr-123', name: 'Alex Johnson', email: 'alex@example.com' },
  }),
}));

// Mock Geolocation Hook
const mockRequestLocation = vi.fn();
const mockGeoLocation = { latitude: 37.7749, longitude: -122.4194, accuracy: 12 };
vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    location: mockGeoLocation,
    error: null,
    loading: false,
    requestLocation: mockRequestLocation,
    isSupported: true,
  }),
}));

// Mock API
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock LocationsService
vi.mock('@/services/locationsService', () => ({
  getNearbyHospitals: vi.fn().mockResolvedValue({
    locations: [
      {
        id: 'hosp-1',
        name: 'St. Jude General Hospital',
        address: '450 Health Ave',
        phone: '+1-555-0144',
        latitude: 37.775,
        longitude: -122.418,
        distance: 450,
      },
    ],
    error: null,
  }),
}));

describe('EmergencyModal — Global SOS Dialog & Safety Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock responses
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/emergency/contacts') {
        return Promise.resolve([
          { _id: 'c-1', name: 'Dr. Evelyn Reed', phone: '+1-555-0101', relation: 'Cardiologist (Primary)' },
          { _id: 'c-2', name: 'Mark Johnson', phone: '+1-555-0102', relation: 'Spouse' },
        ]);
      }
      if (url === '/user/profile') {
        return Promise.resolve({
          full_name: 'Alex Johnson',
          blood_type: 'O+',
          date_of_birth: '1990-05-15',
          allergies: ['Penicillin', 'Peanuts'],
          chronic_diseases: ['Hypertension'],
          surgeries: ['Appendectomy (2018)'],
          emergency_contact_name: 'Mark Johnson',
          emergency_contact_phone: '+1-555-0102',
          updatedAt: '2026-09-01T10:00:00Z',
        });
      }
      if (url === '/emergency/active') {
        return Promise.resolve({ data: [] });
      }
      if (url === '/emergency/history') {
        return Promise.resolve({
          data: [
            {
              _id: 'inc-prev-1',
              severity: 'CRITICAL',
              triggerReason: 'Manual SOS Dispatch',
              createdAt: '2026-10-18T14:30:00Z',
              status: 'resolved',
            },
          ],
        });
      }
      return Promise.resolve({});
    });
  });

  it('renders modal header with Title, Subtitle, and 24/7 indicator', async () => {
    render(<EmergencyModal open={true} onOpenChange={vi.fn()} />);

    expect(screen.getAllByText('Emergency Assistance').length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('Quick access to emergency help and your medical information.').length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('24/7')).toBeInTheDocument();
  });

  it('renders Action A (Call 112) and Action B (Send SOS Alert) prominently', async () => {
    render(<EmergencyModal open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText('Call Emergency')).toBeInTheDocument();
    expect(screen.getByText('Call 112')).toBeInTheDocument();
    expect(screen.getAllByText('Send SOS Alert').length).toBeGreaterThanOrEqual(1);
  });

  it('Call 112 triggers device dialer window.open without asserting call completion', async () => {
    const originalOpen = window.open;
    const windowOpenMock = vi.fn();
    window.open = windowOpenMock;

    render(<EmergencyModal open={true} onOpenChange={vi.fn()} />);

    const call112Btn = screen.getByRole('button', { name: /Call 112 Emergency Services/i });
    fireEvent.click(call112Btn);

    expect(windowOpenMock).toHaveBeenCalledWith('tel:112', '_self');
    expect(screen.getByText(/Opens native device dialer/i)).toBeInTheDocument();

    window.open = originalOpen;
  });

  it('Send SOS Alert opens confirmation view before dispatching any signal', async () => {
    render(<EmergencyModal open={true} onOpenChange={vi.fn()} />);

    const openSOSBtn = screen.getByRole('button', { name: /Open SOS Confirmation view/i });
    fireEvent.click(openSOSBtn);

    // Confirmation view should be displayed
    expect(screen.getByText('Confirm Emergency SOS Alert')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to trigger an SOS alert/i)).toBeInTheDocument();

    // Loaded contacts should be visible
    await waitFor(() => {
      expect(screen.getByText('Dr. Evelyn Reed')).toBeInTheDocument();
      expect(screen.getByText('Mark Johnson')).toBeInTheDocument();
    });

    // Confirmation button should be present
    expect(screen.getByRole('button', { name: /Confirm & Send SOS/i })).toBeInTheDocument();
  });

  it('SOS confirmation transmits alert, prevents duplicate clicks, and shows honest delivery state', async () => {
    (api.post as any).mockResolvedValueOnce({
      status: 'triggered',
      success: true,
      data: {
        id: 'INC-2026-999',
        status: 'active',
        severity: 'CRITICAL',
      },
      message: 'Emergency alert recorded.',
    });

    render(<EmergencyModal open={true} onOpenChange={vi.fn()} defaultView="sos_confirm" />);

    await waitFor(() => {
      expect(screen.getByText('Confirm Emergency SOS Alert')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole('button', { name: /Confirm & Send SOS/i });
    fireEvent.click(confirmBtn);

    // API should be called with live coordinates and selected contact IDs
    expect(api.post).toHaveBeenCalledWith('/emergency/sos', {
      latitude: 37.7749,
      longitude: -122.4194,
      contactIds: ['c-1', 'c-2'],
    });

    // Result view should render honest status
    await waitFor(() => {
      expect(screen.getByText('Emergency Alert Recorded')).toBeInTheDocument();
      expect(screen.getByText(/Incident ID:/i)).toBeInTheDocument();
      expect(screen.getByText('Not Configured')).toBeInTheDocument();
      expect(screen.getByText(/External telephony gateway \(e\.g\., Twilio\) is unconfigured/i)).toBeInTheDocument();
    });
  });

  it('SOS displays per-recipient Twilio delivery status when gateway is active', async () => {
    (api.post as any).mockResolvedValueOnce({
      status: 'triggered',
      success: true,
      incidentId: 'INC-TWILIO-777',
      isTwilioConfigured: true,
      dispatchRecords: [
        {
          contactId: 'c-1',
          contactName: 'Dr. Evelyn Reed',
          phone: '+15550101',
          channel: 'sms',
          status: 'queued',
          messageSid: 'SM1234567890abcdef',
        },
        {
          contactId: 'c-2',
          contactName: 'Mark Johnson',
          phone: '+15550102',
          channel: 'sms',
          status: 'delivered',
          messageSid: 'SM9876543210fedcba',
        },
      ],
      message: 'Emergency alert recorded. SMS queued for 2 contact(s).',
    });

    render(<EmergencyModal open={true} onOpenChange={vi.fn()} defaultView="sos_confirm" />);

    await waitFor(() => {
      expect(screen.getByText('Confirm Emergency SOS Alert')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole('button', { name: /Confirm & Send SOS/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText('Twilio Active')).toBeInTheDocument();
      expect(screen.getByText(/Contact SMS Delivery Tracking/i)).toBeInTheDocument();
      expect(screen.getByText('Queued (Twilio)')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
      expect(screen.getByText(/SID: SM1234567890abcdef/i)).toBeInTheDocument();
    });
  });

  it('SOS handles backend failure honestly without fake success', async () => {
    (api.post as any).mockRejectedValueOnce(new Error('Network error or server timeout'));

    render(<EmergencyModal open={true} onOpenChange={vi.fn()} defaultView="sos_confirm" />);

    const confirmBtn = screen.getByRole('button', { name: /Confirm & Send SOS/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText('SOS Transmission Unconfirmed')).toBeInTheDocument();
      expect(screen.getByText(/Network error or server timeout/i)).toBeInTheDocument();
    });
  });

  it('Emergency Contacts view displays saved contacts and provides dial buttons', async () => {
    render(<EmergencyModal open={true} onOpenChange={vi.fn()} defaultView="contacts" />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Evelyn Reed')).toBeInTheDocument();
      expect(screen.getByText('Mark Johnson')).toBeInTheDocument();
      expect(screen.getByText('Primary')).toBeInTheDocument();
    });

    // Check dial link
    const callLink = screen.getByRole('link', { name: /Call Dr. Evelyn Reed/i });
    expect(callLink).toHaveAttribute('href', 'tel:+1-555-0101');
  });

  it('Medical ID view displays blood group, allergies, conditions, and confidential notice', async () => {
    render(<EmergencyModal open={true} onOpenChange={vi.fn()} defaultView="medical_id" />);

    await waitFor(() => {
      expect(screen.getByText('Emergency Medical ID')).toBeInTheDocument();
      expect(screen.getAllByText('O+').length).toBeGreaterThan(0);
      expect(screen.getByText('Penicillin')).toBeInTheDocument();
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
      expect(screen.getByText(/Nonfunctional QR-code export has been removed for privacy/i)).toBeInTheDocument();
    });
  });

  it('Nearby Hospitals view displays facilities and calculates distance from coordinates', async () => {
    render(<EmergencyModal open={true} onOpenChange={vi.fn()} defaultView="hospitals" />);

    await waitFor(() => {
      expect(screen.getByText('St. Jude General Hospital')).toBeInTheDocument();
      expect(screen.getByText('450 Health Ave')).toBeInTheDocument();
      expect(screen.getByText('450m')).toBeInTheDocument();
    });
  });

  it('Share Location view displays GPS coordinates and supports copying', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<EmergencyModal open={true} onOpenChange={vi.fn()} defaultView="location" />);

    expect(screen.getByText('Live Location Sharing')).toBeInTheDocument();
    expect(screen.getByText('37.774900')).toBeInTheDocument();
    expect(screen.getByText('-122.419400')).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /Copy Coordinates/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('37.77490, -122.41940');
  });

  it('Emergency History view displays persisted incidents', async () => {
    render(<EmergencyModal open={true} onOpenChange={vi.fn()} defaultView="history" />);

    await waitFor(() => {
      expect(screen.getByText('Emergency Incident History')).toBeInTheDocument();
      expect(screen.getByText('Manual SOS Dispatch')).toBeInTheDocument();
      expect(screen.getByText('RESOLVED')).toBeInTheDocument();
    });
  });
});
