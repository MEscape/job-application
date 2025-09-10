"use client"

import React, { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import {Background} from "@/features/shared/components";

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
    showDetails: boolean
}

export class AdminErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, showDetails: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            showDetails: false
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
        this.setState({ hasError: false, error: undefined, errorInfo: undefined, showDetails: false })
    }

    toggleDetails = () => {
        this.setState(prevState => ({ showDetails: !prevState.showDetails }))
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <Background>
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-lg w-full"
                        >
                            <div className="text-center">
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

                                <p className="text-white/70 mb-8">
                                    An unexpected error occurred in the admin panel. Please try refreshing the page or contact support if the problem persists.
                                </p>
                            </div>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="mb-6">
                                    <motion.button
                                        onClick={this.toggleDetails}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white/90 rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20"
                                    >
                                        <span className="text-sm font-medium">Error Details (Development)</span>
                                        {this.state.showDetails ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                    </motion.button>

                                    {this.state.showDetails && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="mt-3 overflow-hidden"
                                        >
                                            <pre className="text-xs text-red-300 bg-slate-900/50 p-4 rounded-lg overflow-auto max-h-48 border border-red-500/20 whitespace-pre-wrap break-words scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-red-500/40 hover:scrollbar-thumb-red-500/60 scrollbar-track-rounded-full scrollbar-thumb-rounded-full">
                                                {this.state.error.toString()}
                                                {this.state.errorInfo?.componentStack}
                                            </pre>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <motion.button
                                    onClick={this.handleRetry}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Try Again</span>
                                </motion.button>

                                <Link href="/admin" className="block">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors duration-200 w-full shadow-lg"
                                    >
                                        <Home className="w-4 h-4" />
                                        <span>Go to Dashboard</span>
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </Background>
            )
        }

        return this.props.children
    }
}