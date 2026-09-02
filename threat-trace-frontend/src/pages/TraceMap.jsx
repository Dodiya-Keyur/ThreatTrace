import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Wifi, WifiOff, Shield, AlertTriangle, Server, Globe, Eye, EyeOff, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ipIntelligence } from '../data/mockData';
import { getStoredEmails, getEmailById } from '../utils/emailAnalyzer';
import { getThreatScoreSeverity } from '../utils/helpers';
import { SeverityBadge } from '../components/common/Badge';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function getResolvedIPData(ip) {
  if (ipIntelligence[ip]) return ipIntelligence[ip];

  const isMicrosoft = ip.startsWith('40.107') || ip.startsWith('52.');
  if (isMicrosoft) {
    return {
      ip: ip,
      country: 'United States',
      countryCode: 'US',
      region: 'Illinois',
      city: 'Chicago',
      lat: 41.8781,
      lng: -87.6298,
      isp: 'Microsoft Corporation (O365 Mail Gateway)',
      org: 'Microsoft Corporation',
      asn: 'AS8075',
      hostingProvider: 'Microsoft Azure Cloud',
      isVPN: false,
      vpnProvider: null,
      isTOR: false,
      isProxy: false,
      isHosting: true,
      abuseIPDBScore: 0,
      abuseIPDBReports: 0,
      virusTotalMalicious: 0,
      virusTotalClean: 85,
      shodanPorts: [25, 443, 587],
      shodanServices: ['SMTP', 'HTTPS', 'Submission'],
    };
  }

  if (ip.startsWith('103.45.')) {
    return {
      ip: ip,
      country: 'Netherlands',
      countryCode: 'NL',
      region: 'North Holland',
      city: 'Amsterdam',
      lat: 52.3676,
      lng: 4.9041,
      isp: 'HostEurope B.V.',
      org: 'HostEurope Netherlands',
      asn: 'AS20857',
      hostingProvider: 'HostEurope VPS',
      isVPN: false,
      vpnProvider: null,
      isTOR: false,
      isProxy: true,
      isHosting: true,
      abuseIPDBScore: 78,
      abuseIPDBReports: 89,
      virusTotalMalicious: 8,
      virusTotalClean: 64,
      shodanPorts: [25, 80, 443],
      shodanServices: ['SMTP', 'HTTP', 'HTTPS'],
    };
  }

  return {
    ip: ip,
    country: ip.startsWith('185.220') ? 'Germany' : 'Germany',
    countryCode: 'DE',
    region: 'Hesse',
    city: 'Frankfurt',
    lat: 50.1109,
    lng: 8.6821,
    isp: 'Leaseweb Deutschland GmbH',
    org: 'Leaseweb DE',
    asn: 'AS60781',
    hostingProvider: 'Leaseweb Bulletproof VPS',
    isVPN: true,
    vpnProvider: 'Mullvad VPN Exit Node',
    isTOR: false,
    isProxy: true,
    isHosting: true,
    abuseIPDBScore: 92,
    abuseIPDBReports: 142,
    virusTotalMalicious: 14,
    virusTotalClean: 58,
    shodanPorts: [22, 25, 80, 443, 587],
    shodanServices: ['SSH', 'SMTP', 'HTTP', 'HTTPS', 'SMTP-Submission'],
  };
}

export default function TraceMap() {
  const { ip: paramIP } = useParams();
  const navigate = useNavigate();
  const allEmails = getStoredEmails();

  // Find matching email or select first
  let selectedEmail = allEmails.find(e => e.originIP === paramIP || e.receivedChain?.[0]?.ip === paramIP) || allEmails[0];
  const targetIP = paramIP || selectedEmail.originIP || selectedEmail.receivedChain?.[0]?.ip || '185.220.101.4';
  const ipData = getResolvedIPData(targetIP);
  const chain = selectedEmail.receivedChain || [];

  // Build polyline from hops
  const hopCoords = chain
    .map(h => getResolvedIPData(h.ip))
    .filter(Boolean)
    .map(d => [d.lat, d.lng]);

  const MetaRow = ({ label, value, alert }) => (
    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border-subtle)] last:border-0">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono font-medium text-[var(--color-text-primary)]">{value}</span>
        {alert && <AlertTriangle className="w-3 h-3 text-[var(--color-threat-high)]" />}
      </div>
    </div>
  );

  const isSafe = ipData.abuseIPDBScore === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">GeoLocation & Origin Trace</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Physical server location, ISP attribution, and anonymization detection
        </p>
      </div>

      {/* Interactive Sample Selector Tabs */}
      <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
          Select Email to Trace Origin Infrastructure
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {allEmails.map((email) => {
            const originIp = email.originIP || email.receivedChain?.[0]?.ip || '185.220.101.4';
            const isSelected = originIp === targetIP || email.id === selectedEmail.id;
            const sev = getThreatScoreSeverity(email.threatScore);
            return (
              <button
                key={email.id}
                onClick={() => navigate(`/trace/${originIp}`)}
                className={`flex items-center justify-between p-3 rounded-[var(--radius-sm)] border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--color-brand-black)] bg-[var(--color-surface)] ring-1 ring-[var(--color-brand-black)] shadow-[var(--shadow-sm)]'
                    : 'border-[var(--color-border-subtle)] bg-[var(--color-canvas)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`w-2 h-2 rounded-full ${sev === 'critical' ? 'bg-red-600' : sev === 'high' ? 'bg-amber-500' : 'bg-emerald-600'}`} />
                    <span className="text-xs font-bold text-[var(--color-text-primary)] uppercase">{sev} ({email.threatScore}/100)</span>
                  </div>
                  <p className="text-xs font-medium text-[var(--color-text-primary)] truncate max-w-[200px]">{email.subject}</p>
                  <p className="text-[10px] font-mono text-[var(--color-text-muted)] truncate">IP: {originIp}</p>
                </div>
                <SeverityBadge severity={sev} score={email.threatScore} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        {/* Left Panel */}
        <div className="space-y-4">
          {/* IP Hero */}
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)] mb-2">Originating Transmission Host</p>
            <p className="text-xl font-mono font-bold text-[var(--color-text-primary)]">{ipData.ip}</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {ipData.city}, {ipData.country} ({ipData.countryCode})
            </p>
          </div>

          {/* Network Metadata */}
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-[var(--color-text-muted)] mb-3">Network Intelligence</h2>
            <MetaRow label="ISP" value={ipData.isp} />
            <MetaRow label="Organization" value={ipData.org} />
            <MetaRow label="ASN" value={ipData.asn} />
            <MetaRow label="Hosting Provider" value={ipData.hostingProvider} />
            <MetaRow label="Country" value={`${ipData.country} (${ipData.countryCode})`} />
            <MetaRow label="Region" value={ipData.region} />
            <MetaRow label="City" value={ipData.city} />
          </div>

          {/* Proxy/VPN Indicators */}
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-[var(--color-text-muted)] mb-3">Anonymization Detection</h2>
            <div className="space-y-2.5">
              {[
                { label: 'VPN Relay', detected: ipData.isVPN, detail: ipData.vpnProvider, icon: ipData.isVPN ? EyeOff : Eye },
                { label: 'TOR Exit Node', detected: ipData.isTOR, detail: null, icon: Globe },
                { label: 'Proxy Relay', detected: ipData.isProxy, detail: null, icon: Wifi },
                { label: 'Cloud Datacenter', detected: ipData.isHosting, detail: null, icon: Server },
              ].map((item) => (
                <div key={item.label} className={`flex items-center justify-between p-2.5 rounded-[var(--radius-sm)] border ${
                  item.detected
                    ? 'bg-[var(--color-threat-critical-bg)] border-red-200'
                    : 'bg-[var(--color-threat-low-bg)] border-emerald-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-3.5 h-3.5 ${item.detected ? 'text-[var(--color-threat-critical)]' : 'text-[var(--color-threat-low)]'}`} />
                    <span className="text-xs font-medium text-[var(--color-text-primary)]">{item.label}</span>
                  </div>
                  <span className={`text-xs font-bold ${item.detected ? 'text-[var(--color-threat-critical)]' : 'text-[var(--color-threat-low)]'}`}>
                    {item.detected ? 'DETECTED' : 'NOT DETECTED'}
                  </span>
                </div>
              ))}
              {ipData.vpnProvider && (
                <p className="text-[11px] text-[var(--color-text-muted)] pl-1">
                  Provider: <span className="font-mono">{ipData.vpnProvider}</span>
                </p>
              )}
            </div>
          </div>

          {/* Reputation */}
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-[var(--color-text-muted)] mb-3">Threat Intelligence Reputation</h2>
            <div className="space-y-2">
              <MetaRow label="AbuseIPDB Confidence Score" value={`${ipData.abuseIPDBScore}/100`} alert={ipData.abuseIPDBScore >= 75} />
              <MetaRow label="Community Abuse Reports" value={ipData.abuseIPDBReports} />
              <MetaRow label="VirusTotal Malicious Detections" value={`${ipData.virusTotalMalicious} / ${ipData.virusTotalMalicious + ipData.virusTotalClean} security engines`} alert={ipData.virusTotalMalicious > 5} />
              <MetaRow label="Open Perimeter Ports" value={ipData.shodanPorts.join(', ')} />
              <MetaRow label="Active Network Services" value={ipData.shodanServices.join(', ')} />
            </div>
          </div>
        </div>

        {/* Right: Map with Clean OpenStreetMap Tiles (No watermark) */}
        <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] overflow-hidden min-h-[500px]">
          <MapContainer
            key={`${ipData.lat}-${ipData.lng}`}
            center={[ipData.lat, ipData.lng]}
            zoom={5}
            style={{ height: '100%', minHeight: '520px', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[ipData.lat, ipData.lng]} icon={isSafe ? greenIcon : redIcon}>
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-bold font-mono text-sm">{ipData.ip}</p>
                  <p className="font-medium text-gray-700">{ipData.city}, {ipData.country}</p>
                  <p className="text-gray-500">{ipData.isp}</p>
                  <p className={`font-bold mt-1 ${isSafe ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isSafe ? 'Verified Safe Infrastructure' : `Risk: ${ipData.abuseIPDBScore}/100`}
                  </p>
                </div>
              </Popup>
            </Marker>
            {hopCoords.length > 1 && (
              <Polyline positions={hopCoords} color={isSafe ? "#10B981" : "#DC2626"} weight={3} dashArray="8 6" />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
