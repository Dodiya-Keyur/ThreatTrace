import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  RotateCcw,
  Download,
  Mail,
  User,
  Globe,
  Wifi,
  Server,
  FolderOpen,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Info,
  Layers
} from 'lucide-react';
import { getStoredCases } from '../utils/casesManager';

const initialGraphPresets = {
  'case-1024': {
    nodes: [
      {
        id: 'sender',
        type: 'entity',
        position: { x: 50, y: 180 },
        data: {
          label: 'Attacker / Spoofed Sender',
          value: 'security@paypa1-security.com',
          type: 'Sender',
          threatLevel: 'CRITICAL (98)',
          details: 'Domain registered 12 days ago with anonymous WHOIS privacy.'
        },
      },
      {
        id: 'email',
        type: 'entity',
        position: { x: 380, y: 180 },
        data: {
          label: 'Email #1 (eml-001)',
          value: 'Urgent: Verify Your PayPal Account Immediately',
          type: 'Email',
          threatLevel: 'CRITICAL (95)',
          details: 'Contains high-urgency language and weaponized credential harvesting link.'
        },
      },
      {
        id: 'domain',
        type: 'entity',
        position: { x: 720, y: 50 },
        data: {
          label: 'Phishing Domain',
          value: 'paypa1-security.com',
          type: 'Domain',
          threatLevel: 'CRITICAL (95)',
          details: '94% string similarity typosquat of paypal.com, hosted on bulletproof server.'
        },
      },
      {
        id: 'ip',
        type: 'entity',
        position: { x: 720, y: 180 },
        data: {
          label: 'Originating IP Address',
          value: '185.220.101.4',
          type: 'IP Address',
          threatLevel: 'CRITICAL (92)',
          details: 'Frankfurt, DE (Tor Exit Node / Bulletproof Hosting Pool).'
        },
      },
      {
        id: 'isp',
        type: 'entity',
        position: { x: 1040, y: 180 },
        data: {
          label: 'Hosting Provider / ASN',
          value: 'AS44050 (Anonymous Bulletproof Proxy)',
          type: 'ISP',
          threatLevel: 'HIGH',
          details: 'Autonomous System with history of bulletproof phishing hosting.'
        },
      },
      {
        id: 'case',
        type: 'entity',
        position: { x: 720, y: 310 },
        data: {
          label: 'Investigation Dossier',
          value: 'Case #1024 (Active)',
          type: 'Case',
          threatLevel: 'CRITICAL',
          details: 'Coordinated credential harvesting incident targeting finance staff.'
        },
      },
    ],
    edges: [
      { id: 'sender-email', source: 'sender', target: 'email', label: 'sent', animated: true },
      { id: 'email-domain', source: 'email', target: 'domain', label: 'contains link', animated: true },
      { id: 'email-ip', source: 'email', target: 'ip', label: 'originated from', animated: true },
      { id: 'ip-isp', source: 'ip', target: 'isp', label: 'routed by', animated: true },
      { id: 'email-case', source: 'email', target: 'case', label: 'linked to', animated: true },
    ]
  },
  'case-1025': {
    nodes: [
      {
        id: 'sender',
        type: 'entity',
        position: { x: 50, y: 180 },
        data: {
          label: 'Spear-Phishing Sender',
          value: 'cfo-office@vendor-update.net',
          type: 'Sender',
          threatLevel: 'CRITICAL (92)',
          details: 'Display name spoof of internal executive requesting payment divert.'
        },
      },
      {
        id: 'email',
        type: 'entity',
        position: { x: 380, y: 180 },
        data: {
          label: 'Email #2 (eml-002)',
          value: 'Updated Wire Instructions - Pending Invoice #8847',
          type: 'Email',
          threatLevel: 'CRITICAL (92)',
          details: 'BEC wire diversion attack targeting Accounts Payable.'
        },
      },
      {
        id: 'domain',
        type: 'entity',
        position: { x: 720, y: 60 },
        data: {
          label: 'Lookalike Domain',
          value: 'vendor-update.net',
          type: 'Domain',
          threatLevel: 'HIGH (88)',
          details: 'Registered 3 weeks ago via privacy proxy in Panama.'
        },
      },
      {
        id: 'ip',
        type: 'entity',
        position: { x: 720, y: 180 },
        data: {
          label: 'Originating Relay IP',
          value: '194.26.29.112',
          type: 'IP Address',
          threatLevel: 'HIGH (85)',
          details: 'Amsterdam, NL (Suspected VPN endpoint).'
        },
      },
      {
        id: 'case',
        type: 'entity',
        position: { x: 720, y: 300 },
        data: {
          label: 'Investigation Dossier',
          value: 'Case #1025',
          type: 'Case',
          threatLevel: 'HIGH',
          details: 'Financial BEC incident dossier.'
        },
      },
    ],
    edges: [
      { id: 'sender-email', source: 'sender', target: 'email', label: 'sent', animated: true },
      { id: 'email-domain', source: 'email', target: 'domain', label: 'routes through', animated: true },
      { id: 'email-ip', source: 'email', target: 'ip', label: 'originated from', animated: true },
      { id: 'email-case', source: 'email', target: 'case', label: 'linked to', animated: true },
    ]
  }
};

const typeIconMap = {
  Sender: User,
  Email: Mail,
  Domain: Globe,
  'IP Address': Wifi,
  IP: Wifi,
  ISP: Server,
  Case: FolderOpen,
};

function EntityNode({ data, selected }) {
  const Icon = typeIconMap[data.type] || Globe;
  const isCritical = data.threatLevel?.includes('CRITICAL');

  return (
    <div
      className={`w-[240px] rounded-xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer select-none ${
        selected ? 'border-black ring-2 ring-black/20' : 'border-gray-200 hover:border-gray-400'
      }`}
      style={{ cursor: 'pointer' }}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-gray-400 hover:!bg-black cursor-crosshair" />

      <div className="border-b border-gray-100 px-4 py-2 flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-gray-500" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {data.type}
          </p>
        </div>
        {data.threatLevel && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
            isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
          }`}>
            {data.threatLevel.split(' ')[0]}
          </span>
        )}
      </div>

      <div className="px-4 py-3 cursor-pointer">
        <p className="font-bold text-xs text-black leading-tight mb-1">{data.label}</p>
        <p className="break-all text-xs font-mono text-gray-600">
          {data.value}
        </p>
      </div>

      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-gray-400 hover:!bg-black cursor-crosshair" />
    </div>
  );
}

const nodeTypes = {
  entity: EntityNode,
};

export default function InvestigationGraph() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const allCases = getStoredCases();

  const activeCaseKey = caseId && initialGraphPresets[caseId] ? caseId : 'case-1024';
  const currentPreset = initialGraphPresets[activeCaseKey] || initialGraphPresets['case-1024'];

  const [nodes, setNodes, onNodesChange] = useNodesState(currentPreset.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentPreset.edges);
  const [selectedNode, setSelectedNode] = useState(currentPreset.nodes[0]);

  useEffect(() => {
    setNodes(currentPreset.nodes);
    setEdges(currentPreset.edges);
    setSelectedNode(currentPreset.nodes[0]);
  }, [activeCaseKey]);

  const onConnect = useCallback(
    (params) =>
      setEdges((currentEdges) =>
        addEdge(
          {
            ...params,
            animated: true,
          },
          currentEdges
        )
      ),
    [setEdges]
  );

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  const handleResetGraph = () => {
    setNodes(currentPreset.nodes);
    setEdges(currentPreset.edges);
    setSelectedNode(currentPreset.nodes[0]);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col bg-white text-black min-h-screen">
      {/* Print-Only Formal Dossier Header */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-black">
              ThreatTrace SOC Forensic Intelligence Report
            </h1>
            <p className="text-xs text-gray-600 font-mono mt-0.5">
              Threat Relationship Graph Dossier • {activeCaseKey.toUpperCase()} • Classification: TLP:AMBER
            </p>
          </div>
          <div className="text-right text-xs font-mono text-gray-500">
            Exported: {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC
          </div>
        </div>
      </div>

      {/* Screen Interactive Header (Hidden on Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-4 bg-white shrink-0 gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
            <span
              onClick={() => navigate('/cases')}
              className="hover:text-black cursor-pointer font-medium"
            >
              Cases
            </span>
            <span>/</span>
            <select
              value={activeCaseKey}
              onChange={(e) => navigate(`/graph/${e.target.value}`)}
              className="text-xs font-mono font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-0.5 outline-none cursor-pointer max-w-[200px] sm:max-w-none truncate"
            >
              {allCases.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id.replace('case-', '')} — {c.title.substring(0, 35)}...
                </option>
              ))}
            </select>
            <span>/</span>
            <span className="text-black font-semibold">Graph</span>
          </div>

          <h1 className="mt-1 text-xl sm:text-2xl font-bold text-black">
            Threat Relationship Graph
          </h1>

          <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
            Explore relationships between suspicious email entities, infrastructure nodes, and attack vectors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleResetGraph}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Graph</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Graph (PDF)</span>
          </button>
        </div>
      </div>

      {/* Top Entity Types Legend Bar */}
      <div className="flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-2.5 bg-gray-50 border-b border-gray-200 flex-wrap text-xs text-gray-700 shrink-0">
        <span className="font-bold uppercase tracking-wider text-[11px] text-gray-500">
          Entity Types:
        </span>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
          <span>Sender</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>Email</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>Domain</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span>IP Address</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          <span>ISP / ASN</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Case Dossier</span>
        </div>
      </div>

      {/* 1. FULL WIDTH Interactive Graph Canvas */}
      <div className="w-full relative h-[480px] sm:h-[540px] bg-gray-50 border-b border-gray-200">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="#E2E8F0" />
          <Controls className="!bg-white !border-gray-200 !shadow-sm no-print" />
        </ReactFlow>
      </div>

      {/* 2. FULL WIDTH Entity Details Section BELOW the Graph */}
      <div className="w-full bg-white p-5 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              Entity Details & Forensic Intelligence
            </h2>
          </div>
          {selectedNode && (
            <span className="text-xs font-mono font-medium text-gray-500">
              Node ID: #{selectedNode.id}
            </span>
          )}
        </div>

        {selectedNode ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Col: Type & Identifier */}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Entity Type
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-bold text-black px-2.5 py-1 bg-gray-100 rounded">
                    {selectedNode.data.type}
                  </span>
                  {selectedNode.data.threatLevel && (
                    <span className="text-xs font-bold text-red-600 px-2 py-0.5 bg-red-50 border border-red-200 rounded">
                      {selectedNode.data.threatLevel}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Label
                </p>
                <p className="mt-1 text-sm font-bold text-black">
                  {selectedNode.data.label}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Value / Identifier
                </p>
                <p className="mt-1 break-all font-mono text-xs text-gray-800 bg-gray-50 p-2.5 rounded border border-gray-200">
                  {selectedNode.data.value}
                </p>
              </div>
            </div>

            {/* Middle Col: Forensic Notes */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Forensic Analysis & Context
              </p>
              <div className="text-xs text-gray-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200 min-h-[110px]">
                {selectedNode.data.details || 'No additional threat attributes recorded for this entity node.'}
              </div>
            </div>

            {/* Right Col: Actions */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Correlated Deep Dive
              </p>

              <div className="space-y-2">
                {selectedNode.data.type === 'Domain' && (
                  <button
                    onClick={() => navigate(`/domains`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-left cursor-pointer transition-colors"
                  >
                    <span>Inspect Domain Reputation</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}

                {(selectedNode.data.type === 'IP Address' || selectedNode.data.type === 'IP') && (
                  <button
                    onClick={() => navigate(`/trace/${selectedNode.data.value}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-left cursor-pointer transition-colors"
                  >
                    <span>Locate IP on Attack Map</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}

                {selectedNode.data.type === 'Email' && (
                  <button
                    onClick={() => navigate('/threats/eml-001')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-left cursor-pointer transition-colors"
                  >
                    <span>Open Email Forensic Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}

                {selectedNode.data.type === 'Case' && (
                  <button
                    onClick={() => navigate(`/cases/${activeCaseKey}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-left cursor-pointer transition-colors"
                  >
                    <span>Open Full Case Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}

                <button
                  onClick={() => navigate('/threats')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-left cursor-pointer transition-colors"
                >
                  <span>Correlate Across All Threats</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Info className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">No entity selected</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Click any node on the graph canvas above to inspect its parameters, threat classification, and linked indicators.</p>
          </div>
        )}
      </div>

      {/* 3. Complete Entity Inventory Breakdown Table (Great for Screen & PDF Export) */}
      <div className="w-full bg-white p-5 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Case Node Inventory ({nodes.length} Connected Entities)
        </h3>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Entity Type</th>
                <th className="py-2.5 px-4">Label</th>
                <th className="py-2.5 px-4">Value / Target</th>
                <th className="py-2.5 px-4">Threat Level</th>
                <th className="py-2.5 px-4">Forensic Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {nodes.map((n) => (
                <tr
                  key={n.id}
                  onClick={() => setSelectedNode(n)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedNode?.id === n.id ? 'bg-blue-50/50 font-medium' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 font-bold text-gray-800">
                    {n.data.type}
                  </td>
                  <td className="py-2.5 px-4 text-gray-900 font-semibold">
                    {n.data.label}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-gray-600 break-all">
                    {n.data.value}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                      {n.data.threatLevel || 'INFO'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-600 max-w-xs truncate">
                    {n.data.details}
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
