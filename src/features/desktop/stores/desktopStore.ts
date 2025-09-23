import { FinderItem } from "../constants/finder";
import { FileSystemAPI } from "@/features/desktop/lib/filesystem/FileSystemAPI";

export interface DesktopState {
  items: FinderItem[];
  selectedItems: Set<string>;
  isLoading: boolean;
  error: string | null;
}

export interface DesktopActions {
  loadItems: () => Promise<void>;
  selectItem: (itemId: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  isSystemItem: (itemId: string) => boolean;
}

// System items for design purposes only
const SYSTEM_ITEMS: FinderItem[] = [
  {
    id: 'system-trash',
    name: 'Trash',
    type: 'other',
    path: '~/.Trash',
    parentPath: '',
    dateModified: new Date(),
    dateCreated: new Date(),
  },
  {
    id: 'system-macintosh',
    name: 'Macintosh',
    type: 'other',
    path: '/System/Macintosh',
    parentPath: '',
    dateModified: new Date(),
    dateCreated: new Date(),
  },
  {
    id: 'system-safari',
    name: 'Safari',
    type: 'other',
    path: '/Applications/Safari.app',
    parentPath: '',
    dateModified: new Date(),
    dateCreated: new Date(),
  }
];

const SYSTEM_ITEM_IDS = new Set(['system-trash', 'system-macintosh', 'system-safari']);

export const createDesktopStore = () => {
  type Listener = (state: DesktopState & DesktopActions) => void;

  const listeners = new Set<Listener>();
  let state: DesktopState = {
    items: [],
    selectedItems: new Set(),
    isLoading: false,
    error: null
  };

  const setState = (newState: Partial<DesktopState>) => {
    state = { ...state, ...newState };
    listeners.forEach(listener => listener(getFullState()));
  };

  const actions: DesktopActions = {
    loadItems: async () => {
      setState({ isLoading: true, error: null });
      
      try {
        const userItems = await FileSystemAPI.getItems('/Desktop');
        
        // Combine system items with user items
        const allItems = [...SYSTEM_ITEMS, ...userItems];
        
        setState({ 
          items: allItems,
          isLoading: false,
          selectedItems: new Set() // Clear selection on load
        });
      } catch (error) {
        setState({
          error: error instanceof Error ? error.message : 'Failed to load desktop items',
          isLoading: false,
          items: SYSTEM_ITEMS // Show system items even on error
        });
      }
    },

    selectItem: (itemId: string, multiSelect = false) => {
      // Don't select system items
      if (SYSTEM_ITEM_IDS.has(itemId)) return;
      
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
      
      setState({ selectedItems: newSelection });
    },

    clearSelection: () => {
      setState({ selectedItems: new Set() });
    },



    isSystemItem: (itemId: string) => SYSTEM_ITEM_IDS.has(itemId)
  };

  const getFullState = () => ({ ...state, ...actions });

  // Auto-load items on store creation
  actions.loadItems();

  return {
    getState: () => state,
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    ...actions
  };
};