"use client"

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, File, Video, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Modal } from './Modal'
import { PathInput } from './PathInput'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  fileName: string
  parentPath: string
  file: File | null
}

interface FormErrors {
  fileName?: string
  parentPath?: string
  file?: string
}

interface UploadProgress {
  isUploading: boolean
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
}

export function FileUploadModal({ isOpen, onClose, onSuccess }: FileUploadModalProps) {
  const [formData, setFormData] = useState<FormData>({
    fileName: '',
    parentPath: '/',
    file: null
  })
  
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    status: 'idle'
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.fileName.trim()) {
      newErrors.fileName = 'File name is required'
    }
    
    if (!formData.parentPath.trim()) {
      newErrors.parentPath = 'Parent path is required'
    }
    
    if (!formData.file) {
      newErrors.file = 'Please select a file'
    } else {
      const allowedTypes = ['application/pdf', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
      if (!allowedTypes.includes(formData.file.type) && !formData.file.type.startsWith('video/')) {
        newErrors.file = 'Only PDF and video files are allowed'
      }
      
      // 100MB limit
      if (formData.file.size > 100 * 1024 * 1024) {
        newErrors.file = 'File size must be less than 100MB'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        file,
        fileName: prev.fileName || file.name // Keep original filename with extension
      }))
      setErrors(prev => ({ ...prev, file: undefined }))
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        file,
        fileName: prev.fileName || file.name // Keep original filename with extension
      }))
      setErrors(prev => ({ ...prev, file: undefined }))
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) return
    
    setUploadProgress({ isUploading: true, progress: 0, status: 'uploading' })
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', formData.file!)
      formDataToSend.append('fileName', formData.fileName)
      formDataToSend.append('parentPath', formData.parentPath)
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 20, 90)
        }))
      }, 200)
      
      const response = await fetch('/api/admin/files/upload', {
        method: 'POST',
        body: formDataToSend
      })
      
      clearInterval(progressInterval)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
      
      setUploadProgress({ isUploading: false, progress: 100, status: 'success' })

      // Reset form
      setFormData({ fileName: '', parentPath: '/', file: null })
      setErrors({})
      
      // Close modal after short delay
      setTimeout(() => {
        onSuccess?.()
        onClose()
        setUploadProgress({ isUploading: false, progress: 0, status: 'idle' })
      }, 1000)
      
    } catch (error) {
      setUploadProgress({ 
        isUploading: false, 
        progress: 0, 
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      })
    }
  }

  const handleClose = () => {
    if (!uploadProgress.isUploading) {
      setFormData({ fileName: '', parentPath: '/', file: null })
      setErrors({})
      setUploadProgress({ isUploading: false, progress: 0, status: 'idle' })
      onClose()
    }
  }

  const getFileIcon = () => {
    if (!formData.file) return <Upload className="w-8 h-8 text-white/80" />
    
    if (formData.file.type === 'application/pdf') {
      return <File className="w-8 h-8 text-red-400" />
    }
    
    if (formData.file.type.startsWith('video/')) {
      return <Video className="w-8 h-8 text-blue-400" />
    }
    
    return <Upload className="w-8 h-8" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload File"
      subtitle="Upload PDF or video files to the system"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Drop Zone */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">
            File
          </label>
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
              ${formData.file 
                ? 'border-green-500/50 bg-green-500/5' 
                : 'border-slate-600/50 hover:border-slate-500/70 bg-slate-800/30'
              }
              ${errors.file ? 'border-red-500/50 bg-red-500/5' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,video/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadProgress.isUploading}
            />
            
            <div className="flex flex-col items-center space-y-3">
              {getFileIcon()}
              
              {formData.file ? (
                <div className="space-y-1">
                  <p className="text-white font-medium">{formData.file.name}</p>
                  <p className="text-white/60 text-sm">{formatFileSize(formData.file.size)}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-white/80">Drop your file here or click to browse</p>
                  <p className="text-white/60 text-sm">PDF and video files only (max 100MB)</p>
                </div>
              )}
            </div>
          </div>
          {errors.file && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.file}
            </p>
          )}
        </div>

        {/* File Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">
            File Name
          </label>
          <input
            type="text"
            value={formData.fileName}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, fileName: e.target.value }))
              setErrors(prev => ({ ...prev, fileName: undefined }))
            }}
            className={`
              w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white 
              placeholder-white/40 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
              ${errors.fileName ? 'border-red-500/50' : 'border-slate-600/50'}
            `}
            placeholder="Enter file name"
            disabled={uploadProgress.isUploading}
          />
          {errors.fileName && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.fileName}
            </p>
          )}
        </div>

        {/* Parent Path */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">
            Parent Path
          </label>
          <PathInput
            value={formData.parentPath}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, parentPath: value }))
              setErrors(prev => ({ ...prev, parentPath: undefined }))
            }}
            error={errors.parentPath}
            placeholder="Select parent folder..."
            disabled={uploadProgress.isUploading}
          />
        </div>

        {/* Progress Bar */}
        {uploadProgress.isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Uploading...</span>
              <span className="text-white/60">{Math.round(uploadProgress.progress)}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {uploadProgress.status === 'success' && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            File uploaded successfully!
          </div>
        )}
        
        {uploadProgress.status === 'error' && uploadProgress.error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {uploadProgress.error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploadProgress.isUploading}
            className="
              flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700/70 
              text-white rounded-xl transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:scale-[1.02] active:scale-[0.98]
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploadProgress.isUploading || !formData.file}
            className="
              flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 
              text-white rounded-xl transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:scale-[1.02] active:scale-[0.98]
              flex items-center justify-center gap-2
            "
          >
            {uploadProgress.isUploading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload File
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}