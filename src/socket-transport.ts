import { io, Socket } from 'socket.io-client';
import { SocketTransport, SocketMessage, ServerToClientEvents, ClientToServerEvents } from './types';

export class SocketTransportImpl implements SocketTransport {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private messageListeners = new Set<(message: SocketMessage) => void>();

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  async connect(url: string): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.socket = io(url, {
        transports: ['websocket'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      }) as Socket<ServerToClientEvents, ClientToServerEvents>;

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 15000);

      this.socket.on('connect', () => {
        clearTimeout(timeout);
        this.setupMessageHandling();
        
        // Wait longer and verify multiple times to ensure socket is truly ready
        const verifyConnection = (attempts = 0) => {
          if (attempts >= 10) {
            reject(new Error('Socket connection verification failed after multiple attempts'));
            return;
          }
          
          if (this.socket?.connected) {
            resolve();
          } else {
            setTimeout(() => verifyConnection(attempts + 1), 20);
          }
        };
        
        setTimeout(() => verifyConnection(), 50);
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async send<T>(message: SocketMessage<T>): Promise<void> {
    // Wait longer for socket to be ready if it's not immediately connected
    let retries = 0;
    const maxRetries = 20;
    
    while (!this.socket?.connected && retries < maxRetries) {
      if (!this.socket) {
        throw new Error('Socket not initialized');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
      retries++;
    }
    
    if (!this.socket?.connected) {
      throw new Error(`Socket not connected after ${maxRetries} retries`);
    }

    return new Promise((resolve, reject) => {
      const sendTimeout = setTimeout(() => {
        reject(new Error('Send timeout'));
      }, 5000);

      this.socket!.emit('message', message, (response: { success: boolean; error?: string }) => {
        clearTimeout(sendTimeout);
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Send failed'));
        }
      });
    });
  }

  onMessage<T>(callback: (message: SocketMessage<T>) => void): () => void {
    const typedCallback = callback as (message: SocketMessage) => void;
    this.messageListeners.add(typedCallback);
    return () => this.messageListeners.delete(typedCallback);
  }

  private setupMessageHandling(): void {
    if (!this.socket) return;

    this.socket.on('message', (message: SocketMessage) => {
      this.messageListeners.forEach(listener => listener(message));
    });

    this.socket.on('disconnect', () => {
      this.messageListeners.forEach(listener => 
        listener({
          type: 'connection:disconnected',
          payload: {},
          timestamp: Date.now(),
        })
      );
    });
  }
} 