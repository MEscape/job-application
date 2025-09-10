import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type AnimationPhase =
    | 'idle'
    | 'moving-to-desk'
    | 'at-desk'
    | 'zooming-to-monitor'
    | 'returning-home'

interface SceneState {
    // State
    animationPhase: AnimationPhase
    isAnimating: boolean
    isControlsEnabled: boolean

    // Computed state
    canMoveToDesk: boolean
    canReturnHome: boolean

    // Actions
    startAnimation: (targetPhase: AnimationPhase) => void
    completeAnimation: () => void
    setAnimationPhase: (phase: AnimationPhase) => void
}

// Helper function to update computed state
const updateComputedState = (state: Partial<SceneState>) => {
    const phase = state.animationPhase!
    const isAnimating = state.isAnimating!

    return {
        canMoveToDesk: phase === 'idle' && !isAnimating,
        canReturnHome: phase === 'at-desk' && !isAnimating
    }
}

export const useSceneStore = create<SceneState>()(devtools(
    (set, get) => ({
        // Initial state
        animationPhase: 'idle',
        isAnimating: false,
        isControlsEnabled: true,
        canMoveToDesk: true,
        canReturnHome: false,

        // Actions
        startAnimation: (targetPhase: AnimationPhase) => {
            const currentPhase = get().animationPhase
            console.log(`Starting animation in Zustand: ${currentPhase} -> ${targetPhase}`)

            set((state) => {
                const newState = {
                    ...state,
                    animationPhase: targetPhase,
                    isAnimating: true,
                    isControlsEnabled: false
                }
                
                const computedState = updateComputedState(newState)
                
                return {
                    ...newState,
                    ...computedState
                }
            })
        },

        completeAnimation: () => {
            set((state) => {
                const phase = state.animationPhase
                let newPhase = phase

                switch (phase) {
                    case 'moving-to-desk':
                        newPhase = 'at-desk'
                        break
                    case 'returning-home':
                        newPhase = 'idle'
                        break
                    case 'zooming-to-monitor':
                        break
                    default:
                        break
                }

                const newState = {
                    ...state,
                    animationPhase: newPhase,
                    isAnimating: false,
                    isControlsEnabled: newPhase === 'idle'
                }

                console.log(newPhase, "Animation completed")

                const computedState = updateComputedState(newState)

                return {
                    ...newState,
                    ...computedState
                }
            })
        },

        setAnimationPhase: (phase: AnimationPhase) => {
            set((state) => {
                const newState = {
                    ...state,
                    animationPhase: phase
                }
                
                const computedState = updateComputedState(newState)
                
                return {
                    ...newState,
                    ...computedState
                }
            })
        }
    }),
    {
        name: 'scene-store'
    }
))