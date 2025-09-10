import {useCallback, useMemo, useState, useRef} from 'react';
import { useWindowStore } from "@/features/desktop/hooks/useWindowStore";
import { AppType, DOCK_APPS } from "@/features/desktop/constants/dock";
import {AppWindowInfo, DockClickAction, getAppWindowInfo, getDockClickAction} from "@/features/desktop/utils/dockHelper";
import {getAppContent} from "@/features/desktop/lib/appContent";
import {getAppWindowSize} from "@/features/desktop/utils/windowPositioning";

export interface DockAppState extends AppType {
    windowInfo: AppWindowInfo;
    clickAction: DockClickAction;
}

export const useDock = () => {
    const {
        windows,
        focusedWindowId,
        addWindow,
        focusWindow,
        minimizeWindow,
        restoreWindow,
    } = useWindowStore();

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const lastClickTimeRef = useRef<Record<string, number>>({});
    const CLICK_DEBOUNCE_MS = 300;

    const dockApps = useMemo((): DockAppState[] => {
        return DOCK_APPS.map(app => {
            const windowInfo = getAppWindowInfo(app.type, windows, focusedWindowId);
            const clickAction = getDockClickAction(windowInfo);

            return {
                ...app,
                windowInfo,
                clickAction
            };
        });
    }, [windows, focusedWindowId]);

    const handleDockAppClick = useCallback((app: DockAppState) => {
        const { windowInfo, type, title } = app;
        const now = Date.now();
        const lastClickTime = lastClickTimeRef.current[app.id] || 0;

        // Debounce rapid clicks
        if (now - lastClickTime < CLICK_DEBOUNCE_MS) {
            return;
        }

        lastClickTimeRef.current[app.id] = now;

        switch (app.clickAction) {
            case 'open':
                if (!windowInfo.isRunning) {
                    addWindow({
                        title,
                        size: getAppWindowSize(type),
                        content: getAppContent(type)
                    });
                }
                break;

            case 'focus':
                if (windowInfo.windowId) {
                    focusWindow(windowInfo.windowId);
                }
                break;

            case 'minimize':
                if (windowInfo.windowId) {
                    minimizeWindow(windowInfo.windowId);
                }
                break;

            case 'restore':
                if (windowInfo.windowId) {
                    restoreWindow(windowInfo.windowId);
                }
                break;
        }
    }, [addWindow, focusWindow, minimizeWindow, restoreWindow, CLICK_DEBOUNCE_MS]);

    return {
        dockApps,
        handleDockAppClick,
        openWindows: windows.filter(w => !w.isMinimized),
        minimizedWindows: windows.filter(w => w.isMinimized),
        hoveredIndex,
        setHoveredIndex,
    };
};