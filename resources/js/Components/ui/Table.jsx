import React from 'react';

export function Table({ children, className = '' }) {
    return (
        <div className="overflow-x-auto w-full">
            <table className={`w-full border-collapse text-left text-xs ${className}`}>
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children, className = '' }) {
    return (
        <thead className={`border-b border-atlas-border/30 bg-atlas-surface text-[10px] uppercase font-bold tracking-wider text-atlas-secondary ${className}`}>
            {children}
        </thead>
    );
}

export function TableBody({ children, className = '' }) {
    return (
        <tbody className={`text-atlas-secondary ${className}`}>
            {children}
        </tbody>
    );
}

export function TableRow({ children, className = '', ...props }) {
    return (
        <tr 
            className={`border-b border-atlas-border/20 last:border-b-0 hover:bg-atlas-hover/30 transition-colors duration-150 ${className}`}
            {...props}
        >
            {children}
        </tr>
    );
}

export function TableHead({ children, className = '' }) {
    return (
        <th className={`px-6 py-4 font-bold ${className}`}>
            {children}
        </th>
    );
}

export function TableCell({ children, className = '' }) {
    return (
        <td className={`px-6 py-3.5 align-middle ${className}`}>
            {children}
        </td>
    );
}
