"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload } from 'lucide-react'
import { useFileManagementStore } from '@/features/admin/hooks/useFileManagementStore'
import { FileUploadModal } from './FileUploadModal'

export function UploadFileButton() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { fetchFiles } = useFileManagementStore()

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    const handleSuccess = () => {
        closeModal()
        fetchFiles() // Refresh the file list
    }

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openModal}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
                <Upload className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="text-sm lg:text-base">Upload File</span>
            </motion.button>

            <FileUploadModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={handleSuccess}
            />
        </>
    )
}