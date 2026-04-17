import { NavLink, Outlet } from 'react-router-dom';

const tabs = [
  { to: '/home', label: 'Home' },
  { to: '/files', label: 'Files' },
  { to: '/purchases', label: 'Purchases' },
  { to: '/schedule', label: 'Schedule' },
] as const;

function tabClass(active: boolean) {
  return [
    'flex-1 text-center py-3 text-xs sm:text-sm font-semibold transition-colors border-t-2 -mb-px',
    active
      ? 'text-schedule-accent border-schedule-accent bg-schedule-card'
      : 'text-schedule-textMuted border-transparent hover:text-schedule-text hover:bg-schedule-accentLight/20',
  ].join(' ');
}

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-schedule-bg text-schedule-text font-sans">
      <main className="flex-1 overflow-y-auto min-h-0 pb-[4.5rem]">
        <Outlet />
      </main>
      <nav
        className="no-print fixed bottom-0 inset-x-0 z-40 flex border-t border-schedule-border bg-schedule-card shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
        aria-label="Main"
      >
        {tabs.map(({ to, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => tabClass(isActive)} end={to === '/home'}>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
