import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    BookOpen,
    Key,
    ArrowsLeftRight,
    MagnifyingGlass,
    Warning,
    CheckCircle,
    XCircle,
    Lightning,
} from '@phosphor-icons/react';
import { CodeBlock } from '../../Components/ui/CodeBlock';
import { Badge } from '../../Components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../Components/ui/Table';

export default function Index({ supportedLanguages, baseUrl }) {
    const [activeTab, setActiveTab] = useState('auth');

    const tabs = [
        { key: 'auth',      label: 'Autentikasi',      icon: Key },
        { key: 'translate', label: 'POST /translate',   icon: ArrowsLeftRight },
        { key: 'status',    label: 'GET /translate/{id}', icon: MagnifyingGlass },
        { key: 'errors',    label: 'Error Codes',       icon: Warning },
    ];

    const apiBase = `${baseUrl}/api/v1`;
    const exampleKey = 'atlas_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const exampleId  = '01HXYZ4ABCDE5F6G7H8J9K0M1N';
    const langList   = supportedLanguages.join(', ');

    const handleKeyDown = (e, index) => {
        let nextIndex = index;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            nextIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else {
            return;
        }
        e.preventDefault();
        setActiveTab(tabs[nextIndex].key);
        const buttons = document.querySelectorAll('[role="tab"]');
        if (buttons[nextIndex]) {
            buttons[nextIndex].focus();
        }
    };

    /* ── code snippets ── */
    const curlTranslate = `curl -X POST ${apiBase}/translate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${exampleKey}" \\
  -d '{
    "content_type": "plain",
    "source_lang": "id",
    "target_lang": "en",
    "text": "Halo, dunia!"
  }'`;

    const jsTranslate = `const response = await fetch('${apiBase}/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': '${exampleKey}',
  },
  body: JSON.stringify({
    content_type: 'plain',
    source_lang: 'id',
    target_lang: 'en',
    text: 'Halo, dunia!',
  }),
});

const data = await response.json();
console.log(data.data.translated_text);`;

    const successTranslate = `{
  "success": true,
  "data": {
    "translation_id": "${exampleId}",
    "translated_text": "Hello, world!",
    "cached": false,
    "provider": "SumoPod",
    "retry_count": 0,
    "fallback_used": false,
    "duration_ms": 412,
    "estimated_cost": 0.0000035
  }
}`;

    const cachedTranslate = `{
  "success": true,
  "data": {
    "translation_id": "${exampleId}",
    "translated_text": "Hello, world!",
    "cached": true,
    "provider": "SumoPod",
    "retry_count": 0,
    "fallback_used": false,
    "duration_ms": 4,
    "estimated_cost": 0
  }
}`;

    const curlStatus = `curl -X GET ${apiBase}/translate/${exampleId} \\
  -H "X-API-Key: ${exampleKey}"`;

    const successStatus = `{
  "success": true,
  "data": {
    "translation_id": "${exampleId}",
    "status": "success",
    "source_lang": "id",
    "target_lang": "en",
    "content_type": "plain",
    "provider": "SumoPod",
    "cached": false,
    "duration_ms": 412,
    "cost_estimate": 0.0000035,
    "token_usage": 35,
    "created_at": "2024-07-11T14:22:00Z"
  }
}`;

    const errorCodes = [
        { code: '200', variant: 'success', title: 'OK', desc: 'Permintaan berhasil diproses.' },
        { code: '401', variant: 'danger',  title: 'Unauthorized', desc: 'Header X-API-Key tidak valid atau kedaluwarsa.' },
        { code: '422', variant: 'warning', title: 'Unprocessable Entity', desc: 'Validasi input gagal. Periksa format payload Anda.' },
        { code: '429', variant: 'warning', title: 'Too Many Requests', desc: 'Rate limit tercapai. Silakan coba lagi nanti.' },
        { code: '502', variant: 'danger',  title: 'Bad Gateway', desc: 'Seluruh provider AI gagal merespons permintaan translasi.' },
    ];

    return (
        <div className="space-y-6 pb-20 select-none text-xs">
            <Head title="Dokumentasi API" />

            {/* Premium Header */}
            <div className="border-b border-atlas-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-atlas-hover border border-atlas-border flex items-center justify-center text-atlas-accent">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-atlas-primary">Dokumentasi API</h1>
                        <p className="text-atlas-secondary mt-0.5 text-xs">
                            Integrasi translation gateway Atlas ke dalam project Anda dengan performa tinggi
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Layout Grid matching Settings exactly */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Navigation Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="space-y-1" role="tablist">
                        {tabs.map(({ key, label, icon: Icon }, index) => {
                            const isActive = activeTab === key;
                            return (
                                <button
                                    key={key}
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setActiveTab(key)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-button border text-left font-semibold transition-all duration-150 outline-none ${
                                        isActive
                                            ? 'bg-atlas-card border-atlas-border text-atlas-accent shadow-md shadow-atlas-accent/5'
                                            : 'bg-transparent border-transparent text-atlas-secondary hover:bg-atlas-card hover:text-atlas-primary'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 flex-shrink-0" />
                                    <span className="leading-tight">{label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Supported Languages Widget */}
                    <div className="p-4 rounded-button border border-atlas-border bg-atlas-card space-y-2">
                        <p className="font-bold text-atlas-secondary uppercase tracking-widest text-[10px]">Bahasa Didukung</p>
                        <div className="flex flex-wrap gap-1.5">
                            {supportedLanguages.map(lang => (
                                <Badge key={lang} variant="neutral" className="uppercase font-mono text-[9px] px-2.5 py-0.5">{lang}</Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Viewport - Styled exactly like Settings content panel */}
                <div className="lg:col-span-3 bg-atlas-card border border-atlas-border rounded-card p-6 min-h-[480px] space-y-6">

                    {/* ── AUTENTIKASI ── */}
                    {activeTab === 'auth' && (
                        <div className="space-y-6">
                            <SectionHeader icon={Key} title="Autentikasi Gateway" subtitle="Gunakan HTTP header untuk autentikasi setiap request." />

                            <div className="p-4 rounded-input border border-atlas-border bg-atlas-surface leading-relaxed text-atlas-secondary space-y-3">
                                <p>
                                    Atlas mengamankan endpoint menggunakan token otorisasi per-tenant. Setiap token terikat dengan log kuota, estimasi biaya, dan analytics tenant bersangkutan.
                                </p>
                                <p>
                                    Dapatkan atau buat API Key baru langsung pada panel <a href="/api-keys" className="text-atlas-accent hover:underline font-semibold font-mono">API Key</a>.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <SectionLabel>Header Otorisasi</SectionLabel>
                                <CodeBlock code={`X-API-Key: ${exampleKey}`} />
                            </div>

                            <div className="space-y-3">
                                <SectionLabel>Uji Koneksi dengan cURL</SectionLabel>
                                <CodeBlock code={`curl -I -X GET ${apiBase}/languages \\
  -H "X-API-Key: ${exampleKey}"`} />
                            </div>

                            <InfoCard variant="warning">
                                <p className="text-atlas-warning leading-relaxed font-medium">
                                    Jangan publikasikan API Key di repository publik atau frontend script. Token harus disimpan aman di environment server Anda.
                                </p>
                            </InfoCard>
                        </div>
                    )}

                    {/* ── POST TRANSLATE ── */}
                    {activeTab === 'translate' && (
                        <div className="space-y-6">
                            <SectionHeader icon={ArrowsLeftRight} title="Request Translation" subtitle="Kirim konten teks untuk diterjemahkan oleh SumoPod Engine." />

                            {/* REST Pill */}
                            <div className="flex items-center gap-3 p-3 rounded-button bg-atlas-surface border border-atlas-border w-fit">
                                <span className="px-2 py-0.5 rounded bg-atlas-hover border border-atlas-info text-atlas-info font-bold text-[10px] tracking-wider font-mono">POST</span>
                                <code className="text-atlas-primary font-mono text-[11px] tracking-wide select-all">{apiBase}/translate</code>
                            </div>

                            <div className="space-y-3">
                                <SectionLabel>Body Parameters</SectionLabel>
                                <div className="border border-atlas-border rounded-input overflow-hidden bg-atlas-surface">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-1/4 font-mono font-bold tracking-wider text-[10px]">Parameter</TableHead>
                                                <TableHead className="w-1/6 font-mono font-bold tracking-wider text-[10px]">Tipe</TableHead>
                                                <TableHead className="w-1/6 font-mono font-bold tracking-wider text-[10px]">Status</TableHead>
                                                <TableHead className="font-mono font-bold tracking-wider text-[10px]">Keterangan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <FieldRow field="content_type" type="string" required desc={<>Format struktur teks input. Gunakan: <code className="text-atlas-accent font-mono bg-atlas-hover px-1.5 py-0.5 rounded">plain</code>, <code className="text-atlas-accent font-mono bg-atlas-hover px-1.5 py-0.5 rounded">html</code>, atau <code className="text-atlas-accent font-mono bg-atlas-hover px-1.5 py-0.5 rounded">markdown</code>.</>} />
                                            <FieldRow field="source_lang" type="string" required desc={<>Locale kode bahasa sumber (2 karakter). Didukung: <span className="text-atlas-primary font-mono font-semibold">{langList}</span>.</>} />
                                            <FieldRow field="target_lang" type="string" required desc="Locale kode bahasa tujuan (2 karakter)." />
                                            <FieldRow field="text"        type="string" required desc="Konten teks utama yang akan diterjemahkan (Maks. 50.000 karakter)." />
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-3">
                                    <SectionLabel>Contoh Payload cURL</SectionLabel>
                                    <CodeBlock code={curlTranslate} />
                                </div>
                                <div className="space-y-3">
                                    <SectionLabel>Contoh Payload JavaScript</SectionLabel>
                                    <CodeBlock code={jsTranslate} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <SectionLabel>Responses</SectionLabel>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 font-mono text-[10px]">
                                        <Badge variant="success">200 OK</Badge>
                                        <span className="text-atlas-secondary">Translasi Baru Berhasil</span>
                                    </div>
                                    <CodeBlock code={successTranslate} />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 font-mono text-[10px]">
                                        <Badge variant="info">200 OK</Badge>
                                        <span className="text-atlas-secondary">Translasi Diambil dari Memori Cache (Biaya $0)</span>
                                    </div>
                                    <CodeBlock code={cachedTranslate} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── GET STATUS ── */}
                    {activeTab === 'status' && (
                        <div className="space-y-6">
                            <SectionHeader icon={MagnifyingGlass} title="Detail Transaksi" subtitle="Cari dan ambil record translasi di database menggunakan ULID log." />

                            {/* REST Pill */}
                            <div className="flex items-center gap-3 p-3 rounded-button bg-atlas-surface border border-atlas-border w-fit">
                                <span className="px-2 py-0.5 rounded bg-atlas-hover border border-atlas-success text-atlas-success font-bold text-[10px] tracking-wider font-mono">GET</span>
                                <code className="text-atlas-primary font-mono text-[11px] tracking-wide select-all">{apiBase}/translate/<span className="text-atlas-accent">{'{id}'}</span></code>
                            </div>

                            <div className="space-y-3">
                                <SectionLabel>Path Variables</SectionLabel>
                                <div className="border border-atlas-border rounded-input overflow-hidden bg-atlas-surface">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-1/4 font-mono font-bold tracking-wider text-[10px]">Variabel</TableHead>
                                                <TableHead className="w-1/4 font-mono font-bold tracking-wider text-[10px]">Tipe</TableHead>
                                                <TableHead className="font-mono font-bold tracking-wider text-[10px]">Keterangan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="font-mono text-atlas-accent font-semibold">id</TableCell>
                                                <TableCell className="text-atlas-secondary font-mono">string (ULID)</TableCell>
                                                <TableCell className="text-atlas-secondary leading-relaxed">Unique ID log transaksi yang diperoleh dari response endpoint POST.</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <SectionLabel>Request cURL</SectionLabel>
                                <CodeBlock code={curlStatus} />
                            </div>

                            <div className="space-y-4">
                                <SectionLabel>Responses</SectionLabel>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 font-mono text-[10px]">
                                        <Badge variant="success">200 OK</Badge>
                                        <span className="text-atlas-secondary">Data Transaksi Ditemukan</span>
                                    </div>
                                    <CodeBlock code={successStatus} />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 font-mono text-[10px]">
                                        <Badge variant="danger">404 NOT FOUND</Badge>
                                        <span className="text-atlas-secondary">Transaksi Tidak Ditemukan</span>
                                    </div>
                                    <CodeBlock code={`{
  "success": false,
  "message": "Translation log not found."
}`} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── ERROR CODES ── */}
                    {activeTab === 'errors' && (
                        <div className="space-y-6">
                            <SectionHeader icon={Warning} title="Standard Error Codes" subtitle="Penanganan validasi dan mapping error dari gateway." />

                            <div className="p-4 rounded-input border border-atlas-border bg-atlas-surface text-atlas-secondary">
                                Semua payload error dari Atlas menggunakan format JSON standar yang konsisten di seluruh endpoint gateway.
                            </div>

                            <div className="space-y-3">
                                <SectionLabel>Error JSON Schema</SectionLabel>
                                <CodeBlock code={`{
  "success": false,
  "message": "Deskripsi detail mengenai kesalahan yang terjadi."
}`} />
                            </div>

                            <div className="space-y-3">
                                <SectionLabel>Tabel HTTP Status</SectionLabel>
                                <div className="border border-atlas-border rounded-input overflow-hidden bg-atlas-surface">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-1/6 font-mono font-bold tracking-wider text-[10px]">Status</TableHead>
                                                <TableHead className="w-1/4 font-mono font-bold tracking-wider text-[10px]">Nama</TableHead>
                                                <TableHead className="font-mono font-bold tracking-wider text-[10px]">Penyebab / Solusi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {errorCodes.map(({ code, variant, title, desc }) => (
                                                <TableRow key={code}>
                                                    <TableCell>
                                                        <Badge variant={variant} className="font-mono">{code}</Badge>
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-atlas-primary font-mono">{title}</TableCell>
                                                    <TableCell className="text-atlas-secondary leading-relaxed">{desc}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Helper sub-components ── */

function SectionHeader({ icon: Icon, title, subtitle }) {
    return (
        <div className="flex items-start gap-4 pb-5 border-b border-atlas-border">
            <div className="h-9 w-9 rounded-lg bg-atlas-hover border border-atlas-border flex items-center justify-center text-atlas-accent flex-shrink-0">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <h2 className="text-sm font-bold text-atlas-primary font-mono tracking-wide">{title}</h2>
                <p className="text-atlas-secondary mt-1 text-[11px] leading-relaxed">{subtitle}</p>
            </div>
        </div>
    );
}

function SectionLabel({ children }) {
    return (
        <p className="text-[10px] font-bold uppercase tracking-wider text-atlas-secondary font-mono">{children}</p>
    );
}

function InfoCard({ children, variant }) {
    const border = variant === 'warning'
        ? 'border-atlas-warning bg-atlas-warning/5'
        : 'border-atlas-border bg-atlas-surface';
    return (
        <div className={`rounded-input border p-4 ${border}`}>
            {children}
        </div>
    );
}

function FieldRow({ field, type, required, desc }) {
    return (
        <TableRow>
            <TableCell className="font-mono text-atlas-accent font-semibold">{field}</TableCell>
            <TableCell className="text-atlas-secondary font-mono text-[11px]">{type}</TableCell>
            <TableCell>
                {required
                    ? <span className="px-2 py-0.5 rounded bg-atlas-danger/10 border border-atlas-danger/25 text-atlas-danger text-[9px] font-bold tracking-wider font-mono">required</span>
                    : <span className="px-2 py-0.5 rounded bg-atlas-hover border border-atlas-border text-atlas-secondary text-[9px] font-bold tracking-wider font-mono">optional</span>}
            </TableCell>
            <TableCell className="text-atlas-secondary leading-relaxed">{desc}</TableCell>
        </TableRow>
    );
}
