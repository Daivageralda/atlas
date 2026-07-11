import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../../Hooks/useReducedMotion';

export function StatCard({ label, value, prefix = '', suffix = '', useCountUp = true, status = 'default' }) {
    const reduced = useReducedMotion();
    const [displayVal, setDisplayVal] = useState(useCountUp && !reduced ? 0 : value);

    useEffect(() => {
        if (!useCountUp || reduced || typeof value !== 'number') {
            setDisplayVal(value);
            return;
        }

        let start = 0;
        const end = value;
        if (start === end) return;

        const duration = 800; // ms
        const stepTime = Math.abs(Math.floor(duration / end));
        const timer = setInterval(() => {
            start += Math.ceil(end / 30); // split iterations into 30 steps
            if (start >= end) {
                clearInterval(timer);
                setDisplayVal(end);
            } else {
                setDisplayVal(start);
            }
        }, Math.max(stepTime, 20));

        return () => clearInterval(timer);
    }, [value, useCountUp, reduced]);

    const getStatusStyles = () => {
        if (status === 'warning') return 'text-atlas-warning bg-atlas-warning/10 border-atlas-warning/20';
        if (status === 'danger') return 'text-atlas-danger bg-atlas-danger/10 border-atlas-danger/20';
        return 'text-atlas-secondary bg-atlas-surface border-atlas-border/50';
    };

    const formatValue = (val) => {
        if (typeof val !== 'number') return val;
        if (val % 1 === 0) return val.toLocaleString();
        
        // If it's a percentage statistic, 1 decimal place is plenty (e.g. 33.3% instead of 33.3000%)
        if (suffix === '%') {
            return val.toFixed(1);
        }
        
        // If the cost is less than $0.01, show 6 decimal places to capture micro-cost estimates
        return val < 0.01 ? val.toFixed(6) : val.toFixed(4);
    };

    return (
        <div className="bg-atlas-card border border-atlas-border rounded-card p-5 transition-all duration-300 flex flex-col justify-between h-[120px]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-atlas-secondary truncate">
                {label}
            </span>
            <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold tracking-tight text-atlas-primary font-mono select-all">
                    {prefix}{formatValue(displayVal)}{suffix}
                </span>
                
                {status !== 'default' && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusStyles()}`}>
                        {status.toUpperCase()}
                    </span>
                )}
            </div>
        </div>
    );
}
