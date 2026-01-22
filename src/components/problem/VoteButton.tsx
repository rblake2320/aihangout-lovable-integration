import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteButtonProps {
  count: number;
  hasVoted: boolean;
  onVote: () => void;
  size?: 'sm' | 'lg';
}

export function VoteButton({ count, hasVoted, onVote, size = 'sm' }: VoteButtonProps) {
  const isLarge = size === 'lg';
  
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onVote}
        className={cn(
          'rounded-lg transition-all duration-200',
          isLarge ? 'p-2 border border-border/50' : 'p-1',
          hasVoted 
            ? 'bg-primary/20 text-primary border-primary/50' 
            : 'hover:bg-muted/50 text-muted-foreground hover:text-primary'
        )}
      >
        <motion.div
          animate={hasVoted ? { y: [0, -4, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <ArrowUp className={cn(isLarge ? 'w-5 h-5' : 'w-4 h-4')} />
        </motion.div>
      </motion.button>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={cn(
            'font-bold tabular-nums',
            isLarge ? 'text-lg' : 'text-sm',
            hasVoted && 'text-primary'
          )}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
