// resources/js/Components/decorative/CountUp.jsx
// Source: https://reactbits.dev/text-animations/count-up
// Variant: TS-TW

import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../../Hooks/useReducedMotion';

export function CountUp({ value, duration = 750, prefix = '', suffix = '' }) {
    const reduced = useReducedMotion();
    const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const isDecimal = numericValue % 1 !== 0;

    if (reduced) {
        return <span>{prefix}{numericValue.toLocaleString()}{suffix}</span>;
    }

    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Easing out quad
            const easeProgress = progress * (2 - progress);
            const currentCount = easeProgress * numericValue;
            
            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [numericValue, duration]);

    const formattedValue = isDecimal 
        ? count.toFixed(4) 
        : Math.floor(count).toLocaleString('id-ID');

    return (
        <span>{prefix}{formattedValue}{suffix}</span>
    );
}
