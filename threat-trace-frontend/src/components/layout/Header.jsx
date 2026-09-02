import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { alerts as initialAlerts } from '../../data/mockData';
import { getStoredEmails } from '../../utils/emailAnalyzer';
import { getStoredCases } from '../../utils/casesManager';
import {
  Search,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  CheckCheck,
  AlertTriangle,
  ShieldAlert,
  Mail,
  FolderLock,
  Globe,
  MapPin,
  ArrowRight,
  LayoutDashboard,
  ScanLine,
  Network,
  FileText,
  Settings as SettingsIcon,
  ShieldCheck,
  Terminal
} from 'lucide-react';

const navigationPages = [
  { name: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard, category: 'Pages' },
  { name: 'Scan Email (.eml / Raw)', path: '/scan', icon: ScanLine, category: 'Pages' },
  { name: 'Threat Telemetry & Feeds', path: '/threats', icon: ShieldAlert, category: 'Pages' },
  { name: 'Email Header Forensics', path: '/forensics', icon: Terminal, category: 'Pages' },
  { name: 'Trace Origin & Routing Map', path: '/trace', icon: MapPin, category: 'Pages' },
  { name: 'Domain Intelligence & Typosquats', path: '/domains', icon: Globe, category: 'Pages' },
  { name: 'AI Threat Intelligence Engine', path: '/intelligence', icon: ShieldCheck, category: 'Pages' },
  { name: 'Incident Cases Management', path: '/cases', icon: FolderLock, category: 'Pages' },
  { name: 'Threat Investigation Graph', path: '/graph', icon: Network, category: 'Pages' },
  { name: 'Forensic PDF Reports', path: '/reports', icon: FileText, category: 'Pages' },
  { name: 'Account & Security Settings', path: '/settings', icon: SettingsIcon, category: 'Pages' },
  { name: 'Admin Dashboard & Access', path: '/admin', icon: User, category: 'Pages' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertsList, setAlertsList] = useState(initialAlerts);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);
  const alertsRef = useRef(null);

  const unreadAlerts = alertsList.filter((a) => !a.read).length;

  const markAllAsRead = () => {
    setAlertsList((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const markSingleAsRead = (alertId) => {
    setAlertsList((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
  };

  const handleAlertClick = (alert) => {
    markSingleAsRead(alert.id);
    setAlertsOpen(false);
    if (alert.caseId) {
      navigate(`/cases/${alert.caseId}`);
    } else if (alert.emailId) {
      navigate(`/threats/${alert.emailId}`);
    } else {
      navigate('/threats');
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setProfileOpen(false);
        setAlertsOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Click outside listener for search and dropdowns
  useEffect(() => {
    const handler = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(e.target)) {
        setAlertsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Live Multi-Domain Search Filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const emails = getStoredEmails();
    const cases = getStoredCases();

    const matchedPages = navigationPages
      .filter((p) => p.name.toLowerCase().includes(q))
      .map((p) => ({
        type: 'page',
        id: p.path,
        title: p.name,
        subtitle: `Jump to ${p.path}`,
        icon: p.icon,
        action: () => navigate(p.path),
      }));

    const matchedEmails = emails
      .filter(
        (e) =>
          e.subject?.toLowerCase().includes(q) ||
          e.sender?.toLowerCase().includes(q) ||
          e.id?.toLowerCase().includes(q) ||
          e.classification?.toLowerCase().includes(q)
      )
      .map((e) => ({
        type: 'email',
        id: e.id,
        title: e.subject,
        subtitle: `${e.sender} · Score: ${e.threatScore}/100`,
        score: e.threatScore,
        icon: Mail,
        action: () => navigate(`/threats/${e.id}`),
      }));

    const matchedCases = cases
      .filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.id?.toLowerCase().includes(q) ||
          c.sender?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      )
      .map((c) => ({
        type: 'case',
        id: c.id,
        title: c.title,
        subtitle: `Status: ${c.status?.toUpperCase()} · Risk: ${c.severity?.toUpperCase()}`,
        icon: FolderLock,
        action: () => navigate(`/cases/${c.id}`),
      }));

    const matchedIPsAndDomains = [];
    emails.forEach((e) => {
      const domain = e.sender?.split('@')[1];
      if (domain && domain.toLowerCase().includes(q) && !matchedIPsAndDomains.some(m => m.title === domain)) {
        matchedIPsAndDomains.push({
          type: 'domain',
          id: domain,
          title: domain,
          subtitle: `Analyze Domain Reputation & DNS`,
          icon: Globe,
          action: () => navigate(`/domains/${domain}`),
        });
      }
      if (e.originIP && e.originIP.includes(q) && !matchedIPsAndDomains.some(m => m.title === e.originIP)) {
        matchedIPsAndDomains.push({
          type: 'ip',
          id: e.originIP,
          title: e.originIP,
          subtitle: `Trace Geolocation & Tor Routing`,
          icon: MapPin,
          action: () => navigate(`/trace/${e.originIP}`),
        });
      }
    });

    return [
      ...matchedPages.slice(0, 3),
      ...matchedEmails.slice(0, 4),
      ...matchedCases.slice(0, 3),
      ...matchedIPsAndDomains.slice(0, 3),
    ];
  }, [searchQuery, navigate]);

  const handleSelectResult = (item) => {
    item.action();
    setSearchQuery('');
    setSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-50 h-16 shrink-0 bg-[var(--color-canvas)] border-b border-[var(--color-border-subtle)] flex items-center justify-between px-6 gap-4">
      {/* Left: Mobile menu + SOC Title */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={toggle}
          className="lg:hidden p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider hidden sm:block">
          ThreatTrace SOC
        </span>
      </div>

      {/* Middle: Big, Fully Workable Search Bar */}
      <div
        ref={searchContainerRef}
        className="relative flex-1 max-w-xl mx-auto"
      >
        <div
          className={`relative flex items-center w-full bg-slate-50 border rounded-lg transition-all ${
            searchFocused
              ? 'border-black bg-white ring-2 ring-black/5 shadow-md'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchFocused(true);
            }}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search threats, senders, IPs, domains, cases, or pages..."
            className="w-full py-2 px-3 text-xs bg-transparent outline-none placeholder:text-slate-400 text-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="p-1 mr-2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded mr-2.5 shrink-0 select-none shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Live Search Results Dropdown */}
        {searchFocused && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-100 max-h-[420px] overflow-y-auto">
            {searchQuery.trim() === '' ? (
              <div className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Quick SOC Navigation
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {navigationPages.slice(0, 6).map((page) => {
                    const Icon = page.icon;
                    return (
                      <button
                        key={page.path}
                        onClick={() => {
                          navigate(page.path);
                          setSearchFocused(false);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-left transition-colors cursor-pointer group"
                      >
                        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200">
                          <Icon className="w-3.5 h-3.5 text-slate-700" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 group-hover:text-black truncate">
                          {page.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2 divide-y divide-slate-100">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Search Matches</span>
                  <span>{searchResults.length} Found</span>
                </div>
                <div className="space-y-1 pt-1">
                  {searchResults.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={`${item.type}-${item.id}-${idx}`}
                        onClick={() => handleSelectResult(item)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200">
                            <Icon className="w-4 h-4 text-slate-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-black">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-600">
                            {item.type}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                <p>No results found for &ldquo;<span className="font-semibold text-slate-700">{searchQuery}</span>&rdquo;</p>
                <p className="text-[11px] text-slate-400 mt-1">Try searching by sender email, IP, domain, or Case ID.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Notifications & Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notifications / Alerts Dropdown */}
        <div className="relative" ref={alertsRef}>
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label={`Notifications - ${unreadAlerts} unread`}
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadAlerts > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[9px] font-extrabold text-white bg-red-600 rounded-full shadow-xs">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {alertsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Security Alerts
                  </h3>
                  {unreadAlerts > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 rounded-full">
                      {unreadAlerts} New
                    </span>
                  )}
                </div>
                {unreadAlerts > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-medium text-slate-500 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                {alertsList.length > 0 ? (
                  alertsList.map((alert) => {
                    const isCritical = alert.severity?.toLowerCase() === 'critical';
                    return (
                      <div
                        key={alert.id}
                        onClick={() => handleAlertClick(alert)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                          !alert.read ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCritical ? (
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                                isCritical
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {alert.severity}
                            </span>
                            <span className="text-[10px] text-slate-400">1d ago</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {alert.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-normal">
                            {alert.description}
                          </p>
                        </div>

                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No security alerts at this time.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) || 'K'}
            </div>
            <span className="hidden md:block text-xs font-semibold text-slate-900">
              {user?.name?.split(' ')[0] || 'Keyur'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3.5 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">
                  {user?.name || 'Keyur Dodiya'}
                </p>
                <p className="text-[11px] font-mono text-slate-400 truncate">
                  {user?.email || 'keyur@example.com'}
                </p>
              </div>
              <button
                onClick={() => {
                  navigate('/settings');
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" /> Profile & Settings
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
