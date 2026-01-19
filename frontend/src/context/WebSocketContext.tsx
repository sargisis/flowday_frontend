import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useWebSocket, type WebSocketMessage, type WebSocketMessageType } from '../hooks/useWebSocket';

interface WebSocketContextType {
  isConnected: boolean;
  error: Error | null;
  sendMessage: (type: WebSocketMessageType, payload: Record<string, any>) => void;
  subscribe: (type: string, handler: (message: WebSocketMessage) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Global message handlers registry
const messageHandlers = new Map<string, Set<(message: WebSocketMessage) => void>>();

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const handlersRef = useRef(messageHandlers);

  const { isConnected: wsConnected, error: wsError, sendMessage, connect, disconnect } = useWebSocket({
    autoConnect: false, // Manual control
    onMessage: (message) => {
      // Broadcast to all handlers for this message type
      const handlers = handlersRef.current.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message);
          } catch (err) {
            console.error(`[WebSocket] Error in handler for ${message.type}:`, err);
          }
        });
      }
    },
  });

  // Initialize connection once
  useEffect(() => {
    connect();
    return () => {
      // Don't disconnect on unmount - keep connection alive
      // disconnect();
    };
  }, [connect]);

  // Sync state
  useEffect(() => {
    setIsConnected(wsConnected);
  }, [wsConnected]);

  useEffect(() => {
    setError(wsError);
  }, [wsError]);

  // Subscribe to message types
  const subscribe = useCallback((type: string, handler: (message: WebSocketMessage) => void) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = handlersRef.current.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          handlersRef.current.delete(type);
        }
      }
    };
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    error,
    sendMessage,
    subscribe,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
