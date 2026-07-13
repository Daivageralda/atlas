import React from 'react';

export function Badge({ children, variant = 'neutral', className = '' }) {
    const variantClasses = {
        success: 'bg-atlas-success/15 text-atlas-success border-atlas-success/25',
        info: 'bg-atlas-info/15 text-atlas-info border-atlas-info/25',
        warning: 'bg-atlas-warning/15 text-atlas-warning border-atlas-warning/25',
        danger: 'bg-atlas-danger/15 text-atlas-danger border-atlas-danger/25',
        disabled: 'bg-atlas-disabled/15 text-atlas-secondary border-atlas-disabled/25',
        neutral: 'bg-atlas-hover/60 text-atlas-primary border-atlas-border/50'
    };

    return (
        <span 
            className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-sans border
                ${variantClasses[variant] || variantClasses.neutral}
                ${className}
            `}
        >
            {children}
        </span>
    );
}
