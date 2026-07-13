import React from 'react';

export function Input({ 
    label, 
    error, 
    hint, 
    type = 'text', 
    className = '', 
    ...props 
}) {
    return (
        <div className="space-y-1.5 w-full text-xs">
            {label && (
                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">
                    {label}
                </label>
            )}
            
            <input
                type={type}
                autoComplete="off"
                className={`
                    w-full px-3 py-2 bg-atlas-surface border rounded-input text-atlas-primary outline-none transition-all duration-150 text-xs
                    placeholder:text-atlas-secondary/50
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${error 
                        ? 'border-atlas-danger focus:border-atlas-danger focus:ring-2 focus:ring-atlas-danger/25' 
                        : 'border-atlas-border focus:border-atlas-accent/50 focus:ring-2 focus:ring-atlas-accent/15'
                    }
                    ${className}
                `}
                {...props}
            />

            {error ? (
                <p className="text-atlas-danger font-sans text-[10px]">{error}</p>
            ) : hint ? (
                <p className="text-atlas-secondary/70 text-[10px] leading-relaxed">{hint}</p>
            ) : null}
        </div>
    );
}
