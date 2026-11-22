'use client';

import { useState } from 'react';
import CompassMark from '@/components/CompassMark';

type View = 'roles' | 'create-role' | 'role-summary';

const DEMO_ROLE_ARN = 'arn:aws:iam::000000000000:role/OuijaMonitoringRole';

function copyToBoth(label: string, value: string) {
  try { navigator.clipboard?.writeText(value); } catch { /* */ }
  window.postMessage({ type: 'OUIJA_CLIPBOARD', label, value }, '*');
}

export default function AWSIAMConsoleMockup() {
  const [view, setView] = useState<View>('create-role'); // land straight on the form for the guided demo
  const [accountId, setAccountId] = useState('');
  const [externalId, setExternalId] = useState('');
  const [roleName, setRoleName] = useState('OuijaMonitoringRole');
  const [copiedArn, setCopiedArn] = useState(false);

  const canCreate = accountId.trim() !== '' && externalId.trim() !== '';

  const sidebarItems = ['Dashboard', 'Roles', 'Policies', 'Identity providers', 'Account settings'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'Amazon Ember', 'Helvetica Neue', Roboto, Arial, sans-serif", fontSize: 14, color: '#16191f', background: '#f2f3f3' }}>
      {/* Honesty banner */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, background: '#1a1a2e', color: '#f5e6d3', padding: '8px 24px', fontSize: 12, fontWeight: 500, textAlign: 'center', borderBottom: '2px solid #c8956c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#c8956c', fontWeight: 700, fontSize: 13 }}><CompassMark size={13} /><span>ouija</span></a>
        <span style={{ color: '#f5e6d380' }}>|</span>
        <span>This is a mockup of the AWS IAM Console — so you don&apos;t have to use your real account.</span>
      </div>

      {/* AWS top nav */}
      <div style={{ background: '#232f3e', padding: '0 16px', height: 48, display: 'flex', alignItems: 'center', gap: 16, marginTop: 36, flexShrink: 0 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>IAM</span>
        <div style={{ flex: 1, maxWidth: 460, display: 'flex', alignItems: 'center', background: '#3c4c5e', borderRadius: 4, padding: '6px 12px', gap: 8 }}>
          <span style={{ color: '#aab7c4', fontSize: 13 }}>🔍 Search</span>
        </div>
        <span style={{ marginLeft: 'auto', color: '#fff', fontSize: 12, background: '#1a73e8', padding: '2px 8px', borderRadius: 2 }}>demo-account (000000000000)</span>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #d5dbdb', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ color: '#0073bb', fontWeight: 700, fontSize: 14, cursor: 'pointer' }} onClick={() => setView('roles')}>IAM</span>
        <span style={{ color: '#545b64' }}>&gt;</span>
        <span style={{ color: '#0073bb', fontSize: 14, cursor: 'pointer' }} onClick={() => setView('roles')}>Roles</span>
        {view !== 'roles' && (<><span style={{ color: '#545b64' }}>&gt;</span><span style={{ color: '#16191f', fontSize: 14 }}>{view === 'role-summary' ? roleName : 'Create role'}</span></>)}
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #d5dbdb', padding: '12px 0', flexShrink: 0 }}>
          <div style={{ padding: '8px 16px', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>IAM</div>
          {sidebarItems.map(item => {
            const active = item === 'Roles';
            return (
              <div key={item} role="button" aria-label={item} onClick={() => item === 'Roles' && setView('roles')}
                style={{ padding: '7px 16px 7px 24px', fontSize: 13, color: active ? '#0073bb' : '#16191f', fontWeight: active ? 600 : 400, cursor: 'pointer', background: active ? '#f0f8ff' : 'transparent', borderLeft: active ? '3px solid #0073bb' : '3px solid transparent' }}>
                {item}
              </div>
            );
          })}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '24px 32px', maxWidth: 760 }}>
          {/* ── ROLES LIST ── */}
          {view === 'roles' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Roles (5)</h1>
                <button role="button" aria-label="Create role" onClick={() => setView('create-role')}
                  style={{ padding: '8px 18px', background: '#0073bb', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Create role
                </button>
              </div>
              <div style={{ border: '1px solid #d5dbdb', borderRadius: 4, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead><tr style={{ background: '#fafafa', borderBottom: '1px solid #d5dbdb' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Role name</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Trusted entities</th>
                  </tr></thead>
                  <tbody>
                    {['AWSServiceRoleForSupport', 'AWSServiceRoleForTrustedAdvisor', 'OrganizationAccountAccessRole', 'aws-controltower-AdministratorExecutionRole', 'aws-controltower-ReadOnlyExecutionRole'].map(name => (
                      <tr key={name} style={{ borderBottom: '1px solid #eaeded' }}>
                        <td style={{ padding: '10px 16px', color: '#0073bb' }}>{name}</td>
                        <td style={{ padding: '10px 16px', color: '#545b64' }}>AWS service</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── CREATE ROLE (single screen) ── */}
          {view === 'create-role' && (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Create role</h1>
              <p style={{ color: '#545b64', marginBottom: 20, fontSize: 13 }}>Grant a trusted AWS account read-only access to this account.</p>

              <div style={{ border: '1px solid #d5dbdb', borderRadius: 8, padding: 24, background: '#fff', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Trusted entity</h3>
                <p style={{ color: '#545b64', fontSize: 13, marginBottom: 18 }}>✓ Another AWS account · ✓ Require external ID</p>

                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Account ID</label>
                <p style={{ fontSize: 12, color: '#545b64', marginBottom: 6 }}>Paste the Account ID you copied from CloudPulse.</p>
                <input name="accountId" aria-label="Account ID" value={accountId} onChange={e => setAccountId(e.target.value)} placeholder="000000000000"
                  style={{ width: 360, maxWidth: '100%', padding: '8px 12px', border: '1px solid #aab7c4', borderRadius: 4, fontSize: 14, fontFamily: 'monospace', marginBottom: 18 }} />

                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>External ID</label>
                <p style={{ fontSize: 12, color: '#545b64', marginBottom: 6 }}>Paste the External ID you copied from CloudPulse.</p>
                <input name="externalId" aria-label="External ID" value={externalId} onChange={e => setExternalId(e.target.value)} placeholder="ouija-demo-xk9f2m"
                  style={{ width: 360, maxWidth: '100%', padding: '8px 12px', border: '1px solid #aab7c4', borderRadius: 4, fontSize: 14, fontFamily: 'monospace' }} />
              </div>

              <div style={{ border: '1px solid #d5dbdb', borderRadius: 8, padding: 24, background: '#fff', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Permissions &amp; name</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ color: '#1d8102', fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 13 }}>Permissions policy: <strong>ReadOnlyAccess</strong> (AWS managed)</span>
                </div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Role name</label>
                <input name="roleName" aria-label="Role name" value={roleName} onChange={e => setRoleName(e.target.value)}
                  style={{ width: 360, maxWidth: '100%', padding: '8px 12px', border: '1px solid #aab7c4', borderRadius: 4, fontSize: 14 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => setView('roles')} style={{ padding: '8px 20px', background: '#fff', color: '#16191f', border: '1px solid #aab7c4', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button role="button" aria-label="Create role" disabled={!canCreate} onClick={() => setView('role-summary')}
                  style={{ padding: '8px 20px', background: canCreate ? '#0073bb' : '#d5dbdb', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: canCreate ? 'pointer' : 'default' }}>
                  Create role
                </button>
              </div>
            </>
          )}

          {/* ── ROLE SUMMARY ── */}
          {view === 'role-summary' && (
            <>
              <div style={{ background: '#f0fff4', border: '1px solid #1d8102', borderRadius: 4, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#1d8102', fontWeight: 700 }}>✓</span>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Role created</h2>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>{roleName}</h1>
              <div style={{ border: '1px solid #d5dbdb', borderRadius: 8, padding: 24, background: '#fff' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px 16px', fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>ARN</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code aria-label="Role ARN" style={{ background: '#f2f3f3', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all' }}>{DEMO_ROLE_ARN}</code>
                    <button role="button" aria-label="Copy Role ARN"
                      onClick={() => { copyToBoth('Role ARN', DEMO_ROLE_ARN); setCopiedArn(true); setTimeout(() => setCopiedArn(false), 2000); }}
                      style={{ padding: '5px 14px', background: copiedArn ? '#f0fff4' : '#0073bb', border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontWeight: 600, color: copiedArn ? '#1d8102' : '#fff', whiteSpace: 'nowrap' }}>
                      {copiedArn ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <span style={{ fontWeight: 600 }}>Trusted entity</span>
                  <span>Another AWS account (External ID required)</span>
                  <span style={{ fontWeight: 600 }}>Permissions</span>
                  <span>ReadOnlyAccess</span>
                </div>
                <p style={{ fontSize: 13, color: '#545b64', marginTop: 16 }}>Copy the ARN above and paste it back into CloudPulse to finish connecting.</p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
