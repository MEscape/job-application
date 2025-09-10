import {useEffect, useState} from 'react';
import {useScene} from "@/features/home/stores/hooks";
import {useIframeActions, useIframeState} from "@/features/shared/hooks/useIframeSync";
import {AnimationPhase} from "@/features/home/stores/sceneStore";

export type ViewType = "lock" | "login" | "loading";

export function useViewManager(resetCredentials: () => void) {
    const [currentView, setCurrentView] = useState<ViewType>("lock");
    const { setAnimationPhase } = useScene();
    const iframeState = useIframeState();
    const { startAnimation, completeAnimation, setAnimationPhase: setIframeAnimationPhase } = useIframeActions();

    // Listen for state updates from parent
    useEffect(() => {
        if (iframeState) {
            // Update view based on parent state
            const parentView = iframeState.view as ViewType;
            if (['lock', 'login', 'loading'].includes(parentView)) {
                setCurrentView(parentView);
            }

            // Update animation phase from parent
            if (iframeState.animationPhase) {
                setAnimationPhase(iframeState.animationPhase as AnimationPhase);
            }
        }
    }, [iframeState, setAnimationPhase]);

    function handleUnlock() {
        setCurrentView('login');
        // Parent will handle view change through state sync
    }

    function handleBack() {
        resetCredentials();
        setCurrentView('lock');
        // Parent will handle view change through state sync
    }

    return {
        currentView,
        handleUnlock,
        handleBack,
        setCurrentView,
        // Expose iframe actions for components that need them
        startAnimation,
        completeAnimation,
        setAnimationPhase: setIframeAnimationPhase
    };
}
