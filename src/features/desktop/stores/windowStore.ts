interface WindowState {
    id: string;
    title: string;
    isMinimized: boolean;
    isMaximized: boolean;
    position: Position;
    size: Size;
    zIndex: number;
    content?: React.ReactNode;
}

interface WindowStore {
    windows: WindowState[];
    focusedWindowId: string | null;
    nextId: number;
}

interface WindowActions {
    addWindow: (config: Partial<Omit<WindowState, 'id' | 'zIndex'>>) => string;
    updateWindow: (id: string, updates: Partial<WindowState>) => void;
    removeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
}

const createWindowStore = () => {
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

    const actions: WindowActions = {
        addWindow: (windowConfig): string => {
            const id = `window-${state.nextId}`;
            const newWindow: WindowState = {
                id,
                title: 'New Window',
                isMinimized: false,
                isMaximized: false,
                position: {
                    x: 100 + (state.nextId * WINDOW_OFFSET),
                    y: 100 + (state.nextId * WINDOW_OFFSET)
                },
                size: DEFAULT_WINDOW_SIZE,
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
                windows: state.windows.map(w =>
                    w.id === id ? { ...w, ...updates } : w
                )
            });
        },

        removeWindow: (id) => {
            setState({
                windows: state.windows.filter(w => w.id !== id),
                focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId,
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