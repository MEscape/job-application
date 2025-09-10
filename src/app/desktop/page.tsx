"use client"

import { useWindowStore } from "@/features/desktop/hooks/useWindowStore";
import {Background} from "@/features/shared/components";
import React, {useCallback} from "react";
import {Window} from "@/features/desktop/components/Window";
import {Position} from "@/features/desktop/constants/window";
import {Dock} from "@/features/desktop/components/dock/Dock";
import { useFinderStore } from "@/features/desktop/hooks/useFinderStore";

export default function Desktop() {
    const {
        windows,
        updateWindow,
        removeWindow,
        focusWindow,
        minimizeWindow,
        maximizeWindow,
        toggleFullscreen,
    } = useWindowStore();

    const { resetToRoot } = useFinderStore();

    const handleClose = useCallback((id: string) => {
        const window = windows.find(w => w.id === id);

        if (window && window.title === 'Documents') {
            resetToRoot();
        }
        
        removeWindow(id);
    }, [removeWindow, windows, resetToRoot]);

    const handleMinimize = useCallback((id: string) => {
        minimizeWindow(id);
    }, [minimizeWindow]);

    const handleMaximize = useCallback((id: string) => {
        maximizeWindow(id);
    }, [maximizeWindow]);

    const handleToggleFullscreen = useCallback((id: string) => {
        toggleFullscreen(id);
    }, [toggleFullscreen]);

    const handlePositionChange = useCallback((id: string, position: Position) => {
        updateWindow(id, { position });
    }, [updateWindow]);

    return (
        <Background>
            {windows.map((window) => (
                <Window
                    key={window.id}
                    window={window}
                    onClose={handleClose}
                    onMinimize={handleMinimize}
                    onMaximize={handleMaximize}
                    onFocus={focusWindow}
                    onPositionChange={handlePositionChange}
                    onToggleFullscreen={handleToggleFullscreen}
                />
            ))}

            <Dock />
        </Background>
    );
}