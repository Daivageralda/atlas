<x-mail::message>
# Halo {{ $user->name }},

Anda telah diundang untuk bergabung di **{{ config('app.name') }}** sebagai **{{ ucfirst($user->role) }}**.

Berikut adalah kredensial masuk sementara untuk akun Anda:

*   **Email:** {{ $user->email }}
*   **Password Sementara:** `{{ $tempPassword }}`

Silakan login untuk mengakses dashboard dan mengganti password Anda segera demi keamanan akun.

<x-mail::button :url="$loginUrl">
Login ke Dashboard
</x-mail::button>

Terima kasih,<br>
Tim {{ config('app.name') }}
</x-mail::message>
