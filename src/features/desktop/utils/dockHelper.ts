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
    const appWindow = windows.find(w => w.title.toLowerCase().includes(appType));

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
