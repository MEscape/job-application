interface GalleryOverlayProps {
    isGalleryMode: boolean;
    onBackClick?: () => void;
    projectTitle?: string;
    selectedImage: number | null;
    sampleImages: string[];
}

export const GalleryOverlay = ({
    isGalleryMode,
    onBackClick,
    projectTitle,
    selectedImage,
    sampleImages
}: GalleryOverlayProps) => {
    return (
        <>
            {/* Modern Integrated Header - Strip Mode */}
            {!isGalleryMode && (
                <div className="absolute top-6 inset-x-6 z-50 flex justify-between items-start">
                    {/* Left - Instructions */}
                    <div className="bg-gradient-to-br from-black/90 via-black/85 to-gray-900/80 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 shadow-xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
                            <span className="text-white/90 text-sm font-medium">Click image to view</span>
                        </div>
                    </div>

                    {/* Right - Project Info & Back Button */}
                    <div className="bg-gradient-to-br from-black/90 via-black/85 to-gray-900/80 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 shadow-xl">
                        <div className="flex items-center space-x-4">
                            {onBackClick && (
                                <button
                                    onClick={onBackClick}
                                    className="group flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 rounded-md transition-all duration-200 hover:scale-105"
                                >
                                    <svg
                                        className="w-4 h-4 text-white/80 group-hover:text-white transition-colors duration-200"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                        />
                                    </svg>
                                </button>
                            )}
                            <div>
                                <div className="text-white/60 text-xs uppercase tracking-wider font-medium mb-0.5">
                                    Project Gallery
                                </div>
                                <h1 className="text-white font-semibold text-sm leading-tight max-w-48 truncate">
                                    {projectTitle}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modern Integrated Header - Gallery Mode */}
            {isGalleryMode && (
                <div className="absolute top-6 inset-x-6 z-50 flex justify-between items-start">
                    {/* Left - Navigation Instructions */}
                    <div className="bg-gradient-to-br from-black/90 via-black/85 to-gray-900/80 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 shadow-xl">
                        <div className="space-y-2">
                            <span className="text-white/90 text-sm font-medium">← → Navigate • ESC Close</span>
                            <div className="text-white/60 text-xs">
                                {(selectedImage ?? 0) + 1} / {sampleImages.length}
                            </div>
                        </div>
                    </div>

                    {/* Right - Project Info & Back Button */}
                    <div className="bg-gradient-to-br from-black/90 via-black/85 to-gray-900/80 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 shadow-xl">
                        <div className="flex items-center space-x-4">
                            {onBackClick && (
                                <button
                                    onClick={onBackClick}
                                    className="group flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 rounded-md transition-all duration-200 hover:scale-105"
                                >
                                    <svg
                                        className="w-4 h-4 text-white/80 group-hover:text-white transition-colors duration-200"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                        />
                                    </svg>
                                </button>
                            )}
                            <div>
                                <div className="text-white/60 text-xs uppercase tracking-wider font-medium mb-0.5">
                                    Project Gallery
                                </div>
                                <h1 className="text-white font-semibold text-sm leading-tight max-w-48 truncate">
                                    {projectTitle}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}