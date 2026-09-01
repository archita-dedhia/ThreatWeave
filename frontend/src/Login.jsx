import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { mapFirebaseError } from './firebase.jsx';
import { ShieldCheck, LogIn, Loader2, AlertTriangle, CheckCircle2, KeyRound } from 'lucide-react';
import './Form.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      setSuccess('Authenticated. Redirecting to SOC console...');
      setTimeout(() => navigate(from, { replace: true }), 700);
    } catch (err) {
      setError(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email) {
      setError('Enter your email first, then click Forgot Password');
      return;
    }
    setError('');
    setForgotLoading(true);
    try {
      await resetPassword(email);
      setSuccess(`Password reset email sent to ${email}. Check your inbox.`);
    } catch (err) {
      setError(mapFirebaseError(err));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-logo"><ShieldCheck size={18} color="white" /></div>
          <div className="auth-brand-title">ThreatWeave</div>
          <div className="auth-brand-chip">SIH-26 SOC</div>
        </div>

        <div className="auth-eyebrow">Access Control</div>
        <h1 className="auth-title">Sign in to SOC Console</h1>
        <p className="auth-subtitle">
          Authenticate to access the multi-agent threat pipeline, MITRE mappings,
          and exportable forensic incident dossiers.</p>

        {error && (
          <div className="auth-error">
            <AlertTriangle size={14} style={{ marginRight: 8, verticalAlign: '-2px' }} />
            {error}
          </div>
        )}
        {success && (
          <div className="auth-success">
            <CheckCircle2 size={14} style={{ marginRight: 8, verticalAlign: '-2px' }} />
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="auth-input"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-row">
            <button
              className="auth-button warn"
              type="button"
              onClick={handleForgot}
              disabled={forgotLoading || loading}
              style={{ flex: 1 }}
            >
              {forgotLoading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              {forgotLoading ? 'Sending email...' : 'Forgot Password'}
            </button>
            <Link
              to="/"
              className="auth-button secondary"
              style={{ flex: 1, textDecoration: 'none' }}
            >
              Create Account
            </Link>
          </div>
        </form>

        <div className="auth-meta">
          <span>
            No account? <Link to="/" style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
          </span>
          <span>
            <span className="dot on" />Firebase Auth · v10
          </span>
        </div>
      </div>
    </div>
  );
}
