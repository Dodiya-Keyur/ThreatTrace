import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Download,
  Mail,
  AlertTriangle,
  ShieldAlert,
  FolderOpen,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  MoveRight,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamic multi-period data dictionary
const timePeriodData = {
  'Last 24 Hours': {
    totalEmails: '1,248',
    totalEmailsChange: '+5.2%',
    threatsDetected: '184',
    threatsChange: '+12.4%',
    critical: '32',
    criticalChange: '+2.1%',
    activeCases: '18',
    activeCasesChange: '0.0%',
    chartData: [
      { time: '00:00', score: 12, dotType: null },
      { time: '04:00', score: 8, dotType: null },
      { time: '08:00', score: 28, dotType: null },
      { time: '12:00', score: 58, dotType: null },
      { time: '16:00', score: 79, dotType: 'black' },
      { time: '20:00', score: 86, dotType: 'red' },
      { time: 'Now', score: 96, dotType: 'red-large' },
    ]
  },
  'Last 7 Days': {
    totalEmails: '8,940',
    totalEmailsChange: '+14.8%',
    threatsDetected: '1,120',
    threatsChange: '+9.3%',
    critical: '194',
    criticalChange: '+6.5%',
    activeCases: '42',
    activeCasesChange: '-3.2%',
    chartData: [
      { time: 'Mon', score: 24, dotType: null },
      { time: 'Tue', score: 45, dotType: 'red' },
      { time: 'Wed', score: 32, dotType: null },
      { time: 'Thu', score: 68, dotType: 'black' },
      { time: 'Fri', score: 84, dotType: 'red' },
      { time: 'Sat', score: 52, dotType: null },
      { time: 'Sun', score: 91, dotType: 'red-large' },
    ]
  },
  'Last 30 Days': {
    totalEmails: '38,450',
    totalEmailsChange: '+22.1%',
    threatsDetected: '4,890',
    threatsChange: '+15.4%',
    critical: '812',
    criticalChange: '+8.7%',
    activeCases: '124',
    activeCasesChange: '+11.0%',
    chartData: [
      { time: 'Week 1', score: 35, dotType: 'red' },
      { time: 'Week 2', score: 55, dotType: null },
      { time: 'Week 3', score: 78, dotType: 'black' },
      { time: 'Week 4', score: 96, dotType: 'red-large' },
    ]
  },
  'All Time': {
    totalEmails: '142,800',
    totalEmailsChange: '+38.5%',
    threatsDetected: '18,240',
    threatsChange: '+24.1%',
    critical: '3,190',
    criticalChange: '+18.3%',
    activeCases: '480',
    activeCasesChange: '+15.0%',
    chartData: [
      { time: 'Apr', score: 25, dotType: null },
      { time: 'May', score: 48, dotType: 'red' },
      { time: 'Jun', score: 60, dotType: null },
      { time: 'Jul', score: 74, dotType: 'black' },
      { time: 'Aug', score: 88, dotType: 'red' },
      { time: 'Sep', score: 98, dotType: 'red-large' },
    ]
  }
};

// Custom line chart dot renderer matching highlighted nodes
const CustomChartDot = (props) => {
  const { cx, cy, payload } = props;
  if (!payload.dotType) return null;

  if (payload.dotType === 'black') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={9} ry={6} fill="#09090B" />
      </g>
    );
  }

  if (payload.dotType === 'red') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={10} ry={6} fill="#DC2626" />
      </g>
    );
  }

  if (payload.dotType === 'red-large') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={14} ry={7} fill="#B91C1C" />
      </g>
    );
  }

  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('Last 24 Hours');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const currentStats = timePeriodData[timeRange] || timePeriodData['Last 24 Hours'];

  const handleExport = () => {
    navigate('/reports');
  };

  const recentThreatsList = [
    {
      id: 'eml-001',
      subject: 'URGENT: Invoice #84792 Attached',
      sender: 'billing@suspicious-domain.com',
      riskScore: 95,
      status: 'Quarantined',
      statusType: 'critical',
    },
    {
      id: 'eml-002',
      subject: 'Password Reset Required immediately',
      sender: 'admin-support@it-desk-help.net',
      riskScore: 88,
      status: 'Quarantined',
      statusType: 'critical',
    },
    {
      id: 'eml-003',
      subject: 'New Voicemail Message from 0123456789',
      sender: 'voicemail@internal-pbx.com.ru',
      riskScore: 72,
      status: 'In Review',
      statusType: 'review',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Security Overview
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Real-time analysis of network threats and email anomalies ({timeRange}).
          </p>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3">
          {/* Time Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] hover:border-[var(--color-border-strong)] transition-colors cursor-pointer text-[var(--color-text-primary)]"
            >
              <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <span>{timeRange}</span>
            </button>

            {showTimeDropdown && (
              <div className="absolute right-0 mt-1 w-40 bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] shadow-lg py-1 z-30 text-xs">
                {['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'All Time'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setTimeRange(option);
                      setShowTimeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 transition-colors cursor-pointer font-medium ${
                      timeRange === option
                        ? 'bg-[var(--color-brand-black)] text-white font-bold'
                        : 'hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[var(--color-brand-black)] rounded-[var(--radius-sm)] hover:bg-neutral-800 transition-colors shadow-[var(--shadow-sm)] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Emails */}
        <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-text-muted)]">
              TOTAL EMAILS
            </span>
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-surface)] flex items-center justify-center border border-[var(--color-border-subtle)]">
              <Mail className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
              {currentStats.totalEmails}
            </p>
            <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{currentStats.totalEmailsChange}</span>
              <span className="text-[var(--color-text-muted)] font-normal ml-0.5">vs last period</span>
            </p>
          </div>
        </div>

        {/* Threats Detected */}
        <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-text-muted)]">
              THREATS DETECTED
            </span>
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-red-50 flex items-center justify-center border border-red-100">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
              {currentStats.threatsDetected}
            </p>
            <p className="text-xs font-medium text-red-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{currentStats.threatsChange}</span>
              <span className="text-[var(--color-text-muted)] font-normal ml-0.5">vs last period</span>
            </p>
          </div>
        </div>

        {/* Critical */}
        <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-red-600">
              CRITICAL
            </span>
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-red-50 flex items-center justify-center border border-red-100">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold tracking-tight text-red-600">
              {currentStats.critical}
            </p>
            <p className="text-xs font-medium text-red-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{currentStats.criticalChange}</span>
              <span className="text-[var(--color-text-muted)] font-normal ml-0.5">vs last period</span>
            </p>
          </div>
        </div>

        {/* Active Cases */}
        <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-text-muted)]">
              ACTIVE CASES
            </span>
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-surface)] flex items-center justify-center border border-[var(--color-border-subtle)]">
              <FolderOpen className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
              {currentStats.activeCases}
            </p>
            <p className="text-xs font-medium text-[var(--color-text-muted)] mt-2 flex items-center gap-1">
              <MoveRight className="w-3.5 h-3.5" />
              <span>{currentStats.activeCasesChange}</span>
              <span className="font-normal ml-0.5">vs last period</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Threat Detection Timeline Chart + World Threat Origins Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Line Chart */}
        <div className="lg:col-span-2 bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                Threat Detection Over Time
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Timeline curve for {timeRange}
              </p>
            </div>
            <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded hover:bg-[var(--color-surface)] transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Recharts Curve Line with Custom Oval Pins */}
          <div className="h-[260px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentStats.chartData} margin={{ top: 15, right: 20, left: -25, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="0"
                  stroke="var(--color-border-subtle)"
                  vertical={true}
                  horizontal={true}
                />
                <XAxis
                  dataKey="time"
                  stroke="var(--color-text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border-subtle)' }}
                  dy={8}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border-subtle)' }}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-brand-black)',
                    borderColor: 'var(--color-border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    padding: '6px 10px'
                  }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Line
                  type="linear"
                  dataKey="score"
                  stroke="#09090B"
                  strokeWidth={2}
                  dot={<CustomChartDot />}
                  activeDot={{ r: 6, fill: '#DC2626' }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: World Threat Origins Interactive Leaflet Map */}
        <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
              Suspicious IP Locations
            </h2>
            <button
              onClick={() => navigate('/trace')}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
              title="Open full interactive map"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="16" y2="18" />
              </svg>
            </button>
          </div>

          {/* Real World Map Container */}
          <div
            onClick={() => navigate('/trace')}
            className="relative w-full h-[200px] rounded-[var(--radius-sm)] overflow-hidden cursor-pointer group my-1 border border-slate-200 isolate z-0"
          >
            <MapContainer
              center={[30, 20]}
              zoom={0.4}
              minZoom={0}
              maxZoom={3}
              zoomControl={false}
              attributionControl={false}
              scrollWheelZoom={false}
              dragging={false}
              doubleClickZoom={false}
              style={{ height: '100%', width: '100%', background: '#F8FAFC' }}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              />

              {/* Attack Trajectory Arcs */}
              <Polyline
                positions={[
                  [39.9042, 116.4074], // Beijing
                  [55.7558, 37.6173],  // Moscow
                  [40.7128, -74.0060]  // New York
                ]}
                pathOptions={{
                  color: '#DC2626',
                  weight: 1.5,
                  dashArray: '4, 4',
                  opacity: 0.8
                }}
              />

              {/* Moscow Primary Epicenter */}
              <CircleMarker
                center={[55.7558, 37.6173]}
                radius={10}
                pathOptions={{
                  color: '#DC2626',
                  fillColor: '#EF4444',
                  fillOpacity: 0.4,
                  weight: 1
                }}
              />
              <CircleMarker
                center={[55.7558, 37.6173]}
                radius={4}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: '#DC2626',
                  fillOpacity: 1,
                  weight: 1.5
                }}
              />

              {/* Beijing Node */}
              <CircleMarker
                center={[39.9042, 116.4074]}
                radius={8}
                pathOptions={{
                  color: '#DC2626',
                  fillColor: '#EF4444',
                  fillOpacity: 0.45,
                  weight: 1
                }}
              />
              <CircleMarker
                center={[39.9042, 116.4074]}
                radius={4}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: '#DC2626',
                  fillOpacity: 1,
                  weight: 1.5
                }}
              />

              {/* New York Node */}
              <CircleMarker
                center={[40.7128, -74.0060]}
                radius={7}
                pathOptions={{
                  color: '#D97706',
                  fillColor: '#F59E0B',
                  fillOpacity: 0.5,
                  weight: 1
                }}
              />
              <CircleMarker
                center={[40.7128, -74.0060]}
                radius={3.5}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: '#F59E0B',
                  fillOpacity: 1,
                  weight: 1.5
                }}
              />
            </MapContainer>

            {/* Overlay Card */}
            <div className="absolute bottom-1.5 right-1.5 z-[400] bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded px-2 py-1 shadow-sm text-[7.5px] leading-tight text-slate-700 pointer-events-none">
              <p className="font-bold uppercase tracking-wider text-[7px] text-slate-500 mb-0.5">REGIONAL ACTIVITY</p>
              <p>Eastern Europe: <span className="font-bold text-red-600">Critical</span></p>
              <p>East Asia: <span className="font-bold text-red-600">High</span></p>
              <p>North America: <span className="font-semibold text-amber-600">Caution</span></p>
              <p className="border-t border-slate-200 pt-0.5 mt-0.5 font-bold text-red-700">Threat Level: HIGH</p>
            </div>
          </div>

          {/* Location Items Under Map */}
          <div className="space-y-2.5 mt-2">
            <div
              onClick={() => navigate('/trace/185.220.101.4')}
              className="flex items-center justify-between text-xs py-1 hover:bg-[var(--color-surface)] px-1 rounded transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="font-semibold text-[var(--color-text-primary)]">Moscow, RU</span>
              </div>
              <span className="text-[var(--color-text-muted)] font-mono font-medium">42 events</span>
            </div>

            <div
              onClick={() => navigate('/trace/194.26.29.112')}
              className="flex items-center justify-between text-xs py-1 hover:bg-[var(--color-surface)] px-1 rounded transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="font-semibold text-[var(--color-text-primary)]">Beijing, CN</span>
              </div>
              <span className="text-[var(--color-text-muted)] font-mono font-medium">28 events</span>
            </div>

            <div
              onClick={() => navigate('/trace/45.33.32.156')}
              className="flex items-center justify-between text-xs py-1 hover:bg-[var(--color-surface)] px-1 rounded transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-[var(--color-text-primary)]">New York, US</span>
              </div>
              <span className="text-[var(--color-text-muted)] font-mono font-medium">15 events</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Recent Threat Interceptions */}
      <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="p-5 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
              Recent Threat Interceptions
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Top prioritized emails quarantined by automated SOC triage
            </p>
          </div>
          <button
            onClick={() => navigate('/threats')}
            className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View all threats</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-5">Threat Subject</th>
                <th className="py-3 px-4">Sender Origin</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {recentThreatsList.map((threat) => (
                <tr
                  key={threat.id}
                  onClick={() => navigate(`/threats/${threat.id}`)}
                  className="hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-5 font-semibold text-[var(--color-text-primary)] max-w-[280px] truncate">
                    {threat.subject}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[var(--color-text-muted)]">
                    {threat.sender}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-red-600">
                      {threat.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        threat.statusType === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {threat.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right font-semibold text-[var(--color-brand-black)] hover:underline">
                    Analyze →
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
