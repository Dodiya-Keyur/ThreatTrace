import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect directly to dashboard!
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--color-brand-black)] rounded-[var(--radius-md)] mb-4 shadow-sm">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">ThreatTrace</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Forensic Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div className="form-card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Sign in</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Access your security dashboard
            </p>
          </div>

          {error && <div className="form-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input font-mono"
                placeholder="analyst@threattrace.io"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-10"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" defaultChecked />
                <span className="text-[var(--color-text-secondary)] text-xs">Remember session</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="form-btn-primary cursor-pointer">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6 pt-2 border-t border-[var(--color-border-subtle)]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="form-link font-semibold">
              Register
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[var(--color-text-muted)] mt-8">
          © 2026 ThreatTrace. AI-Powered Email Forensic Intelligence.
        </p>
      </div>
    </div>
  );
}
