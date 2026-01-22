import { useState, useCallback } from 'react';

interface VoteState {
  [id: string]: {
    count: number;
    hasVoted: boolean;
  };
}

export function useVoting(initialVotes: { id: string; count: number }[]) {
  const [votes, setVotes] = useState<VoteState>(() => {
    const initial: VoteState = {};
    initialVotes.forEach(({ id, count }) => {
      initial[id] = { count, hasVoted: false };
    });
    return initial;
  });

  const toggleVote = useCallback((id: string) => {
    setVotes(prev => {
      const current = prev[id] || { count: 0, hasVoted: false };
      return {
        ...prev,
        [id]: {
          count: current.hasVoted ? current.count - 1 : current.count + 1,
          hasVoted: !current.hasVoted,
        },
      };
    });
  }, []);

  const getVoteState = useCallback((id: string) => {
    return votes[id] || { count: 0, hasVoted: false };
  }, [votes]);

  return { votes, toggleVote, getVoteState };
}
