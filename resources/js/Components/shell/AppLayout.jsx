import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileDrawer } from './MobileDrawer';

export default function AppLayout({ children }) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="flex h-screen bg-atlas-bg overflow-hidden text-atlas-primary">
            {/* Sidebar template — hidden on mobile, collapsed at tablet, full on desktop */}
            <aside className="hidden md:block flex-shrink-0 w-[72px] lg:w-[260px] h-full transition-all duration-[var(--duration-base)]">
                <div className="hidden lg:block h-full">
                    <Sidebar isCollapsed={false} />
                </div>
                <div className="block lg:hidden h-full">
                    <Sidebar isCollapsed={true} />
                </div>
            </aside>

            {/* Mobile Drawer panel */}
            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            {/* Main content body wrapper */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
                <Topbar onMenuClick={() => setDrawerOpen(true)} />
                
                <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
                    <div className="max-w-[1440px] mx-auto w-full h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
