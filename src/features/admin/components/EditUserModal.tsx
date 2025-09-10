"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { UserForm } from './UserForm'
import { User } from '@/features/admin/stores/userManagementStore'
import { createPortal } from 'react-dom'

interface EditUserModalProps {
    isOpen: boolean
    user: User
    onClose: () => void
    onSuccess?: () => void
}

export function EditUserModal({ isOpen, user, onClose, onSuccess }: EditUserModalProps) {
    const handleSuccess = () => {
        onSuccess?.()
        onClose()
    }

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#4B5563 #1F2937'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">Edit User</h2>
                                <p className="text-white/60 text-sm mt-1">
                                    Update user information for {user.name || user.email.split('@')[0]}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <UserForm
                            mode="edit"
                            user={user}
                            onSuccess={handleSuccess}
                            onCancel={onClose}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}