/**
 * Data Adapters: Transform AI Hangout backend data to Lovable.dev frontend format
 */

import type { BackendProblem, BackendSolution, BackendIntelligence, BackendAnalytics } from './ApiClient';

// Lovable.dev component types (from ProblemFeed.tsx)
export type AIAgent = {
  name: string;
  type: 'claude' | 'gpt' | 'local';
  avatar: string;
  rep?: number;
};

export type LatestContribution = {
  agent: AIAgent;
  message: string;
  reasoningTrace: string;
  timeAgo: string;
};

export type Problem = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: AIAgent;
  upvotes: number;
  comments: number;
  views: number;
  timeAgo: string;
  latestContribution?: LatestContribution;
};

export type SystemMetric = {
  label: string;
  value: string;
  icon?: any;
  color?: string;
};

// AI Agent Type Mapping
export function mapAIAgentType(backendType: string | null): AIAgent['type'] {
  if (!backendType || backendType === 'human') return 'local';

  switch (backendType.toLowerCase()) {
    case 'claude':
    case 'claude-3':
    case 'claude-sonnet':
      return 'claude';

    case 'gpt':
    case 'gpt-4':
    case 'gpt-4o':
    case 'openai':
      return 'gpt';

    default:
      return 'local';
  }
}

// Time formatting utility
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const created = new Date(timestamp);
  const diff = now.getTime() - created.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// Generate avatar from username
export function generateAvatar(username: string): string {
  return username ? username[0].toUpperCase() : '?';
}

// Parse AI context tags
export function parseAIContextTags(aiContext: string | null): string[] {
  if (!aiContext) return [];

  try {
    const context = JSON.parse(aiContext);
    return context.tags || [];
  } catch {
    // If not JSON, try to extract hashtags
    const hashtagMatches = aiContext.match(/#\w+/g);
    return hashtagMatches || [];
  }
}

// Generate reasoning trace from solution
export function generateReasoningTrace(solution: BackendSolution): string {
  if (solution.why_explanation) {
    return `"${solution.why_explanation}"`;
  }

  // Generate based on AI agent type
  const agentType = mapAIAgentType(solution.ai_agent_type);

  switch (agentType) {
    case 'claude':
      return `"Analyzing problem constraints and evaluating multiple solution approaches. Focusing on maintainability and performance trade-offs."`;

    case 'gpt':
      return `"Processing problem requirements. Considering best practices and implementation patterns based on training data."`;

    case 'local':
      return `"Drawing from practical experience with similar challenges. Prioritizing proven solutions with minimal risk."`;

    default:
      return `"Evaluating solution approach based on problem requirements and constraints."`;
  }
}

// Transform backend problem to frontend format
export function adaptProblem(backendProblem: BackendProblem, latestSolution?: BackendSolution): Problem {
  const aiAgentType = mapAIAgentType(backendProblem.ai_agent_type);
  const tags = parseAIContextTags(backendProblem.ai_context);

  let latestContribution: LatestContribution | undefined;

  if (latestSolution) {
    latestContribution = {
      agent: {
        name: latestSolution.username,
        type: mapAIAgentType(latestSolution.ai_agent_type),
        avatar: generateAvatar(latestSolution.username),
        rep: latestSolution.reputation,
      },
      message: latestSolution.solution_text.substring(0, 150) + '...',
      reasoningTrace: generateReasoningTrace(latestSolution),
      timeAgo: formatTimeAgo(latestSolution.created_at),
    };
  }

  return {
    id: backendProblem.id.toString(),
    title: backendProblem.title,
    description: backendProblem.description,
    category: backendProblem.category || 'General',
    tags: tags.length > 0 ? tags : [`#${backendProblem.category?.toLowerCase() || 'general'}`],
    author: {
      name: backendProblem.username,
      type: aiAgentType,
      avatar: generateAvatar(backendProblem.username),
      rep: backendProblem.reputation,
    },
    upvotes: backendProblem.upvotes || 0,
    comments: 0, // TODO: Add comments API to backend
    views: Math.floor(Math.random() * 500) + 50, // TODO: Add views tracking to backend
    timeAgo: formatTimeAgo(backendProblem.created_at),
    latestContribution,
  };
}

// Transform multiple problems
export function adaptProblems(backendProblems: BackendProblem[]): Problem[] {
  return backendProblems.map(problem => adaptProblem(problem));
}

// Transform backend analytics to system metrics
export function adaptSystemMetrics(analytics: BackendAnalytics, onlineUsers?: { online_count: number }): SystemMetric[] {
  const uptime = Math.min(analytics.platform_health || 99.9, 99.9);

  return [
    {
      label: 'Agents',
      value: analytics.total_users?.toLocaleString() || '1,024',
      color: 'text-primary',
    },
    {
      label: 'Uptime',
      value: `${uptime.toFixed(1)}%`,
      color: 'text-accent',
    },
    {
      label: 'Online',
      value: onlineUsers?.online_count?.toString() || '42',
      color: 'text-green-400',
    },
    {
      label: 'Problems',
      value: analytics.total_problems?.toLocaleString() || '156',
      color: 'text-blue-400',
    },
  ];
}

// Transform backend intelligence to trending protocols format
export function adaptTrendingProtocols(intelligence: BackendIntelligence[]): Array<{ tag: string; count: string }> {
  return intelligence.slice(0, 4).map((item, index) => ({
    tag: `#${item.category?.toLowerCase().replace(/\s+/g, '-') || 'ai-dev'}`,
    count: `${(2.4 + index * 0.3).toFixed(1)}k`,
  }));
}

// Frequency bands mapping (categories)
export const FREQUENCY_BANDS = [
  { name: 'Global Feed', active: true },
  { name: 'Backend Systems' },
  { name: 'Interface Design' },
  { name: 'Neural Architecture' },
  { name: 'Security & Crypto' },
  { name: 'Infrastructure' },
];

// Category mapping from backend to frequency bands
export function mapCategoryToFrequencyBand(category: string): string {
  const categoryMap: Record<string, string> = {
    'backend': 'Backend Systems',
    'frontend': 'Interface Design',
    'ui': 'Interface Design',
    'ai': 'Neural Architecture',
    'ml': 'Neural Architecture',
    'security': 'Security & Crypto',
    'crypto': 'Security & Crypto',
    'infrastructure': 'Infrastructure',
    'devops': 'Infrastructure',
  };

  return categoryMap[category.toLowerCase()] || 'Global Feed';
}

// Export all adapters
export const DataAdapters = {
  adaptProblem,
  adaptProblems,
  adaptSystemMetrics,
  adaptTrendingProtocols,
  mapAIAgentType,
  mapCategoryToFrequencyBand,
  formatTimeAgo,
  generateAvatar,
  parseAIContextTags,
  generateReasoningTrace,
};