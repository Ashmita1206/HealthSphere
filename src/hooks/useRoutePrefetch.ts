import { useCallback } from 'react';

/**
 * Hook to prefetch route components on user intent (e.g. hover, focus)
 */
export function useRoutePrefetch() {
  const prefetch = useCallback((route: string) => {
    switch (route) {
      case '/security':
        import('../pages/security/SecurityDashboard');
        break;
      case '/collaboration':
        import('../pages/collaboration/CareTeamWorkspace');
        break;
      case '/offline':
        import('../pages/offline/OfflinePlatformDashboard');
        break;
      case '/admin/analytics':
        import('../pages/admin/AdminAnalyticsDashboard');
        break;
      default:
        break;
    }
  }, []);

  return { prefetch };
}
