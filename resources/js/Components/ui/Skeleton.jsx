import React from 'react';

export function Skeleton({ className = '' }) {
    return (
        <div 
            className={`
                animate-pulse rounded bg-atlas-surface border border-atlas-border/10
                motion-reduce:animate-none
                ${className}
            `}
        />
    );
}
