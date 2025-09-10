export interface QuickStatsData {
    totalUsers: number
    totalFiles: number
    activeUsers: number
    systemActivity: number
}

export interface QuickStatsState {
    stats: QuickStatsData
    isLoading: boolean
    error: string | null
    lastFetched: Date | null
}

export interface QuickStatsActions {
    fetchStats: () => Promise<void>
    refreshStats: () => Promise<void>
    clearError: () => void
}

export const createQuickStatsStore = () => {
    type Listener = (state: QuickStatsState & QuickStatsActions) => void

    const listeners = new Set<Listener>()
    let state: QuickStatsState = {
        stats: {
            totalUsers: 0,
            totalFiles: 0,
            activeUsers: 0,
            systemActivity: 0
        },
        isLoading: false,
        error: null,
        lastFetched: null
    }

    const setState = (newState: Partial<QuickStatsState>) => {
        state = { ...state, ...newState }
        listeners.forEach(listener => listener(getFullState()))
    }

    const fetchUserStats = async () => {
        const response = await fetch('/api/admin/users/stats')
        if (!response.ok) {
            throw new Error(`Failed to fetch user stats: ${response.statusText}`)
        }
        return await response.json()
    }

    const fetchFileStats = async () => {
        const response = await fetch('/api/admin/files/stats')
        if (!response.ok) {
            throw new Error(`Failed to fetch file stats: ${response.statusText}`)
        }
        return await response.json()
    }

    const fetchSystemActivity = async () => {
        const response = await fetch('/api/admin/system/activity')
        if (!response.ok) {
            throw new Error(`Failed to fetch system activity: ${response.statusText}`)
        }
        return await response.json()
    }

    const actions: QuickStatsActions = {
        fetchStats: async () => {
            setState({ isLoading: true, error: null })
            
            try {
                const [userStats, fileStats, activityStats] = await Promise.all([
                    fetchUserStats(),
                    fetchFileStats(),
                    fetchSystemActivity()
                ])

                setState({
                    stats: {
                        totalUsers: userStats.total || 0,
                        totalFiles: fileStats.totalFiles || 0,
                        activeUsers: userStats.active || 0,
                        systemActivity: activityStats.activityScore || 0
                    },
                    isLoading: false,
                    lastFetched: new Date()
                })
            } catch (error) {
                setState({
                    error: error instanceof Error ? error.message : 'Failed to fetch quick stats',
                    isLoading: false
                })
            }
        },

        refreshStats: async () => {
            await actions.fetchStats()
        },

        clearError: () => {
            setState({ error: null })
        }
    }

    const getFullState = () => ({ ...state, ...actions })

    return {
        getState: () => state,
        subscribe: (listener: Listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
        ...actions
    }
}