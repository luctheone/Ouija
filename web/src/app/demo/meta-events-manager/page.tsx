'use client';

import { useState } from 'react';
import CompassMark from '@/components/CompassMark';

const FAKE_PIXEL_ID = '548392017263841';

function generateFakeToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'EAABsbCS1iHgBO';
  for (let i = 0; i < 120; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}

export default function MetaEventsManagerMockup() {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [tokenGenerated, setTokenGenerated] = useState(false);
  const [token, setToken] = useState('');
  const [copiedPixel, setCopiedPixel] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  function handleGenerateToken() {
    setToken(generateFakeToken());
    setTokenGenerated(true);
  }

  function copyToClipboard(text: string, which: 'pixel' | 'token') {
    navigator.clipboard.writeText(text);
    window.postMessage({ type: 'OUIJA_CLIPBOARD', label: which === 'pixel' ? 'Pixel ID' : 'Access Token', value: text }, '*');
    if (which === 'pixel') { setCopiedPixel(true); setTimeout(() => setCopiedPixel(false), 2000); }
    else { setCopiedToken(true); setTimeout(() => setCopiedToken(false), 2000); }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 14, color: '#1c1e21', background: '#f0f2f5' }}>
      {/* Honesty banner */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#1a1a2e', color: '#f5e6d3', padding: '8px 24px', fontSize: 12, fontWeight: 500, textAlign: 'center', borderBottom: '2px solid #c8956c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#c8956c', fontWeight: 700, fontSize: 13 }}><CompassMark size={13} /><span>ouija</span></a>
        <span style={{ color: '#f5e6d380' }}>|</span>
        <span>This is a mockup of Meta Events Manager — Ouija guides this page with the same DOM perception it uses on real sites.</span>
      </div>

      {/* Left sidebar — Meta Business Suite nav */}
      <aside style={{ width: 240, background: '#ffffff', borderRight: '1px solid #dadde1', paddingTop: 56, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #e4e6eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>f</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Meta Business Suite</div>
              <div style={{ fontSize: 11, color: '#65676b' }}>Demo Business Account</div>
            </div>
          </div>
        </div>
        <nav style={{ padding: '8px 0', flex: 1 }}>
          {['Home', 'Notifications', 'Planner', 'Content', 'Ads', 'Insights', 'Monetization', 'Commerce'].map(item => (
            <div key={item} style={{ padding: '8px 16px', fontSize: 13, color: '#050505', cursor: 'pointer', borderRadius: 6, margin: '1px 8px' }}>
              {item}
            </div>
          ))}
          <div style={{ padding: '8px 16px', fontSize: 13, color: '#050505', cursor: 'pointer', borderRadius: 6, margin: '1px 8px', borderTop: '1px solid #e4e6eb', marginTop: 8, paddingTop: 12 }}>
            All tools &rarr;
          </div>
          <div role="button" aria-label="Events Manager" style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#1877f2', background: '#e7f3ff', borderRadius: 6, margin: '2px 8px', cursor: 'pointer' }}>
            Events Manager
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, paddingTop: 56, overflow: 'auto' }}>
        {/* Breadcrumb */}
        <div style={{ padding: '16px 32px 0', fontSize: 12, color: '#65676b' }}>
          Events Manager &rsaquo; Data Sources &rsaquo; <span style={{ color: '#050505', fontWeight: 600 }}>My Store Pixel</span>
        </div>

        {/* Pixel header */}
        <div style={{ padding: '16px 32px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📊</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>My Store Pixel</h1>
            <div style={{ fontSize: 12, color: '#65676b' }}>Pixel ID: {FAKE_PIXEL_ID}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '20px 32px 0', display: 'flex', gap: 0, borderBottom: '1px solid #dadde1' }}>
          <button
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            style={{ padding: '12px 20px', fontSize: 14, fontWeight: activeTab === 'overview' ? 700 : 400, color: activeTab === 'overview' ? '#1877f2' : '#65676b', background: 'none', border: 'none', borderBottom: activeTab === 'overview' ? '3px solid #1877f2' : '3px solid transparent', cursor: 'pointer' }}
          >
            Overview
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            style={{ padding: '12px 20px', fontSize: 14, fontWeight: activeTab === 'settings' ? 700 : 400, color: activeTab === 'settings' ? '#1877f2' : '#65676b', background: 'none', border: 'none', borderBottom: activeTab === 'settings' ? '3px solid #1877f2' : '3px solid transparent', cursor: 'pointer' }}
          >
            Settings
          </button>
        </div>

        {/* Settings content */}
        {activeTab === 'settings' && (
          <div style={{ padding: '24px 32px', maxWidth: 720 }}>
            {/* Pixel ID section */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Pixel ID</h2>
              <p style={{ fontSize: 13, color: '#65676b', marginBottom: 12 }}>Use this ID to connect your pixel to your website or e-commerce platform.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="text"
                  readOnly
                  value={FAKE_PIXEL_ID}
                  aria-label="Pixel ID"
                  style={{ padding: '10px 14px', fontSize: 14, fontFamily: 'monospace', border: '1px solid #dadde1', borderRadius: 6, background: '#f5f6f7', width: 240 }}
                />
                <button
                  role="button"
                  aria-label="Copy Pixel ID"
                  onClick={() => copyToClipboard(FAKE_PIXEL_ID, 'pixel')}
                  style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600, background: copiedPixel ? '#e7f3ff' : '#e4e6eb', border: '1px solid #dadde1', borderRadius: 6, cursor: 'pointer', color: copiedPixel ? '#1877f2' : '#050505' }}
                >
                  {copiedPixel ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </section>

            {/* Conversions API section */}
            <section style={{ borderTop: '1px solid #e4e6eb', paddingTop: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Conversions API</h2>
              <p style={{ fontSize: 13, color: '#65676b', marginBottom: 16 }}>Generate an access token to send events server-side via the Conversions API. This token allows your server to send web events directly to Meta.</p>

              {!tokenGenerated ? (
                <button
                  role="button"
                  aria-label="Generate access token"
                  onClick={handleGenerateToken}
                  style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600, background: '#1877f2', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  Generate access token
                </button>
              ) : (
                <div style={{ background: '#fffbe6', border: '1px solid #ffd666', borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#d4380d' }}>Copy this token now — it won&apos;t be shown again</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#65676b', marginBottom: 12 }}>This access token is not stored by Meta. If you navigate away without copying it, you&apos;ll need to generate a new one.</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="text"
                      readOnly
                      value={token}
                      aria-label="Access token"
                      style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'monospace', border: '1px solid #dadde1', borderRadius: 6, background: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
                    />
                    <button
                      role="button"
                      aria-label="Copy access token"
                      onClick={() => copyToClipboard(token, 'token')}
                      style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600, background: copiedToken ? '#f6ffed' : '#1877f2', color: copiedToken ? '#52c41a' : 'white', border: copiedToken ? '1px solid #b7eb8f' : 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {copiedToken ? 'Copied!' : 'Copy token'}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Additional settings (decoration) */}
            <section style={{ borderTop: '1px solid #e4e6eb', paddingTop: 24, marginTop: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Event Configuration</h2>
              <div style={{ fontSize: 13, color: '#65676b' }}>
                <p style={{ marginBottom: 8 }}>Configure which events your pixel sends:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['PageView', 'ViewContent', 'AddToCart', 'Purchase', 'Lead'].map(ev => (
                    <label key={ev} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }} />
                      <span>{ev}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'overview' && (
          <div style={{ padding: '24px 32px' }}>
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #dadde1', padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>No events received yet</h2>
              <p style={{ fontSize: 13, color: '#65676b' }}>Connect your pixel to your website to start receiving events. Go to the Settings tab to get your Pixel ID and generate an access token.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
