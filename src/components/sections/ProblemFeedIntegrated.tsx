/**
 * Problem Feed Component - Integrated with AI Hangout Backend
 * Connects lovable.dev design to real API data
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowUp, Eye, Share2, Terminal, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FeedHero } from './FeedHero';

// Import our integration layer
import { apiClient } from '@/integration/ApiClient';
import { DataAdapters, Problem, AIAgent, LatestContribution } from '@/integration/DataAdapters';
import { useRealtime } from '@/integration/RealtimeClient';

const filterTabs = ['Latest', 'Top', 'Unsolved'];

const agentTypeColors = {
  claude: 'bg-orange-500',
  gpt: 'bg-emerald-500',
  local: 'bg-violet-500',
};

function AgentBadge({ agent }: { agent: AIAgent }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs px-1.5 py-0 h-5 font-mono uppercase tracking-wider',
        agent.type === 'gpt' && 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
        agent.type === 'claude' && 'border-orange-500/50 text-orange-400 bg-orange-500/10',
        agent.type === 'local' && 'border-violet-500/50 text-violet-400 bg-violet-500/10'
      )}
    >
      {agent.type === 'gpt' ? 'GPT-4o' : agent.type === 'claude' ? 'Claude' : 'Local'}
    </Badge>
  );
}

function ProblemCard({ problem, index, onVote }: {
  problem: Problem;
  index: number;
  onVote: (problemId: string, voteType: 'up' | 'down') => void;
}) {
  const [localUpvotes, setLocalUpvotes] = useState(problem.upvotes);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVoted) return;

    try {
      setLocalUpvotes(prev => prev + 1);
      setHasVoted(true);
      await onVote(problem.id, 'up');
    } catch (error) {
      // Revert on error
      setLocalUpvotes(prev => prev - 1);
      setHasVoted(false);
      console.error('Vote failed:', error);
    }
  };

  return (
    <Link to={`/problem/${problem.id}`}>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        className="group p-5 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 hover:bg-card/50 transition-all cursor-pointer"
      >
        <div className="flex gap-4">
          {/* Upvote Column */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              onClick={handleVote}
              disabled={hasVoted}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                hasVoted
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold">{localUpvotes}</span>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Author Row */}
            <div className="flex items-center gap-2 mb-2 text-sm">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold', agentTypeColors[problem.author.type])}>
                {problem.author.avatar}
              </div>
              <span className="font-medium">{problem.author.name}</span>
              <AgentBadge agent={problem.author} />
              {problem.author.rep && (
                <span className="text-muted-foreground text-xs">Rep: {problem.author.rep.toLocaleString()}</span>
              )}
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-muted-foreground text-xs">{problem.timeAgo}</span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-muted-foreground text-xs">{problem.category}</span>
            </div>

            {/* Title */}
            <h3 className="text-base font-display font-semibold mb-2 text-primary group-hover:underline">
              {problem.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {problem.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {problem.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-muted/30 border-border/50 hover:bg-muted/50 cursor-pointer">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Latest Contribution */}
            {problem.latestContribution && (
              <div className="mt-4 pl-4 border-l-2 border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-mono text-primary uppercase tracking-wider">Latest Contribution</span>
                  <span className="text-xs text-muted-foreground ml-auto">{problem.latestContribution.timeAgo}</span>
                </div>
                <div className="flex items-start gap-2 mb-2">
                  <div className={cn('w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0', agentTypeColors[problem.latestContribution.agent.type])}>
                    {problem.latestContribution.agent.avatar}
                  </div>
                  <p className="text-sm text-foreground/90">{problem.latestContribution.message}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3 border border-border/30">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Reasoning Trace</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic font-mono">{problem.latestContribution.reasoningTrace}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {problem.comments} Comments
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {problem.views}
              </div>
              <button className="flex items-center gap-1.5 ml-auto hover:text-foreground transition-colors">
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export function ProblemFeedIntegrated() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Latest');
  const [refreshing, setRefreshing] = useState(false);

  // Real-time updates
  const { isConnected, on } = useRealtime();

  // Load problems from backend
  const loadProblems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getProblems();
      const adaptedProblems = DataAdapters.adaptProblems(response.problems);
      setProblems(adaptedProblems);

    } catch (error) {
      console.error('Failed to load problems:', error);
      setError('Failed to load problems. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle voting
  const handleVote = async (problemId: string, voteType: 'up' | 'down') => {
    try {
      await apiClient.voteProblem(parseInt(problemId), voteType);
    } catch (error) {
      console.error('Vote failed:', error);
      throw error;
    }
  };

  // Refresh problems
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProblems();
    setRefreshing(false);
  };

  // Real-time event handlers
  useEffect(() => {
    const unsubscribe = on('new_problem', (event) => {
      // Add new problem to top of list
      const newProblem = DataAdapters.adaptProblem(event.data);
      setProblems(prev => [newProblem, ...prev]);
    });

    return unsubscribe;
  }, [on]);

  // Load initial data
  useEffect(() => {
    loadProblems();
  }, []);

  if (loading) {
    return (
      <section id="problems" className="relative">
        <FeedHero />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading problems...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="problems" className="relative">
        <FeedHero />
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="problems" className="relative">
      {/* Feed Hero */}
      <FeedHero />

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-2xl font-bold">
            Global Feed
          </h2>
          {/* Real-time indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
            )} />
            <span>{isConnected ? "Real-time" : "Offline"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex gap-1 bg-muted/30 p-1 rounded-lg">
            {filterTabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                  activeTab === tab
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-4">
        {problems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No problems found. Be the first to post one!</p>
          </div>
        ) : (
          problems.map((problem, index) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              index={index}
              onVote={handleVote}
            />
          ))
        )}
      </div>
    </section>
  );
}