# Part 03 — Auth

> **Status**: `[ ]`
> **Depends on**: Part 00 (Inertia root), Part 01 (users table), Part 02 (routes, HandleInertiaRequests)
> **Blocks**: Part 04+ (all pages require auth)

---

## Goal

Login / logout via Laravel session. Inertia Login page with React Bits Aurora background. Role-aware redirect after login.

---

## Backend

### `AuthController` (`app/Http/Controllers/Auth/AuthController.php`)

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'Email atau password salah.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
```

### Auth middleware

In `bootstrap/app.php`, confirm `auth` redirects to `route('login')`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->redirectGuestsTo(fn () => route('login'));
})
```

---

## Frontend

### `resources/js/Pages/Auth/Login.jsx`

```
Layout: full-screen, centered card.
Background: React Bits Aurora (decorative layer, z-0).
Card: max-w-md, centered, bg atlas-card, radius-card, border atlas-border.

Fields:
  - Email (type="email", required)
  - Password (type="password", required)
  - Remember me (optional checkbox)

CTA: Primary button full-width "Masuk"
Error: Inertia validation errors shown inline below each field.
Loading: button disabled + inline spinner during submit.
```

**Inertia form pattern** (`useForm` from `@inertiajs/react`):
```jsx
const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
})

function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post(route('login.store'))
}
```

> Use `post(route('login.store'))` — Inertia handles CSRF automatically.
> Do NOT use `axios` or `fetch` for auth — use `useForm`.

### `resources/js/Components/decorative/AuroraBackground.jsx`

```jsx
// Source: https://reactbits.dev/backgrounds/aurora
// Variant: TS-TW
// Reduced motion: renders static gradient fallback

import { useReducedMotion } from '../Hooks/useReducedMotion'
// ... React Bits Aurora component
```

- Opacity: low (0.3–0.5), tinted toward emerald/dark.
- `useReducedMotion` hook: if true, render static `<div>` with gradient background instead of animated canvas/SVG.
- Never re-render on window resize (use `useEffect` with no deps or `ResizeObserver`).

### `resources/js/Hooks/useReducedMotion.ts`

```js
import { useEffect, useState } from 'react'

export function useReducedMotion() {
    const [reduced, setReduced] = useState(
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])
    return reduced
}
```

---

## UX Flows

### Login flow
```
User visits /
  → auth? redirect to /dashboard
  → not auth: Inertia redirects to /login

Submit email + password
  → POST /login (Inertia useForm)
  → Invalid: back() with errors, email preserved, password cleared
  → Valid: session created, redirect to /dashboard (or intended URL)
```

### Logout
```
User clicks "Sign out" in Topbar dropdown
  → useForm().post(route('logout')) or <Link href={route('logout')} method="post">
  → Session invalidated, redirect to /login
```

---

## Verification

- [ ] `GET /login` renders Login page with Aurora background.
- [ ] Aurora is static gradient when `prefers-reduced-motion: reduce`.
- [ ] Empty submit: both field errors show inline.
- [ ] Wrong credentials: "Email atau password salah." appears under email field. Password field cleared.
- [ ] Valid credentials: redirects to `/dashboard`.
- [ ] Authenticated user visiting `/login` redirects to `/dashboard`.
- [ ] Logout clears session, redirects to `/login`.
- [ ] CSRF token included in form (Inertia default).
- [ ] Keyboard: Tab cycles through email → password → remember → button. Enter submits.
- [ ] Mobile: card fits viewport width, no horizontal scroll.
- [ ] `role: 'developer'` user logs in — same redirect (role-gating per page done in later parts).
