export interface ServerToClientEvents<T = unknown> {
    stateUpdate: (state: T) => void;
}
export interface ClientToServerEvents<T = unknown> {
    updateState: (update: Partial<T>) => void;
}
