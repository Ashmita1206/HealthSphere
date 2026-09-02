import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '@/App';
import { useAuth } from '@/contexts/AuthContext';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Router & Route Hygiene Verification', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com', name: 'Test User' },
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
  });

  it('1. /ai-chat is the canonical AI route and renders AIChat page', async () => {
    window.location.hash = '#/ai-chat';
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/HealthSphere AI Assistant/i)).toBeInTheDocument();
    });
  });

  it('2. /ai-assistant is obsolete and renders NotFound 404 page', async () => {
    window.location.hash = '#/ai-assistant';
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/404/i)).toBeInTheDocument();
      expect(screen.queryByText(/AI Health Consultation Workspace/i)).not.toBeInTheDocument();
    });
  });

  it('3. /blood-donation is available as canonical blood & organ donation route', async () => {
    window.location.hash = '#/blood-donation';
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Blood Donation & Requests/i)).toBeInTheDocument();
    });
  });

  it('4. /blood-organ is obsolete and renders NotFound 404 page', async () => {
    window.location.hash = '#/blood-organ';
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/404/i)).toBeInTheDocument();
      expect(screen.queryByText(/Blood & Organ Donor Registry/i)).not.toBeInTheDocument();
    });
  });
});
