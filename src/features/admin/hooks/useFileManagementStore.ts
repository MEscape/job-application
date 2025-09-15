"use client"

import { useEffect, useState } from "react"
import { createFileManagementStore, FileManagementActions, FileManagementState } from "@/features/admin/stores/fileManagementStore"

const fileManagementStore = createFileManagementStore()

export const useFileManagementStore = () => {
    const [state, setState] = useState<FileManagementState & FileManagementActions>(() => ({
        ...fileManagementStore.getState(),
        ...fileManagementStore,
    }))

    useEffect(() => {
        const unsubscribe = fileManagementStore.subscribe(setState)
        return () => {
            unsubscribe()
        }
    }, [])

    return state
}