'use client'

import { AdminSidebar } from '@/features/admin/components/AdminSidebar'
import AdminHeader from '@/features/admin/components/AdminHeader'
import { AdminErrorBoundary } from '@/features/admin/components/AdminErrorBoundary'
import { AdminToastProvider } from '@/features/admin/components/AdminToast'
import { AdminPageLoading } from '@/features/admin/components/AdminLoadingStates'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (status === 'loading') return // Still loading
        
        if (!session || !session.user.isAdmin) {
            redirect('/login')
        }
    }, [session, status])

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    if (status === 'loading') {
        return <AdminPageLoading message="Loading admin panel..." />
    }

    if (!session || !session.user.isAdmin) {
        return null
    }

    return (
        <AdminErrorBoundary>
            <AdminToastProvider>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
                    <AdminSidebar 
                        isMobileMenuOpen={isMobileMenuOpen}
                        onCloseMobileMenu={closeMobileMenu}
                    />
                    <div className="flex-1 lg:ml-64 flex flex-col">
                        <AdminHeader onMenuToggle={toggleMobileMenu} />
                        <main className="flex-1 p-4 lg:p-6">
                            {children}
                        </main>
                    </div>
                </div>
            </AdminToastProvider>
        </AdminErrorBoundary>
    )
}