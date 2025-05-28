import { useEffect, useState, useCallback, useRef } from 'react';
import {
  CallService,
  CallState,
  ConnectionState,
  CallRequest,
  EndCallRequest,
  Platform,
  CALL_EVENTS,
  CONNECTION_EVENTS,
} from './types';
import { CallServiceImpl } from './call-service';
import { SocketTransportImpl } from './socket-transport';

const serviceCache = new Map<string, CallService>();

export function useCallService(socketUrl: string, platform: Platform, nativeService?: any) {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: CONNECTION_EVENTS.DISCONNECTED,
    userId: null,
    platform: null,
  });

  const [callState, setCallState] = useState<CallState>({
    session: null,
    status: CALL_EVENTS.CALL_ENDED,
  });

  const serviceRef = useRef<CallService | null>(null);

  useEffect(() => {
    if (!serviceCache.has(socketUrl)) {
      const transport = new SocketTransportImpl();
      const service = new CallServiceImpl(transport, socketUrl, nativeService);
      serviceCache.set(socketUrl, service);
    }

    serviceRef.current = serviceCache.get(socketUrl)!;
    const service = serviceRef.current;

    setConnectionState(service.connectionState);
    setCallState(service.callState);

    const unsubscribeConnection = service.onConnectionChange(setConnectionState);
    const unsubscribeCall = service.onCallChange(setCallState);

    return () => {
      unsubscribeConnection();
      unsubscribeCall();
    };
  }, [socketUrl, nativeService]);

  const connect = useCallback(async (userId: string) => {
    if (!serviceRef.current) return;
    await serviceRef.current.connect(userId, platform);
  }, [platform]);

  const disconnect = useCallback(async () => {
    if (!serviceRef.current) return;
    await serviceRef.current.disconnect();
  }, []);

  const initiateCall = useCallback(async (phoneNumber: string) => {
    if (!serviceRef.current) return { success: false, error: 'Service not available' };
    
    const request: CallRequest = { phoneNumber, platform };
    return await serviceRef.current.initiateCall(request);
  }, [platform]);

  const endCall = useCallback(async (reason?: 'user' | 'timeout' | 'error') => {
    if (!serviceRef.current || !callState.session) return;
    
    const request: EndCallRequest = { 
      sessionId: callState.session.id, 
      reason 
    };
    await serviceRef.current.endCall(request);
  }, [callState.session]);

  return {
    connectionState,
    callState,
    connect,
    disconnect,
    initiateCall,
    endCall,
    isConnected: connectionState.status === CONNECTION_EVENTS.CONNECTED,
    isInCall: callState.status === CALL_EVENTS.CALL_ANSWERED,
    isRinging: callState.status === CALL_EVENTS.CALL_RINGING,
  };
}

export function useCallAudio(callState: CallState) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    audioRef.current = new Audio('/ring.mp3');
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (callState.status === CALL_EVENTS.CALL_RINGING) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [callState.status]);
} 