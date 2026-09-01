import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  fbAuthStateListener,
  fbLogin,
  fbLogout,
  fbSignup,
  fbSendPasswordReset,
  fbGetUserProfile,
} from './firebase.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = fbAuthStateListener(async (u) => {
      setUser(u);
      if (u) {
        try {
          const p = await fbGetUserProfile(u.uid);
          setProfile(p || null);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub && unsub();
  }, []);

  const login = async (email, password) => {
    const u = await fbLogin(email, password);
    setUser(u);
    try { setProfile(await fbGetUserProfile(u.uid)); } catch {}
    return u;
  };

  const signup = async (email, password, displayName) => {
    const u = await fbSignup(email, password, displayName);
    setUser(u);
    try { setProfile(await fbGetUserProfile(u.uid)); } catch {}
    return u;
  };

  const logout = async () => {
    await fbLogout();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => fbSendPasswordReset(email);

  const value = {
    user,
    profile,
    loading,
    loggedIn: !!user,
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function ProtectedRoute({ children }) {
  const { loggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0B0D] text-gray-400 font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          Authenticating session...
        </div>
      </div>
    );
  }
  if (!loggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export function GuestRoute({ children }) {
  const { loggedIn, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0B0D] text-gray-400 font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          Loading...
        </div>
      </div>
    );
  }
  if (loggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
