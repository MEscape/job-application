import { FinderItem } from "../constants/finder";
import {FileSystemAPI} from "@/features/desktop/lib/filesystem/FileSystemAPI";
import { SortBy, SortOrder } from "../lib/filesystem/FileSystemService";

export type ViewMode = 'icon' | 'list'

export interface FinderState {
  sidebarVisible: boolean;

  historyIndex: number;
  history: string[];
  currentPath: string;

  items: FinderItem[];
  isLoading: boolean;
  error: string | null;

  selectedItems: Set<string>;
  lastSelectedItem: string | null;

  sortBy: SortBy;
  sortDirection: SortOrder;

  viewMode: ViewMode
}

export interface FinderActions {
    toggleSidebar: () => void;
    goBack: () => void;
    goForward: () => void;
    navigateTo: (path: string) => Promise<void>;
    setViewMode: (mode: ViewMode) => void;
    selectItem: (itemId: string, multiSelect?: boolean) => void;
    resetToRoot: () => Promise<void>;
}

export const createFinderStore = () => {
  type Listener = (state: FinderState & FinderActions) => void;

  const listeners = new Set<Listener>();
  let state: FinderState = {
    sidebarVisible: true,

    historyIndex: 0,
    history: ['/'],
    currentPath: '/',

    items: [],
    isLoading: true,
    error: null,

    selectedItems: new Set(),
    lastSelectedItem: null,

    sortBy: 'name',
    sortDirection: 'asc',

    viewMode: 'list',
  }

  const setState = (newState: Partial<FinderState>) => {
    state = { ...state, ...newState };
    listeners.forEach(listener => listener(getFullState()));
  };

  const navigateToPath = async (path: string, updateHistory: boolean = true) => {
    if (path === state.currentPath) return;
    
    setState({ isLoading: true, error: null });
    
    try {
      const items = await FileSystemAPI.getItems(path, {
        sortBy: state.sortBy,
        sortOrder: state.sortDirection
      });
      
      let newHistory = state.history;
      let newHistoryIndex = state.historyIndex;
      
      if (updateHistory) {
        newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(path);
        newHistoryIndex = newHistory.length - 1;
      }
      
      setState({
        currentPath: path,
        items,
        history: newHistory,
        historyIndex: newHistoryIndex,
        isLoading: false,
        selectedItems: new Set(),
        lastSelectedItem: null,
      });
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : 'Failed to load directory',
        isLoading: false,
      });
    }
  };

  // Initialize with root directory items
  const initializeStore = async () => {
    try {
      const items = await FileSystemAPI.getItems(state.currentPath, {
        sortBy: state.sortBy,
        sortOrder: state.sortDirection
      });
      setState({
        items,
        isLoading: false,
      });
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : 'Failed to load directory',
        isLoading: false,
      });
    }
  };

  const actions: FinderActions = {
    toggleSidebar: () => {
      setState({ sidebarVisible: !state.sidebarVisible });
    },

    goBack: () => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const path = state.history[newIndex];
        
        setState({ historyIndex: newIndex });
        navigateToPath(path, false);
      }
    },

    goForward: () => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const path = state.history[newIndex];
        
        setState({ historyIndex: newIndex });
        navigateToPath(path, false);
      }
    },

    navigateTo: async (path: string) => {
      await navigateToPath(path, true);
    },

    setViewMode: (mode: ViewMode) => {
      setState({ viewMode: mode });
    },

    selectItem: (itemId: string, multiSelect = false) => {
      const newSelection = new Set(state.selectedItems);
      
      if (multiSelect) {
        if (newSelection.has(itemId)) {
          newSelection.delete(itemId);
        } else {
          newSelection.add(itemId);
        }
      } else {
        newSelection.clear();
        newSelection.add(itemId);
      }
      
      setState({
        selectedItems: newSelection,
        lastSelectedItem: itemId,
      });
    },

    resetToRoot: async () => {
      setState({
        historyIndex: 0,
        history: ['/'],
        currentPath: '/',
        selectedItems: new Set(),
        lastSelectedItem: null,
        error: null,
        isLoading: true,
      });
      
      try {
        const items = await FileSystemAPI.getItems('/', {
          sortBy: state.sortBy,
          sortOrder: state.sortDirection
        });
        setState({
          items,
          isLoading: false,
        });
      } catch (error) {
        setState({
          error: error instanceof Error ? error.message : 'Failed to load directory',
          isLoading: false,
        });
      }
    },
  }

  const getFullState = () => ({ ...state, ...actions });

  // Initialize the store with root directory items
  initializeStore();

  return {
    getState: () => state,
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    ...actions,
  };
};