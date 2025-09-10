import {DEFAULT_WINDOW_SIZE, Position, Size, WINDOW_OFFSET} from "@/features/desktop/constants/window";
import React from "react";

export interface WindowState {
    id: string;
    title: string;
    isMinimized: boolean;
    isMaximized: boolean;
    isFullscreen: boolean;
    position: Position;
    size: Size;
    zIndex: number;
    content?: React.ReactNode;
}

export interface WindowStore {
    windows: WindowState[];
    focusedWindowId: string | null;
    nextId: number;
}

export interface WindowActions {
    addWindow: (config: Partial<Omit<WindowState, 'id' | 'zIndex'>>) => string;
    updateWindow: (id: string, updates: Partial<WindowState>) => void;
    removeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
    toggleFullscreen: (id: string) => void;
    hasFullscreenWindow: () => boolean;
}

export const createWindowStore = () => {
    type Listener = (state: WindowStore & WindowActions) => void;

    const listeners = new Set<Listener>();
    let state: WindowStore = {
        windows: [],
        nextId: 1,
        focusedWindowId: null,
    };

    const setState = (newState: Partial<WindowStore>) => {
        state = { ...state, ...newState };
        listeners.forEach(listener => listener(getFullState()));
    };

    const getMaxZIndex = (): number => {
        return Math.max(...state.windows.map(w => w.zIndex), 0);
    };

    const getValidWindowPosition = (windowSize: Size): Position => {
        if (typeof window === 'undefined') {
            return { x: 100, y: 100 };
        }

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const maxX = screenWidth - windowSize.width - 50; // Keep 50px margin
        const maxY = screenHeight - windowSize.height - 150; // Account for dock height

        // Calculate position with cycling offset to prevent going out of bounds
        const offsetMultiplier = (state.nextId - 1) % 10; // Cycle every 10 windows
        const baseX = 100;
        const baseY = 100;
        
        let x = baseX + (offsetMultiplier * WINDOW_OFFSET);
        let y = baseY + (offsetMultiplier * WINDOW_OFFSET);

        // Ensure position stays within bounds
        x = Math.min(x, maxX);
        y = Math.min(y, maxY);
        
        // If we've hit the bounds, start a new row/column
        if (x >= maxX || y >= maxY) {
            const row = Math.floor(offsetMultiplier / 5);
            const col = offsetMultiplier % 5;
            x = baseX + (col * WINDOW_OFFSET);
            y = baseY + (row * WINDOW_OFFSET);
            
            // Final bounds check
            x = Math.min(x, maxX);
            y = Math.min(y, maxY);
        }

        return { x, y };
    };

    const actions: WindowActions = {
        addWindow: (windowConfig): string => {
            const id = `window-${state.nextId}`;
            const windowSize = windowConfig.size || DEFAULT_WINDOW_SIZE;
            const position = getValidWindowPosition(windowSize);
            
            const newWindow: WindowState = {
                id,
                title: 'New Window',
                isMinimized: false,
                isMaximized: false,
                isFullscreen: false,
                position,
                size: windowSize,
                zIndex: getMaxZIndex() + 1,
                ...windowConfig,
            };

            setState({
                windows: [...state.windows, newWindow],
                nextId: state.nextId + 1,
                focusedWindowId: id,
            });

            return id;
        },

        updateWindow: (id, updates) => {
            setState({
                windows: state.windows.map(w => {
                    if (w.id !== id) return w;

                    const updatedWindow = { ...w, ...updates };

                    if (updates.position && typeof window !== 'undefined') {
                        const screenWidth = window.innerWidth;
                        const screenHeight = window.innerHeight;
                        const maxX = screenWidth - updatedWindow.size.width;
                        const maxY = screenHeight - updatedWindow.size.height - 150;

                        updatedWindow.position = {
                            x: Math.max(0, Math.min(updates.position.x, maxX)),
                            y: Math.max(0, Math.min(updates.position.y, maxY))
                        };
                    }

                    return updatedWindow;
                })
            });
        },

        removeWindow: (id) => {
            const newWindows = state.windows.filter(w => w.id !== id);
            
            // Reset nextId if no windows remain to prevent memory bloat
            const newNextId = newWindows.length === 0 ? 1 : state.nextId;
            
            setState({
                windows: newWindows,
                focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId,
                nextId: newNextId,
            });
        },

        focusWindow: (id) => {
            const maxZ = getMaxZIndex();
            setState({
                windows: state.windows.map(w =>
                    w.id === id ? { ...w, zIndex: maxZ + 1 } : w
                ),
                focusedWindowId: id,
            });
        },

        minimizeWindow: (id) => {
            actions.updateWindow(id, { isMinimized: true });
        },

        maximizeWindow: (id) => {
            const window = state.windows.find(w => w.id === id);
            if (window) {
                actions.updateWindow(id, { isMaximized: !window.isMaximized });
            }
        },

        restoreWindow: (id) => {
            actions.updateWindow(id, { isMinimized: false });
            actions.focusWindow(id);
        },

        toggleFullscreen: (id) => {
            const window = state.windows.find(w => w.id === id);
            if (window) {
                actions.updateWindow(id, { isFullscreen: !window.isFullscreen });
            }
        },

        hasFullscreenWindow: () => {
            return state.windows.some(w => w.isFullscreen && !w.isMinimized);
        },
    };

    const getFullState = () => ({ ...state, ...actions });

    return {
        getState: () => state,
        subscribe: (listener: Listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        ...actions,
    };
};