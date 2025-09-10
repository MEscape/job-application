import React from "react"
import { User } from "lucide-react"
import { motion } from "framer-motion"

interface LockScreenProps {
    formattedTime: string
    formattedDate: string
    onUnlock: () => void
    isVisible: boolean
}

export function LockScreen({
                               formattedTime,
                               formattedDate,
                               onUnlock,
                               isVisible,
                           }: LockScreenProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
                opacity: isVisible ? 1 : 0, 
                scale: isVisible ? 1 : 0.95,
                pointerEvents: isVisible ? "auto" : "none"
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6"
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl" 
                />
            </div>
            
            <div className="relative z-10 flex flex-col items-center space-y-6 sm:space-y-8">
                <motion.div 
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                    className="text-center text-white"
                >
                    <motion.div 
                        animate={{ 
                            textShadow: [
                                '0 0 20px rgba(255,255,255,0.3)',
                                '0 0 30px rgba(255,255,255,0.6)',
                                '0 0 20px rgba(255,255,255,0.3)'
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-thin tracking-wider mb-3"
                    >
                        {formattedTime}
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-2xl sm:text-3xl md:text-4xl font-light text-white/70 tracking-wide"
                    >
                        {formattedDate}
                    </motion.div>
                </motion.div>

                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full" />
                    <User className="w-10 h-10 text-white/90 relative z-10" />
                </motion.div>

                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                    whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 20px 40px rgba(255,255,255,0.2)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onUnlock}
                    className="px-6 py-3 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 backdrop-blur-xl rounded-full text-white font-medium transition-all duration-300 border border-white/30 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group text-sm"
                >
                    <span className="relative z-10">Unlock</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
            </div>
        </motion.div>
    )
}
