"use client"

import { useEffect, useState } from "react"
import { createUserManagementStore, UserManagementActions, UserManagementState } from "@/features/admin/stores/userManagementStore"

const userManagementStore = createUserManagementStore()

export const useUserManagementStore = () => {
    const [state, setState] = useState<UserManagementState & UserManagementActions>(() => ({
        ...userManagementStore.getState(),
        ...userManagementStore,
    }))

    useEffect(() => {
        const unsubscribe = userManagementStore.subscribe(setState)
        return () => {
            unsubscribe()
        }
    }, [])

    return state
}