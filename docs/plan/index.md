# Atlas — Implementation Plan Index

> **Project**: Atlas Translation Gateway Platform
> **Architecture**: Single Laravel project — Inertia.js + React for dashboard, REST API (`/api/v1/*`) for tenant-facing translation traffic
> **Stack**: Laravel (latest) · Inertia.js (latest) · React (latest) · JavaScript · Tailwind CSS · Radix UI · React Bits (TS-TW) · MySQL · Upstash QStash
> **Package manager**: `pnpm` (JS), `composer` (PHP). Use `pnpx` not `npx`. Never pin versions.
> **Design**: Dark mode · Emerald `#3ECF8E` · Geist/Geist Mono · Supabase-inspired (design.md)
> **Review process**: Each part is self-contained — review & approve before starting next.

---

## Legend

| Status | Meaning |
|---|---|
| `[ ]` | Not started |
| `[/]` | In progress |
| `[x]` | Done — reviewed & approved |
| `[!]` | Blocked / needs decision |

---

## Parts

| # | Part | File | Status | Description |
|---|---|---|---|---|
| 00 | **Foundation** | [part-00-foundation.md](part-00-foundation.md) | `[x]` | Laravel install, Inertia setup, React + TS, Tailwind, CSS tokens, folder structure |
| 01 | **Migrations & Seeders** | [part-01-migrations.md](part-01-migrations.md) | `[x]` | All database tables, base model, seeders |
| 02 | **Backend Base** | [part-02-backend-base.md](part-02-backend-base.md) | `[x]` | Sanctum session, CORS, middleware, ApiResponse trait, HandleInertiaRequests, route structure |
| 03 | **Auth** | [part-03-auth.md](part-03-auth.md) | `[x]` | Login/logout (Laravel session), `HandleInertiaRequests` shared props, auth middleware, Login page |
| 04 | **App Shell** | [part-04-app-shell.md](part-04-app-shell.md) | `[x]` | `AppLayout` wrapper, Sidebar, Topbar, responsive, tenant switcher |
| 05 | **Dashboard** | [part-05-dashboard.md](part-05-dashboard.md) | `[x]` | `StatsController` + Dashboard Inertia page, KPI cards, CountUp, system status |
| 06 | **Tenants** | [part-06-tenants.md](part-06-tenants.md) | `[x]` | `TenantController` (CRUD) + Tenants/Index, Tenants/Show Inertia pages |
| 07 | **API Keys** | [part-07-api-keys.md](part-07-api-keys.md) | `[x]` | `ApiKeyController` (create/revoke/regen, SHA-256 hash) + ApiKeys pages |
| 08 | **Providers** | [part-08-providers.md](part-08-providers.md) | `[x]` | `ProviderController` (CRUD, pricing formula) + Providers pages |
| 09 | **Translation Core API** | [part-09-translation-core.md](part-09-translation-core.md) | `[x]` | REST `POST /api/v1/translate`: TM lookup, provider dispatch, retry+fallback, QStash async, log write |
| 10 | **Translation Logs** | [part-10-logs.md](part-10-logs.md) | `[x]` | `LogController` + Logs/Index (filter table), Logs/Show (detail drawer + code viewer) |
| 11 | **Translation Memory** | [part-11-memory.md](part-11-memory.md) | `[ ]` | `MemoryController` (browse, search, manual correction) + Memory pages |
| 12 | **Queue** | [part-12-queue.md](part-12-queue.md) | `[ ]` | QStash dispatch, callback handler, manual retry endpoint + Queue monitor page |
| 13 | **Analytics** | [part-13-analytics.md](part-13-analytics.md) | `[ ]` | `AnalyticsController` (aggregate queries, filters) + Analytics page (Recharts) |
| 14 | **Users** | [part-14-users.md](part-14-users.md) | `[ ]` | `UserController` (list, invite, role, tenant scope) + Users pages |
| 15 | **Audit Log** | [part-15-audit-log.md](part-15-audit-log.md) | `[ ]` | `AuditLogController` + read-only Audit Log page (diff viewer) |
| 16 | **Settings** | [part-16-settings.md](part-16-settings.md) | `[ ]` | `SettingsController` + Settings page (languages, cost formula, global prompt) |
| 17 | **Shared UI Components** | [part-17-shared-ui.md](part-17-shared-ui.md) | `[ ]` | Button, Input, Select, Table, Badge, Modal, Toast, Skeleton, Empty State — full state coverage |
| 18 | **React Bits Integration** | [part-18-react-bits.md](part-18-react-bits.md) | `[ ]` | Aurora (login bg), CountUp (KPI), SpotlightCard, BlurText (empty state) |
