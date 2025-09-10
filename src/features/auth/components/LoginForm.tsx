"use client"

import React from "react"
import { ArrowLeft, Eye, EyeOff, Lock, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface LoginFormProps {
    onSubmit: (e?: React.FormEvent) => void
    onBack: () => void
    credentials: { accessCode: string; password: string }
    onCredentialChange: (
        field: "accessCode" | "password"
    ) => (e: React.ChangeEvent<HTMLInputElement>) => void
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
    showPassword: boolean
    onTogglePassword: () => void
    isLoading: boolean
    error: string
    isVisible: boolean
}

export function LoginForm({
                              onSubmit,
                              onBack,
                              credentials,
                              onCredentialChange,
                              onKeyDown,
                              showPassword,
                              onTogglePassword,
                              isLoading,
                              error,
                              isVisible,
                          }: LoginFormProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center px-4 sm:px-6"
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="w-full max-w-xs mx-auto"
                    >
                        <form onSubmit={onSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
                            {/* Background gradient effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />

                            <div className="relative z-10">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="flex items-center justify-between mb-3"
                                >
                                    <motion.button
                                        type="button"
                                        onClick={onBack}
                                        disabled={isLoading}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 disabled:opacity-50 backdrop-blur-sm border border-white/10"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-white/70" />
                                    </motion.button>
                                    <h1 className="text-base font-semibold text-white bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">Sign In</h1>
                                    <div className="w-11" /> {/* Spacer */}
                                </motion.div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="text-center mb-4"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mx-auto mb-2 shadow-2xl backdrop-blur-xl border border-white/30 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full" />
                                        <Lock className="w-6 h-6 text-white/90 relative z-10" />
                                    </motion.div>
                                    <h2 className="text-sm font-light text-white/90">Welcome Back</h2>
                                </motion.div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center backdrop-blur-sm shadow-lg"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    className="space-y-3"
                                >
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type="text"
                                            placeholder="Access Code"
                                            value={credentials.accessCode}
                                            onChange={onCredentialChange("accessCode")}
                                            onKeyDown={onKeyDown}
                                            disabled={isLoading}
                                            className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm transition-all duration-200 disabled:opacity-50 hover:bg-white/15 focus:bg-white/15 text-sm"
                                            autoComplete="username"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            value={credentials.password}
                                            onChange={onCredentialChange("password")}
                                            onKeyDown={onKeyDown}
                                            disabled={isLoading}
                                            className="w-full pl-10 pr-12 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm transition-all duration-200 disabled:opacity-50 hover:bg-white/15 focus:bg-white/15 text-sm"
                                            autoComplete="current-password"
                                        />
                                        <motion.button
                                            type="button"
                                            onClick={onTogglePassword}
                                            disabled={isLoading}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors duration-200 disabled:opacity-50 p-1 rounded-lg hover:bg-white/10"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </motion.button>
                                    </div>
                                </motion.div>

                                <motion.button
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    whileHover={{
                                        scale: 1.02,
                                        boxShadow: '0 20px 40px rgba(255,255,255,0.2)'
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-4 py-2.5 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white font-semibold rounded-lg transition-all duration-300 backdrop-blur-xl border border-white/30 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group text-sm"
                                >
                                    <span className="relative z-10">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                />
                                                <span>Signing In...</span>
                                            </div>
                                        ) : (
                                            "Sign In"
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}