import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled = false, 
    className = '', 
    icon: Icon,
    ...props 
}) {
    // Height & padding size
    const sizeClasses = {
        sm: 'h-8 px-3 text-[11px] gap-1.5',
        md: 'h-10 px-4 text-xs gap-2',
        lg: 'h-11 px-5 text-sm gap-2'
    };

    // Color variant configurations
    const variantClasses = {
        primary: 'bg-atlas-accent text-atlas-bg font-bold hover:bg-atlas-accent/90 focus-visible:ring-2 focus-visible:ring-atlas-accent/20 active:scale-[0.98]',
        secondary: 'bg-atlas-card border border-atlas-border text-atlas-primary hover:bg-atlas-hover focus-visible:ring-2 focus-visible:ring-atlas-border active:scale-[0.98]',
        ghost: 'bg-transparent text-atlas-secondary hover:bg-atlas-hover hover:text-atlas-primary active:scale-[0.98]',
        destructive: 'bg-atlas-danger text-atlas-primary font-bold hover:bg-atlas-danger/90 focus-visible:ring-2 focus-visible:ring-atlas-danger/20 active:scale-[0.98]'
    };

    return (
        <button
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center rounded-button font-semibold outline-none transition-all duration-150 select-none
                disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                ${sizeClasses[size] || sizeClasses.md}
                ${variantClasses[variant] || variantClasses.primary}
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : Icon ? (
                <Icon className="h-3.5 w-3.5 shrink-0" />
            ) : null}
            <span>{loading ? 'Memuat...' : children}</span>
        </button>
    );
}
