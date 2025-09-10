"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, X, Check } from 'lucide-react'
import { useDebounce } from '@/features/shared/hooks'

interface LocationSuggestion {
    latitude: number
    longitude: number
    displayName: string
    importance: number
}

interface LocationInputProps {
    value: string
    onChange: (value: string, coordinates?: { latitude: number; longitude: number }) => void
    placeholder?: string
    error?: string
    disabled?: boolean
    className?: string
}

export function LocationInput({
    value,
    onChange,
    placeholder = "Enter location...",
    error,
    disabled = false,
    className = ""
}: LocationInputProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [hasSelectedCoordinates, setHasSelectedCoordinates] = useState(false)
    
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
            if (!debouncedValue || debouncedValue.length < 3) {
                setSuggestions([])
                setIsOpen(false)
                return
            }

            setIsLoading(true)
            try {
                const response = await fetch('/api/admin/geocode', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ address: debouncedValue })
                })

                if (response.ok) {
                    const data = await response.json()
                    setSuggestions(data.locations || [])
                    setIsOpen(data.locations?.length > 0)
                } else {
                    setSuggestions([])
                    setIsOpen(false)
                }
            } catch (error) {
                console.error('Error fetching location suggestions:', error)
                setSuggestions([])
                setIsOpen(false)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSuggestions()
    }, [debouncedValue])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        onChange(newValue)
        setHasSelectedCoordinates(false)
        setSelectedIndex(-1)
    }

    const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
        onChange(suggestion.displayName, {
            latitude: suggestion.latitude,
            longitude: suggestion.longitude
        })
        setHasSelectedCoordinates(true)
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || suggestions.length === 0) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => 
                    prev > 0 ? prev - 1 : suggestions.length - 1
                )
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionSelect(suggestions[selectedIndex])
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
        setHasSelectedCoordinates(false)
        setIsOpen(false)
        setSuggestions([])
        inputRef.current?.focus()
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setIsOpen(true)
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full pl-10 pr-12 py-3 
                        bg-slate-800/50 border border-slate-700/50 
                        rounded-xl text-white placeholder-slate-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                        transition-all duration-200
                        ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : ''}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${hasSelectedCoordinates ? 'border-green-500/50' : ''}
                    `}
                />
                
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Search className="h-4 w-4 text-slate-400 animate-pulse" />
                            </motion.div>
                        ) : hasSelectedCoordinates ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Check className="h-4 w-4 text-green-400" />
                            </motion.div>
                        ) : value ? (
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
                                key="search"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Search className="h-4 w-4 text-slate-400" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

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

            {/* Suggestions dropdown */}
            <AnimatePresence>
                {isOpen && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="max-h-60 overflow-y-auto">
                            {suggestions.map((suggestion, index) => (
                                <motion.button
                                    key={`${suggestion.latitude}-${suggestion.longitude}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.15, delay: index * 0.05 }}
                                    onClick={() => handleSuggestionSelect(suggestion)}
                                    className={`
                                        w-full px-4 py-3 text-left hover:bg-slate-700/50 
                                        transition-colors duration-150 border-b border-slate-700/30 last:border-b-0
                                        ${selectedIndex === index ? 'bg-slate-700/50' : ''}
                                    `}
                                    type="button"
                                >
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">
                                                {suggestion.displayName}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {suggestion.latitude.toFixed(6)}, {suggestion.longitude.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}