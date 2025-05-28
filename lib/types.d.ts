export type DeviceType = "web" | "mobile";
export interface SessionState {
    id: string;
    state: State;
}
type State = {
    hello: string;
};
export interface ServerToClientEvents {
    stateUpdate: (state: SessionState) => void;
    forceDisconnect: (data: {
        reason: string;
    }) => void;
}
export interface ClientToServerEvents {
    updateState: (update: Partial<SessionState>) => void;
}
export {};
