import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Mail,
  Globe,
  Wifi,
  Server,
  FolderOpen,
  User,
  RotateCcw,
  Download,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { getStoredCases } from '../utils/casesManager';

const initialGraphPresets = {
  'case-1024': {
    caseTitle: 'Fake Banking Campaign — PayPal Credential Phishing',
    caseNum: '1024',
    nodes: [
      {
        id: 'sender',
        type: 'entity',
        position: { x: 40, y: 220 },
        data: {
          label: 'Attacker / Spoofed Sender',
          value: 'security@paypa1-security.com',
          type: 'Sender',
          threatLevel: 'CRITICAL',
          details: 'Originates from spoofed domain with failing DMARC/SPF checks.'
        },
      },
      {
        id: 'email',
        type: 'entity',
        position: { x: 340, y: 220 },
        data: {
          label: 'Email #1 (eml-001)',
          value: 'Urgent: Verify Your PayPal Account Immediately',
          type: 'Email',
          threatLevel: 'CRITICAL (96/100)',
          details: 'Credential harvesting phishing email with high urgency lure.'
        },
      },
      {
        id: 'domain',
        type: 'entity',
        position: { x: 650, y: 90 },
        data: {
          label: 'Phishing Domain',
          value: 'paypa1-security.com',
          type: 'Domain',
          threatLevel: 'CRITICAL',
          details: 'Typosquatting domain registered 12 days ago under Panama privacy shield.'
        },
      },
      {
        id: 'ip',
        type: 'entity',
        position: { x: 650, y: 270 },
        data: {
          label: 'Originating IP Address',
          value: '185.220.101.4',
          type: 'IP Address',
          threatLevel: 'CRITICAL',
          details: 'Bulletproof hosting relay node in Moscow, Russia (Tor exit node).'
        },
      },
      {
        id: 'isp',
        type: 'entity',
        position: { x: 960, y: 270 },
        data: {
          label: 'Hosting Provider / ASN',
          value: 'AS44050 (Anonymous Bulletproof Proxy)',
          type: 'ISP',
          threatLevel: 'HIGH',
          details: 'Autonomous system with high ratio of malicious botnet traffic.'
        },
      },
      {
        id: 'case',
        type: 'entity',
        position: { x: 650, y: 450 },
        data: {
          label: 'Investigation Dossier',
          value: 'Case #1024 (Active)',
          type: 'Case',
          threatLevel: 'CRITICAL',
          details: 'Primary incident case tracking targeted credential phishing.'
        },
      },
    ],
    edges: [
      { id: 'sender-email', source: 'sender', target: 'email', label: 'sent', animated: true },
      { id: 'email-domain', source: 'email', target: 'domain', label: 'contains link', animated: true },
      { id: 'email-ip', source: 'email', target: 'ip', label: 'originated from', animated: true },
      { id: 'ip-isp', source: 'ip', target: 'isp', label: 'hosted by', animated: true },
      { id: 'email-case', source: 'email', target: 'case', label: 'linked to', animated: true },
    ]
  },
  'case-1025': {
    caseTitle: 'CEO Wire Fraud Attempt — Invoice Diversion',
    caseNum: '1025',
    nodes: [
      {
        id: 'sender',
        type: 'entity',
        position: { x: 40, y: 220 },
        data: {
          label: 'BEC Attacker',
          value: 'ceo@hr-payroll-update.net',
          type: 'Sender',
          threatLevel: 'HIGH',
          details: 'Display name spoofing executive John Mitchell.'
        },
      },
      {
        id: 'email',
        type: 'entity',
        position: { x: 340, y: 220 },
        data: {
          label: 'Email #2 (eml-002)',
          value: 'Urgent Wire Transfer: Vendor Invoice Payment #INV-8891',
          type: 'Email',
          threatLevel: 'HIGH (78/100)',
          details: 'Wire diversion fraud attempting unauthorized $48,500 disbursement.'
        },
      },
      {
        id: 'domain',
        type: 'entity',
        position: { x: 650, y: 90 },
        data: {
          label: 'Lookalike Domain',
          value: 'hr-payroll-update.net',
          type: 'Domain',
          threatLevel: 'HIGH',
          details: 'Newly registered lookalike domain with active MX mail exchangers.'
        },
      },
      {
        id: 'ip',
        type: 'entity',
        position: { x: 650, y: 270 },
        data: {
          label: 'Relay IP Address',
          value: '103.45.12.89',
          type: 'IP Address',
          threatLevel: 'HIGH',
          details: 'Intermediate open relay located in Singapore.'
        },
      },
      {
        id: 'case',
        type: 'entity',
        position: { x: 650, y: 450 },
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
      className={`w-[230px] rounded-xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer select-none ${
        selected ? 'border-black ring-2 ring-black/20' : 'border-gray-200 hover:border-gray-400'
      }`}
      style={{ cursor: 'pointer' }}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-gray-400 hover:!bg-black cursor-crosshair" />

      <div className="border-b border-gray-100 px-4 py-2 flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
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
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    setNodes(currentPreset.nodes);
    setEdges(currentPreset.edges);
    setSelectedNode(null);
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
    setSelectedNode(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-white text-black -m-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-white shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
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
              className="text-xs font-mono font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-0.5 outline-none cursor-pointer"
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
            Explore relationships between suspicious email entities and network infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetGraph}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Graph</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Top Entity Types Legend Bar */}
      <div className="flex items-center gap-4 px-6 py-2.5 bg-white border-b border-gray-200 flex-wrap text-xs text-gray-600 shrink-0">
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

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1">
        {/* Graph Area */}
        <div className="relative flex-1 bg-gray-50">
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
            <Controls className="!bg-white !border-gray-200 !shadow-sm" />
          </ReactFlow>
        </div>

        {/* Details Sidebar */}
        <aside className="w-[320px] border-l border-gray-200 bg-white flex flex-col shrink-0">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-bold text-black">
              Entity Details
            </h2>
          </div>

          {selectedNode ? (
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Type
                </p>
                <p className="mt-0.5 text-xs font-bold text-black">
                  {selectedNode.data.type}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Name / Label
                </p>
                <p className="mt-0.5 text-xs font-semibold text-black">
                  {selectedNode.data.label}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Value / Identifier
                </p>
                <p className="mt-0.5 break-all font-mono text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                  {selectedNode.data.value}
                </p>
              </div>

              {selectedNode.data.threatLevel && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Threat Level
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-red-600">
                    {selectedNode.data.threatLevel}
                  </p>
                </div>
              )}

              {selectedNode.data.details && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Forensic Notes
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                    {selectedNode.data.details}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Related Actions
                </p>

                <div className="space-y-2 text-xs">
                  {selectedNode.data.type === 'Domain' && (
                    <button
                      onClick={() => navigate(`/domains/${selectedNode.data.value}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 font-medium text-left cursor-pointer transition-colors"
                    >
                      <span>Analyze Domain Intel</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}

                  {selectedNode.data.type.includes('IP') && (
                    <button
                      onClick={() => navigate(`/trace/${selectedNode.data.value}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 font-medium text-left cursor-pointer transition-colors"
                    >
                      <span>Trace IP Geolocation</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}

                  {selectedNode.data.type === 'Email' && (
                    <button
                      onClick={() => navigate('/forensics/eml-001')}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 font-medium text-left cursor-pointer transition-colors"
                    >
                      <span>View Header Forensics</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}

                  <div className="rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600 border border-gray-100">
                    Linked to Incident #{activeCaseKey.replace('case-', '')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[320px] items-center justify-center px-8 text-center">
              <div>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <Sparkles className="w-5 h-5 text-gray-400" />
                </div>

                <p className="font-bold text-xs text-black">
                  Select an entity node
                </p>

                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Click any node on the canvas to inspect its parameters, threat classification, and linked indicators.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
