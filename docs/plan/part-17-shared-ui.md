# Part 17 — Shared UI Components

> **Status**: `[ ]`
> **Depends on**: Part 00 (tokens, Radix UI, Lucide installed)
> **Blocks**: All page parts reference these components (build this early, or in parallel with Part 04)

---

## Goal

Build the Foundation Layer: every reusable, design-system-aligned UI primitive. All components in `resources/js/Components/ui/`. Every component ships with complete state coverage.

---

## Component Inventory

| Component | File | States Required |
|---|---|---|
| `Button` | `Button.jsx` | default, hover, focus-visible, active, disabled, loading |
| `Input` | `Input.jsx` | default, hover, focus, error, disabled |
| `Textarea` | `Textarea.jsx` | same as Input |
| `Select` | `Select.jsx` (Radix) | default, open, selected, disabled |
| `Checkbox` | `Checkbox.jsx` (Radix) | unchecked, checked, indeterminate, disabled |
| `Switch` | `Switch.jsx` (Radix) | off, on, disabled |
| `Badge` | `Badge.jsx` | success, info, warning, danger, disabled, neutral |
| `Table` | `Table.jsx` | header, row-default, row-hover, row-selected |
| `Modal` | `Modal.jsx` (Radix Dialog) | closed, open, loading |
| `AlertDialog` | `AlertDialog.jsx` (Radix) | confirm, loading |
| `Toast` | `Toast.jsx` | success, error, warning, info, dismiss |
| `Skeleton` | `Skeleton.jsx` | shimmer animation |
| `EmptyState` | `EmptyState.jsx` | icon + headline + description + optional CTA |
| `Tooltip` | `Tooltip.jsx` (Radix) | trigger, visible |
| `Dropdown` | `Dropdown.jsx` (Radix DropdownMenu) | trigger, open, item, separator |
| `Tabs` | `Tabs.jsx` (Radix) | trigger, content |
| `CodeBlock` | `CodeBlock.jsx` | code display + copy button |
| `Pagination` | `Pagination.jsx` | prev, next, page numbers |

---

## Design Spec per Component

### `Button`

```jsx
// type: 'primary' | 'secondary' | 'ghost' | 'destructive'
// type: 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    loading?
    icon?
}
```

| Variant | Background | Text | Border |
|---|---|---|---|
| `primary` | `var(--color-accent)` | `#09090B` | none |
| `secondary` | `var(--color-card)` | `var(--color-text-primary)` | `var(--color-border)` |
| `ghost` | transparent | `var(--color-text-secondary)` | none |
| `destructive` | `var(--color-danger)` | `#FAFAFA` | none |

Heights: `sm` 32px · `md` 40px · `lg` 44px. Radius: `var(--radius-button)`.

Loading state: inline `<Loader2 className="animate-spin" size={14} />` replaces text, button disabled.

### `Input`

```jsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?
    error?
    hint?
}
```

- Height: 36–40px. BG: `var(--color-card)`. Border: `var(--color-border)`. Radius: `var(--radius-input)`.
- Focus: `border-atlas-accent ring-2 ring-atlas-accent/20`.
- Error: `border-atlas-danger` + red helper text below.
- Label: 12–13px, weight 500, `--color-text-secondary`, above field.
- `autocomplete="off"` for sensitive fields (pass via props).

### `Badge`

```jsx
// type: 'success' | 'info' | 'warning' | 'danger' | 'disabled' | 'neutral'

/** @type props */
    variant: BadgeVariant
    children
}
```

- Pill: `rounded-badge`. Padding: `2px 8px`. Font: 12px, weight 500.
- Background: status color at 12–15% opacity. Text: full status color.
- **Always text, never color-only** (accessibility rule).

### `Table`

Compound component pattern:
```jsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Value</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

- `TableHead`: 12px, uppercase, letter-spacing, `--color-text-secondary`.
- `TableRow` hover: `bg-atlas-hover transition-colors duration-[var(--duration-fast)]`.
- No zebra stripe. Hairline `border-b border-atlas-border/60` between rows.
- Row height: 40–44px.

### `Modal` (Radix Dialog)

```jsx
/** @type props */
    open
    onClose: () => void
    title
    description?
    children
    footer?
}
```

- Radix `Dialog.Root`, `Dialog.Overlay`, `Dialog.Content`.
- Overlay: `bg-atlas-overlay backdrop-blur-sm`.
- Content: `bg-atlas-card border border-atlas-border rounded-card max-w-lg w-full`.
- Entrance: `data-[state=open]:animate-in data-[state=closed]:animate-out` via Tailwind `tw-animate-css` or manual keyframes.
- Focus trap: Radix handles automatically.

### `Toast`

Use a global `toast()` utility. Implementation options:
1. Radix `Toast` primitives — manual setup.
2. `sonner` library (`pnpm add sonner`) — simpler, matches Atlas aesthetic with custom styling.

Recommend `sonner` with custom `toaster` config:
```jsx
// In app.jsx or Layout:
import { Toaster } from 'sonner'
<Toaster
    position="top-right"
    toastOptions={{
        style: {
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-input)',
            color: 'var(--color-text-primary)',
        },
    }}
/>
```

### `Skeleton`

```jsx
function Skeleton({ className }: { className? }) {
    return (
        <div className={cn(
            'animate-pulse rounded bg-atlas-surface',
            className
        )} />
    )
}
```

Usage examples:
```jsx
// Row skeleton
<Skeleton className="h-10 w-full" />

// Card skeleton
<Skeleton className="h-32 w-full rounded-card" />

// KPI card
<div className="p-5 bg-atlas-card rounded-card border border-atlas-border space-y-2">
    <Skeleton className="h-3 w-20" />
    <Skeleton className="h-9 w-28" />
</div>
```

### `EmptyState`

```jsx
/** @type props */
    icon?
    title
    description?
    action?: { label; onClick: () => void }
}
```

- Center of container. Icon 24px, `--color-text-secondary`.
- Title: 16px, weight 600, `--color-text-primary`. May use React Bits `BlurText` (see Part 18).
- Description: 14px, `--color-text-secondary`.
- Action: Primary button.

### `CodeBlock`

```jsx
/** @type props */
    code
    lang?
}
```

- BG: `var(--color-surface)`. Padding 16px. Radius 12px. Border `var(--color-border)`.
- Font: Geist Mono 13px.
- Copy button: `Ghost` icon button, top-right. On click → `navigator.clipboard.writeText(code)` → show "Tersalin!" for 2s.

### `Pagination`

Props: `currentPage, lastPage, onPageChange`.
Renders: `<` Prev · 1 2 3 … N · Next `>`.
Active page: bg accent, text dark.

---

## Verification

- [ ] All components render in isolation (create a `/test` Inertia page listing all).
- [ ] `Button`: all 4 variants render correctly. Loading state shows spinner.
- [ ] `Button`: disabled state: cursor not-allowed, reduced opacity.
- [ ] `Input`: focus ring visible. Error state shows red border + message.
- [ ] `Badge`: all 6 variants — color correct, always has text label.
- [ ] `Table`: hover row visible. No zebra stripe.
- [ ] `Modal`: opens/closes. Backdrop dismisses. Escape key closes. Focus trapped.
- [ ] `Toast`: `sonner` toast appears top-right with Atlas styling.
- [ ] `Skeleton`: `animate-pulse` visible. Disabled with `prefers-reduced-motion`.
- [ ] `EmptyState`: icon + title + description + button all render.
- [ ] `CodeBlock`: copy button works. "Tersalin!" feedback shown.
- [ ] `Pagination`: clicking page changes `currentPage`.
- [ ] All components: keyboard-navigable. Focus ring always visible.
- [ ] `pnpm build` — no JavaScript errors.
