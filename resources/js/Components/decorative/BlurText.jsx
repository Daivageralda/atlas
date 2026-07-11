// resources/js/Components/decorative/BlurText.jsx
// Source: https://reactbits.dev/text-animations/blur-text
// Variant: TS-TW

import React from 'react';
import { useReducedMotion } from '../../Hooks/useReducedMotion';

export function BlurText({ text = '', className = '' }) {
    const reduced = useReducedMotion();

    if (reduced) {
        return <span className={className}>{text}</span>;
    }

    const words = text.split(' ');

    return (
        <span className={`inline-flex flex-wrap gap-x-1.5 ${className}`}>
            {words.map((word, wordIdx) => (
                <span 
                    key={wordIdx}
                    className="inline-block animate-[blurIn_450ms_ease-out_both]"
                    style={{
                        animationDelay: `${wordIdx * 80}ms`
                    }}
                >
                    {word}
                </span>
            ))}
        </span>
    );
}
