# Part 00 — Foundation

> **Status**: `[ ]`
> **Depends on**: Nothing — first step.
> **Blocks**: All other parts.

---

## Goal

Bootstrap the single Laravel project with Inertia.js + React + JavaScript. Wire up Tailwind, load all CSS design tokens, establish folder conventions, and confirm the dev server runs clean.

---

## Install

### 1. Create Laravel project

```bash
composer create-project laravel/laravel atlas
cd atlas
```

### 2. Install Inertia server-side adapter

```bash
composer require inertiajs/inertia-laravel
php artisan inertia:middleware
```

Add `HandleInertiaRequests` to the `web` middleware group in `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \App\Http\Middleware\HandleInertiaRequests::class,
    ]);
})
```

### 3. Root Blade view (`resources/views/app.blade.php`)

```html
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name') }}</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="antialiased">
    @inertia
</body>
</html>
```

### 4. Install JS dependencies

```bash
pnpm add @inertiajs/react react react-dom react-router-dom
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-popover @radix-ui/react-separator @radix-ui/react-alert-dialog
pnpm add lucide-react recharts clsx tailwind-merge axios
pnpm add -D @vitejs/plugin-react tailwindcss autoprefixer postcss
```

### 5. `vite.config.js`

```js
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
})
```

### 6. `jsconfig.json`

```json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": ["resources/js/*"]
        },
        "jsx": "react"
    },
    "include": ["resources/js/**/*"]
}
```

### 7. `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx}',
    ],
    theme: {
        extend: {
            colors: {
                atlas: {
                    bg:       'var(--color-bg)',
                    surface:  'var(--color-surface)',
                    card:     'var(--color-card)',
                    border:   'var(--color-border)',
                    primary:  'var(--color-text-primary)',
                    secondary:'var(--color-text-secondary)',
                    accent:   'var(--color-accent)',
                    success:  'var(--color-success)',
                    info:     'var(--color-info)',
                    warning:  'var(--color-warning)',
                    danger:   'var(--color-danger)',
                    disabled: 'var(--color-disabled)',
                    hover:    'var(--color-surface-hover)',
                    active:   'var(--color-surface-active)',
                    overlay:  'var(--color-overlay)',
                },
            },
            borderRadius: {
                card:   'var(--radius-card)',
                button: 'var(--radius-button)',
                input:  'var(--radius-input)',
                badge:  'var(--radius-badge)',
            },
            fontFamily: {
                sans: ['Geist', 'system-ui', 'sans-serif'],
                mono: ['Geist Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
```

### 8. `resources/css/app.css` — all CSS tokens

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap');

:root {
    /* Base */
    --color-bg:             #09090B;
    --color-surface:        #111113;
    --color-card:           #18181B;
    --color-border:         #2A2A2E;
    --color-text-primary:   #FAFAFA;
    --color-text-secondary: #A1A1AA;
    --color-accent:         #3ECF8E;

    /* Status */
    --color-success:        #3ECF8E;
    --color-info:           #3B82F6;
    --color-warning:        #F59E0B;
    --color-danger:         #EF4444;
    --color-disabled:       #52525B;

    /* State */
    --color-surface-hover:  #1E1E22;
    --color-surface-active: #151517;
    --color-focus-ring:     rgba(62, 207, 142, 0.4);
    --color-overlay:        rgba(9, 9, 11, 0.7);
    --color-divider:        rgba(42, 42, 46, 0.6);

    /* Radius */
    --radius-card:   20px;
    --radius-button: 12px;
    --radius-input:  12px;
    --radius-badge:  999px;

    /* Motion */
    --duration-fast:  120ms;
    --duration-base:  200ms;
    --duration-slow:  320ms;
    --ease-standard:  cubic-bezier(0.4, 0, 0.2, 1);
    --ease-entrance:  cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}

html, body, #app {
    background-color: var(--color-bg);
    color: var(--color-text-primary);
    font-family: 'Geist', system-ui, sans-serif;
    height: 100%;
}
```

### 9. `resources/js/app.jsx` — Inertia root

```jsx
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import '../css/app.css'

createInertiaApp({
    title: (title) => `${title} — Atlas`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
        return pages[`./Pages/${name}.jsx`]
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />)
    },
})
```

### 10. `resources/js/lib/utils.js`

```js
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}
```

### 11. Shared prop shape (comment convention)

No TypeScript — document shared Inertia prop shape as a JSDoc comment in `app.jsx`:

```js
/**
 * @typedef {Object} AuthUser
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {'admin'|'developer'} role
 * @property {number|null} tenant_scope
 */
```

---

## Folder Structure (frontend)

```
resources/js/
├── Components/
│   ├── ui/             ← Button, Input, Table, Badge, Modal, Toast, Skeleton…
│   ├── decorative/     ← React Bits (Aurora, CountUp, SpotlightCard, BlurText)
│   └── shell/          ← AppLayout, Sidebar, SidebarItem, Topbar, MobileDrawer
├── Pages/              ← one file per Inertia route
│   ├── Auth/
│   │   └── Login.jsx
│   ├── Dashboard.jsx
│   ├── Tenants/
│   │   ├── Index.jsx
│   │   └── Show.jsx
│   ├── ApiKeys/
│   ├── Providers/
│   ├── Logs/
│   ├── Memory/
│   ├── Queue/
│   ├── Analytics/
│   ├── Users/
│   ├── AuditLog/
│   └── Settings/
├── Hooks/
├── Lib/
│   └── utils.js
└── app.jsx
```

---

## Verification

- [ ] `php artisan serve` starts on `http://localhost:8000`.
- [ ] `pnpm dev` starts Vite HMR on `http://localhost:5173`.
- [ ] Visiting `http://localhost:8000` loads the Blade root and React app mounts.
- [ ] Tailwind classes `bg-atlas-bg` and `text-atlas-accent` render correctly (check DevTools).
- [ ] CSS variables visible on `:root` in DevTools.
- [ ] Geist font loaded (Network tab or font inspector).
- [ ] `pnpm build` exits 0 — no errors.
- [ ] No console errors on first load.

---

## Open Questions

1. **Google Fonts or local Geist?** Google Fonts (CDN, in CSS above) vs `pnpm add geist` (self-hosted). Local preferred for no external dependency at runtime.
2. **App name**: `Atlas` confirmed for `config('app.name')`?
