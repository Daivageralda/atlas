# Atlas — Translation Gateway Platform
## Design System (design.md)

> **Versi:** 1.0 — turunan detail dari `Atlas-Translation-Gateway-Brief-v1.md`
> **Referensi visual:** Supabase Dashboard (dark mode, developer-first, card-based, minimalis)
> **Stack UI:** React + Tailwind, komponen ekspresif dari **React Bits**
> Untuk requirement fungsional & data model, lihat `product.md`.

---

## 1. Prinsip Desain

1. **Dark mode only.** Tidak ada toggle light mode di V1 — semua token warna didesain untuk kontras di atas dark background.
2. **Developer-first, bukan consumer-facing.** Densitas informasi tinggi diprioritaskan di atas keindahan dekoratif — Atlas adalah tool internal untuk Admin & Developer, bukan landing page marketing.
3. **Clean, minimalis, card-based.** Border tipis, banyak whitespace, tanpa gradient berlebihan — persis arahan brief.
4. **Tenang di area kerja, hidup di titik masuk.** Halaman data-dense (log, tabel, audit) harus terasa cepat & tenang. Momen ekspresif (login, empty state, angka KPI) boleh punya sedikit "kehidupan" lewat animasi ringan.
5. **Restraint adalah fitur.** Satu momen visual yang disengaja lebih baik daripada animasi bertebaran di banyak tempat — ini sejalan dengan best-practice resmi React Bits sendiri (lihat bagian 4).

---

## 2. Design Tokens

### 2.1 Warna

**Base (dari brief — final, jangan diubah):**

| Token | Hex | Kegunaan |
|---|---|---|
| `--color-bg` | `#09090B` | Background utama aplikasi |
| `--color-surface` | `#111113` | Sidebar, topbar, panel sekunder |
| `--color-card` | `#18181B` | Card, container tabel, modal |
| `--color-border` | `#2A2A2E` | Border tipis di semua elemen |
| `--color-text-primary` | `#FAFAFA` | Teks utama |
| `--color-text-secondary` | `#A1A1AA` | Teks sekunder, label, caption |
| `--color-accent` | `#3ECF8E` | Emerald — primary action, link, highlight |

**Status (nama dari brief, hex diusulkan — perlu konfirmasi sebelum dikunci):**

| Status | Token | Hex (usulan) |
|---|---|---|
| Success | `--color-success` | `#3ECF8E` (sama dengan accent) |
| Running | `--color-info` | `#3B82F6` |
| Warning | `--color-warning` | `#F59E0B` |
| Failed | `--color-danger` | `#EF4444` |
| Disabled | `--color-disabled` | `#52525B` |

**State turunan (diusulkan, belum ada di brief):**

| Token | Hex/Value | Kegunaan |
|---|---|---|
| `--color-surface-hover` | `#1E1E22` | Hover di atas card/row |
| `--color-surface-active` | `#151517` | Pressed/active state |
| `--color-focus-ring` | `#3ECF8E` @ 40% opacity | Focus ring, 2px, offset 2px |
| `--color-overlay` | `rgba(9,9,11,0.7)` | Backdrop modal/dialog |
| `--color-divider` | `--color-border` @ 60% opacity | Separator internal (mis. dalam tabel) |

**Aturan pemakaian:**
- Emerald (`--color-accent`) dipakai konsisten untuk: primary button, active nav item, link, focus ring, checkbox/switch aktif. **Jangan** dipakai untuk dekorasi acak — jaga supaya emerald tetap terasa "actionable".
- Badge status memakai pola: background = warna status @ 12–15% opacity, teks = warna status penuh. Ini menjaga kontras tetap nyaman di dark background tanpa badge terasa terlalu terang/mencolok.
- Status **tidak boleh** hanya mengandalkan warna — selalu sandingkan dengan label teks (Success/Running/Warning/Failed/Disabled), demi aksesibilitas.

### 2.2 Tipografi

- **Font UI:** Geist (sesuai brief).
- **Font monospace:** Geist Mono — untuk API key, log request/response, JSON payload, log Queue.

| Role | Size / Line-height | Weight | Catatan |
|---|---|---|---|
| Page Title | 24px / 32px | 600 | Judul halaman (mis. "Translation Logs") |
| Section Header | 18px / 28px | 600 | Judul di dalam card/section |
| Card Title | 14px / 20px | 600 | Judul kecil di dalam card |
| Body | 14px / 20px | 400 | Teks UI standar |
| Body Dense (tabel) | 13px / 18px | 400 | Baris tabel, supaya lebih banyak data terlihat |
| Caption / Label | 12px / 16px | 400–500 | Label form, timestamp, secondary text |
| KPI Number | 32–36px / 40px | 600 | Angka besar di Stat Card, `font-variant-numeric: tabular-nums` |
| Code/Mono | 13px / 20px | 400 | Payload, API key, log |

Hindari lompatan weight yang terlalu jauh (400 → 600 saja, tanpa 700+) supaya tetap terasa "clean, minimalis" sesuai brief.

### 2.3 Spacing & Grid

Grid dasar **4px**: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

- Padding di dalam card: 20–24px.
- Jarak antar section dalam satu halaman: 24–32px.
- Padding item sidebar: 8–12px vertical, 12px horizontal.
- Gap antar kolom grid KPI card: 16–20px.

### 2.4 Radius

Dari brief:
- Card: **20px**
- Button: **12px**
- Input: **12px**

Diusulkan (turunan konsisten dari brief):
- Badge/Chip/Pill: **999px** (full round) — pola umum status tag ala Supabase.
- Modal/Dialog: **20px** (sama dengan Card).
- Tooltip: **8px**.
- Avatar: full round.

### 2.5 Elevation & Border

Karena kontras antar layer background cukup rendah (`#09090B` → `#111113` → `#18181B`), hierarki visual **dikomunikasikan lewat border tipis (1px, `--color-border`), bukan shadow berat** — ini konsisten dengan arahan brief "border tipis".

- Shadow default (jika perlu): `0 1px 2px rgba(0,0,0,0.4)` — sangat halus, hanya untuk modal/dropdown yang melayang di atas konten.
- Glow emerald hanya dipakai di titik yang sengaja ditonjolkan (mis. hover primary button, hover card unggulan) — bukan default semua card.

### 2.6 Iconography

- Set ikon: **Lucide** (sesuai brief).
- Stroke width: 1.5–2px.
- Ukuran: 16px (di dalam tabel/inline text), 20px (sidebar nav, tombol), 24px (empty state/ilustrasi kosong).
- Ikon dengan fungsi tanpa label teks (icon-only button) wajib punya `aria-label`.

### 2.7 Motion Tokens

| Token | Value | Kegunaan |
|---|---|---|
| `--duration-fast` | 120ms | Hover, press, fade baris tabel |
| `--duration-base` | 200ms | Dropdown, tooltip, tab switch |
| `--duration-slow` | 320ms | Modal/panel masuk-keluar |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transisi umum |
| `--ease-entrance` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elemen masuk (modal, toast) |

Semua motion (termasuk dari React Bits) **wajib menghormati `prefers-reduced-motion`** — matikan animasi dekoratif, sisakan transisi fungsional minimal.

---

## 3. Layout & App Shell

### 3.1 Struktur Halaman

```
┌────────────┬──────────────────────────────────────────┐
│            │  Topbar: tenant switcher · search · bell · user menu │
│  Sidebar   ├──────────────────────────────────────────┤
│  ±260px    │                                            │
│  (fixed)   │  Content area (page padding 24–32px)      │
│            │                                            │
└────────────┴──────────────────────────────────────────┘
```

- Sidebar: fixed, lebar ±260px (sesuai brief).
- Topbar: tinggi ±56–64px, berisi tenant/project switcher, global search (pola `Cmd+K`), notifikasi, dan menu user.
- Content area: max-width fluid, dengan container maksimum ±1440px di layar ultra-wide supaya baris tabel tidak meregang tak wajar.

### 3.2 Sidebar Navigation

Urutan menu mengikuti modul dashboard di `product.md` (8.9):

1. Dashboard
2. Projects / Tenants
3. API Keys
4. Providers
5. Translation Logs
6. Translation Memory
7. Queue
8. Analytics
9. Users
10. Audit Log
11. Settings *(dipisah/di-pin ke bawah, mengikuti pola umum dashboard tool)*

**State item nav:**
- Default: ikon + label, warna `--color-text-secondary`.
- Hover: background `--color-surface-hover`.
- Active: background `--color-card`, accent bar kiri 2–3px `--color-accent`, ikon & teks berubah ke `--color-text-primary`/accent.

### 3.3 Responsive

Brief menyebut "fixed sidebar" sebagai arah utama (tool internal, desktop-first wajar), tapi tetap perlu graceful degradation:

- `≥1024px`: sidebar penuh (260px) seperti spesifikasi.
- `768–1023px`: sidebar collapse ke icon-only rail (±72px).
- `<768px`: sidebar jadi off-canvas drawer (toggle dari topbar).

### 3.4 Page Templates

| Template | Struktur |
|---|---|
| **List/Table** (Translation Logs, API Keys, Tenants) | Header (judul + primary action kanan atas) → filter/search bar → data table → pagination |
| **Detail** (Tenant, Provider) | Breadcrumb → header entity → tab (Overview / API Keys / Logs / Analytics) |
| **Settings** | Sub-nav kiri atau tab atas → form dalam card per section → save bar sticky kanan-bawah saat ada perubahan belum disimpan |
| **Analytics** | Baris KPI card di atas → grid chart 2 kolom di bawah |
| **Empty state** | Ikon + headline singkat + 1 baris penjelasan + primary action, center di area card |
| **Loading state** | Skeleton shimmer mengikuti bentuk konten (bukan spinner besar di tengah layar) |
| **Error state** | Banner inline warna status, pesan jelas + aksi retry (tanpa nada meminta maaf, langsung actionable) |

---

## 4. Strategi Component Library

Atlas memakai **dua lapis komponen**:

- **Layer 1 — Foundation (fungsional):** semua elemen data-dense & interaktif inti — button, input, select, table, tab, dropdown, dialog, toast, checkbox, switch, tooltip, pagination.
- **Layer 2 — Expressive (React Bits):** aksen animasi terbatas di titik-titik tertentu yang butuh "rasa hidup" — bukan tulang punggung UI.

### 4.1 Tentang React Bits (hasil riset)

React Bits (reactbits.dev) adalah koleksi open-source **110+ komponen React beranimasi**, terbagi 4 kategori: **Text Animations**, **Animations**, **Components**, **Backgrounds**.

Poin penting dari riset:

- **Bukan component library klasik** — React Bits secara eksplisit *tidak* menyediakan button, input, atau elemen form generik. Fokusnya murni pada elemen ekspresif/dekoratif dan interaksi kreatif (hover tilt, spotlight, teks beranimasi, background bergerak).
- **Instalasi:** copy-paste ke codebase sendiri (bukan npm dependency yang di-lock), lewat CLI `shadcn` (`npx shadcn@latest add @react-bits/NamaKomponen-TS-TW`) atau `jsrepo`. Karena kode langsung masuk ke repo, komponen jadi 100% bisa dikustomisasi.
- **4 varian tiap komponen:** JS-CSS, JS-TW, TS-CSS, TS-TW. Untuk Atlas (React + Tailwind), pakai varian **TS-TW** secara konsisten.
- **Lisensi:** MIT + Commons Clause — gratis dipakai untuk membangun produk/SaaS (termasuk internal tool seperti Atlas), hanya dilarang menjual ulang React Bits itu sendiri sebagai library.
- **Best-practice resmi dari maintainer-nya sendiri:** maksimal **2–3 komponen beranimasi per halaman**, matikan efek berat di mobile, dan selalu uji di perangkat nyata. Ini sejalan dengan arahan brief soal "minimalis, tanpa gradient berlebihan" — jadi restraint bukan cuma opini desain, tapi memang anjuran library-nya.

### 4.2 Kapan Pakai, Kapan Tidak

**Pakai React Bits di:**
- Halaman login/auth (satu background animasi halus).
- Angka KPI di Dashboard/Analytics (count-up saat data dimuat).
- Satu titik "signature" di card unggulan (mis. status provider utama).
- Headline di empty state supaya layar kosong tidak terasa mati.

**Jangan pakai React Bits di:**
- Translation Logs, Audit Log, Translation Memory — halaman data-dense, fungsional, harus terasa cepat & tenang. Transisi cukup dari Layer Foundation (fade 120ms).
- Lebih dari satu animated background dalam satu viewport.
- Varian yang memakai Three.js/WebGL berat (background 3D) di halaman dashboard utama — berisiko mengganggu performa saat render bareng chart & tabel data besar.
- Tanpa fallback untuk `prefers-reduced-motion`.

### 4.3 Pemetaan Konkret

| Area di Atlas | Komponen React Bits | Kategori | Catatan Pemakaian |
|---|---|---|---|
| Background halaman Login | `Aurora` / `Threads` / `Beams` (pilih satu) | Backgrounds | Opacity rendah, tint ke arah emerald/netral; nonaktif saat `prefers-reduced-motion` |
| Angka besar di Stat/KPI Card | `CountUp` | Text Animation | Durasi ±600–800ms, jalan sekali saat data dimuat — jangan re-trigger tiap re-render |
| Card provider/tenant unggulan | `SpotlightCard` atau `TiltCard` | Components | Pilih **satu** titik saja, bukan diterapkan ke semua card list |
| Headline empty state | `BlurText` / `ShinyText` | Text Animation | Animasi hanya di headline, isi konten tetap statis |
| Transisi status Queue (running → success) | *(bukan React Bits)* — transisi CSS sederhana dari Foundation | — | Area fungsional, harus tetap tenang & cepat dibaca |

### 4.4 Foundation Layer — Rekomendasi

Karena React Bits tidak menyediakan elemen form/tabel generik, Foundation Layer sebaiknya dibangun di atas **Radix UI primitives + Tailwind** (pola ala shadcn/ui): primitif accessible & keyboard-navigable, di-skin memakai token Atlas sendiri (warna, radius, spacing di atas).

---

## 5. Spesifikasi Komponen Kunci

### 5.1 Sidebar & Topbar
Lihat bagian 3.1–3.2.

### 5.2 Stat / KPI Card
- Struktur: eyebrow label (12px, secondary, uppercase, letter-spacing wide) → angka besar (32–36px, tabular-nums, opsional `CountUp`) → delta chip kecil (badge naik/turun dengan warna status) → opsional sparkline tipis di bawah.
- Card radius 20px, padding 20–24px, border 1px `--color-border`.

### 5.3 Data Table & Status Badge
- Density: **compact** (developer tool) — tinggi baris ±40–44px.
- Header: teks secondary, 12px, uppercase, letter-spacing.
- Tanpa zebra stripe — pemisah antar baris cukup hairline border (`--color-divider`), sesuai gaya Supabase.
- Hover baris: `--color-surface-hover`.
- Badge status: pill radius 999px, background warna status @ 12–15% opacity, teks warna status penuh, selalu disertai label teks (Success/Running/Warning/Failed/Disabled).

### 5.4 Button
| Variant | Background | Teks | Kegunaan |
|---|---|---|---|
| Primary | `--color-accent` | `#09090B` (kontras tinggi di atas emerald) | Aksi utama |
| Secondary | `--color-card` | `--color-text-primary` | Aksi sekunder, border `--color-border` |
| Ghost | transparent | `--color-text-secondary` | Aksi tersier, hover → `--color-surface-hover` |
| Destructive | `--color-danger` | `#FAFAFA` | Aksi berbahaya (revoke key, delete tenant) |

Radius 12px (sesuai brief). Ukuran: sm 32px / md 36–40px / lg 44px tinggi.

### 5.5 Form Input
- Tinggi 36–40px, background `--color-card`, border 1px `--color-border`, radius 12px.
- Focus: border `--color-accent` + ring emerald 40% opacity, 2px offset.
- Placeholder: `--color-text-secondary`.
- Error: border `--color-danger` + helper text 12px merah di bawah field.
- Label: 12–13px, weight 500, di atas field.

### 5.6 Modal / Dialog
- Radius 20px (samakan dengan Card), background `--color-card`, border `--color-border`.
- Backdrop: `--color-overlay`.
- Header (judul + close icon) → body → footer (aksi rata kanan: secondary lalu primary).

### 5.7 Chart
- Rekomendasi library: Recharts atau sejenisnya yang ringan & mudah di-styling dengan token Tailwind.
- Warna: metrik utama = emerald, metrik sekunder = blue/amber, Success vs Failed = emerald/red (stacked/grouped bar).
- Grid line: `--color-border` @ opacity rendah. Axis label: 12px secondary text.
- Tooltip chart: styling sama seperti Card (background, border, radius 12px).

### 5.8 Log / Code Viewer
- Font Geist Mono, 13px.
- Background sedikit lebih gelap dari card (mis. `--color-surface`) untuk membedakan dari card biasa.
- Line number: secondary text. Tombol copy: ghost icon button di kanan atas blok.

### 5.9 Toast / Notification
- Posisi: top-right atau bottom-right (stack).
- Background `--color-card`, radius 12px, accent bar kiri sesuai warna status.
- Auto-dismiss 4–5 detik, **kecuali** toast error/destructive yang tetap sampai di-dismiss manual.

### 5.10 Empty & Loading State
- Empty: ikon 24px + headline (boleh pakai `BlurText`/`ShinyText`) + 1 baris deskripsi + primary action button, center di card.
- Loading: skeleton shimmer sesuai bentuk konten asli (card skeleton, row skeleton) — spinner hanya untuk aksi inline di dalam tombol, bukan untuk memuat seluruh halaman.

---

## 6. Aksesibilitas & Motion Safety

- Kontras teks: `--color-text-primary` di atas `--color-bg` sangat tinggi (>15:1). `--color-text-secondary` di atas `--color-card` perlu divalidasi dengan tool contrast checker khususnya untuk ukuran caption 12px.
- Focus state **selalu terlihat** — jangan pernah menghapus outline default tanpa pengganti (`--color-focus-ring`).
- Semua icon-only button wajib `aria-label`.
- Status tidak boleh hanya mengandalkan warna (lihat 2.1) — penting untuk pengguna dengan color vision deficiency.
- Semua animasi (React Bits maupun custom) wajib punya fallback statis saat `prefers-reduced-motion: reduce` — mis. `CountUp` langsung menampilkan angka final tanpa animasi.

---

## 7. Konvensi Implementasi

- Simpan seluruh token di bagian 2 sebagai **CSS variables** (mis. di `app.css`) sebagai satu sumber kebenaran warna/radius/spacing — memudahkan maintenance & penyesuaian di kemudian hari.
- Komponen Foundation (Button, Input, Table, Badge, Modal, dst.) ditaruh di folder `ui/` sebagai shared component yang di-reuse di seluruh halaman, bukan di-copy ulang per halaman.
- Komponen React Bits yang dipakai sebaiknya dipisah folder (mis. `ui/effects/` atau `components/decorative/`) supaya jelas mana lapisan fungsional vs ekspresif — memudahkan audit performa/motion nanti.
- Karena React Bits di-copy langsung ke repo (bukan dependency npm), catat sumber tiap komponen (mis. komentar link ke halaman reactbits.dev-nya) supaya gampang di-update manual kalau ada perbaikan di upstream.
- Pola UI yang berulang (mis. kombinasi KPI Card + CountUp) sebaiknya diekstrak jadi satu shared component, bukan diduplikasi di tiap halaman.

---

## 8. Lampiran — Quick Reference Token Table

```css
:root {
  /* Base */
  --color-bg: #09090B;
  --color-surface: #111113;
  --color-card: #18181B;
  --color-border: #2A2A2E;
  --color-text-primary: #FAFAFA;
  --color-text-secondary: #A1A1AA;
  --color-accent: #3ECF8E;

  /* Status */
  --color-success: #3ECF8E;
  --color-info: #3B82F6;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-disabled: #52525B;

  /* Radius */
  --radius-card: 20px;
  --radius-button: 12px;
  --radius-input: 12px;
  --radius-badge: 999px;

  /* Motion */
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --duration-slow: 320ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-entrance: cubic-bezier(0.16, 1, 0.3, 1);
}
```
