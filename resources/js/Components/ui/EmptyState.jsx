export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-lg bg-atlas-card border border-dashed border-atlas-border max-w-md mx-auto my-6 select-none">
            <div className="h-12 w-12 rounded-full bg-atlas-surface border border-atlas-border flex items-center justify-center text-atlas-secondary mb-4">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-xs font-bold text-atlas-primary tracking-tight">
                {title}
            </h3>
            <p className="text-[11px] text-atlas-secondary mt-1.5 mb-5 max-w-[280px] leading-relaxed">
                {description}
            </p>
            {action}
        </div>
    );
}
