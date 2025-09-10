"use client"

import React, { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
}

export class AdminErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            error,
            errorInfo
        })
        
        // Log error to monitoring service
        console.error('Admin Error Boundary caught an error:', error, errorInfo)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-white mb-4">
                            Something went wrong
                        </h2>
                        
                        <p className="text-white/70 mb-6">
                            An unexpected error occurred in the admin panel. Please try refreshing the page or contact support if the problem persists.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="text-white/60 cursor-pointer mb-2">
                                    Error Details (Development)
                                </summary>
                                <pre className="text-xs text-red-300 bg-black/30 p-3 rounded-lg overflow-auto max-h-32">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <motion.button
                                onClick={this.handleRetry}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Try Again</span>
                            </motion.button>
                            
                            <Link href="/admin">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 w-full"
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Go to Dashboard</span>
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            )
        }

        return this.props.children
    }
}

// Hook version for functional components
export function useErrorHandler() {
    const [error, setError] = React.useState<Error | null>(null)

    const resetError = React.useCallback(() => {
        setError(null)
    }, [])

    const handleError = React.useCallback((error: Error) => {
        setError(error)
        console.error('Admin error:', error)
    }, [])

    React.useEffect(() => {
        if (error) {
            // Log to monitoring service
            console.error('Error handled by useErrorHandler:', error)
        }
    }, [error])

    return {
        error,
        resetError,
        handleError
    }
}