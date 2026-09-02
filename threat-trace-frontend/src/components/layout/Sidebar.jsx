import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ScanSearch, ShieldAlert, FileSearch, MapPin,
  Globe, Brain, FolderOpen, FileText, Archive, Settings,
  UserCog, Network
} from 'lucide-react';

const navItems = [
  { section: 'OVERVIEW', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/scan', icon: ScanSearch, label: 'Email Scanner' },
  ]},
  { section: 'ANALYSIS', items: [
    { to: '/threats', icon: ShieldAlert, label: 'Threats' },
    { to: '/forensics', icon: FileSearch, label: 'Forensics' },
    { to: '/trace', icon: MapPin, label: 'Trace Map' },
  ]},
  { section: 'INTELLIGENCE', items: [
    { to: '/domains', icon: Globe, label: 'Domain Intel' },
    { to: '/intelligence', icon: Brain, label: 'Threat Intel' },
  ]},
  { section: 'INVESTIGATION', items: [
    { to: '/cases', icon: FolderOpen, label: 'Cases' },
    { to: '/graph', icon: Network, label: 'Graph View' },
  ]},
  { section: 'REPORTING', items: [
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/evidence', icon: Archive, label: 'Evidence' },
  ]},
  { section: 'SYSTEM', items: [
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/admin', icon: UserCog, label: 'Admin' },
  ]},
];

export default function Sidebar() {
  return (
    <aside
      className="sticky top-0 h-screen shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border-subtle)] z-40 flex flex-col w-16 lg:w-[var(--sidebar-width)] transition-all duration-200 select-none"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-4 border-b border-[var(--color-border-subtle)] shrink-0">
        <div className="w-8 h-8 bg-[var(--color-brand-black)] rounded-[var(--radius-sm)] flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-[var(--color-text-primary)] whitespace-nowrap hidden lg:inline">
          ThreatTrace
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-1.5 lg:px-2 space-y-4" aria-label="Main navigation">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="px-2 mb-1.5 text-[9px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase hidden lg:block">
              {group.section}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-center lg:justify-start gap-3 px-2.5 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-[var(--color-brand-black)] text-white'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]'
                    }`
                  }
                  title={item.label}
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="whitespace-nowrap hidden lg:inline text-xs font-semibold">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
