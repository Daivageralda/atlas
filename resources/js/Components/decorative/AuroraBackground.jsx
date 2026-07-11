// resources/js/Components/decorative/AuroraBackground.jsx
// Source: https://reactbits.dev/backgrounds/aurora
// Variant: TS-TW

import React from 'react';
import { useReducedMotion } from '../../Hooks/useReducedMotion';

export function AuroraBackground() {
    const reduced = useReducedMotion();

    if (reduced) {
        return (
            <div
                className="fixed inset-0 -z-10"
                style={{ 
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(62,207,142,0.12) 0%, transparent 75%), var(--color-bg, #09090b)' 
                }}
            />
        );
    }

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#09090b] pointer-events-none">
            {/* Inject keyframes to document head directly */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes aurora-spin-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes aurora-spin-fast {
                    0% { transform: rotate(360deg); }
                    100% { transform: rotate(0deg); }
                }
                .aurora-glow-1 {
                    animation: aurora-spin-slow 60s linear infinite;
                }
                .aurora-glow-2 {
                    animation: aurora-spin-fast 45s linear infinite;
                }
            `}} />

            <div className="absolute inset-0 opacity-[0.25] mix-blend-screen filter blur-[100px]">
                {/* Slow moving glow shapes (Aurora effect) */}
                <div 
                    className="absolute top-[-30%] left-[-20%] h-[140%] w-[140%] rounded-full bg-gradient-to-tr from-[#3ECF8E]/30 to-transparent aurora-glow-1"
                />
                <div 
                    className="absolute bottom-[-20%] right-[-20%] h-[120%] w-[120%] rounded-full bg-gradient-to-bl from-teal-500/15 to-transparent aurora-glow-2"
                />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
        </div>
    );
}
