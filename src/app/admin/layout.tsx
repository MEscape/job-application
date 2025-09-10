'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Background } from "@/features/shared/components"
import { AdminErrorBoundary, AdminPageLoading, AdminSidebar } from '@/features/admin/components'
import AdminHeader from "@/features/admin/components/AdminHeader"

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { data: session, status } = useSession()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [hasRedirected, setHasRedirected] = useState(false)

    useEffect(() => {
        if (status === 'loading') return // Still loading

        if (!session?.user?.isAdmin && !hasRedirected) {
            setHasRedirected(true)
            redirect('/')
        }
    }, [session, status, hasRedirected])

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    // Show loading while session is being fetched
    if (status === 'loading') {
        return <AdminPageLoading message="Loading admin panel..." />
    }

    // Don't render anything if user is not admin (will redirect)
    if (!session?.user?.isAdmin) {
        return <AdminPageLoading message="Redirecting..." />
    }

    return (
        <AdminErrorBoundary>
            <Background>
                <div className="min-h-screen flex" data-admin-section>
                    <AdminSidebar
                        isMobileMenuOpen={isMobileMenuOpen}
                        onCloseMobileMenu={closeMobileMenu}
                    />
                    <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                        <AdminHeader onMenuToggle={toggleMobileMenu} />
                        <main className="flex-1 p-4 lg:p-6">
                            {children}
                        </main>
                    </div>
                </div>
            </Background>
        </AdminErrorBoundary>
    )
}