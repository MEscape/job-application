"use client"

import { motion } from "framer-motion"
import {Bell, LogOut, Menu, Search, User, ChevronDown} from "lucide-react";
import {signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

interface AdminHeaderProps {
    onMenuToggle?: () => void
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
    const { data: session } = useSession()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [notificationCount] = useState(3)
    const userMenuRef = useRef<HTMLDivElement>(null)

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' })
    }

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false)
            }
        }

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showUserMenu])

    return (
        <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 lg:px-6 py-3 lg:py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {/* Mobile menu button */}
                    <motion.button
                        onClick={onMenuToggle}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                    >
                        <Menu className="w-5 h-5" />
                    </motion.button>
                </div>

                <div className="flex items-center space-x-2 lg:space-x-4">
                    {/* Search - Hidden on mobile */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="hidden sm:flex p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                    >
                        <Search className="w-4 h-4 lg:w-5 lg:h-5" />
                    </motion.button>

                    {/* Notifications */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 relative group"
                        title={`${notificationCount} new notifications`}
                    >
                        <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                        {notificationCount > 0 && (
                            <>
                                <span className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-red-500 rounded-full animate-pulse"></span>
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 lg:w-5 lg:h-5 bg-red-500/20 rounded-full animate-ping"></span>
                            </>
                        )}
                    </motion.button>

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                    {session?.user?.email?.charAt(0).toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-medium">{session?.user?.name || 'Admin'}</p>
                                <p className="text-xs text-white/50">{session?.user?.email}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Simple Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur border border-white/20 rounded-lg shadow-lg z-50">
                                <div className="p-2">
                                    <div className="px-3 py-2 border-b border-white/10">
                                        <p className="text-white text-sm font-medium truncate">{session?.user?.name || 'Admin'}</p>
                                        <p className="text-white/60 text-xs truncate">{session?.user?.email}</p>
                                    </div>
                                    
                                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors">
                                        <User className="w-4 h-4" />
                                        <span className="text-sm">Profile</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}