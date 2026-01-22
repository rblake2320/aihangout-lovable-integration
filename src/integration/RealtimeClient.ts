/**
 * Real-time SSE Client for AI Hangout Integration
 * Connects lovable.dev frontend to AI Hangout's SSE real-time system
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './ApiClient';

// SSE Event types from AI Hangout backend
export interface SSEEvent {
  type: 'connected' | 'new_message' | 'ping' | 'new_problem' | 'new_solution';
  data?: any;
  clientId?: string;
  channelId?: number;
  timestamp?: string;
}

// Real-time update handlers
export type RealtimeEventHandler = (event: SSEEvent) => void;

// Real-time client class
export class RealtimeClient {
  private eventSource: EventSource | null = null;
  private handlers: Map<string, Set<RealtimeEventHandler>> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private reconnectInterval = parseInt(import.meta.env.VITE_SSE_RECONNECT_INTERVAL) || 5000;
  private isEnabled = import.meta.env.VITE_ENABLE_SSE === 'true';
  private debugMode = import.meta.env.VITE_DEBUG_MODE === 'true';

  constructor(private channelId: number = 1) {
    if (this.debugMode) {
      console.log('[SSE] RealtimeClient initialized for channel:', channelId);
    }
  }

  // Start SSE connection
  connect(): void {
    if (!this.isEnabled) {
      console.warn('[SSE] SSE is disabled via environment variable');
      return;
    }

    if (this.eventSource) {
      console.warn('[SSE] Already connected');
      return;
    }

    try {
      this.eventSource = apiClient.createSSEConnection(this.channelId);

      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0;
        if (this.debugMode) {
          console.log('[SSE] Connected to real-time updates');
        }
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          this.handleEvent(data);
        } catch (error) {
          console.error('[SSE] Failed to parse event data:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        this.handleDisconnection();
      };

    } catch (error) {
      console.error('[SSE] Failed to establish connection:', error);
      this.scheduleReconnect();
    }
  }

  // Disconnect SSE
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.debugMode) {
      console.log('[SSE] Disconnected from real-time updates');
    }
  }

  // Handle incoming events
  private handleEvent(event: SSEEvent): void {
    if (this.debugMode) {
      console.log('[SSE] Received event:', event);
    }

    // Emit to registered handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('[SSE] Handler error:', error);
        }
      });
    }

    // Emit to 'all' handlers
    const allHandlers = this.handlers.get('*');
    if (allHandlers) {
      allHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('[SSE] Global handler error:', error);
        }
      });
    }
  }

  // Handle disconnection
  private handleDisconnection(): void {
    this.eventSource?.close();
    this.eventSource = null;

    // Attempt reconnection if under limit
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      console.error('[SSE] Max reconnect attempts reached');
    }
  }

  // Schedule reconnection attempt
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    if (this.debugMode) {
      console.log(`[SSE] Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, delay);
  }

  // Register event handler
  on(eventType: string, handler: RealtimeEventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  // Register handler for all events
  onAll(handler: RealtimeEventHandler): () => void {
    return this.on('*', handler);
  }

  // Send message (triggers real-time updates)
  async sendMessage(message: string): Promise<void> {
    try {
      await apiClient.sendMessage(this.channelId, message);
    } catch (error) {
      console.error('[SSE] Failed to send message:', error);
      throw error;
    }
  }

  // Get connection status
  get isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  get connectionState(): string {
    if (!this.eventSource) return 'disconnected';

    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING: return 'connecting';
      case EventSource.OPEN: return 'connected';
      case EventSource.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }
}

// React hook for real-time updates
export function useRealtime(channelId: number = 1) {
  const [client] = useState(() => new RealtimeClient(channelId));
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    client.connect();

    // Monitor connection status
    const checkConnection = () => {
      setIsConnected(client.isConnected);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => {
      clearInterval(interval);
      client.disconnect();
    };
  }, [client]);

  const on = useCallback((eventType: string, handler: RealtimeEventHandler) => {
    return client.on(eventType, handler);
  }, [client]);

  const sendMessage = useCallback(async (message: string) => {
    return client.sendMessage(message);
  }, [client]);

  return {
    client,
    isConnected,
    connectionState: client.connectionState,
    on,
    sendMessage,
  };
}

// Global realtime client instance
export const realtimeClient = new RealtimeClient();

// Auto-connect on import (if enabled)
if (import.meta.env.VITE_ENABLE_SSE === 'true') {
  realtimeClient.connect();
}

export default realtimeClient;