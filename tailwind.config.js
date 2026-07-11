import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                atlas: {
                    bg:       'var(--color-bg)',
                    surface:  'var(--color-surface)',
                    card:     'var(--color-card)',
                    border:   'var(--color-border)',
                    primary:  'var(--color-text-primary)',
                    secondary:'var(--color-text-secondary)',
                    accent:   'var(--color-accent)',
                    success:  'var(--color-success)',
                    info:     'var(--color-info)',
                    warning:  'var(--color-warning)',
                    danger:   'var(--color-danger)',
                    disabled: 'var(--color-disabled)',
                    hover:    'var(--color-surface-hover)',
                    active:   'var(--color-surface-active)',
                    overlay:  'var(--color-overlay)',
                },
            },
            borderRadius: {
                card:   'var(--radius-card)',
                button: 'var(--radius-button)',
                input:  'var(--radius-input)',
                badge:  'var(--radius-badge)',
            },
            fontFamily: {
                sans: ['CreatoDisplay', ...defaultTheme.fontFamily.sans],
                mono: ['Geist Mono', 'monospace'],
            },
        },
    },

    plugins: [forms],
};
