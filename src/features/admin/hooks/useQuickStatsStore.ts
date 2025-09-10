"use client"

import { useEffect, useState } from "react"
import { createQuickStatsStore, QuickStatsActions, QuickStatsState } from "@/features/admin/stores/quickStatsStore"

const quickStatsStore = createQuickStatsStore()

export const useQuickStatsStore = () => {
    const [state, setState] = useState<QuickStatsState & QuickStatsActions>(() => ({
        ...quickStatsStore.getState(),
        ...quickStatsStore,
    }))

    useEffect(() => {
        const unsubscribe = quickStatsStore.subscribe(setState)
        return () => {
            unsubscribe()
        }
    }, [])

    return state
}