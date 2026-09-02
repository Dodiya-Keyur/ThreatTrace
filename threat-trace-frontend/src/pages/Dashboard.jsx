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
  MoveRight
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

// Time series data matching the exact curve in the image
const timelineChartData = [
  { time: '00:00', score: 12, dotType: null },
  { time: '02:00', score: 18, dotType: null },
  { time: '04:00', score: 8, dotType: null },
  { time: '06:00', score: 35, dotType: null },
  { time: '08:00', score: 28, dotType: null },
  { time: '10:00', score: 48, dotType: null },
  { time: '12:00', score: 58, dotType: null },
  { time: '14:00', score: 40, dotType: null },
  { time: '16:00', score: 79, dotType: 'black' },
  { time: '18:00', score: 62, dotType: null },
  { time: '20:00', score: 86, dotType: 'red' },
  { time: 'Now', score: 96, dotType: 'red-large' },
];

// Custom line chart dot renderer matching the image's highlighted nodes
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
            Real-time analysis of network threats and email anomalies.
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
                    className="w-full text-left px-3 py-1.5 hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
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
              1,248
            </p>
            <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+5.2%</span>
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
              184
            </p>
            <p className="text-xs font-medium text-red-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4%</span>
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
              32
            </p>
            <p className="text-xs font-medium text-red-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+2.1%</span>
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
              18
            </p>
            <p className="text-xs font-medium text-[var(--color-text-muted)] mt-2 flex items-center gap-1">
              <MoveRight className="w-3.5 h-3.5" />
              <span>0.0%</span>
              <span className="font-normal ml-0.5">vs last period</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Threat Detection Over Time (Line Chart) + Suspicious IP Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (Line Chart) */}
        <div className="lg:col-span-2 bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">
              Threat Detection Over Time
            </h2>
            <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded hover:bg-[var(--color-surface)] cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineChartData}
                margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
              >
                <CartesianGrid vertical={false} stroke="#E4E4E7" strokeDasharray="0 0" />
                <XAxis
                  dataKey="time"
                  axisLine={{ stroke: '#E4E4E7' }}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#71717A' }}
                  dy={8}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  axisLine={{ stroke: '#E4E4E7' }}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#71717A' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-neutral-900 text-white px-3 py-1.5 rounded text-xs shadow-lg font-mono">
                          <p>{payload[0].payload.time}</p>
                          <p className="font-bold text-red-400">Score: {payload[0].value}/100</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="linear"
                  dataKey="score"
                  stroke="#18181B"
                  strokeWidth={2}
                  dot={<CustomChartDot />}
                  activeDot={{ r: 5, fill: '#DC2626' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Suspicious IP Locations (Zoomed-out global GIS view) */}
        <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">
              Suspicious IP Locations
            </h2>
            {/* 3-bar filter icon matching reference */}
            <button
              onClick={() => navigate('/trace')}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded hover:bg-[var(--color-surface)] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="8" y1="18" x2="16" y2="18" />
              </svg>
            </button>
          </div>

          {/* Authentic Real World Map Container - Sized to display All IP Locations globally */}
          <div
            onClick={() => navigate('/trace')}
            className="relative w-full h-[200px] rounded-[var(--radius-sm)] overflow-hidden cursor-pointer group my-1 border border-slate-200 isolate z-0"
          >
            {/* Real Interactive Leaflet Map with World Light Gray Tiles */}
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
                  dashArray: '3, 3',
                  opacity: 0.85
                }}
              />
              <Polyline
                positions={[
                  [39.9042, 116.4074], // Beijing
                  [40.7128, -74.0060]  // New York
                ]}
                pathOptions={{
                  color: '#EF4444',
                  weight: 1,
                  dashArray: '4, 4',
                  opacity: 0.45
                }}
              />

              {/* Moscow Critical Pulsing Epicenter */}
              <CircleMarker
                center={[55.7558, 37.6173]}
                radius={10}
                pathOptions={{
                  color: '#DC2626',
                  fillColor: '#EF4444',
                  fillOpacity: 0.45,
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

              {/* Beijing High Epicenter */}
              <CircleMarker
                center={[39.9042, 116.4074]}
                radius={9}
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

              {/* New York Caution Epicenter */}
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

              {/* Secondary European Telemetry Cluster */}
              <CircleMarker
                center={[50.1109, 8.6821]} // Frankfurt
                radius={2.5}
                pathOptions={{ color: '#EF4444', fillColor: '#DC2626', fillOpacity: 0.9, weight: 1 }}
              />
              <CircleMarker
                center={[52.3676, 4.9041]} // Amsterdam
                radius={2.5}
                pathOptions={{ color: '#EF4444', fillColor: '#DC2626', fillOpacity: 0.9, weight: 1 }}
              />
              <CircleMarker
                center={[31.2304, 121.4737]} // Shanghai
                radius={2.5}
                pathOptions={{ color: '#EF4444', fillColor: '#DC2626', fillOpacity: 0.9, weight: 1 }}
              />
            </MapContainer>

            {/* Bottom-right Overlay Card (Compact & non-blocking) */}
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
              className="flex items-center justify-between text-xs py-1 hover:bg-[var(--color-surface)] px-1.5 rounded cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="font-medium text-[var(--color-text-primary)]">Moscow, RU</span>
              </div>
              <span className="font-semibold text-[var(--color-text-secondary)]">42 events</span>
            </div>

            <div
              onClick={() => navigate('/trace/103.45.12.89')}
              className="flex items-center justify-between text-xs py-1 hover:bg-[var(--color-surface)] px-1.5 rounded cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="font-medium text-[var(--color-text-primary)]">Beijing, CN</span>
              </div>
              <span className="font-semibold text-[var(--color-text-secondary)]">28 events</span>
            </div>

            <div
              onClick={() => navigate('/trace/40.107.92.75')}
              className="flex items-center justify-between text-xs py-1 hover:bg-[var(--color-surface)] px-1.5 rounded cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-medium text-[var(--color-text-primary)]">New York, US</span>
              </div>
              <span className="font-semibold text-[var(--color-text-secondary)]">15 events</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Recent Threats Table */}
      <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-sm)]">
        {/* Table Title Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">
            Recent Threats
          </h2>
          <button
            onClick={() => navigate('/threats')}
            className="text-xs font-semibold text-[var(--color-brand-black)] hover:underline transition-all cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  SUBJECT
                </th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  SENDER
                </th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  RISK SCORE
                </th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  STATUS
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] text-right">
                  {/* Arrow column */}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {recentThreatsList.map((threat) => (
                <tr
                  key={threat.id}
                  onClick={() => navigate(`/threats/${threat.id}`)}
                  className="hover:bg-[var(--color-surface)] transition-colors cursor-pointer group"
                >
                  {/* Subject */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-black">
                      {threat.subject}
                    </p>
                  </td>

                  {/* Sender */}
                  <td className="px-6 py-4">
                    <p className="text-xs font-mono text-[var(--color-text-secondary)]">
                      {threat.sender}
                    </p>
                  </td>

                  {/* Risk Score */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${threat.riskScore}%`,
                            backgroundColor: threat.riskScore >= 80 ? '#B91C1C' : '#D97706',
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold font-mono min-w-[20px]"
                        style={{ color: threat.riskScore >= 80 ? '#B91C1C' : '#D97706' }}
                      >
                        {threat.riskScore}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {threat.statusType === 'critical' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {threat.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                        {threat.status}
                      </span>
                    )}
                  </td>

                  {/* Arrow */}
                  <td className="px-4 py-4 text-right">
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] group-hover:translate-x-0.5 transition-all inline" />
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
