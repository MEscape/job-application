import React, {memo} from "react";
import {useIsAnimating, useSceneComputed} from "@/stores/scene-store";

export const InstructionsOverlay: React.FC = memo(() => {
    const isAnimating = useIsAnimating()
    const { canMoveToDesk, canReturnHome } = useSceneComputed()

    const getInstructionContent = () => {
        if (isAnimating) {
            return (
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span>Animating...</span>
                </div>
            )
        }

        if (canMoveToDesk) {
            return (
                <div>
                    Press <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Tab</kbd> to sit at desk • Free look mode
                </div>
            )
        }

        if (canReturnHome) {
            return (
                <div>
                    Press <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Esc</kbd> to leave desk • Work mode
                </div>
            )
        }

        return null
    }

    const content = getInstructionContent()
    if (!content) return null

    return (
        <div className="absolute top-4 left-4 text-white bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-white/10 shadow-lg z-10">
            <div className="text-sm font-medium">{content}</div>
        </div>
    )
})

InstructionsOverlay.displayName = 'InstructionsOverlay'