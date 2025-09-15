"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, ExternalLink } from 'lucide-react'

interface FileData {
  id: string
  name: string
  type: string
  extension: string | null
  size: number | null
  isReal: boolean
  dateCreated: string
  dateModified: string
}

export default function FileViewPage() {
  const params = useParams()
  const router = useRouter()
  const [file, setFile] = useState<FileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fileId = params.id as string

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const response = await fetch(`/api/admin/files?id=${fileId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch file data')
        }
        const data = await response.json()
        setFile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file')
      } finally {
        setLoading(false)
      }
    }

    if (fileId) {
      fetchFileData()
    }
  }, [fileId])

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/files/download/${fileId}`)
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file?.name || 'download'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const getFileViewUrl = () => {
    return `/api/files/view/${fileId}`
  }

  const isViewableInBrowser = (extension: string | null) => {
    if (!extension) return false
    const viewableExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.txt', '.md']
    return viewableExtensions.includes(extension.toLowerCase())
  }

  const isImageFile = (extension: string | null) => {
    if (!extension) return false
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg']
    return imageExtensions.includes(extension.toLowerCase())
  }

  const isTextFile = (extension: string | null) => {
    if (!extension) return false
    const textExtensions = ['.txt', '.md', '.json', '.xml', '.csv']
    return textExtensions.includes(extension.toLowerCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || 'File not found'}</div>
          <button
            onClick={() => router.back()}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">{file.name}</h1>
              <div className="text-sm text-slate-400">
                {file.extension && (
                  <span className="mr-4">{file.extension.toUpperCase()} File</span>
                )}
                {file.size && (
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {file.isReal && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                {isViewableInBrowser(file.extension) && (
                  <a
                    href={getFileViewUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {!file.isReal ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <div className="text-slate-400 mb-4">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-xl font-semibold text-white mb-2">Fake File</h2>
              <p>This is a placeholder file and cannot be viewed or downloaded.</p>
              <p className="text-sm mt-2">File Type: {file.type}</p>
            </div>
          </div>
        ) : isViewableInBrowser(file.extension) ? (
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            {isImageFile(file.extension) ? (
              <div className="p-4">
                <img
                  src={getFileViewUrl()}
                  alt={file.name}
                  className="max-w-full h-auto mx-auto rounded-lg"
                  style={{ maxHeight: '80vh' }}
                />
              </div>
            ) : file.extension === '.pdf' ? (
              <iframe
                src={getFileViewUrl()}
                className="w-full h-screen"
                title={file.name}
              />
            ) : isTextFile(file.extension) ? (
              <iframe
                src={getFileViewUrl()}
                className="w-full h-96 bg-white"
                title={file.name}
              />
            ) : (
              <div className="p-8 text-center">
                <div className="text-slate-400 mb-4">
                  <div className="text-6xl mb-4">📄</div>
                  <h2 className="text-xl font-semibold text-white mb-2">Preview Not Available</h2>
                  <p>This file type cannot be previewed in the browser.</p>
                  <p className="text-sm mt-2">Use the download button to view the file.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <div className="text-slate-400 mb-4">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-xl font-semibold text-white mb-2">Preview Not Available</h2>
              <p>This file type cannot be previewed in the browser.</p>
              <p className="text-sm mt-2">Use the download button to view the file.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}