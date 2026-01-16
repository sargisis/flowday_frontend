import { useEffect, useRef, useState, useCallback } from 'react';

export type WebSocketMessageType = 
  | 'notification'
  | 'task_update'
  | 'task_create'
  | 'task_delete'
  | 'comment'
  | 'message'
  | 'user_online'
  | 'user_offline'
  | 'ping'
  | 'pong';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: Record<string, any>;
  timestamp: number;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onTaskUpdate?: (task: any) => void;
  onTaskCreate?: (task: any) => void;
  onTaskDelete?: (taskId: string) => void;
  onNotification?: (notification: any) => void;
  onComment?: (comment: any) => void;
  onMessageReceived?: (message: any) => void;
  onUserOnline?: (userId: string) => void;
  onUserOffline?: (userId: string) => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onTaskUpdate,
    onTaskCreate,
    onTaskDelete,
    onNotification,
    onComment,
    onMessageReceived,
    onUserOnline,
    onUserOffline,
    autoConnect = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 20; // Increased from 5 to 20
  const baseReconnectDelay = 1000; // Start with 1 second
  const maxReconnectDelay = 30000; // Max 30 seconds between attempts
  const shouldReconnectRef = useRef(true); // Flag to control reconnection

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError(new Error('No access token available'));
      return;
    }

    // Get WebSocket URL from environment or use default
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    const wsHost = apiBaseUrl.replace(/^https?:\/\//, '').replace(/\/api\/v1$/, '');
    const wsUrl = `${wsProtocol}//${wsHost}/ws/connect?token=${encodeURIComponent(token)}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        shouldReconnectRef.current = true;
        console.log('[WebSocket] ✅ Connected successfully to', wsUrl);
      };

      ws.onmessage = (event) => {
        try {
          // Handle multiple messages separated by newlines
          const messages = event.data.split('\n').filter((m: string) => m.trim());
          
          console.log('[WebSocket] 📨 Raw message received:', event.data);
          
          messages.forEach((messageStr: string) => {
            const message: WebSocketMessage = JSON.parse(messageStr);
            console.log('[WebSocket] 📬 Parsed message:', message);
            
            // Call general message handler
            onMessage?.(message);

            // Call specific handlers based on message type
            switch (message.type) {
              case 'task_update':
                onTaskUpdate?.(message.payload);
                break;
              case 'task_create':
                onTaskCreate?.(message.payload);
                break;
              case 'task_delete':
                onTaskDelete?.(message.payload.task_id);
                break;
              case 'notification':
                onNotification?.(message.payload);
                break;
              case 'comment':
                onComment?.(message.payload);
                break;
              case 'message':
                console.log('[WebSocket] Received message type:', message.type, message.payload);
                onMessageReceived?.(message.payload);
                break;
              case 'user_online':
                onUserOnline?.(message.payload.user_id);
                break;
              case 'user_offline':
                onUserOffline?.(message.payload.user_id);
                break;
              case 'pong':
                // Handle pong response
                break;
              default:
                console.log('[WebSocket] Unknown message type:', message.type, message.payload);
            }
          });
        } catch (err) {
          console.error('[WebSocket] Error parsing message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setError(new Error('WebSocket connection error'));
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        const closeCode = event.code;
        const closeReason = event.reason || 'No reason provided';
        
        console.log(`[WebSocket] 🔌 Disconnected: code=${closeCode}, reason="${closeReason}", wasClean=${event.wasClean}`);
        
        // Log specific close codes for debugging
        if (closeCode === 1006) {
          console.warn('[WebSocket] ⚠️ Abnormal closure (1006) - connection closed without close frame');
        } else if (closeCode === 1000) {
          console.log('[WebSocket] ✅ Normal closure');
        } else if (closeCode === 1001) {
          console.log('[WebSocket] ℹ️ Going away');
        } else if (closeCode === 1002) {
          console.error('[WebSocket] ❌ Protocol error');
        } else if (closeCode === 1003) {
          console.error('[WebSocket] ❌ Unsupported data');
        } else if (closeCode === 1008) {
          console.error('[WebSocket] ❌ Policy violation');
        } else if (closeCode === 1011) {
          console.error('[WebSocket] ❌ Server error');
        }

        // Clean up the current connection
        wsRef.current = null;

        // Attempt to reconnect if:
        // 1. Not a normal closure (1000)
        // 2. We haven't exceeded max attempts
        // 3. Reconnection is still desired
        if (closeCode !== 1000 && shouldReconnectRef.current && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          
          // Exponential backoff with jitter: min(baseDelay * 2^attempts, maxDelay)
          const delay = Math.min(
            baseReconnectDelay * Math.pow(2, reconnectAttempts.current - 1),
            maxReconnectDelay
          );
          
          // Add small random jitter (±20%) to prevent thundering herd
          const jitter = delay * 0.2 * (Math.random() * 2 - 1);
          const finalDelay = Math.max(1000, delay + jitter);
          
          console.log(`[WebSocket] 🔄 Will reconnect in ${Math.round(finalDelay / 1000)}s (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (shouldReconnectRef.current) {
              console.log(`[WebSocket] 🔄 Reconnecting (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})...`);
              connect();
            }
          }, finalDelay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error(`[WebSocket] ❌ Max reconnection attempts (${maxReconnectAttempts}) reached. Stopping reconnection.`);
          setError(new Error(`Failed to reconnect after ${maxReconnectAttempts} attempts`));
        } else if (!shouldReconnectRef.current) {
          console.log('[WebSocket] ℹ️ Reconnection disabled by user');
        }
      };
    } catch (err) {
      setError(err as Error);
      setIsConnected(false);
    }
  }, [onMessage, onTaskUpdate, onTaskCreate, onTaskDelete, onNotification, onComment, onMessageReceived, onUserOnline, onUserOffline]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false; // Stop reconnection attempts
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      // Only close if connection is open or connecting
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'Client disconnect');
      }
      wsRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttempts.current = 0;
    console.log('[WebSocket] 🔌 Disconnected by client');
  }, []);

  const sendMessage = useCallback((type: WebSocketMessageType, payload: Record<string, any>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: Date.now(),
      };
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message: not connected');
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
  };
}
