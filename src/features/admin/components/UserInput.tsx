"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Search, X, ChevronDown } from 'lucide-react'
import { useDebounce } from '@/features/shared/hooks'

interface UserSuggestion {
    id: string
    name: string | null
    email: string
    company: string
    accessCode: string
    isActive: boolean
}

interface UserInputProps {
    value: string
    onChange: (value: string, userId?: string) => void
    placeholder?: string
    error?: string
    disabled?: boolean
    className?: string
}

export function UserInput({
    value,
    onChange,
    placeholder = "Select user...",
    error,
    disabled = false,
    className = ""
}: UserInputProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [hasSelectedUser, setHasSelectedUser] = useState(false)
    
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const debouncedValue = useDebounce(value, 300)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSelectedIndex(-1)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch suggestions when debounced value changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedValue || debouncedValue.length < 2 || disabled) {
                setSuggestions([])
                setIsOpen(false)
                return
            }

            setIsLoading(true)
            try {
                const response = await fetch('/api/admin/users')

                if (response.ok) {
                    const users = await response.json()
                    
                    // Filter users based on search term
                    const filteredUsers = users.filter((user: UserSuggestion) => {
                        const searchTerm = debouncedValue.toLowerCase()
                        return (
                            user.name?.toLowerCase().includes(searchTerm) ||
                            user.email.toLowerCase().includes(searchTerm) ||
                            user.company.toLowerCase().includes(searchTerm) ||
                            user.accessCode.toLowerCase().includes(searchTerm)
                        )
                    }).filter((user: UserSuggestion) => user.isActive) // Only show active users
                    
                    setSuggestions(filteredUsers)
                    // Only open dropdown if we have suggestions and user is actively typing
                    if (filteredUsers.length > 0 && !hasSelectedUser) {
                        setIsOpen(true)
                    }
                } else {
                    setSuggestions([])
                    setIsOpen(false)
                }
            } catch (error) {
                console.error('Error fetching users:', error)
                setSuggestions([])
                setIsOpen(false)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSuggestions()
    }, [debouncedValue, disabled, hasSelectedUser])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        onChange(newValue)
        setHasSelectedUser(false)
        setSelectedIndex(-1)
    }

    const handleSuggestionClick = (user: UserSuggestion) => {
        const displayName = user.name || user.email
        onChange(displayName, user.id)
        setHasSelectedUser(true)
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex])
                }
                break
            case 'Escape':
                setIsOpen(false)
                setSelectedIndex(-1)
                inputRef.current?.blur()
                break
        }
    }

    const clearInput = () => {
        onChange('')
        setHasSelectedUser(false)
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.focus()
    }

    const handleFocus = () => {
        if (disabled) return;
        // Only open dropdown if there's a value, user hasn't selected anyone, and we have suggestions
        if (value && value.length >= 2 && !hasSelectedUser && suggestions.length > 0) {
            setIsOpen(true)
        }
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-3 pr-12 bg-slate-800/50 border rounded-xl text-white 
                        placeholder-white/40 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                        ${error ? 'border-red-500/50' : 'border-slate-600/50'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                />
                
                {/* Right side icons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    <AnimatePresence mode="wait">
                        {value && !disabled ? (
                            <motion.button
                                key="clear"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                onClick={clearInput}
                                className="text-slate-400 hover:text-white transition-colors"
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </motion.button>
                        ) : (
                            <motion.div
                                key="chevron"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                className={`transform transition-transform duration-200 ${
                                    isOpen ? 'rotate-180' : 'rotate-0'
                                }`}
                            >
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden"
                    >
                        {isLoading ? (
                            <div className="p-4 text-center text-slate-400">
                                <div className="flex items-center justify-center space-x-2">
                                    <motion.div
                                        className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    />
                                    <span className="text-sm">Loading users...</span>
                                </div>
                            </div>
                        ) : suggestions.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto">
                                {suggestions.map((user, index) => (
                                    <motion.button
                                        key={user.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.15, delay: index * 0.02 }}
                                        onClick={() => handleSuggestionClick(user)}
                                        className={`
                                            w-full px-4 py-3 text-left hover:bg-slate-700/50 
                                            transition-colors duration-150 border-b border-slate-700/30 last:border-b-0
                                            ${selectedIndex === index ? 'bg-slate-700/50' : ''}
                                        `}
                                        type="button"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-400" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {user.name || user.email}
                                                    </p>
                                                    <span className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
                                                        {user.accessCode}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-400 truncate">
                                                    {user.company} • {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-slate-400">
                                <div className="flex items-center justify-center space-x-2">
                                    <Search className="h-4 w-4" />
                                    <span className="text-sm">No users found</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 text-sm text-red-400"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}