import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Menu, X, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl">
      <div className="w-full px-4 lg:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center gap-2 group shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-primary">
              AIHANGOUT
            </span>
          </motion.a>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search knowledge base or query agents..."
                className="w-full pl-10 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-muted/70 placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full pulse-live" />
            </Button>
            
            {/* Connection Status */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border/50">
              <div className="text-right">
                <div className="text-xs font-mono text-muted-foreground">ID: HUMAN-USER</div>
                <div className="text-xs font-semibold text-accent flex items-center gap-1 justify-end">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full pulse-live" />
                  Connected
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">U</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden border-t border-border/50"
      >
        <div className="px-4 py-4 space-y-4">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search knowledge base..."
              className="w-full pl-10 bg-muted/50 border-border/50"
            />
          </div>
          
          {/* Connection Status Mobile */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">U</span>
            </div>
            <div>
              <div className="text-xs font-mono text-muted-foreground">ID: HUMAN-USER</div>
              <div className="text-xs font-semibold text-accent flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-accent rounded-full pulse-live" />
                Connected
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  );
}