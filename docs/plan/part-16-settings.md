# Part 16 — Settings

> **Status**: `[ ]`
> **Depends on**: Part 04 (AppLayout), Part 02 (AuditLogger)
> **Blocks**: Nothing (Part 09 reads settings, but works with seeded defaults)

---

## Goal

Global system configuration: supported languages list, provider pricing formula reference, global prompt, and retry behavior. Saved per `settings` table key-value pairs. All changes audited.

---

## Backend

### `SettingsController` (`app/Http/Controllers/Dashboard/SettingsController.php`)

```php
public function index()
{
    $settings = Setting::all()->pluck('value', 'key');

    return Inertia::render('Settings/Index', [
        'settings' => [
            'supported_languages' => $settings['supported_languages'] ?? [],
            'global_prompt'       => $settings['global_prompt'] ?? '',
            'retry_max_attempts'  => $settings['retry_max_attempts'] ?? 3,
            'retry_backoff_ms'    => $settings['retry_backoff_ms'] ?? [1000, 2000, 4000],
        ],
    ]);
}

public function update(UpdateSettingsRequest $request)
{
    $validated = $request->validated();

    foreach ($validated as $key => $value) {
        $before = Setting::where('key', $key)->first()?->value;
        Setting::updateOrCreate(['key' => $key], ['value' => $value]);

        AuditLogger::log(
            Setting::where('key', $key)->first(),
            'updated',
            [$key => $before],
            [$key => $value]
        );
    }

    return back()->with('success', 'Pengaturan disimpan.');
}
```

### `UpdateSettingsRequest`

```php
'supported_languages' => ['sometimes', 'array', 'min:1'],
'supported_languages.*' => ['string', 'size:2'], // ISO 639-1
'global_prompt'       => ['sometimes', 'string', 'max:2000'],
'retry_max_attempts'  => ['sometimes', 'integer', 'min:1', 'max:10'],
'retry_backoff_ms'    => ['sometimes', 'array'],
'retry_backoff_ms.*'  => ['integer', 'min:100', 'max:30000'],
```

---

## Frontend

### `Pages/Settings/Index.jsx`

Sub-nav layout (left sidebar within settings area, or tabs at top):

```
Tabs: [Languages] [Prompt] [Retry Config]
```

#### Tab: Languages

```
Supported Languages:
  [ id ] [ en ] [ ja ] [ zh ] [ ar ]   [+ Add Language]

Each tag: removable chip (X button).
Add: small input + "Add" button.
```

Implementation: `useForm({ supported_languages: settings.supported_languages })`. On add/remove, update array, show save button.

**Save bar** (sticky bottom, only visible when form is dirty):
```
Unsaved changes   [Discard] [Save Settings — primary]
```

#### Tab: Global Prompt

```
Global Translation Prompt:

[Textarea — Geist Mono, 8 rows]
"Prompt ini dikirim ke semua provider untuk setiap request translasi."

Karakter: N/2000
```

Character counter: `value.length + '/2000'`. Red when > 2000.

#### Tab: Retry Config

```
Max Retry Attempts: [number input, min 1, max 10]

Backoff delays (ms):
  Attempt 1: [number input] ms
  Attempt 2: [number input] ms
  Attempt 3: [number input] ms
  (dynamic based on max attempts — add/remove rows when count changes)

"Waktu tunggu antar percobaan (exponential backoff)."
```

---

## Verification

- [ ] Settings page loads with seeded defaults.
- [ ] Languages: add "fr" → saves → appears in list.
- [ ] Languages: remove "ar" → saves → no longer in list.
- [ ] Language input: max 2 chars, lowercase enforced.
- [ ] Global prompt: character counter updates live.
- [ ] Saving prompt > 2000 chars → validation error.
- [ ] Retry config: changing max attempts to 2 → backoff list shows 2 rows.
- [ ] Save bar only appears when form is dirty (values changed from loaded state).
- [ ] Discard: resets to loaded values, hides save bar.
- [ ] Save: success toast, AuditLog row written for each changed key.
- [ ] Admin-only: developer → 403.
- [ ] Part 09 `TranslationDispatcher` reads updated retry settings immediately (reads from DB per request).
