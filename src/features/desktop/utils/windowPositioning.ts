import {Offset, Position, Size, SNAP_THRESHOLD} from "@/features/desktop/constants/window";
import {AppType, DOCK_HEIGHT} from "@/features/desktop/constants/dock";

export interface DragConstraints {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export const calculateDragConstraints = (windowSize: Size): DragConstraints => {
    if (typeof window === 'undefined') {
        return { left: 0, right: 0, top: 0, bottom: 0 };
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    return {
        left: -(windowSize.width - 100), // Allow partial off-screen
        right: screenWidth - 100, // Keep some visible
        top: 0,
        bottom: screenHeight - DOCK_HEIGHT - 50,
    };
};

export const calculateSnapPosition = (
    currentPos: Position,
    offset: Offset,
    windowSize: Size
): Position => {
    if (typeof window === 'undefined') return currentPos;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let newX = currentPos.x + offset.x;
    let newY = currentPos.y + offset.y;

    // Snap to edges
    if (newX < SNAP_THRESHOLD) newX = 0;
    if (newX > screenWidth - windowSize.width - SNAP_THRESHOLD) {
        newX = screenWidth - windowSize.width;
    }
    if (newY < SNAP_THRESHOLD) newY = 0;
    if (newY > screenHeight - windowSize.height - DOCK_HEIGHT - SNAP_THRESHOLD) {
        newY = screenHeight - windowSize.height - DOCK_HEIGHT;
    }

    return { x: newX, y: newY };
};

export const getAppWindowSize = (appType: AppType['type']) => {
    switch (appType) {
        case 'calculator':
            return { width: 320, height: 500 };
        case 'terminal':
            return { width: 800, height: 500 };
        case 'settings':
            return { width: 900, height: 550 };
        case 'notes':
            return { width: 700, height: 550 };
        case 'mail':
            return { width: 1000, height: 550 };
        case 'music':
            return { width: 500, height: 600 };
        case 'photos':
            return { width: 900, height: 550 };
        case 'browser':
            return { width: 1100, height: 550 };
        case 'documents':
            return { width: 800, height: 550 };
        case 'camera':
            return { width: 600, height: 550 };
        default:
            return { width: 700, height: 500 };
    }
};