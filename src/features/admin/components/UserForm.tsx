"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Building, Mail, Locate, Key, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useUserManagementStore } from '@/features/admin/hooks/useUserManagementStore'
import { SignUpInput, signUpSchema } from "@/features/auth/lib"
import { User as UserType, UpdateUserData } from '@/features/admin/stores/userManagementStore'
import { LocationInput } from './LocationInput'
import z from 'zod'

const editUserSchema = z.object({
    email: z.string().email("Invalid email format"),
    company: z.string().min(1, "Company is required"),
    name: z.string().optional(),
    location: z.string().min(1, "Location is required"),
    latitude: z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),
    longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
    accessCode: z.string().optional(),
    password: z.string().optional()
})

interface UserFormProps {
    mode: 'create' | 'edit'
    user?: UserType
    onSuccess: () => void
    onCancel: () => void
}

export function UserForm({ mode, user, onSuccess, onCancel }: UserFormProps) {
    const { createUser, updateUser, isCreating, isUpdating, error, clearError } = useUserManagementStore()

    const [formData, setFormData] = useState<SignUpInput>(() => {
        if (mode === 'edit' && user) {
            return {
                email: user.email,
                company: user.company,
                name: user.name || '',
                location: user.location,
                latitude: user.latitude,
                longitude: user.longitude,
                accessCode: user.accessCode,
                password: '' // Don't pre-fill password for security
            }
        }
        return {
            email: '',
            company: '',
            name: '',
            location: '',
            latitude: 0,
            longitude: 0,
            accessCode: '',
            password: ''
        }
    })

    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignUpInput, string>>>({})
    const [showSuccess, setShowSuccess] = useState(false)

    const isLoading = mode === 'create' ? isCreating : isUpdating

    const validateForm = (): boolean => {
        try {
            if (mode === 'create') {
                signUpSchema.parse(formData)
            } else {
                // For edit mode, only validate non-empty fields
                const dataToValidate = Object.fromEntries(
                    Object.entries(formData).filter(([_, value]) => {
                        if (typeof value === 'string') {
                        return value.trim() !== ''
                        }
                        return value !== null && value !== undefined
                    })
                )
                editUserSchema.parse(dataToValidate)
            }
            setFieldErrors({})
            return true
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newFieldErrors: Partial<Record<keyof SignUpInput, string>> = {}
                error.issues.forEach((issue) => {
                    const fieldName = issue.path[0] as keyof SignUpInput
                    if (fieldName) {
                        newFieldErrors[fieldName] = issue.message
                    }
                })
                setFieldErrors(newFieldErrors)
            }
            return false
        }
    }

    const handleInputChange = (field: keyof SignUpInput, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))

        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: undefined }))
        }

        // Clear global error
        if (error) {
            clearError()
        }

        // Real-time validation for current field
        try {
            if (mode === 'create') {
                signUpSchema.pick({ [field]: true }).parse({ [field]: value })
            } else {
                // For edit mode, only validate if field has value
                if (value.trim() !== '') {
                    editUserSchema.pick({ [field]: true }).parse({ [field]: value })
                }
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const issue = error.issues[0]
                if (issue && (mode === 'create' || value.trim() !== '')) {
                    setFieldErrors(prev => ({ ...prev, [field]: issue.message }))
                }
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            if (mode === 'create') {
                // Prepare data for creation - remove empty optional fields
                const submitData = {
                    email: formData.email.trim(),
                    company: formData.company.trim(),
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    ...(formData.name?.trim() && { name: formData.name.trim() }),
                    location: formData.location.trim(),
                    ...(formData.accessCode?.trim() && { accessCode: formData.accessCode.trim() }),
                    ...(formData.password?.trim() && { password: formData.password.trim() })
                }

                await createUser(submitData)
            } else {
                // Prepare data for update - only include changed fields
                if (!user) return
                
                // Validate required fields for update
                if (!formData.email || formData.email.trim() === '') {
                    setFieldErrors(prev => ({ ...prev, email: 'Email is required' }))
                    return
                }
                if (!formData.company || formData.company.trim() === '') {
                    setFieldErrors(prev => ({ ...prev, company: 'Company is required' }))
                    return
                }
                
                const updateData: UpdateUserData = {
                    id: user.id
                }

                // Only include fields that have changed
                if (formData.email !== user.email) updateData.email = formData.email
                if (formData.company !== user.company) updateData.company = formData.company
                
                // Handle name field properly - compare with original value and handle empty strings
                const originalName = user.name || ''
                const newName = formData.name || ''
                if (newName !== originalName) {
                    updateData.name = newName === '' ? undefined : newName
                }
                
                // Handle location field properly
                const originalLocation = user.location || ''
                const newLocation = formData.location || ''
                if (newLocation !== originalLocation) {
                    updateData.location = newLocation === '' ? undefined : newLocation
                }

                if (formData.latitude !== user.latitude) {
                    updateData.latitude = formData.latitude
                }
                if (formData.longitude !== user.longitude) {
                    updateData.longitude = formData.longitude
                }

                await updateUser(updateData)
            }

            setShowSuccess(true)

            // Close modal after short delay to show success message
            setTimeout(() => {
                onSuccess()
            }, 1500)
        } catch (error) {
            // Error is handled by the store
            console.error(`Failed to ${mode} user:`, error)
        }
    }

    if (showSuccess) {
        return (
            <div className="p-8 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </motion.div>
                <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-semibold text-white mb-2"
                >
                    User {mode === 'create' ? 'Created' : 'Updated'} Successfully!
                </motion.h3>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/60"
                >
                    The user has been {mode === 'create' ? 'added to' : 'updated in'} the system.
                </motion.p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email {mode === 'create' && '*'}
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full bg-white/5 border ${fieldErrors.email ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors duration-200`}
                    placeholder="user@company.com"
                />
                {fieldErrors.email && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {fieldErrors.email}
                    </p>
                )}
            </div>

            {/* Company */}
            <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Company {mode === 'create' && '*'}
                </label>
                <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className={`w-full bg-white/5 border ${fieldErrors.company ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors duration-200`}
                    placeholder="Company Name"
                />
                {fieldErrors.company && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {fieldErrors.company}
                    </p>
                )}
            </div>

            {/* Name */}
            <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                </label>
                <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full bg-white/5 border ${fieldErrors.name ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors duration-200`}
                    placeholder="John Doe"
                />
                {fieldErrors.name && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {fieldErrors.name}
                    </p>
                )}
            </div>

            {/* Location */}
            <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                    <Locate className="w-4 h-4 inline mr-2" />
                    Location {mode === 'create' && '*'}
                </label>
                <LocationInput
                    value={formData.location || ''}
                    onChange={(value, coordinates) => {
                        handleInputChange('location', value)
                        // Store coordinates if available
                        if (coordinates) {
                            setFormData(prev => ({
                                ...prev,
                                latitude: coordinates.latitude,
                                longitude: coordinates.longitude
                            }))
                        }
                    }}
                    error={fieldErrors.location}
                    placeholder="Enter address or location"
                />
            </div>

            {/* Access Code - Only show for create mode */}
            {mode === 'create' && (
                <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                        <Key className="w-4 h-4 inline mr-2" />
                        Access Code
                        <span className="text-white/50 text-xs ml-2">(auto-generated if empty)</span>
                    </label>
                    <input
                        type="text"
                        value={formData.accessCode || ''}
                        onChange={(e) => handleInputChange('accessCode', e.target.value.toUpperCase())}
                        className={`w-full bg-white/5 border ${fieldErrors.accessCode ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors duration-200`}
                        placeholder="ABC12345"
                        maxLength={12}
                    />
                    {fieldErrors.accessCode && (
                        <p className="text-red-400 text-xs mt-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {fieldErrors.accessCode}
                        </p>
                    )}
                </div>
            )}

            {/* Password - Only show for create mode */}
            {mode === 'create' && (
                <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Temporary Password
                        <span className="text-white/50 text-xs ml-2">(auto-generated if empty)</span>
                    </label>
                    <input
                        type="text"
                        value={formData.password || ''}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full bg-white/5 border ${fieldErrors.password ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors duration-200`}
                        placeholder="Password20!"
                    />
                    {fieldErrors.password && (
                        <p className="text-red-400 text-xs mt-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {fieldErrors.password}
                        </p>
                    )}
                </div>
            )}

            {/* Edit mode note */}
            {mode === 'edit' && (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3">
                    <p className="text-blue-400 text-sm">
                        Note: Only modified fields will be updated. Access code and password cannot be changed here.
                    </p>
                </div>
            )}

            {/* Global Error */}
            {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {error}
                    </p>
                </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 px-4 py-3 rounded-xl font-medium transition-all duration-200"
                >
                    Cancel
                </button>
                <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-500/50 disabled:to-blue-600/50 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
                >
                    {isLoading ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create User' : 'Update User')}
                </motion.button>
            </div>
        </form>
    )
}