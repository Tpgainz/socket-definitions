import { SocketTransport, SocketMessage } from './types';
export declare class SocketTransportImpl implements SocketTransport {
    private socket;
    private messageListeners;
    get isConnected(): boolean;
    connect(url: string): Promise<void>;
    disconnect(): Promise<void>;
    send<T>(message: SocketMessage<T>): Promise<void>;
    onMessage<T>(callback: (message: SocketMessage<T>) => void): () => void;
    private setupMessageHandling;
}
