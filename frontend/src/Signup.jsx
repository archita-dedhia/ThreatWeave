import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { mapFirebaseError } from './firebase.jsx';
import { ShieldCheck, UserPlus, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './Form.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, displayName || email.split('@')[0]);
      setSuccess('Account created. Redirecting to SOC dashboard...');
      setTimeout(() => navigate(from, { replace: true }), 900);
    } catch (err) {
      setError(mapFirebaseError(err));
    } finally {
      setLoading(false);
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

        <div className="auth-eyebrow">Onboarding</div>
        <h1 className="auth-title">Create Analyst Account</h1>
        <p className="auth-subtitle">
          Register to start investigating threats, generate forensic reports
          automate incident response with the CrewAI security pipeline.</p>

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
            <label className="auth-label" htmlFor="displayName">Display Name (optional)</label>
            <input
              id="displayName"
              className="auth-input"
              type="text"
              placeholder="e.g. Lead SOC Analyst"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
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
              placeholder="At least 6 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              className="auth-input"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-meta">
          <span>
            Already have an account? <Link to="/login" style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
          </span>
          <span>
            <span className="dot on" />Firebase Auth · Firestore Users
          </span>
        </div>
      </div>
    </div>
  );
}
