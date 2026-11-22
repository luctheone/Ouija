'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompassMark from '@/components/CompassMark';
import './admin.css';

interface Company {
  id: string;
  name: string;
  site: string;
  status: 'configured' | 'discovered';
  session_count: number;
  created_at: string;
}

export default function AdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSite, setNewSite] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  // Auth gate
  const [authState, setAuthState] = useState<{ authed: boolean; configured: boolean } | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/me', { credentials: 'include' });
        const data = await res.json();
        setAuthState({ authed: !!data.authed, configured: !!data.configured });
        if (data.authed) fetchCompanies();
        else setLoading(false);
      } catch {
        // If the check itself fails, fall back to attempting the console.
        setAuthState({ authed: true, configured: true });
        fetchCompanies();
      }
    })();
  }, []);

  async function login() {
    if (!password || loggingIn) return;
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      setLoginError(res.status === 429 ? 'Too many attempts — wait a minute.' : 'Incorrect password.');
    } catch {
      setLoginError('Login failed. Try again.');
    }
    setLoggingIn(false);
  }

  async function fetchCompanies() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/companies', { credentials: 'include' });
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch { /* empty state */ }
    setLoading(false);
  }

  async function createCompany() {
    if (!newName || !newSite) return;
    const res = await fetch('/api/admin/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: newName, site: newSite }),
    });
    if (res.ok) {
      setShowCreate(false);
      setNewName('');
      setNewSite('');
      fetchCompanies();
    }
  }

  async function deleteCompany(id: string) {
    const res = await fetch(`/api/admin/companies/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      setConfirmDelete(null);
      setMenuOpen(null);
      fetchCompanies();
    }
  }

  // ── Login gate ──────────────────────────────────────────────────────
  if (authState && !authState.authed && authState.configured) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div
          className="glass"
          style={{ width: '100%', maxWidth: 380, padding: '32px 28px', borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--hairline-strong)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div className="admin-mark" style={{ width: 40, height: 40 }}><CompassMark size={18} /></div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-hi)', letterSpacing: '-.02em' }}>Admin sign-in</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Enter the admin password</div>
            </div>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') login(); }}
            placeholder="Password"
            autoFocus
            className="console-input"
            style={{ width: '100%', marginBottom: 10 }}
          />
          {loginError && (
            <p style={{ fontSize: 11.5, color: 'var(--danger)', fontWeight: 600, marginBottom: 10 }}>{loginError}</p>
          )}
          <button
            onClick={login}
            disabled={loggingIn || !password}
            style={{ width: '100%', padding: '11px 16px', borderRadius: 12, background: 'var(--btn-bg)', border: '1px solid var(--btn-border)', color: 'var(--btn-text)', fontSize: 13, fontWeight: 700, cursor: loggingIn || !password ? 'default' : 'pointer', opacity: loggingIn || !password ? 0.6 : 1 }}
          >
            {loggingIn ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Banner */}
      <div className="banner">
        <p>This is a preview of the Ouija client console. SaaS companies configure their onboarding flows, documentation, and breakpoint handling here.</p>
      </div>

      {/* Unprotected warning — ADMIN_PASSWORD unset */}
      {authState && !authState.configured && (
        <div
          style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 16, textAlign: 'center', background: 'var(--mark-bg)', border: '1px solid var(--mark-border)', color: 'var(--mark-color)', fontSize: 12, fontWeight: 700 }}
        >
          Admin is unprotected — set ADMIN_PASSWORD
        </div>
      )}

      {/* Header */}
      <div className="admin-head">
        <div className="admin-id">
          <div className="admin-mark"><CompassMark size={20} /></div>
          <div>
            <div className="admin-title">Companies</div>
            <div className="admin-sub">Select a company to manage</div>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="add-company-btn"
        >
          + Add company
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="glass" style={{ padding: '20px 24px', borderRadius: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Company name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Stripe"
                className="console-input"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Site domain</label>
              <input
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                placeholder="e.g. stripe.com"
                className="console-input"
              />
            </div>
            <button onClick={createCompany} className="create-btn">Create</button>
          </div>
        </div>
      )}

      {/* Company grid */}
      {loading ? (
        <div className="ouija-loader"><div className="ouija-loader-ring" /><span className="ouija-loader-text">Loading companies</span></div>
      ) : companies.length === 0 ? (
        <div className="glass" style={{ padding: '60px 32px', borderRadius: 18, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-lo)', marginBottom: 8 }}>No companies configured yet.</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click &ldquo;Add company&rdquo; to set up your first onboarding flow, or use the extension to discover flows automatically.</p>
        </div>
      ) : (
        <div className="company-grid">
          {companies.map((c) => (
            <div key={c.id} style={{ position: 'relative' }}>
              <button
                onClick={() => router.push(`/admin/${c.id}`)}
                className="company-card glass"
              >
                <div className="company-card-head">
                  <div className="company-card-icon">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`company-status company-status--${c.status}`}>
                    {c.status}
                  </span>
                </div>
                <div className="company-card-name">{c.name}</div>
                <div className="company-card-site">{c.site}</div>
                <div className="company-card-meta">
                  {c.session_count} session{c.session_count !== 1 ? 's' : ''}
                </div>
              </button>
              {/* 3-dot menu */}
              <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 10 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === c.id ? null : c.id); setConfirmDelete(null); }}
                  style={{ width: 28, height: 28, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ⋯
                </button>
                {menuOpen === c.id && (
                  <div style={{ position: 'absolute', bottom: 34, right: 0, background: 'var(--surface)', border: '1px solid var(--hairline-strong)', borderRadius: 10, padding: 4, minWidth: 128, boxShadow: 'var(--shadow-card-h)' }}>
                    {confirmDelete === c.id ? (
                      <>
                        <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-md)', fontWeight: 600 }}>Delete {c.name}?</div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteCompany(c.id); }}
                          style={{ width: '100%', padding: '8px 12px', background: 'oklch(0.575 0.205 26/.10)', border: '1px solid oklch(0.575 0.205 26/.22)', borderRadius: 6, fontSize: 11, fontWeight: 700, color: 'var(--danger)', cursor: 'pointer', textAlign: 'left' }}
                        >
                          Confirm delete
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); setMenuOpen(null); }}
                          style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: 6, fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left', marginTop: 2 }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(c.id); }}
                        style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, color: 'var(--danger)', cursor: 'pointer', textAlign: 'left' }}
                      >
                        Delete company
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
