import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../../Hooks/useReducedMotion';
import { Warning, WarningOctagon } from '@phosphor-icons/react';

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

    const getCardStyles = () => {
        if (status === 'warning') return 'bg-atlas-warning/[0.04] border-atlas-warning/30';
        if (status === 'danger') return 'bg-atlas-danger/[0.04] border-atlas-danger/30';
        return 'bg-atlas-card border-atlas-border';
    };

    const getLabelStyles = () => {
        if (status === 'warning') return 'text-atlas-warning/80';
        if (status === 'danger') return 'text-atlas-danger/80';
        return 'text-atlas-secondary';
    };

    const getValStyles = () => {
        if (status === 'warning') return 'text-atlas-warning';
        if (status === 'danger') return 'text-atlas-danger';
        return 'text-atlas-primary';
    };

    const formatValue = (val) => {
        if (typeof val !== 'number') return val;
        if (prefix && prefix.startsWith('Rp')) {
            return val.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        }
        if (val % 1 === 0) return val.toLocaleString();
        
        if (suffix === '%') {
            return val.toFixed(1);
        }
        
        return val < 0.01 ? val.toFixed(6) : val.toFixed(4);
    };

    const renderValue = () => {
        if (suffix === ' ms' && typeof displayVal === 'number') {
            const seconds = displayVal / 1000;
            const secondsFormatted = seconds.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
            return (
                <div className="flex flex-col items-start">
                    <span className="text-2xl font-bold leading-none">{secondsFormatted} s</span>
                    <span className="text-[10px] font-semibold text-atlas-secondary mt-1">
                        {displayVal.toLocaleString('id-ID')} ms
                    </span>
                </div>
            );
        }
        return (
            <span className="text-2xl font-bold leading-none">
                {prefix}{formatValue(displayVal)}{suffix}
            </span>
        );
    };

    return (
        <div className={`border rounded-card p-5 transition-all duration-300 flex flex-col justify-between h-[120px] relative overflow-hidden ${getCardStyles()}`}>
            <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-semibold uppercase tracking-wider truncate ${getLabelStyles()}`}>
                    {label}
                </span>
                {status === 'warning' && (
                    <Warning className="h-4 w-4 text-atlas-warning shrink-0" />
                )}
                {status === 'danger' && (
                    <WarningOctagon className="h-4 w-4 text-atlas-danger shrink-0" />
                )}
            </div>
            
            <div className="flex items-baseline justify-between mt-auto w-full">
                <div className={`font-sans select-all truncate w-full ${getValStyles()}`}>
                    {renderValue()}
                </div>
            </div>
        </div>
    );
}
