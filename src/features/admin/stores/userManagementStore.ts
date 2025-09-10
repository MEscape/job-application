export interface CreateUserData {
    email: string
    company: string
    name?: string
    location: string
    latitude: number
    longitude: number
    accessCode?: string
    password?: string
}

export interface UpdateUserData {
    id: string
    email?: string
    company?: string
    name?: string
    location?: string
    latitude?: number
    longitude?: number
    isActive?: boolean
    isAdmin?: boolean
}

export interface UserFilters {
    role?: 'all' | 'admin' | 'user'
    status?: 'all' | 'active' | 'inactive'
    company?: string
}

export interface User {
    id: string
    accessCode: string
    email: string
    company: string
    name?: string
    location: string
    isActive: boolean
    isAdmin: boolean
    lastLogin?: Date
    createdAt: Date
    updatedAt: Date
    latitude: number
    longitude: number
}

export interface UserManagementState {
    users: User[]
    filteredUsers: User[]
    searchTerm: string
    filters: UserFilters
    isLoading: boolean
    isCreating: boolean
    isUpdating: boolean
    isDeleting: boolean
    error: string | null
    lastFetched: Date | null
}

export interface UserManagementActions {
    fetchUsers: () => Promise<void>
    createUser: (userData: CreateUserData) => Promise<User>
    updateUser: (userData: UpdateUserData) => Promise<User>
    deleteUser: (userId: string) => Promise<void>
    toggleUserStatus: (userId: string) => Promise<void>
    toggleUserRole: (userId: string) => Promise<void>
    setSearchTerm: (term: string) => void
    setFilters: (filters: Partial<UserFilters>) => void
    refreshUsers: () => Promise<void>
    clearError: () => void
}

export const createUserManagementStore = () => {
    type Listener = (state: UserManagementState & UserManagementActions) => void

    const listeners = new Set<Listener>()
    let state: UserManagementState = {
        users: [],
        filteredUsers: [],
        searchTerm: '',
        filters: {
            role: 'all',
            status: 'all',
            company: ''
        },
        isLoading: false,
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        error: null,
        lastFetched: null
    }

    const setState = (newState: Partial<UserManagementState>) => {
        state = { ...state, ...newState }
        // Update filtered users when users, searchTerm, or filters change
        if (newState.users || newState.searchTerm !== undefined || newState.filters) {
            state.filteredUsers = filterUsers(state.users, state.searchTerm, state.filters)
        }
        listeners.forEach(listener => listener(getFullState()))
    }

    const filterUsers = (users: User[], searchTerm: string, filters: UserFilters): User[] => {
        return users.filter(user => {
            // Search filter
            const matchesSearch = !searchTerm || 
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.company.toLowerCase().includes(searchTerm.toLowerCase())

            // Role filter
            const matchesRole = filters.role === 'all' || 
                (filters.role === 'admin' && user.isAdmin) ||
                (filters.role === 'user' && !user.isAdmin)

            // Status filter
            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'active' && user.isActive) ||
                (filters.status === 'inactive' && !user.isActive)

            // Company filter
            const matchesCompany = !filters.company || 
                user.company.toLowerCase().includes(filters.company.toLowerCase())

            return matchesSearch && matchesRole && matchesStatus && matchesCompany
        })
    }

    const fetchUsers = async () => {
        try {
            setState({ isLoading: true, error: null })
            
            const response = await fetch('/api/admin/users')
            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.statusText}`)
            }
            
            const users = await response.json()
            setState({ 
                users, 
                isLoading: false, 
                lastFetched: new Date() 
            })
        } catch (error) {
            setState({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch users'
            })
        }
    }

    const createUser = async (userData: CreateUserData): Promise<User> => {
        try {
            setState({ isCreating: true, error: null })
            
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || `Failed to create user: ${response.statusText}`)
            }
            
            const newUser = await response.json()
            setState({ 
                users: [...state.users, newUser],
                isCreating: false 
            })
            
            return newUser
        } catch (error) {
            setState({
                isCreating: false,
                error: error instanceof Error ? error.message : 'Failed to create user'
            })
            throw error
        }
    }

    const updateUser = async (userData: UpdateUserData): Promise<User> => {
        try {
            setState({ isUpdating: true, error: null })
            
            const response = await fetch(`/api/admin/users/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || `Failed to update user: ${response.statusText}`)
            }
            
            const updatedUser = await response.json()
            setState({ 
                users: state.users.map(user => 
                    user.id === userData.id ? updatedUser : user
                ),
                isUpdating: false 
            })
            
            return updatedUser
        } catch (error) {
            setState({
                isUpdating: false,
                error: error instanceof Error ? error.message : 'Failed to update user'
            })
            throw error
        }
    }

    const deleteUser = async (userId: string): Promise<void> => {
        try {
            setState({ isDeleting: true, error: null })
            
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || `Failed to delete user: ${response.statusText}`)
            }
            
            setState({ 
                users: state.users.filter(user => user.id !== userId),
                isDeleting: false 
            })
        } catch (error) {
            setState({
                isDeleting: false,
                error: error instanceof Error ? error.message : 'Failed to delete user'
            })
            throw error
        }
    }

    const toggleUserStatus = async (userId: string): Promise<void> => {
        const user = state.users.find(u => u.id === userId)
        if (!user) return
        
        await updateUser({
            id: userId,
            isActive: !user.isActive
        })
    }

    const toggleUserRole = async (userId: string): Promise<void> => {
        const user = state.users.find(u => u.id === userId)
        if (!user) return
        
        await updateUser({
            id: userId,
            isAdmin: !user.isAdmin
        })
    }

    const setSearchTerm = (term: string) => {
        setState({ searchTerm: term })
    }

    const setFilters = (newFilters: Partial<UserFilters>) => {
        setState({ 
            filters: { ...state.filters, ...newFilters }
        })
    }

    const refreshUsers = async () => {
        await fetchUsers()
    }

    const clearError = () => {
        setState({ error: null })
    }

    const actions: UserManagementActions = {
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        toggleUserRole,
        setSearchTerm,
        setFilters,
        refreshUsers,
        clearError
    }

    const getFullState = (): UserManagementState & UserManagementActions => ({
        ...state,
        ...actions
    })

    const subscribe = (listener: Listener) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
    }

    const getState = () => getFullState()

    return {
        getState,
        subscribe,
        ...actions
    }
}