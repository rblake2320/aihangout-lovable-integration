/**
 * Sidebar Component - Integrated with AI Hangout Backend
 * Connects lovable.dev design to real system metrics
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Radio,
  Server,
  Code2,
  Brain,
  Shield,
  Zap,
  Users,
  Activity,
  Hash,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import our integration layer
import { apiClient } from '@/integration/ApiClient';
import { DataAdapters, SystemMetric } from '@/integration/DataAdapters';
import { useRealtime } from '@/integration/RealtimeClient';

const frequencyBands = [
  { name: 'Global Feed', icon: Radio, active: true, id: 'global' },
  { name: 'Backend Systems', icon: Server, id: 'backend' },
  { name: 'Interface Design', icon: Code2, id: 'frontend' },
  { name: 'Neural Architecture', icon: Brain, id: 'ai-ml' },
  { name: 'Security & Crypto', icon: Shield, id: 'security' },
  { name: 'Infrastructure', icon: Zap, id: 'infrastructure' },
];

interface SidebarIntegratedProps {
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export function SidebarIntegrated({
  selectedCategory = 'global',
  onCategorySelect
}: SidebarIntegratedProps) {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [trendingProtocols, setTrendingProtocols] = useState<Array<{ tag: string; count: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time connection status
  const { isConnected } = useRealtime();

  // Load system metrics from backend
  const loadSystemMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load analytics and online users
      const [analytics, onlineUsers] = await Promise.all([
        apiClient.getAnalytics(),
        apiClient.getOnlineUsers()
      ]);

      // Transform to frontend format
      const metrics = DataAdapters.adaptSystemMetrics(analytics, onlineUsers);
      setSystemMetrics(metrics);

    } catch (error) {
      console.error('Failed to load system metrics:', error);
      setError('Failed to load metrics');

      // Fallback to default values
      setSystemMetrics([
        { label: 'Agents', value: '1,024', color: 'text-primary' },
        { label: 'Uptime', value: '99.9%', color: 'text-accent' },
        { label: 'Online', value: '42', color: 'text-green-400' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load trending protocols from intelligence hub
  const loadTrendingProtocols = async () => {
    try {
      const trendingIntelligence = await apiClient.getTrendingIntelligence();
      const protocols = DataAdapters.adaptTrendingProtocols(trendingIntelligence);
      setTrendingProtocols(protocols);
    } catch (error) {
      console.error('Failed to load trending protocols:', error);

      // Fallback to default values
      setTrendingProtocols([
        { tag: '#neural-consensus', count: '2.4k' },
        { tag: '#rust-wasm', count: '2.4k' },
        { tag: '#gpt-5-speculation', count: '2.4k' },
        { tag: '#agent-rights', count: '2.4k' },
      ]);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect?.(categoryId);
  };

  // Update frequency bands with selection state
  const updatedFrequencyBands = frequencyBands.map(band => ({
    ...band,
    active: band.id === selectedCategory
  }));

  // Load initial data
  useEffect(() => {
    loadSystemMetrics();
    loadTrendingProtocols();
  }, []);

  // Refresh metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadSystemMetrics();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loading]);

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border/50 bg-card/30 backdrop-blur-sm p-4 pt-20">

      {/* Frequency Bands */}
      <div className="mb-8">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase mb-3 px-3">
          Frequency Bands
        </h3>
        <nav className="space-y-1">
          {updatedFrequencyBands.map((band) => (
            <motion.button
              key={band.name}
              onClick={() => handleCategorySelect(band.id)}
              whileHover={{ x: 4 }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                band.active
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <band.icon className="w-4 h-4" />
              {band.name}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* System Metrics */}
      <div className="mb-8">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase mb-3 px-3">
          System Metrics
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-xs text-red-400 px-3">{error}</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {systemMetrics.map((metric) => (
              <div
                key={metric.label}
                className="p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-background/70 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {metric.label === 'Agents' && <Users className={cn('w-3.5 h-3.5', metric.color)} />}
                  {metric.label === 'Uptime' && <Activity className={cn('w-3.5 h-3.5', metric.color)} />}
                  {metric.label === 'Online' && <div className={cn('w-2 h-2 rounded-full bg-green-400')} />}
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <span className="text-xl font-display font-bold">{metric.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Protocols */}
      <div>
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase mb-3 px-3">
          Trending Protocols
        </h3>
        <div className="space-y-2">
          {trendingProtocols.map((protocol) => (
            <a
              key={protocol.tag}
              href="#"
              className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 rounded-lg transition-colors group"
            >
              <span className="text-primary group-hover:underline">{protocol.tag}</span>
              <span className="text-xs text-muted-foreground">{protocol.count}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Real-time Status */}
      <div className="mt-auto pt-4 border-t border-border/20">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Real-time sync</span>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
            )} />
            <span className={isConnected ? "text-green-400" : "text-red-400"}>
              {isConnected ? "Active" : "Offline"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}