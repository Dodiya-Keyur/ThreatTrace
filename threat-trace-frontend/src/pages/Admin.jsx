import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  ShieldAlert,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowUpRight,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MoreVertical,
  Activity,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  Layers,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { getStoredCases } from '../utils/casesManager';

const activityData = [
  { day: 'Mon', emails: 210, threats: 28, critical: 4 },
  { day: 'Tue', emails: 340, threats: 45, critical: 7 },
  { day: 'Wed', emails: 195, threats: 22, critical: 2 },
  { day: 'Thu', emails: 410, threats: 58, critical: 9 },
  { day: 'Fri', emails: 280, threats: 33, critical: 2 },
];

const threatTypeDistribution = [
  { type: 'Phishing', percentage: 65, count: 121, color: 'bg-red-600', text: 'text-red-600' },
  { type: 'Malware', percentage: 20, count: 32, color: 'bg-amber-600', text: 'text-amber-600' },
  { type: 'Spam', percentage: 8, count: 18, color: 'bg-slate-600', text: 'text-slate-600' },
  { type: 'Credential Theft', percentage: 5, count: 9, color: 'bg-purple-600', text: 'text-purple-600' },
  { type: 'Other', percentage: 2, count: 6, color: 'bg-blue-600', text: 'text-blue-600' },
];

const initialAdminCases = [
  { id: '1024', sender: 'support@paypa1-security.com', subject: 'Urgent: Verify Your PayPal Account Immediately', threat: 'Phishing', risk: 'Critical', status: 'Open', date: '2026-08-31 09:14' },
  { id: '1025', sender: 'ceo@hr-payroll-update.net', subject: 'Urgent Wire Transfer: Vendor Invoice Payment #INV-8891', threat: 'Malware', risk: 'High', status: 'Review', date: '2026-08-31 10:22' },
  { id: '1021', sender: 'notifications@secure-banking-alert.com', subject: 'Account Alert: Suspicious Login Detected from IP 185.220.101.4', threat: 'Phishing', risk: 'Critical', status: 'Open', date: '2026-08-30 14:05' },
  { id: '1026', sender: 'admin@xyz-system-update.org', subject: 'Internal Company Newsletter — Q3 Town Hall & Benefits Update', threat: 'Spam', risk: 'Medium', status: 'Closed', date: '2026-08-29 11:30' },
  { id: '1027', sender: 'login@secure-microsoft-portal.biz', subject: 'Action Required: Microsoft 365 Password Expiration Notice', threat: 'Credential Theft', risk: 'Critical', status: 'Open', date: '2026-08-29 08:15' },
  { id: '1028', sender: 'invoice@freight-logistics-corp.com', subject: 'Attached Shipping Manifest #SHP-992144', threat: 'Suspicious Link', risk: 'High', status: 'Review', date: '2026-08-28 16:40' },
];

const initialUsersList = [
  { id: 'usr-1', name: 'Keyur Dodiya', email: 'keyur@example.com', role: 'Admin', status: 'Active', lastActive: 'Just now' },
  { id: 'usr-2', name: 'Dr. Anika Sharma', email: 'anika.sharma@acmecorp.com', role: 'Lead Analyst', status: 'Active', lastActive: '10 min ago' },
  { id: 'usr-3', name: 'Rahul Patel', email: 'rahul.patel@soc.acmecorp.com', role: 'Analyst', status: 'Active', lastActive: '1 hour ago' },
  { id: 'usr-4', name: 'Jay Mehta', email: 'jay.mehta@soc.acmecorp.com', role: 'User', status: 'Active', lastActive: '2 days ago' },
  { id: 'usr-5', name: 'Sarah Johnson', email: 'sarah.j@soc.acmecorp.com', role: 'Analyst', status: 'Inactive', lastActive: '1 week ago' },
];

const threatTypeDirectory = [
  {
    type: 'Phishing',
    cases: 121,
    severity: 'High',
    description: 'Attempts to trick users into revealing sensitive credentials, passwords, or financial details using deceptive emails and lookalike clone portals.'
  },
  {
    type: 'Malware',
    cases: 32,
    severity: 'Critical',
    description: 'Emails containing weaponized attachments, script droppers, ransomware payloads, or malicious macro-enabled documents.'
  },
  {
    type: 'Spam',
    cases: 18,
    severity: 'Medium',
    description: 'Unsolicited bulk marketing messages, scam distributions, and low-reputation broadcast traffic.'
  },
  {
    type: 'Credential Theft',
    cases: 9,
    severity: 'Critical',
    description: 'Targeted spear-phishing campaigns designed to obtain enterprise SSO credentials and MFA authentication codes.'
  },
  {
    type: 'Suspicious Link',
    cases: 6,
    severity: 'High',
    description: 'Emails containing embedded obfuscated URLs redirecting to newly registered or unauthenticated IP addresses.'
  },
];

export default function Admin({ defaultTab = 'overview' }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL path or prop
  const currentTab = useMemo(() => {
    if (location.pathname === '/admin/cases') return 'cases';
    if (location.pathname === '/admin/users') return 'users';
    if (location.pathname === '/admin/threats') return 'threats';
    return defaultTab;
  }, [location.pathname, defaultTab]);

  const [activeTab, setActiveTab] = useState(currentTab);

  // Cases Management State
  const [casesSearch, setCasesSearch] = useState('');
  const [selectedThreatType, setSelectedThreatType] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [adminCases, setAdminCases] = useState(initialAdminCases);

  // Users Management State
  const [usersSearch, setUsersSearch] = useState('');
  const [usersList, setUsersList] = useState(initialUsersList);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'overview') navigate('/admin');
    else navigate(`/admin/${tabId}`);
  };

  const handleCaseStatusChange = (caseId, newStatus) => {
    setAdminCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c))
    );
  };

  const handleToggleUserStatus = (userId) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
          : u
      )
    );
  };

  const handleUserRoleChange = (userId, newRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  // Filtered Cases
  const filteredCases = useMemo(() => {
    return adminCases.filter((c) => {
      const matchQuery =
        c.sender.toLowerCase().includes(casesSearch.toLowerCase()) ||
        c.subject.toLowerCase().includes(casesSearch.toLowerCase()) ||
        c.id.includes(casesSearch);
      const matchType =
        selectedThreatType === 'All' || c.threat === selectedThreatType;
      const matchRisk =
        selectedRisk === 'All' || c.risk.toLowerCase() === selectedRisk.toLowerCase();
      const matchStatus =
        selectedStatus === 'All' || c.status.toLowerCase() === selectedStatus.toLowerCase();
      return matchQuery && matchType && matchRisk && matchStatus;
    });
  }, [adminCases, casesSearch, selectedThreatType, selectedRisk, selectedStatus]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(
      (u) =>
        u.name.toLowerCase().includes(usersSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(usersSearch.toLowerCase()) ||
        u.role.toLowerCase().includes(usersSearch.toLowerCase())
    );
  }, [usersList, usersSearch]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System overview, threat telemetry distribution, and access management
          </p>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto flex-wrap">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'cases', label: 'All Cases', icon: Layers },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'threats', label: 'Threat Types', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-xs'
                    : 'text-slate-600 hover:text-black hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW (Main Dashboard Layout)                   */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 4 Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 — Total Emails */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Emails
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-slate-700" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">1,248</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-2">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>↑ 12.4%</span>
                <span className="text-slate-400 font-normal">from last week</span>
              </div>
            </div>

            {/* Card 2 — Threats Detected */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Threats Detected
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">186</p>
              <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-2">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>↑ 8.2%</span>
                <span className="text-slate-400 font-normal">from last week</span>
              </div>
            </div>

            {/* Card 3 — Critical Threats */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Critical Threats
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-red-600 mt-2">24</p>
              <div className="flex items-center gap-1 text-xs text-red-600 font-semibold mt-2">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>↑ 4.5%</span>
                <span className="text-slate-400 font-normal">requires attention</span>
              </div>
            </div>

            {/* Card 4 — Active Users */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Users
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-slate-700" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">42</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-2">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>↑ 6.8%</span>
                <span className="text-slate-400 font-normal">this month</span>
              </div>
            </div>
          </div>

          {/* Row 2: Threat Activity Chart & Threat Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Threat Activity Chart (2 cols) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Threat Activity</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Weekly email scan velocity and threat triage
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-slate-600">
                      <span className="w-2.5 h-2.5 bg-slate-300 rounded-sm" />
                      <span>Emails Scanned</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-amber-600">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                      <span>Threats Detected</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-red-600">
                      <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                      <span>Critical</span>
                    </div>
                  </div>
                </div>

                <div className="h-[240px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="emails" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={24} name="Emails Scanned" />
                      <Bar dataKey="threats" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={16} name="Threats Detected" />
                      <Line type="monotone" dataKey="critical" stroke="#DC2626" strokeWidth={2.5} dot={{ fill: '#DC2626', r: 4 }} name="Critical" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Threat Type Distribution (1 col) */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Threat Types</h2>
                <button
                  onClick={() => handleTabChange('threats')}
                  className="text-xs font-semibold text-slate-500 hover:text-black cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-4">
                {threatTypeDistribution.map((item) => (
                  <div key={item.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.type}</span>
                      <span className="font-mono font-bold text-slate-900">{item.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Recent Threat Cases Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Threat Cases</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest security incidents prioritized by risk scoring
                </p>
              </div>
              <button
                onClick={() => handleTabChange('cases')}
                className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Open Cases Center
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Sender</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Threat Type</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {initialAdminCases.slice(0, 4).map((c) => {
                    const isCritical = c.risk === 'Critical';
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                          #{c.id}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-800">
                          {c.sender}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900 max-w-[220px] truncate">
                          {c.subject}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-700">{c.threat}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                              isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.risk}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                          {c.date}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigate(`/cases/case-${c.id}`)}
                            className="px-3 py-1 bg-black text-white rounded font-bold hover:bg-neutral-800 shadow-2xs transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ADMIN CASES PAGE (/admin/cases)                    */}
      {/* ========================================================= */}
      {activeTab === 'cases' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={casesSearch}
                  onChange={(e) => setCasesSearch(e.target.value)}
                  placeholder="Search cases by sender, subject, or ID..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Dropdowns */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Threat Type Filter */}
                <select
                  value={selectedThreatType}
                  onChange={(e) => setSelectedThreatType(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="All">Threat Type: All</option>
                  <option value="Phishing">Phishing</option>
                  <option value="Malware">Malware</option>
                  <option value="Spam">Spam</option>
                  <option value="Credential Theft">Credential Theft</option>
                  <option value="Suspicious Link">Suspicious Link</option>
                </select>

                {/* Risk Filter */}
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="All">Risk: All</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="All">Status: All</option>
                  <option value="Open">Open</option>
                  <option value="Review">Review</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Cases Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Sender</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Threat Type</th>
                    <th className="py-3 px-4">Risk</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCases.map((c) => {
                    const isCritical = c.risk === 'Critical';
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-400">
                          #{c.id}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800">
                          {c.sender}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 max-w-[240px] truncate">
                          {c.subject}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {c.threat}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                              isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.risk}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={c.status}
                            onChange={(e) => handleCaseStatusChange(c.id, e.target.value)}
                            className="px-2 py-1 bg-slate-100 font-semibold text-slate-700 rounded border border-slate-200 outline-none cursor-pointer text-[11px]"
                          >
                            <option value="Open">Open</option>
                            <option value="Review">Review</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                          {c.date}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => navigate(`/cases/case-${c.id}`)}
                            className="px-3 py-1 bg-black text-white rounded font-bold hover:bg-neutral-800 shadow-2xs transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCases.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No cases match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <span>Showing {filteredCases.length} of {adminCases.length} cases</span>
              <div className="flex items-center gap-1">
                <button className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="px-2.5 py-1 bg-black text-white rounded font-bold">1</button>
                <button className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40" disabled>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: USERS MANAGEMENT PAGE (/admin/users)               */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  placeholder="Search registered users by name, email, or role..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {filteredUsers.length} Users registered
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isActive = u.status === 'Active';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {u.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {u.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                            className="px-2 py-1 bg-slate-100 font-semibold text-slate-700 rounded border border-slate-200 outline-none cursor-pointer text-[11px]"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Lead Analyst">Lead Analyst</option>
                            <option value="Analyst">Analyst</option>
                            <option value="User">User</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? 'bg-emerald-600' : 'bg-slate-400'
                              }`}
                            />
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {u.lastActive}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: THREAT TYPES DIRECTORY (/admin/threats)            */}
      {/* ========================================================= */}
      {activeTab === 'threats' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-hidden">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Threat Categories & Severity Rules</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of automated SOC detection engines and active incident counts
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Threat Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Detected Cases</th>
                    <th className="py-3 px-4 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {threatTypeDirectory.map((t) => {
                    const isCritical = t.severity === 'Critical';
                    return (
                      <tr key={t.type} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                          {t.type}
                        </td>
                        <td className="py-4 px-4 text-slate-600 max-w-md leading-relaxed">
                          {t.description}
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-extrabold text-sm text-slate-900">
                          {t.cases}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                              isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.severity}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
