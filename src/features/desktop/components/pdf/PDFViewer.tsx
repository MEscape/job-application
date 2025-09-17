"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Download, X } from 'lucide-react';

interface PDFViewerProps {
  fileId: string;
  fileName: string;
}

export function PDFViewer({ fileId, fileName }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/files/view/${fileId}`);
        if (!response.ok) {
          throw new Error('Failed to load PDF');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [fileId]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    const downloadUrl = `/api/files/download/${fileId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col h-full bg-white"
    >
      {/* Toolbar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center px-4 py-3 bg-gray-50/80 backdrop-blur-md border-b border-gray-200/50"
      >
        <div className="flex items-center space-x-4">
          {!isLoading && !error && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleZoomOut}
                className="p-2 rounded-lg hover:bg-white/80 transition-colors shadow-sm border border-gray-200/50"
                disabled={scale <= 0.5}
              >
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </motion.button>
              
              <span className="text-sm text-gray-700 min-w-[4rem] text-center font-medium">
                {Math.round(scale * 100)}%
              </span>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleZoomIn}
                className="p-2 rounded-lg hover:bg-white/80 transition-colors shadow-sm border border-gray-200/50"
                disabled={scale >= 3}
              >
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm border border-blue-200/50 bg-blue-50/50"
              >
                <Download className="w-4 h-4 text-blue-600" />
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Loading PDF...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center space-y-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load PDF</h3>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </motion.div>
          )}

          {pdfUrl && !isLoading && !error && (
            <motion.div
              key="pdf"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col items-center"
            >
              <div 
                className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200/50"
                style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
              >
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-[800px] h-[600px] border-0"
                  title={fileName}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </motion.div>
  );
}