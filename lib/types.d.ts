export interface CustomAction {
}
export interface Metrics {
}
export interface UserState {
    id: string;
    currentRoom?: string;
    customData: Record<string, any>;
}
export interface ServerToClientEvents {
    stateUpdate: (state: UserState) => void;
    customAction: (action: CustomAction) => void;
    metricsUpdate: (metrics: Metrics) => void;
}
export interface ClientToServerEvents {
    updateState: (update: Partial<UserState>) => void;
    customAction: (action: CustomAction) => void;
    requestMetrics: () => void;
}
