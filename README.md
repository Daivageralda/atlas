<div align="center">

<br />

<img src="./public/logo/logo.png" alt="Atlas" height="52" />

<br />
<br />

**Translation Gateway untuk Enterprise**

Satu endpoint cerdas untuk semua kebutuhan AI-powered translation —
multi-provider, failover otomatis, caching semantik, dan analitik penuh per tenant.

<br />

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-7C3AED?style=flat)](https://inertiajs.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-3ECF8E?style=flat)](#license)

</div>

---

## Apa itu Atlas?

Atlas adalah **API gateway khusus translasi** yang duduk di depan provider AI (OpenAI, DeepL, dll.) dan memberikan lapisan abstraksi, reliabilitas, dan observabilitas — tanpa developer perlu tahu siapa provider aktifnya.

**Satu `POST /api/v1/translate`.** Atlas menentukan sisanya.

```bash
curl -X POST https://your-atlas.app/api/v1/translate \
  -H "X-API-Key: atlas_xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"text": "Halo dunia", "source_lang": "id", "target_lang": "en", "content_type": "plain"}'
```

```json
{
  "success": true,
  "data": {
    "translation_id": "01HXYZ4ABCDE5F6G7H8J9K0M1N",
    "translated_text": "Hello world",
    "cached": false,
    "provider": "SumoPod",
    "duration_ms": 412,
    "estimated_cost": 0.0000035
  }
}
```

---

## Fitur Utama

| Fitur | Keterangan |
|---|---|
| **Multi-Provider Routing** | Konfigurasi urutan provider via dashboard. Jika satu gagal, Atlas fallback otomatis ke berikutnya. |
| **Semantic Cache** | Terjemahan yang identik tidak dikirim ulang ke AI — diambil dari memori cache, biaya $0. |
| **Per-Tenant API Keys** | Setiap klien/proyek punya key sendiri, terikat kuota, analytics, dan scope bahasa. |
| **Queue & Retry** | Request yang gagal dimasukkan ulang ke antrian dengan delay yang bisa dikonfigurasi. |
| **Translation Memory** | Simpan pasangan sumber–target untuk konsistensi istilah lintas request. |
| **Audit Log** | Setiap aksi kritis (tambah key, ubah provider, revoke user) tercatat lengkap dengan diff. |
| **Analytics Dashboard** | Grafik penggunaan, estimasi biaya kumulatif, breakdown per provider dan bahasa. |
| **Dokumentasi API In-App** | Halaman docs langsung di dashboard — tidak perlu buka tab Postman. |

---

## Arsitektur

```
Client / Application
        │
        ▼  POST /api/v1/translate
   ┌─────────────────────┐
   │    API Gateway       │  ← AuthenticateApiKey middleware
   │     (Atlas)          │     validates X-API-Key per tenant
   └────────┬────────────┘
            │
            ▼
   ┌─────────────────────┐
   │  Translation        │  ← check TranslationMemory (semantic cache)
   │  Dispatcher         │     if miss → route to active Provider
   └────────┬────────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
 Provider A    Provider B   ← failover jika timeout / error
  (SumoPod)   (OpenAI, dll)
     │
     ▼
 TranslationLog saved
 AuditLog recorded
 Response returned
```

---

## Tech Stack

**Backend**
- [Laravel 12](https://laravel.com) — routing, Eloquent ORM, queues, auth
- MySQL — primary database
- [Phosphor Icons](https://phosphoricons.com) — icon set via `@phosphor-icons/react`

**Frontend**
- [React 19](https://react.dev) + [Inertia.js 2](https://inertiajs.com) — SPA tanpa API layer terpisah
- [Tailwind CSS 4](https://tailwindcss.com) — utility-first, custom design tokens
- [Vite 8](https://vitejs.dev) — bundler

---

## Instalasi

### Prerequisites

- PHP ≥ 8.2 + Composer
- Node.js ≥ 20 + pnpm
- MySQL ≥ 8.0

### Setup

```bash
# Clone repo
git clone https://github.com/your-org/atlas.git
cd atlas

# Install PHP dependencies
composer install

# Install JS dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate
```

### Konfigurasi `.env`

```env
# Database
DB_CONNECTION=mysql
DB_DATABASE=atlas
DB_USERNAME=root
DB_PASSWORD=

# Mail (untuk undangan pengguna)
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=no-reply@example.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME="${APP_NAME}"

# Queue (gunakan database driver untuk development)
QUEUE_CONNECTION=database
```

### Database & Seeder

```bash
php artisan migrate
php artisan db:seed
```

### Build & Run

```bash
# Development (dengan HMR)
pnpm dev
php artisan serve

# Production
pnpm build
```

Akses di `http://localhost:8000`.

---

## Struktur Direktori Kunci

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/           # Public translation endpoints
│   │   └── Dashboard/     # Dashboard internal (admin-only)
│   ├── Middleware/
│   │   └── AuthenticateApiKey.php
│   └── Resources/         # JSON API Resources
├── Mail/
│   └── UserInvitedMail.php
├── Models/
│   ├── ApiKey.php
│   ├── Provider.php
│   ├── Tenant.php
│   ├── TranslationLog.php
│   ├── TranslationMemory.php
│   └── User.php
└── Services/
    ├── AuditLogger.php
    └── TranslationDispatcher.php

resources/js/
├── Components/
│   ├── shell/             # Layout shell (Sidebar, Topbar)
│   └── ui/                # Reusable UI primitives (Button, Table, Badge, ...)
└── Pages/
    ├── Dashboard.jsx
    ├── Docs/              # API Documentation in-app
    ├── Settings/
    ├── Tenants/
    └── Users/
```

---

## API Reference Singkat

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/api/v1/translate` | `X-API-Key` | Submit teks untuk diterjemahkan |
| `GET` | `/api/v1/translate/{id}` | `X-API-Key` | Ambil detail transaksi by ULID |
| `GET` | `/api/v1/languages` | `X-API-Key` | Daftar bahasa yang didukung tenant |

Dokumentasi lengkap tersedia di halaman **Docs** di dalam dashboard aplikasi.

---

## Kontribusi

1. Fork repository ini
2. Buat branch: `git checkout -b feat/nama-fitur`
3. Commit dengan konvensi Conventional Commits:
   ```bash
   git commit -m "feat(api): add response streaming support"
   ```
4. Push dan buka Pull Request ke branch `development`

---

## License

MIT © [Daivageralda](https://github.com/daivageralda)
