import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  FileUp,
  FileText,
  Search,
  Loader2,
  X,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { analyzeEmail } from '../utils/emailAnalyzer';
import { sampleCriticalEmail, sampleHighEmail, sampleLowEmail } from '../data/mockData';

export default function EmailScanner() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [rawContent, setRawContent] = useState('');
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Analysis Configuration Checkboxes
  const [options, setOptions] = useState({
    ipReputation: true,
    domainAge: true,
    virusTotal: true,
    deepUrlScan: false,
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const droppedFile = acceptedFiles[0];
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setRawContent(e.target.result);
      };
      reader.readAsText(droppedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'message/rfc822': ['.eml'],
      'application/vnd.ms-outlook': ['.msg'],
      'text/plain': ['.txt', '.eml', '.msg'],
    },
    noClick: false,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleAnalyze = async () => {
    const contentToScan = rawContent.trim();
    if (!contentToScan) return;

    setAnalyzing(true);
    setProgress(20);

    const filename = file ? file.name : 'pasted_email.eml';

    const timer = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 200);

    try {
      const analyzed = await analyzeEmail(contentToScan, filename);
      clearInterval(timer);
      setProgress(100);

      setTimeout(() => {
        navigate(`/threats/${analyzed.id}`);
      }, 400);
    } catch (err) {
      clearInterval(timer);
      setAnalyzing(false);
      console.error('Scan error:', err);
    }
  };

  const canAnalyze = rawContent.trim().length > 10 || !!file;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Quick Load Test Samples Banner */}
      <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Quick Load Verified Test Samples
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => {
              setRawContent(sampleCriticalEmail.rawHeaders);
              setFile(null);
              setActiveTab('paste');
            }}
            className="flex items-center gap-2 p-2.5 text-left bg-[var(--color-threat-critical-bg)] border border-red-200 rounded-[var(--radius-sm)] hover:border-red-400 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-[var(--color-threat-critical)] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--color-threat-critical)]">CRITICAL (96/100)</p>
              <p className="text-[11px] text-[var(--color-text-secondary)] truncate">PayPal Credential Phish</p>
            </div>
          </button>

          <button
            onClick={() => {
              setRawContent(sampleHighEmail.rawHeaders);
              setFile(null);
              setActiveTab('paste');
            }}
            className="flex items-center gap-2 p-2.5 text-left bg-[var(--color-threat-high-bg)] border border-amber-200 rounded-[var(--radius-sm)] hover:border-amber-400 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-[var(--color-threat-high)] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--color-threat-high)]">HIGH (78/100)</p>
              <p className="text-[11px] text-[var(--color-text-secondary)] truncate">CEO Invoice BEC Fraud</p>
            </div>
          </button>

          <button
            onClick={() => {
              setRawContent(sampleLowEmail.rawHeaders);
              setFile(null);
              setActiveTab('paste');
            }}
            className="flex items-center gap-2 p-2.5 text-left bg-[var(--color-threat-low-bg)] border border-emerald-200 rounded-[var(--radius-sm)] hover:border-emerald-400 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[var(--color-threat-low)] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--color-threat-low)]">LOW (8/100 - SAFE)</p>
              <p className="text-[11px] text-[var(--color-text-secondary)] truncate">Internal Company News</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main 2-Column Interface Matching Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload / Paste (8 cols) */}
        <div className="lg:col-span-8 bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)] flex flex-col justify-between min-h-[420px]">
          {/* Underline Tabs Header */}
          <div className="flex border-b border-[var(--color-border-subtle)] gap-8 mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 text-sm font-bold transition-all cursor-pointer relative ${
                activeTab === 'upload'
                  ? 'text-[var(--color-text-primary)] border-b-2 border-b-[var(--color-brand-black)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Upload .eml/.msg File
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-2.5 text-sm font-bold transition-all cursor-pointer relative ${
                activeTab === 'paste'
                  ? 'text-[var(--color-text-primary)] border-b-2 border-b-[var(--color-brand-black)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Paste Raw Headers
            </button>
          </div>

          {/* Tab Content Area */}
          {activeTab === 'upload' ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-[var(--radius-md)] p-10 text-center flex flex-col items-center justify-center flex-1 transition-all cursor-pointer ${
                isDragActive
                  ? 'border-[var(--color-brand-black)] bg-[var(--color-surface)]'
                  : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] bg-white'
              }`}
            >
              <input {...getInputProps()} />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-neutral-100 rounded-xl flex items-center justify-center border border-neutral-200">
                    <FileText className="w-7 h-7 text-[var(--color-brand-black)]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">{file.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setRawContent('');
                    }}
                    className="flex items-center gap-1 text-xs text-red-600 hover:underline cursor-pointer mt-1"
                  >
                    <X className="w-3.5 h-3.5" /> Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  {/* Rounded Document Icon with Upload Arrow */}
                  <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center border border-neutral-200/80 shadow-xs mb-1">
                    <FileUp className="w-6 h-6 text-neutral-800 stroke-[2.2]" />
                  </div>

                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                    Drag and drop file here
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Supported formats: .eml, .msg. Maximum file size: 50MB.
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      open();
                    }}
                    className="mt-3 px-5 py-2 text-xs font-semibold bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] hover:border-[var(--color-border-strong)] transition-colors cursor-pointer text-[var(--color-text-primary)]"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                  Raw Email Source (RFC 822 / 5322)
                </label>
                {rawContent && (
                  <button
                    onClick={() => setRawContent('')}
                    className="text-xs text-[var(--color-text-muted)] hover:text-red-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder="Paste the complete raw email source including all headers here..."
                className="w-full flex-1 min-h-[260px] p-4 text-xs font-mono bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-black)]"
              />
            </div>
          )}
        </div>

        {/* Right Column: Analysis Configuration (4 cols) */}
        <div className="lg:col-span-4 bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)] flex flex-col justify-between min-h-[420px]">
          <div>
            {/* Header */}
            <h2 className="text-base font-bold text-[var(--color-text-primary)] pb-3 border-b border-[var(--color-border-subtle)] mb-5">
              Analysis Configuration
            </h2>

            {/* Checkboxes List */}
            <div className="space-y-4">
              {/* Option 1: Check IP Reputation */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={options.ipReputation}
                  onChange={(e) => setOptions({ ...options, ipReputation: e.target.checked })}
                  className="mt-0.5 rounded w-4 h-4 accent-black cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)] leading-tight">
                    Check IP Reputation
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-normal">
                    Query threat intelligence for originating IPs.
                  </p>
                </div>
              </label>

              {/* Option 2: Check Domain Age */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={options.domainAge}
                  onChange={(e) => setOptions({ ...options, domainAge: e.target.checked })}
                  className="mt-0.5 rounded w-4 h-4 accent-black cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)] leading-tight">
                    Check Domain Age
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-normal">
                    Identify newly registered domains (NRDs).
                  </p>
                </div>
              </label>

              {/* Option 3: Check VirusTotal */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={options.virusTotal}
                  onChange={(e) => setOptions({ ...options, virusTotal: e.target.checked })}
                  className="mt-0.5 rounded w-4 h-4 accent-black cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)] leading-tight">
                    Check VirusTotal
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-normal">
                    Scan attachments and hashes against VT.
                  </p>
                </div>
              </label>

              {/* Option 4: Deep URL Scan */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={options.deepUrlScan}
                  onChange={(e) => setOptions({ ...options, deepUrlScan: e.target.checked })}
                  className="mt-0.5 rounded w-4 h-4 accent-black cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)] leading-tight">
                    Deep URL Scan
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-normal">
                    Follow redirects and analyze landing pages.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Bottom Analyze Button */}
          <div className="pt-6">
            {analyzing ? (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--color-brand-black)]" />
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Analyzing threat vectors...
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-brand-black)] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-white bg-[var(--color-brand-black)] rounded-[var(--radius-sm)] hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-[var(--shadow-sm)] cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Analyze Email</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
