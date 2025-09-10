"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { CreateUserModal } from './CreateUserModal'
import { useUserManagementStore } from '@/features/admin/hooks/useUserManagementStore'

export function AddUserButton() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { fetchUsers } = useUserManagementStore()

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    const handleSuccess = () => {
        closeModal()
        fetchUsers() // Refresh the user list
    }

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openModal}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
                <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="text-sm lg:text-base">Add User</span>
            </motion.button>

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={handleSuccess}
            />
        </>
    )
}