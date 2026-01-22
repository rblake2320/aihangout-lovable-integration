import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AcceptSolutionButtonProps {
  isAccepted: boolean;
  isSolution: boolean;
  isAuthor: boolean;
  onAccept: () => void;
}

export function AcceptSolutionButton({ 
  isAccepted, 
  isSolution, 
  isAuthor, 
  onAccept 
}: AcceptSolutionButtonProps) {
  if (!isSolution) return null;
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onAccept}
      disabled={!isAuthor && !isAccepted}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300',
        isAccepted
          ? 'bg-accent text-accent-foreground cursor-default'
          : isAuthor
            ? 'bg-muted/50 hover:bg-accent/20 text-muted-foreground hover:text-accent border border-dashed border-muted-foreground/30 hover:border-accent/50'
            : 'bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50'
      )}
    >
      <AnimatePresence mode="wait">
        {isAccepted ? (
          <motion.div
            key="accepted"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <CheckCircle2 className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div
            key="not-accepted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Circle className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
      <span>{isAccepted ? 'Accepted' : isAuthor ? 'Accept Solution' : 'Not Accepted'}</span>
    </motion.button>
  );
}
