import { useState, useCallback } from 'react';

export function useAcceptedSolution(initialAcceptedId?: string) {
  const [acceptedId, setAcceptedId] = useState<string | null>(initialAcceptedId || null);

  const toggleAccepted = useCallback((id: string) => {
    setAcceptedId(prev => prev === id ? null : id);
  }, []);

  const isAccepted = useCallback((id: string) => {
    return acceptedId === id;
  }, [acceptedId]);

  return { acceptedId, toggleAccepted, isAccepted };
}
