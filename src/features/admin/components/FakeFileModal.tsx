"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { File, Video, AlertCircle, CheckCircle2, CheckCircle, FileText, Image, Music, Archive, Code, Folder } from "lucide-react"
import { Modal } from './Modal'
import { PathInput } from './PathInput'
import { UserInput } from './UserInput'

interface FakeFileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  fileName: string
  parentPath: string
  fileType: 'FOLDER' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'ARCHIVE' | 'CODE' | 'TEXT' | 'OTHER' | ''
  selectedUser: string
  userId: string | null
}

interface CreateProgress {
  isCreating: boolean
  status: 'idle' | 'creating' | 'success' | 'error'
  error?: string
}

interface FormErrors {
  fileName?: string
  parentPath?: string
  fileType?: string
  selectedUser?: string
}

export function FakeFileModal({ isOpen, onClose, onSuccess }: FakeFileModalProps) {
  const [formData, setFormData] = useState<FormData>({
    fileName: '',
    parentPath: '/',
    fileType: '',
    selectedUser: '',
    userId: null
  })
  
  const [createProgress, setCreateProgress] = useState<CreateProgress>({
    isCreating: false,
    status: 'idle'
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.fileName.trim()) {
      newErrors.fileName = 'File name is required'
    }
    
    if (!formData.parentPath.trim()) {
      newErrors.parentPath = 'Parent path is required'
    }
    
    if (!formData.fileType) {
      newErrors.fileType = 'File type is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) return
    
    setCreateProgress({ isCreating: true, status: 'creating' })
    
    try {
      const response = await fetch('/api/admin/files/fake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: formData.fileName,
          parentPath: formData.parentPath,
          fileType: formData.fileType,
          userId: formData.userId
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Creation failed')
      }
      
      setCreateProgress({ isCreating: false, status: 'success' })
      setShowSuccess(true)

      // Reset form
      setFormData({ fileName: '', parentPath: '/', fileType: '', selectedUser: '', userId: null })
      setErrors({})
      
      // Close modal after short delay
      setTimeout(() => {
        onSuccess?.()
        onClose()
        setCreateProgress({ isCreating: false, status: 'idle' })
        setShowSuccess(false)
      }, 1500)
      
    } catch (error) {
      setCreateProgress({ 
        isCreating: false, 
        status: 'error',
        error: error instanceof Error ? error.message : 'Creation failed'
      })
    }
  }

  const handleClose = () => {
    if (!createProgress.isCreating) {
      setFormData({ fileName: '', parentPath: '/', fileType: '', selectedUser: '', userId: null })
      setErrors({})
      setCreateProgress({ isCreating: false, status: 'idle' })
      onClose()
    }
  }

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'FOLDER':
        return <Folder className="w-6 h-6 text-yellow-400" />
      case 'IMAGE':
        return <Image className="w-6 h-6 text-green-400" />
      case 'VIDEO':
        return <Video className="w-6 h-6 text-blue-400" />
      case 'AUDIO':
        return <Music className="w-6 h-6 text-purple-400" />
      case 'DOCUMENT':
        return <File className="w-6 h-6 text-red-400" />
      case 'ARCHIVE':
        return <Archive className="w-6 h-6 text-orange-400" />
      case 'CODE':
        return <Code className="w-6 h-6 text-cyan-400" />
      case 'TEXT':
        return <FileText className="w-6 h-6 text-gray-400" />
      case 'OTHER':
        return <FileText className="w-6 h-6 text-slate-400" />
      default:
        return <FileText className="w-6 h-6 text-gray-400" />
    }
  }

  // Show success animation
  if (showSuccess) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Success"
        maxWidth="md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-white mb-2">
              Fake File Created Successfully!
            </h3>
            <p className="text-slate-400">
              {formData.fileName} has been created in the database.
            </p>
          </motion.div>
        </motion.div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Fake File"
      subtitle="Create a database entry without uploading a physical file"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="Enter file name (without extension)"
            disabled={createProgress.isCreating}
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
            disabled={createProgress.isCreating}
            userId={formData.userId}
          />
        </div>

        {/* User Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">
            User (Optional)
            <span className="text-white/50 text-xs ml-2">Leave empty for public access</span>
          </label>
          <UserInput
            value={formData.selectedUser}
            onChange={(value, userId) => {
              setFormData(prev => ({ ...prev, selectedUser: value, userId: userId || null }))
            }}
            placeholder="Select user or leave empty for public access..."
            disabled={createProgress.isCreating}
            className="bg-slate-800/50 border-slate-600/50 text-white placeholder-white/40"
          />

        </div>

        {/* File Type Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/80">
            File Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['FOLDER', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'ARCHIVE', 'CODE', 'TEXT', 'OTHER'] as const).map((type) => (
              <motion.button
                key={type}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, fileType: type }))
                  setErrors(prev => ({ ...prev, fileType: undefined }))
                }}
                disabled={createProgress.isCreating}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200
                  flex flex-col items-center gap-2
                  hover:scale-[1.02] active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    formData.fileType === type
                      ? 'border-blue-500/70 bg-blue-500/10 text-blue-400'
                      : 'border-slate-600/50 bg-slate-800/30 text-white/70 hover:border-slate-500/70'
                  }
                `}
                whileHover={{ scale: createProgress.isCreating ? 1 : 1.02 }}
                whileTap={{ scale: createProgress.isCreating ? 1 : 0.98 }}
              >
                {getFileTypeIcon(type)}
                <span className="font-medium">{type}</span>
                <span className="text-xs opacity-70">
                  {type === 'FOLDER' ? 'Directory' :
                   type === 'IMAGE' ? 'Image file' :
                   type === 'VIDEO' ? 'Video file' :
                   type === 'AUDIO' ? 'Audio file' :
                   type === 'DOCUMENT' ? 'Document file' :
                   type === 'ARCHIVE' ? 'Archive file' :
                   type === 'CODE' ? 'Code file' :
                   type === 'TEXT' ? 'Text file' :
                   'Other file'}
                </span>
              </motion.button>
            ))}
          </div>
          {errors.fileType && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.fileType}
            </p>
          )}
        </div>

        {/* Preview */}
        {formData.fileName && formData.fileType && (
          <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-600/30">
            <div className="flex items-center gap-3">
              {getFileTypeIcon(formData.fileType)}
              <div>
                <p className="text-white font-medium">
                  {formData.fileName}{formData.fileType === 'FOLDER' ? '' :
                   formData.fileType === 'IMAGE' ? '.jpg' :
                   formData.fileType === 'VIDEO' ? '.mp4' :
                   formData.fileType === 'AUDIO' ? '.mp3' :
                   formData.fileType === 'DOCUMENT' ? '.pdf' :
                   formData.fileType === 'ARCHIVE' ? '.zip' :
                   formData.fileType === 'CODE' ? '.js' :
                   formData.fileType === 'TEXT' ? '.txt' :
                   '.file'}
                </p>
                <p className="text-white/60 text-sm">
                  {formData.parentPath === '/' ? '/' : formData.parentPath}/{formData.fileName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {createProgress.status === 'success' && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Fake file created successfully!
          </div>
        )}
        
        {createProgress.status === 'error' && createProgress.error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {createProgress.error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={createProgress.isCreating}
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
            disabled={createProgress.isCreating || !formData.fileName || !formData.fileType}
            className="
              flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 
              text-white rounded-xl transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:scale-[1.02] active:scale-[0.98]
              flex items-center justify-center gap-2
            "
          >
            {createProgress.isCreating ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Creating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Create Fake File
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}