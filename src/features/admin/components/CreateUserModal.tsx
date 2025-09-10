"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { UserForm } from './UserForm'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900/95 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-slate-600/50 hover:scrollbar-thumb-slate-500/70 scrollbar-track-rounded-full scrollbar-thumb-rounded-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Create New User</h2>
                <p className="text-white/60 text-sm mt-1">
                  Add a new user to the system
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <UserForm
              mode="create"
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}