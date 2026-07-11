# Part 11 — Translation Memory

> **Status**: `[ ]`
> **Depends on**: Part 09 (TM entries written), Part 04 (AppLayout)
> **Blocks**: Nothing

---

## Goal

Browse, search, and manually correct Translation Memory entries. Admin can fix wrong translations directly without waiting for a new AI request.

---

## Backend

### `MemoryController` (`app/Http/Controllers/Dashboard/MemoryController.php`)

```php
public function index(Request $request)
{
    $query = TranslationMemory::with('tenant')
        ->when($request->tenant_id, fn($q) => $q->where('tenant_id', $request->tenant_id))
        ->when($request->source_lang, fn($q) => $q->where('source_lang', $request->source_lang))
        ->when($request->target_lang, fn($q) => $q->where('target_lang', $request->target_lang))
        ->when($request->search, fn($q) =>
            $q->where('source_text', 'like', "%{$request->search}%")
              ->orWhere('translated_text', 'like', "%{$request->search}%")
        )
        ->when(auth()->user()->role === 'developer',
            fn($q) => $q->where('tenant_id', auth()->user()->tenant_scope)
        )
        ->latest('updated_at')
        ->paginate(30)
        ->withQueryString();

    return Inertia::render('Memory/Index', [
        'entries' => MemoryResource::collection($query),
        'filters' => $request->only(['tenant_id', 'source_lang', 'target_lang', 'search']),
        'tenants' => auth()->user()->role === 'admin'
            ? Tenant::select('id', 'name')->get()
            : [],
    ]);
}

public function update(UpdateMemoryRequest $request, TranslationMemory $memory)
{
    // Scope check for developer
    if (auth()->user()->role === 'developer' && $memory->tenant_id !== auth()->user()->tenant_scope) {
        abort(403);
    }

    $memory->update(['translated_text' => $request->translated_text]);

    return back()->with('success', 'Entri translation memory diperbarui.');
}
```

### `UpdateMemoryRequest`

`translated_text`: required|string|min:1|max:100000.

### `MemoryResource`

Returns: `id, tenant_name, cache_key (truncated to 12 chars for display), source_lang, target_lang, content_type, source_text (truncated to 100 chars), translated_text (truncated to 100 chars), provider, usage_count, updated_at`.

Detail view: full `source_text` and `translated_text`.

---

## Frontend

### `Pages/Memory/Index.jsx`

```
Header: <h1>Translation Memory</h1>

Filter bar:
  [Search source/translated text]  [Tenant — admin]  [Source lang]  [Target lang]

Table (30 per page):
  TENANT | LANGS | TYPE | SOURCE TEXT | TRANSLATED TEXT | USAGE | UPDATED | ACTIONS
```

**Table columns:**
| Column | Render |
|---|---|
| Tenant | Text |
| Langs | `id → en` |
| Type | Content type tag |
| Source Text | Truncated (max 80ch), tooltip on hover with full text |
| Translated Text | Truncated (max 80ch) — editable inline on row click |
| Usage | Count badge |
| Updated | Relative date |
| Actions | Edit icon (opens edit modal) |

### Edit Modal

Radix `Dialog`. Shows full source + editable translated text:

```
Title: "Koreksi Terjemahan"

Source text (readonly):
  [scrollable textarea — Geist Mono, bg: --color-surface]

Corrected translation:
  [textarea — editable, Geist Mono, border focus ring]

Info: "Perubahan ini akan langsung memengaruhi cache untuk request selanjutnya."

[Batal] [Simpan Koreksi]
```

`useForm()`:
```jsx
const { data, setData, put, processing, errors } = useForm({
    translated_text: entry.translated_text_full,
})
```
Submit: `put(route('memory.update', entry.id))`.

---

## Verification

- [ ] Memory list loads with filters.
- [ ] Search matches source text OR translated text.
- [ ] Tenant filter works (admin only).
- [ ] Source/target lang filter narrows results.
- [ ] Edit modal: shows full source text (readonly) + editable correction.
- [ ] Save: updates `translated_text` in DB, modal closes, row updates.
- [ ] Next translation request using same cache key → returns corrected text.
- [ ] Developer: only sees own tenant's memory.
- [ ] Usage count shows how many times this entry has been served.
