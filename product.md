# Atlas — Translation Gateway Platform
## Product Specification (product.md)

> **Versi:** 1.0 — turunan detail dari `Atlas-Translation-Gateway-Brief-v1.md`
> **Status:** Draft untuk direview
> **Scope dokumen:** requirement, alur sistem, data model, dan API design. Untuk visual/UI, lihat `design.md`.

---

## 1. Ringkasan Eksekutif

Atlas adalah **Translation Gateway internal** yang menjadi satu pintu masuk untuk semua kebutuhan translasi di perusahaan — terutama website berita dan company profile. Alih-alih setiap aplikasi mengintegrasikan provider AI translasi masing-masing secara terpisah, semua aplikasi cukup memanggil satu REST API: **Atlas**.

Atlas yang menangani di baliknya: pemilihan provider, retry, fallback, caching hasil translasi (translation memory), logging, monitoring, analytics, dan cost tracking — semuanya terpusat, dengan arsitektur **multi-tenant** sehingga tiap website punya API key, statistik, dan kontrol akses sendiri-sendiri.

## 2. Problem Statement

- Tanpa gateway terpusat, tiap aplikasi (news portal, company profile, landing page, corporate website) berpotensi mengintegrasikan provider translasi AI secara terpisah → duplikasi effort, biaya tidak terkontrol, tidak ada standar retry/fallback.
- Tidak ada satu tempat untuk melihat: berapa biaya translasi bulan ini, seberapa sering teks yang sama diterjemahkan ulang padahal bisa di-cache, siapa yang mengubah konfigurasi provider/prompt, dan seberapa reliable tiap provider.
- Kalau provider AI translasi diganti di masa depan, perubahan seharusnya terjadi di satu tempat (Atlas), bukan di semua codebase aplikasi.

## 3. Vision

Atlas menjadi platform Translation Gateway internal yang **scalable, reusable**, dan menjadi **single source of truth** untuk seluruh layanan translasi perusahaan — cukup satu API call, Atlas yang mengurus sisanya.

## 4. Goals & Non-Goals

**Goals (V1)**
- Satu REST API translasi yang bisa dipakai semua aplikasi perusahaan.
- Arsitektur multi-tenant: setiap website adalah tenant dengan API key, log, dan analytics sendiri.
- Retry + fallback provider otomatis, semua tercatat.
- Translation memory (cache) berbasis MySQL untuk efisiensi biaya & konsistensi istilah.
- Dashboard monitoring, analytics dasar, audit log, dan manajemen API key.

**Non-Goals (V1 — didorong ke V2)**
- Prompt per tenant + versioning + riwayat prompt.
- Semantic memory lookup via ChromaDB.
- Multiple AI provider selain SumoPod + 1 fallback.
- Cost optimization rule engine otomatis.

## 5. Target User & Persona

### 5.1 Admin
Tim internal yang mengelola Atlas secara keseluruhan.
- **Kebutuhan:** visibilitas ke semua tenant, kontrol keamanan (API key, user access), approval/konfigurasi provider & prompt, melihat cost & audit trail.
- **Titik sakit yang diselesaikan:** tidak perlu masuk ke kode tiap aplikasi untuk tahu status translasi atau biaya yang keluar.

### 5.2 Developer
Engineer yang mengintegrasikan Atlas API ke aplikasi website (news portal, company profile, dll).
- **Kebutuhan:** dokumentasi API yang jelas, API key untuk testing, kemampuan melihat log request miliknya sendiri, pesan error yang jelas saat request gagal.
- **Titik sakit yang diselesaikan:** tidak perlu tahu detail provider AI atau logic retry — cukup panggil satu endpoint.

> **Catatan:** brief hanya menyebut dua persona (Admin, Developer). Jika nanti ada kebutuhan visibilitas cost untuk stakeholder non-teknis (Finance/Management), sebaiknya didefinisikan sebagai role read-only terpisah — lihat bagian 14 (Open Questions).

## 6. Core Concept

| Konsep | Penjelasan |
|---|---|
| **Translation Gateway** | Atlas adalah lapisan abstraksi di atas provider AI translasi. Aplikasi tidak pernah bicara langsung ke provider. |
| **Multi-Tenant** | Setiap website/aplikasi = 1 tenant, dengan API key, statistik, log, analytics, cost, dan user sendiri. |
| **Translation Memory** | Source of truth hasil translasi. Mengurangi biaya AI, mempercepat response, menjaga konsistensi istilah antar request. |
| **Provider Fallback** | Jika provider utama (SumoPod) gagal setelah beberapa kali retry, Atlas otomatis memakai Public Translation API sebagai fallback. |

## 7. Scope

### 7.1 In-Scope V1
- REST API translasi (plain text, HTML, markdown).
- Dashboard dengan 11 modul (lihat 8.9).
- Retry + fallback provider.
- Translation Memory (MySQL).
- API Key management per tenant.
- Audit log.
- Multi-tenant.
- Queue via Upstash QStash.

### 7.2 Out-of-Scope V1 (masuk V2)
- Prompt per tenant, versioning, riwayat prompt.
- ChromaDB semantic memory.
- Multiple AI provider (lebih dari 1 primary + 1 fallback).
- Cost optimization rule engine.

## 8. Functional Requirements

### 8.1 Autentikasi & Otorisasi
- **API traffic** (dari aplikasi/tenant): autentikasi via **API Key**, dikirim di header (mis. `X-API-Key`).
- **Dashboard**: login terpisah (session/JWT) untuk Admin & Developer, dengan role-based access:
  - **Admin**: akses penuh semua modul & semua tenant.
  - **Developer**: direkomendasikan akses **scoped ke tenant tertentu**, read-only ke Analytics & Logs miliknya sendiri (perlu dikonfirmasi — lihat bagian 14).
- API Key **tidak boleh disimpan plaintext** — simpan hash (mis. SHA-256) di database, tampilkan value asli hanya sekali saat pembuatan.

### 8.2 Manajemen Tenant
- CRUD tenant (News Portal, Company Profile, Landing Page, Corporate Website, dst — tipe bebas/extensible).
- Tiap tenant punya: nama, tipe, status (aktif/nonaktif), API key(s), statistik, log, analytics, cost, dan user yang terkait.
- Satu tenant bisa punya lebih dari satu API key (mis. untuk staging vs production) — direkomendasikan untuk V1.

### 8.3 Translation API
- Request **wajib** menyertakan `content_type`: `plain` | `html` | `markdown`, supaya engine tahu cara memproses tanpa merusak struktur.
- Request wajib menyertakan `target_lang`. `source_lang` direkomendasikan **wajib eksplisit di V1** (bukan auto-detect) — demi akurasi cache key Translation Memory dan konsistensi hasil (auto-detect diusulkan sebagai fitur V2).
- Penanganan per content type:
  - **Plain Text** — diterjemahkan apa adanya.
  - **HTML** — hanya text node yang diterjemahkan; tag, atribut, `class`, dan `id` tidak disentuh.
  - **Markdown** — sintaks markdown (heading marker, list marker, code block, link syntax) dipertahankan; hanya teks kontennya yang diterjemahkan.
- Response mengembalikan: teks hasil terjemahan, status `cached` (true/false — apakah diambil dari Translation Memory), provider yang dipakai, `translation_id` untuk tracing, durasi proses, dan estimasi cost (jika tersedia).

### 8.4 Translation Flow (Detail)

1. Request masuk ke Atlas API.
2. Validasi API Key → tolak jika invalid/revoked/rate-limit terlampaui.
3. Identifikasi tenant dari API Key.
4. Hitung cache key dari kombinasi `tenant_id + source_lang + target_lang + content_type + hash(normalized_text)`.
5. Cek Translation Memory dengan cache key tersebut.
   - **Hit** → langsung return hasil, tandai `cached: true`, update `usage_count`.
   - **Miss** → lanjut ke langkah 6.
6. Kirim ke provider primer (**SumoPod**).
   - Jika gagal → retry beberapa kali dengan backoff.
   - Jika tetap gagal → fallback ke **Public Translation API**.
7. Simpan hasil translasi baru ke Translation Memory.
8. Simpan log request (lihat 8.11).
9. Update analytics (request count, success/failed, token usage, dsb).
10. Return response ke pemanggil.

### 8.5 Translation Memory
- **Tujuan:** mengurangi biaya AI, mempercepat response, menjaga konsistensi istilah.
- **V1:** disimpan di MySQL, di-lookup lewat cache key ter-index.
- **V2 (opsional):** ChromaDB untuk semantic lookup (menemukan teks yang mirip meski tidak identik).
- **Rekomendasi scope:** Translation Memory di-scope **per-tenant** secara default (isolasi data & terminologi antar tenant bisa berbeda), dengan opsi **shared/global memory** untuk frasa umum sebagai fitur V2 — ini perlu dikonfirmasi ke stakeholder (lihat 14).
- Dashboard harus memungkinkan admin **mencari dan mengoreksi manual** entri Translation Memory (untuk memperbaiki istilah yang salah tanpa menunggu translasi ulang dari AI).

### 8.6 Provider Gateway, Retry & Fallback
- Provider primer: **SumoPod**.
- Retry beberapa kali dengan strategi backoff (direkomendasikan **exponential backoff**, mis. 3 percobaan: 1s → 2s → 4s — parameter pastinya perlu dikonfirmasi).
- Jika seluruh retry gagal → fallback ke **Public Translation API Internal**.
- Semua aktivitas (percobaan, retry ke berapa, fallback dipakai atau tidak) **dicatat di log**.
- **Rekomendasi tambahan:** circuit breaker per provider — jika provider gagal berkali-kali dalam rentang waktu singkat, Atlas berhenti mencoba provider tersebut sementara (skip langsung ke fallback) supaya tidak membebani sistem dan memperlambat response.

### 8.7 Prompt Management
- **V1:** Global Prompt — satu prompt/instruksi berlaku untuk semua tenant.
- **V2:** Prompt per tenant, dengan versioning dan riwayat perubahan (rollback ke versi sebelumnya).

### 8.8 Queue (Upstash QStash)
- Digunakan karena server **tidak mengizinkan proses `queue:work`** yang berjalan terus-menerus.
- Semua pekerjaan asynchronous (mis. retry di background, job translasi batch/besar) dikirim lewat **Upstash QStash** melalui HTTP callback.
- Dashboard harus punya modul **Queue** untuk monitoring status job: pending, running, success, failed, dan kemampuan retry manual job yang gagal.
- **Rekomendasi:** job harus didesain **idempotent** — supaya aman jika QStash mengirim ulang callback yang sama.

### 8.9 Dashboard Modules

| Modul | Fungsi Utama |
|---|---|
| **Dashboard** | Ringkasan metrik utama (lihat 8.10), status sistem sekilas. |
| **Projects / Tenants** | CRUD tenant, lihat detail per tenant (API key, statistik, log, cost). |
| **API Keys** | Buat, revoke, regenerate, dan atur scope API key per tenant. |
| **Providers** | Konfigurasi provider AI (SumoPod, fallback), termasuk formula harga & status aktif/nonaktif. |
| **Translation Logs** | Tabel log request: bisa difilter per tenant, status, provider, tanggal; drill-down ke detail 1 request. |
| **Translation Memory** | Browse, cari, dan koreksi manual entri hasil translasi tersimpan. |
| **Queue** | Monitoring job asynchronous QStash: status, retry manual. |
| **Analytics** | Grafik & metrik agregat (lihat 8.10). |
| **Users** | Manajemen user dashboard & role (Admin/Developer). |
| **Audit Log** | Riwayat perubahan konfigurasi sistem (lihat 8.12), read-only/immutable. |
| **Settings** | Konfigurasi global sistem (bahasa yang didukung, formula cost, dll). |

### 8.10 Analytics & Metrics

**Metrik ringkasan:**
Today's Request · Success Rate · Provider Usage · Average Response Time · Token Usage · Queue Status · Failure Rate · Estimated Cost · Active Users · Active API Keys.

**Grafik:**
Request per hari · Success vs Failed · Provider Usage · Cost · Token Usage · Average Latency.

Semua metrik & grafik harus bisa difilter per tenant dan per rentang tanggal.

### 8.11 Logging

Setiap request translasi mencatat: Request · Response · Provider · Duration · Retry (jumlah percobaan) · Fallback (dipakai/tidak) · Status · Tenant · User (jika relevan) · Timestamp.

### 8.12 Audit Log

Mencatat seluruh perubahan konfigurasi (siapa mengubah apa, kapan, nilai sebelum/sesudah) untuk: API Key · Prompt · User · Settings · Provider · Tenant. Audit log bersifat **append-only** (tidak bisa diedit/dihapus lewat UI).

### 8.13 Cost Monitoring

- Admin memasukkan **formula harga per provider** (mis. harga per 1.000 karakter atau per token).
- Atlas menghitung **estimasi biaya otomatis** per request, lalu mengagregasinya per tenant/hari/bulan di Analytics & Dashboard.
- **Rekomendasi:** validasi input formula di UI (nilai numerik, unit jelas) untuk mengurangi risiko human error — lihat bagian 15 (Risiko).

## 9. API Design (Proposal)

> Bagian ini adalah **usulan konkret** karena brief awal belum merinci endpoint. Perlu direview sebelum implementasi.

### 9.1 Prinsip
- Base path: `/api/v1`.
- Autentikasi tenant traffic: header `X-API-Key`.
- Semua response berformat JSON, konsisten dengan struktur `{ success, data, error }`.
- Endpoint dashboard/admin terpisah dari endpoint translasi publik (tenant-facing), diautentikasi dengan session/JWT admin.

### 9.2 Endpoint Utama (usulan)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/v1/translate` | Translasi satu teks/HTML/markdown. |
| `POST` | `/v1/translate/batch` | *(usulan tambahan, belum ada di brief)* Translasi banyak string sekaligus dalam 1 request — efisien untuk halaman dengan banyak elemen teks. |
| `GET` | `/v1/languages` | Daftar bahasa yang didukung tenant tersebut. |
| `GET` | `/v1/translate/:id` | Cek status/hasil translasi (berguna untuk job async/batch besar). |
| `GET` | `/v1/tenants` *(admin)* | Daftar & detail tenant. |
| `POST` | `/v1/tenants/:id/api-keys` *(admin)* | Buat API key baru untuk tenant. |
| `GET` | `/v1/logs` *(admin/developer)* | Query translation logs dengan filter. |
| `GET` | `/v1/analytics` *(admin/developer)* | Data metrik & grafik. |
| `GET` | `/v1/audit-log` *(admin)* | Riwayat perubahan konfigurasi. |
| `PUT` | `/v1/settings/cost-formula` *(admin)* | Update formula harga provider. |

### 9.3 Contoh Request/Response

```http
POST /api/v1/translate
X-API-Key: atl_live_xxx...

{
  "content_type": "html",
  "source_lang": "id",
  "target_lang": "en",
  "text": "<p>Selamat datang di berita hari ini.</p>"
}
```

```json
{
  "success": true,
  "data": {
    "translation_id": "trx_9f2c...",
    "translated_text": "<p>Welcome to today's news.</p>",
    "cached": false,
    "provider": "sumopod",
    "retry_count": 0,
    "fallback_used": false,
    "duration_ms": 842,
    "estimated_cost": 0.0012
  }
}
```

## 10. Data Model (Overview)

| Entity | Deskripsi | Field Kunci (usulan) |
|---|---|---|
| **Tenant** | Website/aplikasi yang menggunakan Atlas | `id, name, type, status, created_at` |
| **ApiKey** | Kredensial akses per tenant | `id, tenant_id, key_hash, label, scopes, status, last_used_at, created_at` |
| **User** | Pengguna dashboard | `id, name, email, role, tenant_scope, status` |
| **TranslationLog** | Catatan tiap request translasi | `id, tenant_id, source_lang, target_lang, content_type, provider, retry_count, fallback_used, status, duration_ms, token_usage, cost_estimate, created_at` |
| **TranslationMemory** | Cache hasil translasi | `id, tenant_id, cache_key, source_lang, target_lang, content_type, source_text, translated_text, usage_count, updated_at` |
| **Provider** | Konfigurasi provider AI | `id, name, role(primary/fallback), pricing_formula, is_active, config` |
| **PromptTemplate** *(V2)* | Prompt & versinya | `id, tenant_id, version, content, is_active, created_by` |
| **AuditLog** | Riwayat perubahan konfigurasi | `id, actor_user_id, entity_type, entity_id, action, before, after, created_at` |
| **QueueJob** | Job asynchronous QStash | `id, type, payload_ref, status, retry_count, created_at, updated_at` |

## 11. Non-Functional Requirements

- **Keamanan:** API key di-hash (bukan plaintext); rate limiting per API key/tenant (direkomendasikan, belum ada di brief); RBAC dashboard (Admin vs Developer); kredensial provider (mis. SumoPod API key) disimpan terenkripsi.
- **Performa:** lookup Translation Memory harus cepat (index pada cache key) supaya cache hit tidak menambah latency signifikan.
- **Skalabilitas:** arsitektur multi-tenant harus tetap performant untuk puluhan–ratusan tenant tanpa deploy ulang; index MySQL translation memory perlu mempertimbangkan pertumbuhan data (composite index `tenant_id + cache_key`).
- **Reliabilitas:** retry + fallback + circuit breaker; queue job idempotent.
- **Observability:** metrik dashboard near-real-time; log cukup detail untuk debugging tanpa menyimpan data sensitif berlebihan.
- **Ekstensibilitas bahasa:** menambah bahasa baru harus lewat konfigurasi (tabel/config Supported Languages), bukan hardcode di kode aplikasi.
- **Retensi data:** kebijakan retensi log & translation memory belum ditentukan di brief — perlu diputuskan (lihat 14).

## 12. Success Metrics / KPI

- Cache hit rate Translation Memory (target awal, mis. >40% setelah beberapa bulan berjalan).
- Average response time — dibedakan cache hit vs cache miss.
- Success rate provider primer vs frekuensi fallback dipakai.
- Estimasi penghematan biaya dibanding tanpa Translation Memory.
- Jumlah tenant aktif & jumlah API key aktif.
- Uptime API gateway.

## 13. Roadmap

**V1**
REST API · Dashboard · Monitoring · Analytics · Retry · Fallback · Translation Memory (MySQL) · API Keys · Audit Log · Multi Tenant.

**V2**
Prompt per Tenant · Prompt Versioning · ChromaDB Semantic Memory · Multiple AI Provider · Cost Optimization · Rule Engine.

## 14. Asumsi & Pertanyaan Terbuka

Hal-hal berikut belum eksplisit di brief dan diasumsikan secara wajar dalam dokumen ini — perlu dikonfirmasi sebelum implementasi:

1. **Scope Translation Memory** — per-tenant (rekomendasi default) atau shared/global?
2. **Rate limiting** per API key — perlu ada supaya satu tenant tidak menghabiskan kuota/biaya tenant lain.
3. **Source language** — wajib eksplisit (rekomendasi V1) atau auto-detect?
4. **Scope role Developer** — akses ke 1 tenant saja, atau read-only ke semua tenant?
5. **Retensi data** — berapa lama log & translation memory disimpan?
6. **SLA/uptime target** — belum disebutkan di brief.
7. **Batch translation endpoint** — usulan tambahan di bagian 9, perlu dikonfirmasi apakah dibutuhkan di V1.
8. **Preservasi struktur HTML/Markdown** — perlu strategi teknis (mis. parsing DOM untuk HTML) yang belum dirinci di brief.

## 15. Risiko

| Risiko | Mitigasi |
|---|---|
| Ketergantungan pada 1 provider utama (SumoPod) | Fallback provider + circuit breaker. |
| Translation Memory jadi stale/istilah berubah | Fitur koreksi manual di modul Translation Memory (8.5). |
| Kebocoran isolasi data antar tenant | Strict tenant scoping di setiap query & setiap endpoint. |
| Human error saat input formula cost | Validasi input di UI Settings/Providers. |

## 16. Glossary

- **Tenant** — satu website/aplikasi yang menggunakan Atlas, dengan API key & data terisolasi sendiri.
- **Translation Memory** — cache hasil translasi yang jadi source of truth untuk menghindari translasi ulang.
- **Fallback Provider** — provider translasi cadangan yang dipakai bila provider utama gagal.
- **QStash** — layanan queue dari Upstash yang dipakai untuk pekerjaan asynchronous tanpa proses worker yang berjalan terus-menerus.
- **Audit Log** — riwayat perubahan konfigurasi sistem yang bersifat append-only.
