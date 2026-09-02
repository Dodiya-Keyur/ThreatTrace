import { NavLink } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import {
  LayoutDashboard, ScanSearch, ShieldAlert, FileSearch, MapPin,
  Globe, Brain, FolderOpen, FileText, Archive, Settings,
  UserCog, PanelLeftClose, PanelLeftOpen, Network
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
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border-subtle)] z-40 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]'}`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-[var(--color-border-subtle)] shrink-0">
        <div className="w-8 h-8 bg-[var(--color-brand-black)] rounded-[var(--radius-sm)] flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-[var(--color-text-primary)] whitespace-nowrap">
            ThreatTrace
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Main navigation">
        {navItems.map((group) => (
          <div key={group.section} className="mb-4">
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
                {group.section}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-[var(--color-brand-black)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggle}
        className="h-12 flex items-center justify-center border-t border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
      </button>
    </aside>
  );
}
