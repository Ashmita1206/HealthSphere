import React from 'react';
import { Activity } from 'lucide-react';

export const AppLoadingFallback: React.FC = () => {
  return (
    <div
      className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-4 p-8"
      role="status"
      aria-live="polite"
      aria-label="Loading clinical view"
    >
      <div className="relative flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <Activity className="absolute h-6 w-6 animate-pulse text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground tracking-wide">
          HealthSphere OS
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Loading medical workspace...
        </p>
      </div>
    </div>
  );
};
