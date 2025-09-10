"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Edit, Trash2, UserCheck, UserX, Shield, ShieldOff } from "lucide-react"
import { User } from "@/features/admin/stores/userManagementStore"
import { useUserManagementStore } from "@/features/admin/hooks/useUserManagementStore"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
import { EditUserModal } from "./EditUserModal"

interface UserActionsDropdownProps {
    user: User
}

export function UserActionsDropdown({ user }: UserActionsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
    const buttonRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    
    const {
        deleteUser,
        toggleUserStatus,
        toggleUserRole,
        isDeleting,
        isUpdating
    } = useUserManagementStore()

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setIsConfirmingDelete(false)
            }
        }

        function handleScroll() {
            if (isOpen && buttonRef.current && typeof window !== 'undefined') {
                const rect = buttonRef.current.getBoundingClientRect()
                setDropdownPosition({
                    top: rect.bottom + window.scrollY + 8,
                    left: rect.right + window.scrollX - 192 // 192px is w-48 width
                })
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll, true)
            window.addEventListener('resize', handleScroll)
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            if (typeof window !== 'undefined') {
                window.removeEventListener('scroll', handleScroll, true)
                window.removeEventListener('resize', handleScroll)
            }
        }
    }, [isOpen])

    const handleToggleDropdown = () => {
        if (!isOpen && buttonRef.current && typeof window !== 'undefined') {
            const rect = buttonRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.right + window.scrollX - 192 // 192px is w-48 width
            })
        }
        setIsOpen(!isOpen)
    }

    const handleToggleStatus = async () => {
        try {
            await toggleUserStatus(user.id)
            setIsOpen(false)
        } catch (error) {
            console.error('Failed to toggle user status:', error)
        }
    }

    const handleToggleRole = async () => {
        try {
            await toggleUserRole(user.id)
            setIsOpen(false)
        } catch (error) {
            console.error('Failed to toggle user role:', error)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteUser(user.id)
            setIsOpen(false)
            setIsConfirmingDelete(false)
        } catch (error) {
            console.error('Failed to delete user:', error)
        }
    }

    const isLoading = isDeleting || isUpdating

    const dropdownContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.1 }}
                    className="fixed w-48 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl z-[9999]"
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                    }}
                >
                    {!isConfirmingDelete ? (
                        <div className="py-2">
                            {/* Edit User */}
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(true)
                                    setIsOpen(false)
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                <span>Edit User</span>
                            </button>

                            {/* Toggle Status */}
                            <button
                                onClick={handleToggleStatus}
                                disabled={isLoading}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                {user.isActive ? (
                                    <>
                                        <UserX className="w-4 h-4" />
                                        <span>Deactivate</span>
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="w-4 h-4" />
                                        <span>Activate</span>
                                    </>
                                )}
                            </button>

                            {/* Toggle Role */}
                            <button
                                onClick={handleToggleRole}
                                disabled={isLoading}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                {user.isAdmin ? (
                                    <>
                                        <ShieldOff className="w-4 h-4" />
                                        <span>Remove Admin</span>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4" />
                                        <span>Make Admin</span>
                                    </>
                                )}
                            </button>

                            <div className="border-t border-white/10 my-2"></div>

                            {/* Delete User */}
                            <button
                                onClick={() => setIsConfirmingDelete(true)}
                                disabled={user.isAdmin || isLoading}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete User</span>
                            </button>
                            {user.isAdmin && (
                                <p className="px-4 py-1 text-xs text-white/40">
                                    Admin users cannot be deleted
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="py-3 px-4">
                            <p className="text-white text-sm mb-3">
                                Are you sure you want to delete this user?
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                    onClick={() => setIsConfirmingDelete(false)}
                                    disabled={isLoading}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )

    return (
        <>
            <button
                ref={buttonRef}
                onClick={handleToggleDropdown}
                disabled={isLoading}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
                <MoreVertical className="w-4 h-4" />
            </button>
            
            {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
            
            <EditUserModal
                isOpen={isEditModalOpen}
                user={user}
                onClose={() => setIsEditModalOpen(false)}
            />
        </>
    )
}