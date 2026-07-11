import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { 
    Gear, 
    Translate, 
    Chat, 
    ArrowsCounterClockwise, 
    Plus, 
    X, 
    Warning,
    FloppyDisk
} from '@phosphor-icons/react';

export default function Index({ settings }) {
    const [activeTab, setActiveTab] = useState('languages'); // 'languages' | 'prompt' | 'retry'
    const [newLang, setNewLang] = useState('');

    // Inertia form
    const { data, setData, put, processing, errors, reset, isDirty } = useForm({
        supported_languages: settings.supported_languages || [],
        global_prompt: settings.global_prompt || '',
        retry_max_attempts: settings.retry_max_attempts || 3,
        retry_backoff_ms: settings.retry_backoff_ms || [1000, 2000, 4000]
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        put(route('settings.update'), {
            preserveScroll: true
        });
    };

    // Add new language ISO code chip
    const handleAddLanguage = () => {
        const cleanCode = newLang.trim().toLowerCase();
        if (cleanCode.length !== 2) return;
        if (data.supported_languages.includes(cleanCode)) return;

        setData('supported_languages', [...data.supported_languages, cleanCode]);
        setNewLang('');
    };

    // Remove language chip
    const handleRemoveLanguage = (code) => {
        setData('supported_languages', data.supported_languages.filter(l => l !== code));
    };

    // Update dynamic backoff items based on max retry attempts changes
    const handleMaxAttemptsChange = (val) => {
        const count = Math.min(10, Math.max(1, parseInt(val) || 1));
        setData('retry_max_attempts', count);

        // Adjust backoff array length matching attempts count
        let backoffs = [...data.retry_backoff_ms];
        if (backoffs.length < count) {
            while (backoffs.length < count) {
                const last = backoffs[backoffs.length - 1] || 1000;
                backoffs.push(last * 2); // default multiply factor exponent
            }
        } else if (backoffs.length > count) {
            backoffs = backoffs.slice(0, count);
        }
        setData('retry_backoff_ms', backoffs);
    };

    const handleBackoffChange = (index, value) => {
        const backoffs = [...data.retry_backoff_ms];
        backoffs[index] = Math.max(100, parseInt(value) || 100);
        setData('retry_backoff_ms', backoffs);
    };

    return (
        <div className="space-y-6 select-none relative pb-20">
            <Head title="Settings" />

            {/* Header */}
            <div className="border-b border-atlas-border/50 pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-atlas-accent/10 border border-atlas-accent/25 flex items-center justify-center text-atlas-accent">
                        <Gear className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-atlas-primary">Settings</h1>
                        <p className="text-xs text-atlas-secondary mt-0.5">Konfigurasi parameter global, bahasa terjemahan, dan perilaku fallback engine</p>
                    </div>
                </div>
            </div>

            {/* Main Tabs layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-xs">
                {/* Vertical Tabs Sidebar */}
                <div className="lg:col-span-1 space-y-1">
                    <button
                        onClick={() => setActiveTab('languages')}
                        className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-button border text-left font-semibold transition-all ${
                            activeTab === 'languages'
                                ? 'bg-atlas-card border-atlas-border text-atlas-accent shadow-md shadow-atlas-accent/5'
                                : 'bg-transparent border-transparent text-atlas-secondary hover:bg-atlas-card hover:text-atlas-primary'
                        }`}
                    >
                        <Translate className="h-4 w-4" />
                        <span>Bahasa Didukung</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('prompt')}
                        className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-button border text-left font-semibold transition-all ${
                            activeTab === 'prompt'
                                ? 'bg-atlas-card border-atlas-border text-atlas-accent shadow-md shadow-atlas-accent/5'
                                : 'bg-transparent border-transparent text-atlas-secondary hover:bg-atlas-card hover:text-atlas-primary'
                        }`}
                    >
                        <Chat className="h-4 w-4" />
                        <span>Prompt Global</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('retry')}
                        className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-button border text-left font-semibold transition-all ${
                            activeTab === 'retry'
                                ? 'bg-atlas-card border-atlas-border text-atlas-accent shadow-md shadow-atlas-accent/5'
                                : 'bg-transparent border-transparent text-atlas-secondary hover:bg-atlas-card hover:text-atlas-primary'
                        }`}
                    >
                        <ArrowsCounterClockwise className="h-4 w-4" />
                        <span>Retry & Delay</span>
                    </button>
                </div>

                {/* Content Viewport */}
                <div className="lg:col-span-3 bg-atlas-card border border-atlas-border rounded-card p-6 min-h-[360px]">
                    <form onSubmit={handleFormSubmit}>
                        {/* Tab: Languages */}
                        {activeTab === 'languages' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-sm font-bold text-atlas-primary">Bahasa Internasional Didukung</h2>
                                    <p className="text-atlas-secondary text-[11px] mt-1 leading-relaxed">
                                        Daftar kode bahasa ISO 639-1 yang diizinkan untuk request translasi. Gateway akan memblokir kode bahasa di luar daftar ini.
                                    </p>
                                </div>

                                {/* Language chips */}
                                <div className="flex flex-wrap gap-2 p-4 bg-atlas-surface border border-atlas-border/50 rounded-input">
                                    {data.supported_languages.map(code => (
                                        <div 
                                            key={code} 
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-atlas-accent/10 border border-atlas-accent/20 text-atlas-accent font-mono text-[11px] font-bold"
                                        >
                                            <span>{code}</span>
                                            {data.supported_languages.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLanguage(code)}
                                                    className="hover:bg-atlas-accent/20 rounded-full p-0.5"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Add Language bar */}
                                <div className="flex items-center gap-2 max-w-xs pt-2">
                                    <input
                                        type="text"
                                        maxLength="2"
                                        value={newLang}
                                        onChange={(e) => setNewLang(e.target.value)}
                                        placeholder="Kode (e.g. fr)"
                                        className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs font-mono text-center uppercase"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddLanguage}
                                        className="h-9 px-3 inline-flex items-center justify-center gap-1 rounded-button bg-atlas-accent/15 hover:bg-atlas-accent/25 border border-atlas-accent/30 text-atlas-accent font-semibold transition-all active:scale-95"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Tambah</span>
                                    </button>
                                </div>
                                {errors.supported_languages && <p className="text-atlas-danger font-mono text-[10px]">{errors.supported_languages}</p>}
                            </div>
                        )}

                        {/* Tab: Prompt */}
                        {activeTab === 'prompt' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-sm font-bold text-atlas-primary">Global Prompt Translator</h2>
                                    <p className="text-atlas-secondary text-[11px] mt-1 leading-relaxed">
                                        Instruksi sistem utama yang dikirimkan ke model AI untuk memandu format hasil dan gaya bahasa terjemahan.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <textarea
                                        rows="10"
                                        value={data.global_prompt}
                                        onChange={(e) => setData('global_prompt', e.target.value.substring(0, 2000))}
                                        placeholder="Ketik prompt instruksi translasinya..."
                                        className="w-full px-4 py-3 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary font-mono text-[11px] leading-relaxed outline-none focus:border-atlas-accent/50 resize-y"
                                    />
                                    <div className="flex items-center justify-between font-mono text-[10px]">
                                        <span className="text-atlas-secondary">Maksimum 2000 karakter</span>
                                        <span className={data.global_prompt.length >= 1950 ? 'text-atlas-danger font-bold' : 'text-atlas-secondary'}>
                                            {data.global_prompt.length}/2000
                                        </span>
                                    </div>
                                </div>
                                {errors.global_prompt && <p className="text-atlas-danger font-mono text-[10px]">{errors.global_prompt}</p>}
                            </div>
                        )}

                        {/* Tab: Retry */}
                        {activeTab === 'retry' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-sm font-bold text-atlas-primary">Perilaku Retry & Backoff Delays</h2>
                                    <p className="text-atlas-secondary text-[11px] mt-1 leading-relaxed">
                                        Konfigurasi penanganan toleransi kegagalan koneksi engine provider utama sebelum beralih ke fallback engine.
                                    </p>
                                </div>

                                <div className="space-y-4 max-w-md">
                                    {/* Max Retry Attempts */}
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                            Batas Maksimum Percobaan (Retry Attempts)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={data.retry_max_attempts}
                                            onChange={(e) => handleMaxAttemptsChange(e.target.value)}
                                            className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary font-mono text-xs"
                                        />
                                        {errors.retry_max_attempts && <p className="text-atlas-danger font-mono text-[10px]">{errors.retry_max_attempts}</p>}
                                    </div>

                                    {/* Backoff Delays list */}
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                            Jeda Waktu Tunggu Percobaan (Exponential Backoff ms)
                                        </label>
                                        
                                        <div className="space-y-2 p-4 bg-atlas-surface border border-atlas-border/50 rounded-input font-mono text-xs">
                                            {data.retry_backoff_ms.map((delay, index) => (
                                                <div key={index} className="flex items-center justify-between gap-3">
                                                    <span className="text-atlas-secondary">Percobaan #{index + 1}:</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            required
                                                            type="number"
                                                            min="100"
                                                            max="30000"
                                                            value={delay}
                                                            onChange={(e) => handleBackoffChange(index, e.target.value)}
                                                            className="w-24 px-2 py-1 bg-atlas-card border border-atlas-border rounded text-right text-atlas-primary outline-none focus:border-atlas-accent/50 text-[11px]"
                                                        />
                                                        <span className="text-atlas-secondary text-[10px]">ms</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Sticky Save Bar */}
            {isDirty && (
                <div className="fixed bottom-6 left-[18%] right-6 z-30 bg-atlas-card border border-atlas-accent/35 rounded-card p-4 flex items-center justify-between shadow-2xl animate-fade-in">
                    <div className="flex items-center gap-2 text-atlas-accent font-semibold text-xs">
                        <Warning className="h-4.5 w-4.5" />
                        <span>Terdapat perubahan pengaturan yang belum disimpan!</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <button
                            onClick={() => reset()}
                            className="px-4 py-2 rounded-button bg-atlas-surface border border-atlas-border text-atlas-secondary hover:text-atlas-primary transition-all font-semibold active:scale-95"
                        >
                            Batalkan
                        </button>
                        <button
                            onClick={handleFormSubmit}
                            disabled={processing}
                            className="px-4 py-2 rounded-button bg-atlas-accent text-atlas-bg font-bold hover:bg-atlas-accent/90 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
                        >
                            <FloppyDisk className="h-3.5 w-3.5" />
                            <span>{processing ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
