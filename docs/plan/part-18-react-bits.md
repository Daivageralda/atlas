# Part 18 — React Bits Integration

> **Status**: `[ ]`
> **Depends on**: Part 00 (pnpm, Vite), Part 03 (login page), Part 05 (dashboard), Part 17 (EmptyState uses BlurText)
> **Blocks**: Nothing — expressive layer added last

---

## Goal

Add the 4 approved React Bits components at specific, deliberate touchpoints. Max 2–3 animated components per page. No React Bits on data-dense pages (logs, memory, audit log).

---

## Install via CLI

React Bits uses `pnpx shadcn` or `jsrepo` for copy-based install (not npm packages).

```bash
# Install jsrepo CLI if not present
pnpm add -D jsrepo

# Or use shadcn CLI variant:
pnpx shadcn@latest add @react-bits/Aurora-TS-TW
pnpx shadcn@latest add @react-bits/CountUp-TS-TW
pnpx shadcn@latest add @react-bits/SpotlightCard-TS-TW
pnpx shadcn@latest add @react-bits/BlurText-TS-TW
```

> If CLI unavailable, copy components manually from reactbits.dev — always use **TS-TW** variant.
> Add source URL comment at top of each copied file.

Output location: `resources/js/Components/decorative/`

---

## Components

### 1. `AuroraBackground.jsx`
**Where**: Login page background (`Pages/Auth/Login.jsx`)
**Source**: `https://reactbits.dev/backgrounds/aurora`

```jsx
// resources/js/Components/decorative/AuroraBackground.jsx
// Source: https://reactbits.dev/backgrounds/aurora
// Variant: TS-TW

import { useReducedMotion } from '@/Hooks/useReducedMotion'

export function AuroraBackground() {
    const reduced = useReducedMotion()

    if (reduced) {
        // Static fallback: gradient radial from emerald
        return (
            <div
                className="fixed inset-0 -z-10"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(62,207,142,0.15) 0%, transparent 70%), var(--color-bg)' }}
            />
        )
    }

    return (
        <div className="fixed inset-0 -z-10">
            {/* React Bits Aurora — TS-TW implementation */}
            {/* Props: colorStops toward emerald/teal, opacity 0.35, speed slow */}
        </div>
    )
}
```

**Rules**:
- `position: fixed`, `z-index: -10` — stays behind all content.
- `opacity`: 0.3–0.4 — atmospheric, not dominant.
- Color stops: toward `#3ECF8E` / teal / near-black — on brand.
- Disabled fully when `prefers-reduced-motion: reduce`.

---

### 2. `CountUp.jsx`
**Where**: Dashboard KPI stat cards (`Pages/Dashboard.jsx`), Analytics KPI row (`Pages/Analytics/Index.jsx`)
**Source**: `https://reactbits.dev/text-animations/count-up`

```jsx
// resources/js/Components/decorative/CountUp.jsx
// Source: https://reactbits.dev/text-animations/count-up
// Variant: TS-TW

import { useReducedMotion } from '@/Hooks/useReducedMotion'

/** @type props */
    value
    duration?   // ms, default 700
    prefix?
    suffix?
}

export function CountUp({ value, duration = 700, prefix, suffix }: CountUpProps) {
    const reduced = useReducedMotion()

    if (reduced) {
        // No animation — render final value immediately
        return <span>{prefix}{value.toLocaleString()}{suffix}</span>
    }

    // React Bits CountUp — TS-TW implementation
    // Animates from 0 → value over `duration` ms
    // Trigger: once on mount, never re-trigger on re-render
}
```

**Rules**:
- Duration: 600–800ms. Never longer.
- `useEffect` with `[]` deps — runs once on mount.
- `prefers-reduced-motion`: instant final value.
- No re-trigger on data refresh — if parent re-renders, CountUp stays at final value.

---

### 3. `SpotlightCard.jsx`
**Where**: One specific card — recommend the primary Provider card (`Pages/Providers/Index.jsx`) as the visual signature.
**Source**: `https://reactbits.dev/components/spotlight-card`

```jsx
// resources/js/Components/decorative/SpotlightCard.jsx
// Source: https://reactbits.dev/components/spotlight-card
// Variant: TS-TW

import { useReducedMotion } from '@/Hooks/useReducedMotion'

/** @type props */
    children
    className?
}

export function SpotlightCard({ children, className }: SpotlightCardProps) {
    const reduced = useReducedMotion()

    if (reduced) {
        return <div className={className}>{children}</div>
    }

    // React Bits SpotlightCard — mouse-follow emerald spotlight on hover
    // spotlightColor: rgba(62, 207, 142, 0.12)
}
```

**Rules**:
- Used on **only one** card — the primary SumoPod provider card.
- Spotlight color: `rgba(62, 207, 142, 0.12)` — subtle, not glaring.
- `prefers-reduced-motion`: plain card, no spotlight.
- Do NOT apply to all provider cards or all tenants.

---

### 4. `BlurText.jsx`
**Where**: Empty state headlines only (`EmptyState.jsx` receives optional `animated` prop)
**Source**: `https://reactbits.dev/text-animations/blur-text`

```jsx
// resources/js/Components/decorative/BlurText.jsx
// Source: https://reactbits.dev/text-animations/blur-text
// Variant: TS-TW

import { useReducedMotion } from '@/Hooks/useReducedMotion'

/** @type props */
    text
    className?
}

export function BlurText({ text, className }: BlurTextProps) {
    const reduced = useReducedMotion()

    if (reduced) {
        return <span className={className}>{text}</span>
    }

    // React Bits BlurText — blur-in reveal, word by word
    // delay: 80ms per word, duration: 400ms per word
}
```

**Rules**:
- Only on empty state headlines — not body text, not table headers, not any functional text.
- Animation plays once on mount.
- `prefers-reduced-motion`: plain text, instant.

---

## `useReducedMotion` Hook

```js
// resources/js/Hooks/useReducedMotion.ts
import { useEffect, useState } from 'react'

export function useReducedMotion() {
    const [reduced, setReduced] = useState(
        () => typeof window !== 'undefined'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false
    )

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])

    return reduced
}
```

---

## Page-Level Budget (React Bits allowed per page)

| Page | Aurora | CountUp | SpotlightCard | BlurText | Total |
|---|---|---|---|---|---|
| Login | ✓ | — | — | — | 1 |
| Dashboard | — | ✓ (10 cards) | — | — | 1 |
| Providers | — | — | ✓ (1 card) | — | 1 |
| Analytics | — | ✓ (6 KPIs) | — | — | 1 |
| Any page (empty state) | — | — | — | ✓ (headline only) | 1 |
| Logs, Memory, Audit Log | — | — | — | — | 0 |
| Queue, Users, Settings | — | — | — | — | 0 |

---

## Verification

- [ ] `AuroraBackground`: renders behind login card. Static gradient when `prefers-reduced-motion`.
- [ ] `CountUp`: animates 0→N on dashboard mount. Does NOT re-animate on re-render.
- [ ] `CountUp`: immediate final value when `prefers-reduced-motion`.
- [ ] `SpotlightCard`: spotlight follows mouse on SumoPod card only. Not on fallback card.
- [ ] `SpotlightCard`: plain card (no spotlight) when `prefers-reduced-motion`.
- [ ] `BlurText`: blur-in on empty state headline. Static text when `prefers-reduced-motion`.
- [ ] No React Bits on: Translation Logs, Translation Memory, Audit Log, Queue detail rows.
- [ ] `pnpm build — no errors in React Bits components.
- [ ] Performance: login page LCP not degraded by Aurora (check Lighthouse or Network).
