# Part 04 — App Shell

> **Status**: `[ ]`
> **Depends on**: Part 03 (auth in place, shared props available)
> **Blocks**: Part 05+ (all dashboard pages render inside this shell)

---

## Goal

Build `AppLayout` — the persistent wrapper rendered on every authenticated page. Sidebar navigation, Topbar, responsive breakpoints, tenant switcher placeholder.

---

## Files

```
resources/js/
└── Components/
    └── shell/
        ├── AppLayout.jsx         ← layout wrapper, consumed by all dashboard Pages
        ├── Sidebar.jsx
        ├── SidebarItem.jsx
        ├── Topbar.jsx
        └── MobileDrawer.jsx
```

---

## Usage in Inertia Pages

Every dashboard page exports a `layout` property:

```jsx
// resources/js/Pages/Dashboard.jsx
import AppLayout from '@/Components/shell/AppLayout'

export default function Dashboard() {
    return <div>...</div>
}

Dashboard.layout = (page) => <AppLayout>{page}</AppLayout>
```

Or use a persistent layout in `app.jsx` (preferred — avoids remount on navigation):

```jsx
// resources/js/app.jsx
createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
        const page = pages[`./Pages/${name}.jsx`] as any
        // Attach AppLayout to all pages except Auth/*
        if (!name.startsWith('Auth/')) {
            page.default.layout ??= (page) => <AppLayout>{page}</AppLayout>
        }
        return page
    },
    ...
})
```

---

## Design Spec (design.md §3)

### Sidebar
- **Background**: `var(--color-surface)` (`#111113`)
- **Width**: `260px` fixed at ≥1024px · `72px` icon-rail at 768–1023px · off-canvas drawer at <768px
- **Right border**: `1px solid var(--color-border)`
- **Logo area**: top, 56–64px height, aligned with Topbar

**Nav item states:**

| State | Background | Icon + Label |
|---|---|---|
| Default | transparent | `var(--color-text-secondary)` |
| Hover | `var(--color-surface-hover)` | `var(--color-text-primary)` |
| Active | `var(--color-card)` | accent `var(--color-accent)` + 2–3px left bar |

**Nav order:**
1. Dashboard (`/`)
2. Projects / Tenants (`/tenants`)
3. API Keys (`/tenants/*/api-keys` → shallow)
4. Providers (`/providers`)
5. Translation Logs (`/logs`)
6. Translation Memory (`/memory`)
7. Queue (`/queue`)
8. Analytics (`/analytics`)
9. Users (`/users`)
10. Audit Log (`/audit-log`)
11. Settings (`/settings`) ← pinned to bottom (`mt-auto`)

**Icons** (Lucide, 20px, stroke 1.5):
`LayoutDashboard, Building2, KeyRound, Boxes, ScrollText, Database, ListTodo, BarChart2, Users, ClipboardList, Settings`

### Topbar
- **Height**: 56–64px
- **Background**: `var(--color-surface)`
- **Bottom border**: `1px solid var(--color-border)`
- **Contents** (left → right):
  - Mobile only: `Menu` icon button to open drawer
  - Tenant/project context indicator (text, not a switcher in V1)
  - Right: `Search` icon (placeholder, `Cmd+K` in V2) · `Bell` icon · user avatar + dropdown

**User dropdown** (Radix `DropdownMenu`):
- Profile name + email (non-clickable header)
- Separator
- Settings link
- Sign out (POST logout via Inertia)

### Content area
- Background: `var(--color-bg)`
- Padding: `24–32px`
- Max-width: `1440px` centered at ultra-wide

---

## Step-by-Step

### Step 1: `SidebarItem.jsx`
```jsx
/** @type props */
    icon
    label
    href
    isActive
    isCollapsed   // icon-rail mode at md breakpoint
}
```
- `isActive` determined by: `usePage().url.startsWith(href)` (Inertia).
- Active: `before:` pseudo via Tailwind `relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-atlas-accent`.
- Collapsed (md): show icon only + Radix `Tooltip` with label on hover.
- Transition: `transition-colors duration-[var(--duration-fast)]`.

### Step 2: `Sidebar.jsx`
```jsx
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Building2, label: 'Tenants', href: '/tenants' },
    // ... all 11 items
]
```
- Top items: `flex-1 overflow-y-auto`.
- Settings: `mt-auto` (pinned bottom).
- Use `usePage().url` from `@inertiajs/react` for active detection.

### Step 3: `MobileDrawer.jsx`
- Radix `Dialog` — provides accessible focus trap and backdrop.
- Backdrop: `bg-atlas-overlay backdrop-blur-sm`.
- Inner panel: slides from left, `var(--duration-slow)`, `--ease-entrance`.
- Renders same `<Sidebar>` content inside.
- `prefers-reduced-motion`: instant show/hide (no slide).

### Step 4: `Topbar.jsx`
- `hamburger` toggle state lives in `AppLayout` via `useState`, passed down as prop.
- User dropdown: `useForm().post(route('logout'))` on sign out click.

### Step 5: `AppLayout.jsx`
```jsx
export default function AppLayout({ children }: { children }) {
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <div className="flex h-screen bg-atlas-bg overflow-hidden">
            {/* Sidebar — hidden on mobile, visible md+ */}
            <aside className="hidden md:flex ...">
                <Sidebar />
            </aside>

            {/* Mobile drawer */}
            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar onMenuClick={() => setDrawerOpen(true)} />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-[1440px] mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
```

---

## Verification

- [ ] Sidebar renders all 11 nav items with correct icons and labels.
- [ ] Active item shows emerald left bar — updates on Inertia navigation without full reload.
- [ ] At ≥1024px: sidebar is full 260px.
- [ ] At 768–1023px: sidebar collapses to 72px icon-rail, labels hidden, tooltips on hover.
- [ ] At <768px: sidebar hidden; hamburger opens off-canvas drawer with backdrop.
- [ ] Drawer closes on backdrop click and Escape key.
- [ ] Topbar stays fixed while content area scrolls.
- [ ] Content max-width caps at 1440px on ultra-wide screens.
- [ ] User dropdown: Profile name/email shown. Sign out POSTs to `/logout`.
- [ ] Keyboard: sidebar items navigable via Tab + Enter. Drawer focus trapped.
- [ ] No layout shift on page load.
- [ ] Settings item pinned to bottom of sidebar.
