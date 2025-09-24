"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { FileSystemItem, UpdateFileData } from "@/features/admin/stores/fileManagementStore"
import { useFileManagementStore } from "@/features/admin/hooks/useFileManagementStore"
import { Modal } from "./Modal"
import { PathInput } from "./PathInput"
import { UserInput } from "./UserInput"

interface EditFileModalProps {
    isOpen: boolean
    file: FileSystemItem
    onClose: () => void
    onSuccess?: () => void
}

export function EditFileModal({ isOpen, file, onClose, onSuccess }: EditFileModalProps) {
    // Extract name and extension for files (not folders)
    const getNameAndExtension = (fileName: string | undefined, fileType: string) => {
        if (!fileName || fileType === 'FOLDER') {
            return { nameOnly: fileName || '', extension: '' }
        }
        const lastDotIndex = fileName.lastIndexOf('.')
        if (lastDotIndex === -1 || lastDotIndex === 0) {
            return { nameOnly: fileName, extension: '' }
        }
        return {
            nameOnly: fileName.substring(0, lastDotIndex),
            extension: fileName.substring(lastDotIndex)
        }
    }

    const { nameOnly: initialNameOnly, extension } = getNameAndExtension(file.name, file.type)
    
    const [formData, setFormData] = useState<UpdateFileData>({
        id: file.id,
        name: file.name,
        type: file.type,
        parentPath: file.parentPath || ''
    })
    const [nameOnly, setNameOnly] = useState(initialNameOnly)
    const [selectedUser, setSelectedUser] = useState(file.user?.name || '')
    const [selectedUserId, setSelectedUserId] = useState(file.user?.id || null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showSuccess, setShowSuccess] = useState(false)
    
    const { updateFile, isUpdating, files } = useFileManagementStore()

    // Load user name based on userId
    const loadUserName = async (userId: string) => {
        try {
            const response = await fetch('/api/admin/users')
            if (response.ok) {
                const users = await response.json()
                const user = users.find((u: any) => u.id === userId)
                if (user) {
                    setSelectedUser(user.name || user.email)
                }
            }
        } catch (error) {
            console.error('Error loading user:', error)
        }
    }

    useEffect(() => {
        if (isOpen) {
            const { nameOnly: newNameOnly } = getNameAndExtension(file.name, file.type)
            setFormData({
                id: file.id,
                name: file.name,
                type: file.type,
                parentPath: file.parentPath || ''
            })
            setNameOnly(newNameOnly)
            // Initialize with assigned user (userId), not uploader (user)
            if (file.userId) {
                setSelectedUserId(file.userId)
                loadUserName(file.userId) // Load the actual user name
            } else {
                setSelectedUser('')
                setSelectedUserId(null)
            }
            setErrors({})
        }
    }, [isOpen, file, files])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        // Combine nameOnly with extension for the final name
        const finalName = file.type === 'FOLDER' ? nameOnly : nameOnly + extension
        const finalFormData = {
            ...formData,
            name: finalName,
            userId: selectedUserId
        }

        // Basic validation
        const newErrors: Record<string, string> = {}
        if (!finalFormData.name?.trim()) {
            newErrors.name = 'Name is required'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        try {
            await updateFile(finalFormData)
            setShowSuccess(true)
            // Call onSuccess callback to refresh the file list
            onSuccess?.()
            // Close modal after short delay to show success message
            setTimeout(() => {
                onClose()
            }, 1500)
        } catch (error) {
            console.error('Failed to update file:', error)
            setErrors({ submit: 'Failed to update file. Please try again.' })
        }
    }

    const handleChange = (field: keyof UpdateFileData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const isFolder = formData.type === 'FOLDER'

    // Show success animation
    if (showSuccess) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Success"
                maxWidth="md"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4"
                    >
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {isFolder ? 'Folder' : 'File'} Updated Successfully!
                        </h3>
                        <p className="text-slate-400">
                            {formData.name} has been updated.
                        </p>
                    </motion.div>
                </motion.div>
            </Modal>
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Edit ${isFolder ? 'Folder' : 'File'}`}
            maxWidth="md"
        >

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    {file.type === 'FOLDER' ? 'Name *' : 'Name * (extension cannot be changed)'}
                                </label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={nameOnly}
                                        onChange={(e) => setNameOnly(e.target.value)}
                                        className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        placeholder={file.type === 'FOLDER' ? 'Enter folder name' : 'Enter file name'}
                                    />
                                    {extension && (
                                        <span className="text-slate-400 font-mono text-sm bg-slate-800/50 px-2 py-2 rounded border border-slate-600/50">
                                            {extension}
                                        </span>
                                    )}
                                </div>
                                {errors.name && (
                                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Type (Read-only) */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    Type
                                </label>
                                <input
                                    type="text"
                                    value={formData.type || ''}
                                    readOnly
                                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed"
                                    placeholder="Type cannot be changed"
                                />
                            </div>

                            {/* User Assignment */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    Assigned to User
                                    <span className="text-slate-400 text-xs ml-2">Leave empty for public access</span>
                                </label>
                                <UserInput
                                    value={selectedUser}
                                    onChange={(value, userId) => {
                                        setSelectedUser(value)
                                        setSelectedUserId(userId || null)
                                    }}
                                    placeholder={file.type === 'FOLDER' ? 'Cannot reassign folders' : "Assign to user or leave empty for public access..."}
                                    disabled={file.type === 'FOLDER'}
                                />
                                {file.type === 'FOLDER' && (
                                    <p className="text-amber-400 text-sm mt-1">
                                        ⚠️ Folders cannot be reassigned to prevent errors
                                    </p>
                                )}
                            </div>

                            {/* Parent Path */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    Parent Path
                                </label>
                                <PathInput
                                    value={formData.parentPath || ''}
                                    onChange={(value) => handleChange('parentPath', value)}
                                    disabled={file.type === 'FOLDER'}
                                    placeholder={file.type === 'FOLDER' ? 'Cannot move folders' : 'Select parent path (optional)'}
                                    userId={selectedUserId}
                                />
                                {file.type === 'FOLDER' && (
                                    <p className="text-amber-400 text-sm mt-1">
                                        ⚠️ Folders cannot be moved to prevent errors
                                    </p>
                                )}
                            </div>



                            {errors.submit && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <p className="text-red-400 text-sm">{errors.submit}</p>
                                </div>
                            )}

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isUpdating}
                                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isUpdating ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
        </Modal>
    )
}