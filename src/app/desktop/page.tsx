"use client";

import React, { useState } from "react";
import {
    Copy,
    Edit,
    Folder,
    Settings,
    Terminal,
    Trash2,
} from "lucide-react";
import { Background, StatusBar } from "@/features/shared/components";
import { useTime, useKeyboardShortcuts } from "@/features/shared/hooks";
import { useDesktop } from "@/stores/hooks";
import { useSpotlight } from "@/features/desktop/hooks/useSpotlight";
import { useMissionControl } from "@/features/desktop/hooks/useMissionControl";
import { useLaunchpad } from "@/features/desktop/hooks/useLaunchpad";
import {ContextMenu, DesktopIcon, Dock, Window, SpotlightSearch, MissionControl, Launchpad} from "@/features/desktop/components";
import {getWindowContent} from "@/features/desktop/utils";
import {ContextMenuItem, WindowPosition, WindowType} from "@/stores/desktopStore";

// Main Desktop Component
export default function DesktopOS() {
    const {
        openWindows,
        focusedWindowId,
        contextMenu,
        openWindow,
        closeWindow,
        minimizeWindow,
        restoreWindow,
        toggleMaximize,
        updateWindowPosition,
        focusWindow,
        showContextMenu,
        hideContextMenu
    } = useDesktop();

    const [selectedIconId, setSelectedIconId] = useState<string | null>(null);

    // macOS-like features
    const spotlight = useSpotlight();
    const missionControl = useMissionControl(openWindows, focusWindow);
    const launchpad = useLaunchpad();

    const handleOpenWindow = (type: WindowType, title: string): void => {
        openWindow({ windowType: type, title });
    };

    const handleCloseWindow = (id: number): void => {
        closeWindow({ id });
    };

    const handleMinimizeWindow = (id: number): void => {
        minimizeWindow({ id });
    };

    const handleRestoreWindow = (id: number): void => {
        restoreWindow({ id });
    };

    const handleToggleMaximize = (id: number): void => {
        toggleMaximize({ id });
    };

    const handleUpdateWindowPosition = (id: number, position: WindowPosition): void => {
        updateWindowPosition({ id, position });
    };

    const handleFocusWindow = (id: number): void => {
        focusWindow({ id });
    };

    const handleHideContextMenu = (): void => {
        hideContextMenu();
    };

    const handleShowContextMenu = (e: React.MouseEvent, items: ContextMenuItem[]): void => {
        e.preventDefault();
        showContextMenu({
            x: e.clientX,
            y: e.clientY,
            items
        });
    };

    const getIconContextMenuItems = (type: WindowType, title: string) => [
        {
            icon: Edit,
            label: 'Open',
            action: () => handleOpenWindow(type, title)
        },
        {
            icon: Copy,
            label: 'Duplicate',
            action: () => console.log('Duplicate')
        },
        { separator: true },
        {
            icon: Trash2,
            label: 'Move to Trash',
            action: () => console.log('Delete')
        }
    ];

    const { formattedTime } = useTime();

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onMinimize: () => {
            if (focusedWindowId) {
                handleMinimizeWindow(focusedWindowId);
            }
        },
        onClose: () => {
            if (focusedWindowId) {
                handleCloseWindow(focusedWindowId);
            }
        },
        onQuit: () => {
            if (focusedWindowId) {
                handleCloseWindow(focusedWindowId);
            }
        }
    });

    return (
        <Background>
            <StatusBar size="lg" time={formattedTime} />

            {/* Desktop Icons */}
            <div className="absolute top-8 left-8 space-y-2 pt-4">
                <DesktopIcon
                    icon={Folder}
                    label="Documents"
                    isSelected={selectedIconId === 'documents'}
                    onClick={() => setSelectedIconId(selectedIconId === 'documents' ? null : 'documents')}
                    onDoubleClick={() => handleOpenWindow('folder', 'Documents')}
                    onContextMenu={(e) => handleShowContextMenu(e, getIconContextMenuItems('folder', 'Documents'))}
                />
                <DesktopIcon
                    icon={Terminal}
                    label="Terminal"
                    isSelected={selectedIconId === 'terminal'}
                    onClick={() => setSelectedIconId(selectedIconId === 'terminal' ? null : 'terminal')}
                    onDoubleClick={() => handleOpenWindow('terminal', 'Terminal')}
                    onContextMenu={(e) => handleShowContextMenu(e, getIconContextMenuItems('terminal', 'Terminal'))}
                />
                <DesktopIcon
                    icon={Settings}
                    label="Settings"
                    isSelected={selectedIconId === 'settings'}
                    onClick={() => setSelectedIconId(selectedIconId === 'settings' ? null : 'settings')}
                    onDoubleClick={() => handleOpenWindow('settings', 'System Preferences')}
                    onContextMenu={(e) => handleShowContextMenu(e, getIconContextMenuItems('settings', 'System Preferences'))}
                />
            </div>

            {/* Context Menu */}
            {contextMenu.isVisible && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={contextMenu.items}
                    onClose={handleHideContextMenu}
                />
            )}

            {/* Windows */}
            {openWindows.map((window) => (
                <Window
                    key={window.id}
                    id={window.id}
                    title={window.title}
                    onClose={() => handleCloseWindow(window.id)}
                    onMinimize={() => handleMinimizeWindow(window.id)}
                    onMaximize={() => handleToggleMaximize(window.id)}
                    onFocus={() => handleFocusWindow(window.id)}
                    isMinimized={window.isMinimized}
                    isMaximized={window.isMaximized}
                    zIndex={window.zIndex}
                    initialPosition={{ x: window.position.x, y: window.position.y }}
                    initialSize={{ width: window.size.width, height: window.size.height }}
                    onPositionChange={(position) => handleUpdateWindowPosition(window.id, position)}
                >
                    {getWindowContent(window.type)}
                </Window>
            ))}

            <Dock
                openWindows={openWindows}
                focusedWindowId={focusedWindowId}
                onWindowClick={(id) => {
                    const window = openWindows.find(w => w.id === id);
                    if (window?.isMinimized) {
                        handleRestoreWindow(id);
                    }
                    handleFocusWindow(id);
                }}
                onWindowClose={handleCloseWindow}
                onAppClick={(type, title) => handleOpenWindow(type as WindowType, title)}
            />

            {/* macOS-like Features */}
            <SpotlightSearch
                isOpen={spotlight.isOpen}
                searchQuery={spotlight.searchQuery}
                filteredItems={spotlight.filteredItems}
                selectedIndex={spotlight.selectedIndex}
                onSearchChange={spotlight.setSearchQuery}
                onClose={spotlight.close}
                onExecute={spotlight.executeItem}
            />

            <MissionControl
                isOpen={missionControl.isOpen}
                windows={openWindows}
                onClose={missionControl.close}
                onWindowSelect={(windowId) => {
                    missionControl.close();
                    handleFocusWindow(windowId);
                }}
            />

            <Launchpad
                onAppLaunch={(appName) => {
                    launchpad.launchApp(appName);
                    // Map app names to window types
                    const appTypeMap: Record<string, WindowType> = {
                        'Finder': 'folder',
                        'Terminal': 'terminal',
                        'System Preferences': 'settings',
                        'Calculator': 'calculator',
                        'Text Editor': 'text-editor'
                    };
                    const windowType = appTypeMap[appName] || 'folder';
                    handleOpenWindow(windowType, appName);
                }}
            />
        </Background>
    );
}
