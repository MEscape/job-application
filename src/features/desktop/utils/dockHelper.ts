import { WindowState } from "@/features/desktop/stores/windowStore";
import { AppType } from "@/features/desktop/constants/dock";

export interface AppWindowInfo {
    isRunning: boolean;
    isFocused: boolean;
    isMinimized: boolean;
    windowId?: string;
}

export const getAppWindowInfo = (
    appType: AppType["type"],
    windows: WindowState[],
    focusedWindowId: string | null
): AppWindowInfo => {
    const appTitleMap: Record<AppType["type"], string> = {
        'documents': 'Documents',
        'terminal': 'Terminal',
        'settings': 'System Preferences',
        'calculator': 'Calculator',
        'mail': 'Mail',
        'camera': 'Camera',
        'music': 'Music',
        'notes': 'Notes',
        'browser': 'Safari',
        'photos': 'Photos'
    };

    const expectedTitle = appTitleMap[appType];
    const appWindow = windows.find(w => w.title === expectedTitle);

    return {
        isRunning: !!appWindow,
        isFocused: appWindow?.id === focusedWindowId,
        isMinimized: appWindow?.isMinimized || false,
        windowId: appWindow?.id,
    };
};

export type DockClickAction = "open" | "focus" | "minimize" | "restore";

export const getDockClickAction = (appInfo: AppWindowInfo): DockClickAction => {
    if (!appInfo.isRunning) return "open";
    if (appInfo.isMinimized) return "restore";
    if (appInfo.isFocused) return "minimize";
    return "focus";
};
