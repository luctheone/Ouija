'use client';

import { useState, useEffect } from 'react';
import CompassMark from '@/components/CompassMark';

const MONITORING_ACCOUNT_ID = '000000000000';
const EXTERNAL_ID = 'ouija-demo-xk9f2m';

export default function AWSMonitoringConnectPage() {
  const [roleArn, setRoleArn] = useState('');
  const [connected, setConnected] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedExternal, setCopiedExternal] = useState(false);
  const [copiedBoth, setCopiedBoth] = useState(false);

  function copyValue(value: string, which: 'account' | 'external') {
    navigator.clipboard.writeText(value);
    // Mirror into Ouija's clipboard panel so both AWS values carry across tabs.
    window.postMessage(
      { type: 'OUIJA_CLIPBOARD', label: which === 'account' ? 'AWS Account ID' : 'External ID', value },
      '*'
    );
    if (which === 'account') { setCopiedAccount(true); setTimeout(() => setCopiedAccount(false), 2000); }
    else { setCopiedExternal(true); setTimeout(() => setCopiedExternal(false), 2000); }
  }

  function copyBoth() {
    copyValue(MONITORING_ACCOUNT_ID, 'account');
    copyValue(EXTERNAL_ID, 'external');
    setCopiedBoth(true);
    setTimeout(() => setCopiedBoth(false), 2000);
  }

  // Stamp the URL when connected so Ouija can verify the final step with a deterministic
  // local "URL contains connected=1" check instead of a flaky LLM screenshot read.
  useEffect(() => {
    if (connected) {
      try { window.history.replaceState(null, '', window.location.pathname + '?connected=1'); } catch { /* */ }
    }
  }, [connected]);

  function handleConnect() {
    if (!roleArn.trim()) return;
    setConnected(true);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e4e8ee', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Honesty banner */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, background: '#1a1a2e', color: '#f5e6d3', padding: '8px 24px', fontSize: 12, fontWeight: 500, textAlign: 'center', borderBottom: '2px solid #c8956c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#c8956c', fontWeight: 700, fontSize: 13 }}><CompassMark size={13} /><span>ouija</span></a>
        <span style={{ color: '#f5e6d380' }}>|</span>
        <span>This is a mockup of a monitoring tool&apos;s connect page — Ouija guides the AWS IAM flow.</span>
      </div>

      {/* App header */}
      <header style={{ background: '#1a1d26', borderBottom: '1px solid #2a2e3a', padding: '12px 32px', marginTop: 36, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>CloudPulse</span>
          <span style={{ fontSize: 11, color: '#666', marginLeft: 4 }}>Monitoring</span>
        </div>
        <nav style={{ marginLeft: 32, display: 'flex', gap: 20, fontSize: 13, color: '#8b8fa3' }}>
          <span>Dashboard</span>
          <span>Alerts</span>
          <span style={{ color: '#e4e8ee', fontWeight: 600 }}>Integrations</span>
          <span>Settings</span>
        </nav>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Connect Your AWS Account</h1>
          <p style={{ color: '#8b8fa3', fontSize: 14, lineHeight: 1.6 }}>
            To monitor your AWS infrastructure, CloudPulse needs read-only access to your account via an IAM role. Follow the steps below to create the role in your AWS Console.
          </p>
        </div>

        {/* Step-by-step instructions */}
        <div style={{ background: '#1a1d26', border: '1px solid #2a2e3a', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#7c3aed' }}>Step 1 — Copy these values</h3>

          <button role="button" aria-label="Copy credentials" onClick={copyBoth}
            style={{ width: '100%', marginBottom: 14, padding: '11px 16px', background: copiedBoth ? '#1d4ed820' : 'linear-gradient(135deg, #7c3aed, #2563eb)', border: `1px solid ${copiedBoth ? '#3b82f6' : 'transparent'}`, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: copiedBoth ? '#60a5fa' : '#fff' }}>
            {copiedBoth ? '✓ Both credentials saved to your Ouija clipboard' : 'Copy credentials'}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#0f1117', borderRadius: 8, border: '1px solid #2a2e3a' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8b8fa3', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Our AWS Account ID</div>
                <code aria-label="CloudPulse Account ID" style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace', color: '#e4e8ee' }}>{MONITORING_ACCOUNT_ID}</code>
              </div>
              <button
                role="button"
                aria-label="Copy Account ID"
                onClick={() => copyValue(MONITORING_ACCOUNT_ID, 'account')}
                style={{ padding: '8px 16px', background: copiedAccount ? '#1d4ed820' : '#2a2e3a', border: `1px solid ${copiedAccount ? '#3b82f6' : '#3a3e4a'}`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: copiedAccount ? '#60a5fa' : '#e4e8ee' }}
              >
                {copiedAccount ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#0f1117', borderRadius: 8, border: '1px solid #2a2e3a' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8b8fa3', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>External ID</div>
                <code aria-label="External ID" style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace', color: '#e4e8ee' }}>{EXTERNAL_ID}</code>
              </div>
              <button
                role="button"
                aria-label="Copy External ID"
                onClick={() => copyValue(EXTERNAL_ID, 'external')}
                style={{ padding: '8px 16px', background: copiedExternal ? '#1d4ed820' : '#2a2e3a', border: `1px solid ${copiedExternal ? '#3b82f6' : '#3a3e4a'}`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: copiedExternal ? '#60a5fa' : '#e4e8ee' }}
              >
                {copiedExternal ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ background: '#1a1d26', border: '1px solid #2a2e3a', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#7c3aed' }}>Step 2 — Create the IAM Role in AWS</h3>
          <ol style={{ fontSize: 13, color: '#8b8fa3', lineHeight: 2, paddingLeft: 20, margin: 0 }}>
            <li>Go to the <strong style={{ color: '#e4e8ee' }}>AWS IAM Console</strong> → <strong style={{ color: '#e4e8ee' }}>Create role</strong></li>
            <li>Paste the <strong style={{ color: '#60a5fa' }}>Account ID</strong> and <strong style={{ color: '#60a5fa' }}>External ID</strong> into the form</li>
            <li>Click <strong style={{ color: '#e4e8ee' }}>Create role</strong> — ReadOnlyAccess and the role name are pre-filled</li>
            <li>Copy the <strong style={{ color: '#e4e8ee' }}>Role ARN</strong> from the summary</li>
          </ol>
        </div>

        <div style={{ background: '#1a1d26', border: '1px solid #2a2e3a', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#7c3aed' }}>Step 3 — Paste your Role ARN</h3>
          {!connected ? (
            <>
              <p style={{ fontSize: 13, color: '#8b8fa3', marginBottom: 12 }}>After creating the role, paste the ARN here to complete the connection.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  aria-label="Role ARN"
                  value={roleArn}
                  onChange={e => { setRoleArn(e.target.value); if (e.target.value.trim()) setConnected(true); }}
                  placeholder="arn:aws:iam::000000000000:role/OuijaMonitoringRole"
                  style={{ flex: 1, padding: '10px 14px', background: '#0f1117', border: '1px solid #3a3e4a', borderRadius: 6, fontSize: 13, fontFamily: 'monospace', color: '#e4e8ee' }}
                />
                <button
                  role="button"
                  aria-label="Connect AWS account"
                  onClick={handleConnect}
                  disabled={!roleArn.trim()}
                  style={{ padding: '10px 24px', background: roleArn.trim() ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : '#2a2e3a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: roleArn.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
                >
                  Connect
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: '16px 20px', background: '#052e1610', border: '1px solid #22c55e40', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>✓</span>
              <div>
                <h2 style={{ fontWeight: 700, color: '#22c55e', fontSize: 14, margin: 0 }}>AWS Account Connected!</h2>
                <div style={{ fontSize: 12, color: '#8b8fa3', marginTop: 2 }}>Monitoring data will appear within 5 minutes.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
