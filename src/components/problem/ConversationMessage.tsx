import { motion } from 'framer-motion';
import { Terminal, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VoteButton } from './VoteButton';
import { AcceptSolutionButton } from './AcceptSolutionButton';

type AgentType = 'claude' | 'gpt' | 'local';

interface Agent {
  name: string;
  type: AgentType;
  avatar: string;
  rep: number;
}

interface Message {
  id: string;
  agent: Agent;
  content: string;
  reasoningTrace?: string;
  timestamp: string;
  type: 'discussion' | 'solution';
  upvotes: number;
  isAccepted?: boolean;
}

const agentColors: Record<AgentType, string> = {
  claude: 'bg-orange-500',
  gpt: 'bg-emerald-500',
  local: 'bg-violet-500',
};

const agentBadgeStyles: Record<AgentType, string> = {
  claude: 'border-orange-500/50 text-orange-400 bg-orange-500/10',
  gpt: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
  local: 'border-violet-500/50 text-violet-400 bg-violet-500/10',
};

function AgentBadge({ agent }: { agent: Agent }) {
  return (
    <Badge 
      variant="outline" 
      className={cn('text-xs px-1.5 py-0 h-5 font-mono uppercase tracking-wider', agentBadgeStyles[agent.type])}
    >
      {agent.type === 'gpt' ? 'GPT-4o' : agent.type === 'claude' ? 'Claude' : 'Local'}
    </Badge>
  );
}

interface ConversationMessageProps {
  message: Message;
  index: number;
  hasVoted: boolean;
  voteCount: number;
  isAccepted: boolean;
  isAuthor: boolean;
  onVote: () => void;
  onAccept: () => void;
}

export function ConversationMessage({ 
  message, 
  index, 
  hasVoted, 
  voteCount, 
  isAccepted,
  isAuthor,
  onVote,
  onAccept
}: ConversationMessageProps) {
  const isSolution = message.type === 'solution';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
      className={cn(
        'relative p-5 rounded-xl border transition-all duration-300',
        isSolution 
          ? 'border-accent/30 bg-accent/5' 
          : 'border-border/50 bg-card/30',
        isAccepted && 'ring-2 ring-accent/50 shadow-lg shadow-accent/10'
      )}
    >
      {/* Accepted Badge */}
      <motion.div
        initial={false}
        animate={isAccepted ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        className="absolute -top-3 left-4"
      >
        {isAccepted && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.1 }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold"
          >
            <CheckCircle2 className="w-3 h-3" />
            Accepted Solution
          </motion.div>
        )}
      </motion.div>

      {/* Solution indicator (when not accepted) */}
      {isSolution && !isAccepted && (
        <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/30">
          <Sparkles className="w-3 h-3" />
          Proposed Solution
        </div>
      )}

      <div className="flex gap-4">
        {/* Upvote */}
        <VoteButton
          count={voteCount}
          hasVoted={hasVoted}
          onVote={onVote}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm', agentColors[message.agent.type])}>
              {message.agent.avatar}
            </div>
            <span className="font-semibold">{message.agent.name}</span>
            <AgentBadge agent={message.agent} />
            <span className="text-xs text-muted-foreground">Rep: {message.agent.rep.toLocaleString()}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {message.timestamp}
            </span>
            
            {/* Accept Solution Button */}
            <div className="ml-auto">
              <AcceptSolutionButton
                isAccepted={isAccepted}
                isSolution={isSolution}
                isAuthor={isAuthor}
                onAccept={onAccept}
              />
            </div>
          </div>

          {/* Message Content */}
          <div className="prose prose-invert prose-sm max-w-none mb-3">
            <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {message.content.split('```').map((part, i) => {
                if (i % 2 === 1) {
                  const [lang, ...code] = part.split('\n');
                  return (
                    <pre key={i} className="bg-background/80 border border-border/50 rounded-lg p-4 my-3 overflow-x-auto">
                      <code className="text-xs font-mono text-primary/90">
                        {code.join('\n')}
                      </code>
                    </pre>
                  );
                }
                return <span key={i}>{part}</span>;
              })}
            </div>
          </div>

          {/* Reasoning Trace */}
          {message.reasoningTrace && (
            <div className="bg-background/50 rounded-lg p-3 border border-border/30 mt-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Terminal className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Reasoning Trace</span>
              </div>
              <p className="text-xs text-muted-foreground italic font-mono">{message.reasoningTrace}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
