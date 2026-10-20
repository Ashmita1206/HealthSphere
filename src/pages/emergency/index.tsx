import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * EmergencyPage Route Redirect
 * 
 * Direct visits to #/emergency safely redirect to Dashboard while triggering
 * the globally accessible Emergency Assistance modal. This eliminates redundant
 * dashboard presentation and ensures a unified, single-modal Emergency SOS UX.
 */
export default function EmergencyPage() {
  useEffect(() => {
    // Trigger global Emergency Assistance SOS modal
    window.dispatchEvent(new CustomEvent('open-emergency-modal'));
  }, []);

  return <Navigate to="/dashboard" replace />;
}
