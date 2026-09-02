import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect directly to dashboard!
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Keyur Dodiya' },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'keyur@example.com' },
    { id: 'password', label: 'Password', type: 'password', placeholder: 'Create a strong password' },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Confirm your password' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--color-brand-black)] rounded-[var(--radius-md)] mb-4 shadow-sm">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">ThreatTrace</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Create your analyst account</p>
        </div>

        <div className="form-card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Register</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Create your personal analyst account</p>
          </div>

          {error && <div className="form-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="form-label">
                  {f.label}
                </label>
                <input
                  id={f.id}
                  type={f.type}
                  value={form[f.id]}
                  onChange={update(f.id)}
                  className={`form-input ${f.type === 'email' ? 'font-mono' : ''}`}
                  placeholder={f.placeholder}
                  required
                />
              </div>
            ))}

            <button type="submit" disabled={loading} className="form-btn-primary cursor-pointer">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6 pt-2 border-t border-[var(--color-border-subtle)]">
            Already have an account?{' '}
            <Link to="/login" className="form-link font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
