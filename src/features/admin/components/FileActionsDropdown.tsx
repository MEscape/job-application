"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Edit, Trash2, Download, Eye } from "lucide-react"
import { FileSystemItem } from "@/features/admin/stores/fileManagementStore"
import { useFileManagementStore } from "@/features/admin/hooks/useFileManagementStore"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
import { EditFileModal } from "./EditFileModal"

interface FileActionsDropdownProps {
    file: FileSystemItem
}

export function FileActionsDropdown({ file }: FileActionsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
    const buttonRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    
    const {
        deleteFile,
        updateFile,
        refreshFiles,
        isDeleting,
        isUpdating
    } = useFileManagementStore()

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
                const dropdownWidth = 192 // 192px is w-48 width
                const viewportWidth = window.innerWidth
                const viewportHeight = window.innerHeight
                
                // Calculate left position to center dropdown under button
                let left = rect.left + (rect.width / 2) - (dropdownWidth / 2)
                
                // Ensure dropdown doesn't go off screen horizontally
                if (left < 8) left = 8
                if (left + dropdownWidth > viewportWidth - 8) left = viewportWidth - dropdownWidth - 8
                
                // Calculate dynamic dropdown height based on content
                let dropdownHeight = 16 // py-2 padding
                dropdownHeight += 40 // Edit button
                if (!isFolder && file.isReal) {
                    dropdownHeight += 40 // View button
                    dropdownHeight += 40 // Download button
                }
                dropdownHeight += 9 // border divider
                dropdownHeight += 40 // Delete button
                
                // Calculate top position - show above button if not enough space below
                let top = rect.bottom + 8
                
                if (rect.bottom + dropdownHeight > viewportHeight && rect.top - dropdownHeight > 0) {
                    top = rect.top - dropdownHeight - 8
                }
                
                setDropdownPosition({
                    top,
                    left
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
            const dropdownWidth = 192 // 192px is w-48 width
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight
            
            // Calculate left position to center dropdown under button
            let left = rect.left + (rect.width / 2) - (dropdownWidth / 2)
            
            // Ensure dropdown doesn't go off screen horizontally
            if (left < 8) left = 8
            if (left + dropdownWidth > viewportWidth - 8) left = viewportWidth - dropdownWidth - 8
            
            // Calculate top position - show above button if not enough space below
            let top = rect.bottom + 8
            const dropdownHeight = 200 // Approximate dropdown height
            
            if (rect.bottom + dropdownHeight > viewportHeight && rect.top - dropdownHeight > 0) {
                top = rect.top - dropdownHeight - 8
            }
            
            setDropdownPosition({
                top,
                left
            })
        }
        setIsOpen(!isOpen)
    }



    const handleDownload = async () => {
        if (file.isReal) {
            // For real files, download from blob storage or local storage
            const response = await fetch(`/api/files/download/${file.id}`)
            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                
                // Ensure file has proper extension
                let fileName = file.name
                if (!fileName.includes('.')) {
                    // Add default extension based on file type
                    const typeExtensions: Record<string, string> = {
                        'PDF': '.pdf',
                        'DOCUMENT': '.pdf',
                        'IMAGE': '.jpg',
                        'VIDEO': '.mp4',
                        'AUDIO': '.mp3',
                        'ARCHIVE': '.zip',
                        'OTHER': '.txt'
                    }
                    fileName += typeExtensions[file.type] || '.txt'
                }
                
                link.download = fileName
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }
        }
        setIsOpen(false)
    }

    const handleView = () => {
        // Redirect to the file viewing page for both real and fake files
        window.open(`/api/files/view/${file.id}`, '_blank')
        setIsOpen(false)
    }

    const handleDelete = async () => {
        try {
            await deleteFile(file.id)
            setIsOpen(false)
            setIsConfirmingDelete(false)
        } catch (error) {
            console.error('Failed to delete file:', error)
        }
    }

    const isLoading = isDeleting || isUpdating
    const isFolder = file.type === 'FOLDER'
    const protectedFolders = ['Documents', 'Desktop', 'Downloads', 'Pictures', 'Music', 'Movies']
    const isSystemFolder = isFolder && protectedFolders.includes(file.name)

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
                            {/* Edit File */}
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(true)
                                    setIsOpen(false)
                                }}
                                disabled={isSystemFolder}
                                className={`w-full flex items-center space-x-3 px-4 py-2 transition-colors ${
                                    isSystemFolder 
                                        ? 'text-white/30 cursor-not-allowed' 
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Edit className="w-4 h-4" />
                                <span>Edit {isFolder ? 'Folder' : 'File'}</span>
                            </button>

                            {/* View File (only for real files, not folders or fake files) */}
                            {!isFolder && file.isReal && (
                                <button
                                    onClick={handleView}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>View</span>
                                </button>
                            )}

                            {/* Download File (only for real files, not folders or fake files) */}
                            {!isFolder && file.isReal && (
                                <button
                                    onClick={handleDownload}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                            )}



                            <div className="border-t border-white/10 my-2"></div>

                            {/* Delete File */}
                            <button
                                onClick={() => setIsConfirmingDelete(true)}
                                disabled={isLoading || isSystemFolder}
                                className={`w-full flex items-center space-x-3 px-4 py-2 transition-colors disabled:cursor-not-allowed ${
                                    isSystemFolder 
                                        ? 'text-red-400/30' 
                                        : 'text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50'
                                }`}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete {isFolder ? 'Folder' : 'File'}</span>
                            </button>
                        </div>
                    ) : (
                        <div className="py-3 px-4">
                            <p className="text-white text-sm mb-3">
                                Are you sure you want to delete this {isFolder ? 'folder' : 'file'}?
                                {isFolder && " This will also delete all contents."}
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
            
            <EditFileModal
                isOpen={isEditModalOpen}
                file={file}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={refreshFiles}
            />
        </>
    )
}