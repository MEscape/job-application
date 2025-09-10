import { useSceneStore } from './sceneStore'

// Scene Store Hooks
export const useScene = () => {
    const store = useSceneStore()
    return {
        // State
        animationPhase: store.animationPhase,
        isAnimating: store.isAnimating,
        isControlsEnabled: store.isControlsEnabled,
        canMoveToDesk: store.canMoveToDesk,
        canReturnHome: store.canReturnHome,
        
        // Actions
        startAnimation: store.startAnimation,
        completeAnimation: store.completeAnimation,
        setAnimationPhase: store.setAnimationPhase
    }
}

