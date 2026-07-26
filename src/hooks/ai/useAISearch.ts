import { useState, useCallback } from 'react';
import { aiService, GlobalSearchResult } from '@/services/ai/aiService';

export function useAISearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await aiService.searchGlobal(searchQuery);
      if (res.success && res.data) {
        setResults(res.data);
      }
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  return {
    query,
    results,
    searching,
    search,
  };
}
