
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useState } from 'react';
import { Artifact } from '../types';
import { CopyIcon, DownloadIcon } from './Icons';
import LumoLoader from './LumoLoader';

interface ArtifactCardProps {
    artifact: Artifact;
    isFocused: boolean;
    isFullscreen?: boolean;
    onClick: () => void;
}

const ArtifactCard = React.memo(({ 
    artifact, 
    isFocused, 
    isFullscreen,
    onClick 
}: ArtifactCardProps) => {
    const codeRef = useRef<HTMLPreElement>(null);
    const [copied, setCopied] = useState(false);

    // Auto-scroll logic for code visibility
    useEffect(() => {
        if (codeRef.current) {
            codeRef.current.scrollTop = codeRef.current.scrollHeight;
        }
    }, [artifact.html]);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!artifact.html) return;
        
        navigator.clipboard.writeText(artifact.html).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!artifact.html) return;

        const blob = new Blob([artifact.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `${artifact.styleName.toLowerCase().replace(/\s+/g, '_')}_${artifact.id.substring(0, 5)}.html`;
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const isGenerating = artifact.status === 'streaming';

    return (
        <div 
            className={`artifact-card ${isFocused ? 'focused' : ''} ${isFullscreen ? 'fullscreen' : ''} ${isGenerating ? 'generating' : ''}`}
            onClick={onClick}
        >
            <div className="artifact-header">
                <span className="artifact-style-tag">{artifact.styleName}</span>
                <div className="artifact-actions-group">
                    <button 
                        className={`artifact-copy-btn ${copied ? 'copied' : ''}`}
                        onClick={handleCopy}
                        title="Copy raw HTML"
                        disabled={!artifact.html}
                    >
                        <CopyIcon />
                        <span>{copied ? 'Copied!' : 'Copy HTML'}</span>
                    </button>
                    <button 
                        className="artifact-copy-btn artifact-download-btn"
                        onClick={handleDownload}
                        title="Download as HTML file"
                        disabled={!artifact.html || isGenerating}
                    >
                        <DownloadIcon />
                        <span>Export HTML</span>
                    </button>
                </div>
            </div>
            <div className="artifact-card-inner">
                {isGenerating && (
                    <div className="generating-overlay">
                        <LumoLoader size="large" />
                        <pre ref={codeRef} className="code-stream-preview">
                            {artifact.html}
                        </pre>
                    </div>
                )}
                <iframe 
                    srcDoc={artifact.html} 
                    title={artifact.id} 
                    sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
                    className="artifact-iframe"
                />
            </div>
        </div>
    );
});

export default ArtifactCard;
