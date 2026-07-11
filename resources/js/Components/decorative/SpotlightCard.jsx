// resources/js/Components/decorative/SpotlightCard.jsx
// Source: https://reactbits.dev/components/spotlight-card
// Variant: TS-TW

import React, { useRef, useState } from 'react';
import { useReducedMotion } from '../../Hooks/useReducedMotion';

export function SpotlightCard({ children, className = '' }) {
    const reduced = useReducedMotion();
    const divRef = useRef(null);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [focused, setFocused] = useState(false);

    if (reduced) {
        return <div className={`bg-atlas-card border border-atlas-border rounded-card p-5 ${className}`}>{children}</div>;
    }

    const handleMouseMove = (e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setCoords({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setFocused(true)}
            onMouseLeave={() => setFocused(false)}
            className={`relative overflow-hidden bg-atlas-card border border-atlas-border rounded-card p-5 transition-all duration-300 ${className}`}
        >
            {/* Spotlight overlay mask */}
            {focused && (
                <div
                    className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-card"
                    style={{
                        background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(62, 207, 142, 0.08), transparent 70%)`
                    }}
                />
            )}
            
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
