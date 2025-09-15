export interface CreateFileData {
    name: string
    type: string
    parentPath?: string
    isReal?: boolean
    size?: number
    content?: string
    file?: File
}

export interface UpdateFileData {
    id: string
    name?: string
    type?: string
    parentPath?: string
    isReal?: boolean
    size?: number
    content?: string
}

export interface FileFilters {
    type?: string
    isReal?: string
    parentPath?: string
}

export interface FileSystemItem {
    id: string
    name: string
    type: string
    parentPath: string | null
    isReal: boolean
    size: number | null
    content: string | null
    downloads: number
    uploadedBy: string | null
    createdAt: Date
    updatedAt: Date
    user?: {
        id: string
        name: string | null
        email: string
    } | null
}

export interface FileManagementState {
    files: FileSystemItem[]
    filteredFiles: FileSystemItem[]
    searchTerm: string
    filters: FileFilters
    isLoading: boolean
    isCreating: boolean
    isUpdating: boolean
    isDeleting: boolean
    error: string | null
    lastFetched: Date | null
    currentPage: number
    totalPages: number
    totalFiles: number
}

export interface FileManagementActions {
    fetchFiles: (page?: number, limit?: number) => Promise<void>
    createFile: (fileData: CreateFileData) => Promise<FileSystemItem>
    updateFile: (fileData: UpdateFileData) => Promise<FileSystemItem>
    deleteFile: (fileId: string) => Promise<void>
    setSearchTerm: (term: string) => void
    setFilters: (filters: Partial<FileFilters>) => void
    setPage: (page: number) => void
    refreshFiles: () => Promise<void>
    clearError: () => void
}

export const createFileManagementStore = () => {
    type Listener = (state: FileManagementState & FileManagementActions) => void

    const listeners = new Set<Listener>()
    let state: FileManagementState = {
        files: [],
        filteredFiles: [],
        searchTerm: '',
        filters: {},
        isLoading: false,
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        error: null,
        lastFetched: null,
        currentPage: 1,
        totalPages: 1,
        totalFiles: 0
    }

    const setState = (newState: Partial<FileManagementState>) => {
        state = { ...state, ...newState }
        // Update filtered files when files, searchTerm, or filters change
        if (newState.files || newState.searchTerm !== undefined || newState.filters) {
            state.filteredFiles = filterFiles(state.files, state.searchTerm, state.filters)
        }
        listeners.forEach(listener => listener(getFullState()))
    }

    const filterFiles = (files: FileSystemItem[], searchTerm: string, filters: FileFilters): FileSystemItem[] => {
        return files.filter(file => {
            // Search filter
            const matchesSearch = !searchTerm || 
                file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                file.type.toLowerCase().includes(searchTerm.toLowerCase())

            // Type filter
            const matchesType = !filters.type || file.type === filters.type

            // Real/Fake filter
            const matchesRealStatus = !filters.isReal ||
                (filters.isReal === 'real' && file.isReal) ||
                (filters.isReal === 'fake' && !file.isReal)

            // Parent path filter
            const matchesParentPath = !filters.parentPath || 
                (file.parentPath || '').toLowerCase().includes(filters.parentPath.toLowerCase())

            return matchesSearch && matchesType && matchesRealStatus && matchesParentPath
        })
    }

    const fetchFiles = async (page: number = 1, limit: number = 10) => {
        try {
            setState({ isLoading: true, error: null })
            
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            })

            // Add search and filter params
            if (state.searchTerm) {
                params.append('search', state.searchTerm)
            }
            if (state.filters.type) {
                params.append('type', state.filters.type)
            }
            if (state.filters.isReal) {
                params.append('isReal', state.filters.isReal === 'real' ? 'true' : 'false')
            }
            if (state.filters.parentPath) {
                params.append('parentPath', state.filters.parentPath)
            }
            
            const response = await fetch(`/api/admin/files?${params}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch files: ${response.statusText}`)
            }
            
            const data = await response.json()
            
            // Map database fields to interface fields
            const mappedFiles = data.files.map((file: any) => ({
                ...file,
                user: file.uploader ? {
                    id: file.uploader.id,
                    name: file.uploader.name,
                    email: file.uploader.email
                } : null,
                downloads: file.downloadCount || 0,
                createdAt: file.dateCreated ? new Date(file.dateCreated) : new Date(),
                updatedAt: file.dateModified ? new Date(file.dateModified) : new Date()
            }))
            
            setState({ 
                files: mappedFiles,
                currentPage: data.pagination.page,
                totalPages: data.pagination.totalPages,
                totalFiles: data.pagination.total,
                isLoading: false, 
                lastFetched: new Date() 
            })
        } catch (error) {
            setState({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch files'
            })
        }
    }

    const createFile = async (fileData: CreateFileData): Promise<FileSystemItem> => {
        try {
            setState({ isCreating: true, error: null })
            
            const response = await fetch('/api/admin/files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fileData)
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || `Failed to create file: ${response.statusText}`)
            }
            
            const newFile = await response.json()
            setState({ 
                files: [...state.files, newFile],
                isCreating: false 
            })
            
            return newFile
        } catch (error) {
            setState({
                isCreating: false,
                error: error instanceof Error ? error.message : 'Failed to create file'
            })
            throw error
        }
    }

    const updateFile = async (fileData: UpdateFileData): Promise<FileSystemItem> => {
        try {
            setState({ isUpdating: true, error: null })
            
            const response = await fetch('/api/admin/files', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fileData)
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || `Failed to update file: ${response.statusText}`)
            }
            
            const responseData = await response.json()
            const updatedFile = responseData.file || responseData // Handle both response formats
            
            // Ensure the updated file has all required properties
            const fileWithDefaults = {
                ...updatedFile,
                user: updatedFile.uploader ? {
                    id: updatedFile.uploader.id,
                    name: updatedFile.uploader.name,
                    email: updatedFile.uploader.email
                } : null,
                downloads: updatedFile.downloadCount || 0,
                createdAt: updatedFile.dateCreated ? new Date(updatedFile.dateCreated) : updatedFile.createdAt,
                updatedAt: updatedFile.dateModified ? new Date(updatedFile.dateModified) : updatedFile.updatedAt
            }
            
            setState({ 
                files: state.files.map(file => 
                    file.id === fileData.id ? fileWithDefaults : file
                ),
                isUpdating: false 
            })
            
            return fileWithDefaults
        } catch (error) {
            setState({
                isUpdating: false,
                error: error instanceof Error ? error.message : 'Failed to update file'
            })
            throw error
        }
    }

    const deleteFile = async (fileId: string): Promise<void> => {
        try {
            setState({ isDeleting: true, error: null })
            
            // Find the file being deleted to get its path for cascade deletion
            const fileToDelete = state.files.find(file => file.id === fileId)
            if (!fileToDelete) {
                throw new Error('File not found')
            }
            
            const response = await fetch(`/api/admin/files?id=${fileId}`, {
                method: 'DELETE'
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || `Failed to delete file: ${response.statusText}`)
            }
            
            // For cascade deletion in frontend: remove the file and all its children
            const deletedFilePath = fileToDelete.parentPath ? `${fileToDelete.parentPath}/${fileToDelete.name}` : `/${fileToDelete.name}`
            
            setState({ 
                files: state.files.filter(file => {
                    // Remove the file itself
                    if (file.id === fileId) return false
                    
                    // Remove any children (files whose parentPath starts with the deleted file's path)
                    if (file.parentPath && file.parentPath.startsWith(deletedFilePath)) {
                        return false
                    }
                    
                    return true
                }),
                isDeleting: false 
            })
        } catch (error) {
            setState({
                isDeleting: false,
                error: error instanceof Error ? error.message : 'Failed to delete file'
            })
            throw error
        }
    }

    const setSearchTerm = (term: string) => {
        setState({ searchTerm: term })
        // Trigger a new fetch with the search term
        if (term !== state.searchTerm) {
            fetchFiles(1) // Reset to page 1 when searching
        }
    }

    const setFilters = (filters: Partial<FileFilters>) => {
        setState({ filters })
        // Trigger a new fetch with the filters
        fetchFiles(1) // Reset to page 1 when filtering
    }

    const setPage = (page: number) => {
        setState({ currentPage: page })
        fetchFiles(page)
    }

    const refreshFiles = async () => {
        await fetchFiles(state.currentPage)
    }

    const clearError = () => {
        setState({ error: null })
    }

    const getFullState = (): FileManagementState & FileManagementActions => ({
        ...state,
        fetchFiles,
        createFile,
        updateFile,
        deleteFile,
        setSearchTerm,
        setFilters,
        setPage,
        refreshFiles,
        clearError
    })

    const subscribe = (listener: Listener) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
    }

    const getState = () => state

    return {
        subscribe,
        getState,
        ...getFullState()
    }
}