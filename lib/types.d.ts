export interface SessionState {
    id: string;
    state: Record<string, any>;
}
export type DeviceType = "web" | "mobile";
export interface ConnectionConflict {
    userId: string;
    deviceType: DeviceType;
    existingSocketId: string;
    newSocketId: string;
}
export interface ServerToClientEvents {
    stateUpdate: (state: SessionState) => void;
    connectionConflict: (conflict: ConnectionConflict) => void;
    forceDisconnect: (reason: string) => void;
}
export interface ClientToServerEvents {
    updateState: (update: Partial<SessionState>) => void;
    forceConnection: (deviceType: DeviceType) => void;
}
