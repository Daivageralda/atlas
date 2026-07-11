import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CodeBlock({ code, className = '' }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`relative bg-atlas-surface border border-atlas-border rounded-input p-4 font-mono text-[11px] select-text group ${className}`}>
            {/* Copy Button */}
            <button
                type="button"
                onClick={handleCopy}
                className="absolute top-3 right-3 p-1.5 rounded bg-atlas-card border border-atlas-border hover:bg-atlas-hover text-atlas-secondary hover:text-atlas-primary transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1 text-[9px] font-bold"
                title="Salin kode"
            >
                {copied ? (
                    <>
                        <Check className="h-3 w-3 text-atlas-success" />
                        <span className="text-atlas-success">Tersalin!</span>
                    </>
                ) : (
                    <>
                        <Copy className="h-3 w-3" />
                        <span>Salin</span>
                    </>
                )}
            </button>

            {/* Code Content */}
            <pre className="overflow-x-auto whitespace-pre-wrap break-all pr-12 text-atlas-primary leading-relaxed">
                {code}
            </pre>
        </div>
    );
}
