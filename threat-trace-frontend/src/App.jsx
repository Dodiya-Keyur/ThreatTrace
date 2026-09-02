import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmailScanner from './pages/EmailScanner';
import Threats from './pages/Threats';
import ThreatDetails from './pages/ThreatDetails';
import Forensics from './pages/Forensics';
import TraceMap from './pages/TraceMap';
import DomainIntelligence from './pages/DomainIntelligence';
import ThreatIntelligence from './pages/ThreatIntelligence';
import Cases from './pages/Cases';
import CaseDetails from './pages/CaseDetails';
import InvestigationGraph from './pages/InvestigationGraph';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Evidence from './pages/Evidence';
import Settings from './pages/Settings';
import Admin from './pages/Admin';

import ScrollToTop from './components/common/ScrollToTop';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
}

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <SidebarProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                border: '1px solid var(--color-border-subtle)',
              },
            }}
          />
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scan" element={<EmailScanner />} />
              <Route path="/threats" element={<Threats />} />
              <Route path="/threats/:id" element={<ThreatDetails />} />
              <Route path="/forensics" element={<Forensics />} />
              <Route path="/forensics/:id" element={<Forensics />} />
              <Route path="/trace" element={<TraceMap />} />
              <Route path="/trace/:ip" element={<TraceMap />} />
              <Route path="/domains" element={<DomainIntelligence />} />
              <Route path="/domains/:domain" element={<DomainIntelligence />} />
              <Route path="/intelligence" element={<ThreatIntelligence />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/cases/:id" element={<CaseDetails />} />
              <Route path="/graph" element={<InvestigationGraph />} />
              <Route path="/graph/:id" element={<InvestigationGraph />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/evidence" element={<Evidence />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/cases" element={<Admin defaultTab="cases" />} />
              <Route path="/admin/users" element={<Admin defaultTab="users" />} />
              <Route path="/admin/threats" element={<Admin defaultTab="threats" />} />
            </Route>

            {/* Default redirects */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
