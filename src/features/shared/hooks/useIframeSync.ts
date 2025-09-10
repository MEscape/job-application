import { useEffect, useRef, useCallback, useState } from 'react';
import { useScene } from '@/features/home/stores/hooks';

export type IframeViewType = 'lock' | 'login' | 'loading';

interface IframeSyncState {
  animationPhase: string;
  isAnimating: boolean;
  canMoveToDesk: boolean;
  canReturnHome: boolean;
  view: IframeViewType;
  interactive: boolean;
}

interface IframeMessage {
  type: 'STATE_SYNC' | 'ACTION';
  payload: any;
}

interface IframeActionMessage extends IframeMessage {
  type: 'ACTION';
  payload: {
    action: 'START_ANIMATION' | 'COMPLETE_ANIMATION' | 'SET_ANIMATION_PHASE';
    data?: any;
  };
}

/**
 * Simplified iframe synchronization hook
 * Handles bidirectional communication between parent and iframe
 */
export function useIframeSync(view: IframeViewType, interactive: boolean) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { 
    animationPhase, 
    isAnimating, 
    canMoveToDesk, 
    canReturnHome,
    startAnimation,
    completeAnimation,
    setAnimationPhase
  } = useScene();
  // Send state to iframe when it changes
  const syncState = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const state: IframeSyncState = {
      animationPhase,
      isAnimating,
      canMoveToDesk,
      canReturnHome,
      view,
      interactive
    };

    const message: IframeMessage = {
      type: 'STATE_SYNC',
      payload: state
    };

    try {
      iframe.contentWindow.postMessage(message, window.location.origin);
    } catch (error) {
      console.warn('Failed to sync state to iframe:', error);
    }
  }, [animationPhase, isAnimating, canMoveToDesk, canReturnHome, view, interactive]);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      const message = event.data as IframeMessage;
      if (!message?.type) return;

      if (message.type === 'ACTION') {
        const actionMessage = message as IframeActionMessage;
        const { action, data } = actionMessage.payload;

        switch (action) {
          case 'START_ANIMATION':
            startAnimation(data);
            break;
          case 'COMPLETE_ANIMATION':
            completeAnimation();
            break;
          case 'SET_ANIMATION_PHASE':
            setAnimationPhase(data);
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [startAnimation, completeAnimation, setAnimationPhase]);

  // Sync state when dependencies change
  useEffect(() => {
    syncState();
  }, [syncState]);

  // Sync state when iframe loads
  const handleIframeLoad = useCallback(() => {
    // Small delay to ensure iframe is ready
    setTimeout(syncState, 100);
  }, [syncState]);

  return {
    iframeRef,
    handleIframeLoad
  };
}

/**
 * Hook for iframe content to send actions to parent
 */
export function useIframeActions() {
  const sendAction = useCallback((action: string, data?: any) => {
    if (typeof window === 'undefined' || !window.parent) return;

    const message: IframeActionMessage = {
      type: 'ACTION',
      payload: { action: action as IframeActionMessage['payload']['action'], data }
    };

    try {
      window.parent.postMessage(message, window.location.origin);
    } catch (error) {
      console.warn('Failed to send action to parent:', error);
    }
  }, []);

  return {
    startAnimation: (data?: any) => sendAction('START_ANIMATION', data),
    completeAnimation: () => sendAction('COMPLETE_ANIMATION'),
    setAnimationPhase: (phase: string) => sendAction('SET_ANIMATION_PHASE', phase)
  };
}

/**
 * Hook for iframe content to receive state from parent
 */
export function useIframeState() {
  const [state, setState] = useState<IframeSyncState | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const message = event.data as IframeMessage;
      if (message?.type === 'STATE_SYNC') {
        setState(message.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return state;
}