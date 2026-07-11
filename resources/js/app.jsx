import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import React from 'react';
import AppLayout from './Components/shell/AppLayout';

const appName = import.meta.env.VITE_APP_NAME || 'Atlas';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const page = await resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx')
        );
        
        // Wrap all pages outside Auth/ or Welcome inside persistent AppLayout
        if (!name.startsWith('Auth/') && name !== 'Welcome') {
            page.default.layout = page.default.layout || ((p) => <AppLayout>{p}</AppLayout>);
        }
        
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#3ECF8E',
    },
});
