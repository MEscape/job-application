import { useEffect } from 'react';

interface KeyboardShortcutsProps {
    onMinimize?: () => void;
    onClose?: () => void;
    onQuit?: () => void;
}

export function useKeyboardShortcuts({
    onMinimize,
    onClose,
    onQuit,
}: KeyboardShortcutsProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const { key, metaKey, ctrlKey, shiftKey, altKey } = event;
            const cmdKey = metaKey || ctrlKey; // Support both Mac (Cmd) and Windows (Ctrl)

            // Prevent default browser shortcuts when our shortcuts are triggered
            const preventDefault = () => {
                event.preventDefault();
                event.stopPropagation();
            };

            // Window management shortcuts
            if (cmdKey && key === 'm' && !shiftKey && !altKey) {
                preventDefault();
                onMinimize?.();
                return;
            }

            if (cmdKey && key === 'w' && !shiftKey && !altKey) {
                preventDefault();
                onClose?.();
                return;
            }

            if (cmdKey && key === 'q' && !shiftKey && !altKey) {
                preventDefault();
                onQuit?.();
                return;
            }
        };

        // Add event listener
        document.addEventListener('keydown', handleKeyDown, true);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [
        onMinimize,
        onClose,
        onQuit,
    ]);
}