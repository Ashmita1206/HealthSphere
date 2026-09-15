import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  shareService,
  CreateSharePayload,
  CreateShareResponse,
  SharesData,
  MedicalShareItem,
} from '@/services/shareService';

interface ShareContextType {
  shares: SharesData;
  loading: boolean;
  error: string | null;
  activeCount: number;
  fetchShares: () => Promise<void>;
  createShare: (payload: CreateSharePayload) => Promise<CreateShareResponse>;
  revokeShare: (token: string) => Promise<void>;
}

const defaultSharesData: SharesData = {
  active: [],
  expired: [],
  revoked: [],
  all: [],
};

const ShareContext = createContext<ShareContextType | undefined>(undefined);

export const ShareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shares, setShares] = useState<SharesData>(defaultSharesData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShares = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await shareService.getShares();
      setShares(data || defaultSharesData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load medical shares';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createShare = useCallback(
    async (payload: CreateSharePayload): Promise<CreateShareResponse> => {
      setLoading(true);
      setError(null);
      try {
        const response = await shareService.createShare(payload);
        // Refresh shares list to keep state synchronous
        await fetchShares();
        return response;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create share token';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchShares]
  );

  const revokeShare = useCallback(
    async (token: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await shareService.revokeShare(token);
        // Optimistically update or refetch
        setShares((prev) => {
          const itemToRevoke = prev.active.find((s) => s.shareToken === token);
          const updatedActive = prev.active.filter((s) => s.shareToken !== token);
          const updatedRevoked = itemToRevoke
            ? [{ ...itemToRevoke, status: 'revoked' as const, updatedAt: new Date().toISOString() }, ...prev.revoked]
            : prev.revoked;

          return {
            ...prev,
            active: updatedActive,
            revoked: updatedRevoked,
            all: prev.all.map((s) => (s.shareToken === token ? { ...s, status: 'revoked' as const } : s)),
          };
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to revoke medical share';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const token = localStorage.getItem('healthsphere_token');
    if (token) {
      void fetchShares();
    }
  }, [fetchShares]);

  return (
    <ShareContext.Provider
      value={{
        shares,
        loading,
        error,
        activeCount: shares.active.length,
        fetchShares,
        createShare,
        revokeShare,
      }}
    >
      {children}
    </ShareContext.Provider>
  );
};

export const useMedicalShare = (): ShareContextType => {
  const context = useContext(ShareContext);
  if (!context) {
    throw new Error('useMedicalShare must be used within a ShareProvider');
  }
  return context;
};
