"use client"

import {Background} from "@/features/shared/components";

interface AdminSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
}

interface AdminPageLoadingProps {
    message?: string
}

// Generic loading spinner
export function AdminSpinner({ size = 'md' }: AdminSpinnerProps) {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3'
    }

    return (
        <div className={`${sizeClasses[size]} border-white/30 border-t-white rounded-full animate-spin mx-auto`}>
        </div>
    )
}

// Main page loading component
export function AdminPageLoading({ message = 'Loading...' }: AdminPageLoadingProps) {
    return (
        <Background>
            <div className="flex flex-col items-center justify-center h-screen space-y-6">
                <AdminSpinner size="lg" />
                <h2 className="text-xl font-medium text-white/90">
                    {message}
                </h2>
            </div>
        </Background>
    )
}