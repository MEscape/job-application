"use client"

import {AnimatePresence, motion} from "framer-motion"
import { signOut } from 'next-auth/react'
import {sidebarItems} from "@/features/admin/constants/navbar";
import {usePathname} from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {LogOut} from "lucide-react";

interface AdminSidebarProps {
    isMobileMenuOpen?: boolean
    onCloseMobileMenu?: () => void
}

export function AdminSidebar({ isMobileMenuOpen, onCloseMobileMenu }: AdminSidebarProps) {
    const pathname = usePathname()
    const [isLargeScreen, setIsLargeScreen] = useState(false)

    useEffect(() => {
        const checkScreenSize = () => {
            if (typeof window !== 'undefined') {
                setIsLargeScreen(window.innerWidth >= 1024)
            }
        }

        // Initial check
        checkScreenSize()

        // Add event listener
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', checkScreenSize)
        }

        // Cleanup
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', checkScreenSize)
            }
        }
    }, [])

    const handleSignOut = () => {
        signOut({ redirectTo: '/login' })
    }

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCloseMobileMenu}
                        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                initial={{ x: -300 }}
                animate={{
                    x: isMobileMenuOpen || isLargeScreen ? 0 : -300
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-64 bg-gray-900 lg:bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col fixed lg:fixed h-full z-50 lg:z-auto"
            >
                {/* Logo/Brand */}
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">
                        Admin Panel
                    </h2>
                    <p className="text-white/60 text-sm mt-1">
                        Management Dashboard
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <Link
                                    href={item.href}
                                    onClick={onCloseMobileMenu}
                                    className={`
                                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                                    ${isActive
                                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }
                                `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="ml-auto w-2 h-2 bg-white rounded-full"
                                        />
                                    )}
                                </Link>
                            </motion.div>
                        )
                    })}
                </nav>

                {/* Sign Out */}
                <div className="p-4 border-t border-white/10">
                    <motion.button
                        onClick={handleSignOut}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-red-500/20 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </motion.button>
                </div>
            </motion.div>
        </>
    )
}