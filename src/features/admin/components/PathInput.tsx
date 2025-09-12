"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, Search, X, ChevronDown } from 'lucide-react'

interface PathOption {
  path: string
  name: string
  parentPath: string | null
}

interface PathInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function PathInput({
  value,
  onChange,
  placeholder = "Select parent path...",
  error,
  disabled = false,
  className = ""
}: PathInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [paths, setPaths] = useState<PathOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchTerm, setSearchTerm] = useState('')
  
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Fetch paths when component mounts
  useEffect(() => {
    fetchPaths()
  }, [])

  const fetchPaths = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/files/paths')
      if (response.ok) {
        const data = await response.json()
        setPaths(data.paths || [])
      } else {
        console.error('Failed to fetch paths')
      }
    } catch (error) {
      console.error('Error fetching paths:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter paths based on search term
  const filteredPaths = paths.filter(path => 
    path.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    path.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    setSelectedIndex(-1)
    if (!isOpen) setIsOpen(true)
  }

  const handlePathSelect = (path: PathOption) => {
    onChange(path.path)
    setSearchTerm('')
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredPaths.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredPaths.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredPaths.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredPaths.length) {
          handlePathSelect(filteredPaths[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        setSearchTerm('')
        inputRef.current?.blur()
        break
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const clearInput = () => {
    onChange('')
    setSearchTerm('')
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const displayValue = searchTerm || (value ? paths.find(p => p.path === value)?.name || value : '')

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
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

      {/* Dropdown */}
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
                  <span className="text-sm">Loading paths...</span>
                </div>
              </div>
            ) : filteredPaths.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {filteredPaths.map((path, index) => (
                  <motion.button
                    key={path.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.02 }}
                    onClick={() => handlePathSelect(path)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-slate-700/50 
                      transition-colors duration-150 border-b border-slate-700/30 last:border-b-0
                      ${selectedIndex === index ? 'bg-slate-700/50' : ''}
                    `}
                    type="button"
                  >
                    <div className="flex items-center space-x-3">
                      <Folder className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {path.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {path.path}
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
                  <span className="text-sm">No paths found</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}