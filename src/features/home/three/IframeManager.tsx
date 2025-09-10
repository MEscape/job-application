'use client'

import React from 'react';
import { useIframeSync, type IframeViewType } from '@/features/shared/hooks/useIframeSync';

interface IframeManagerProps {
    view: IframeViewType;
    interactive: boolean;
    style?: React.CSSProperties;
    className?: string;
}

export function IframeManager({ view, interactive, style, className }: IframeManagerProps) {
    const { iframeRef, handleIframeLoad } = useIframeSync(view, interactive);

    const iframeStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        border: 'none',
        pointerEvents: interactive ? 'auto' : 'none',
        imageRendering: 'pixelated',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        ...style
    };

    return (
        <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <iframe
                id="monitor-iframe"
                ref={iframeRef}
                src="/login"
                style={iframeStyle}
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="Monitor Display"
                onLoad={handleIframeLoad}
            />
        </div>
    );
}

export default IframeManager;