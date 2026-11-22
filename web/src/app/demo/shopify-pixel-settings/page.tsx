'use client';

import { useState } from 'react';
import CompassMark from '@/components/CompassMark';

export default function ShopifyPixelSettingsMockup() {
  const [pixelId, setPixelId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!pixelId.trim() || !accessToken.trim()) return;
    setSaved(true);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6f6f7', fontFamily: "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, sans-serif", fontSize: 14, color: '#1a1c1d' }}>
      {/* Honesty banner */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, background: '#1a1a2e', color: '#f5e6d3', padding: '8px 24px', fontSize: 12, fontWeight: 500, textAlign: 'center', borderBottom: '2px solid #c8956c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#c8956c', fontWeight: 700, fontSize: 13 }}><CompassMark size={13} /><span>ouija</span></a>
        <span style={{ color: '#f5e6d380' }}>|</span>
        <span>This is a mockup of the Shopify admin pixel settings.</span>
      </div>

      {/* Shopify-style top bar */}
      <header style={{ background: '#1a1c1d', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 16, marginTop: 36 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M15.5 2.5c-.2 0-.4.1-.5.2l-.6.6c-.7-.3-1.5-.5-2.4-.5-3.6 0-6.5 3-6.5 6.7 0 4.5 4.2 8.3 6 9.7.2.1.4.2.5.2s.3-.1.5-.2c1.8-1.4 6-5.2 6-9.7 0-2-.8-3.7-2-5l.6-.6c.2-.2.3-.5.2-.8-.1-.3-.4-.5-.7-.5h-1.1z" fill="#95bf47"/></svg>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>My Demo Store</span>
        <nav style={{ marginLeft: 32, display: 'flex', gap: 20, fontSize: 13 }}>
          <span style={{ color: '#b5b5b5' }}>Home</span>
          <span style={{ color: '#b5b5b5' }}>Orders</span>
          <span style={{ color: '#b5b5b5' }}>Products</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>Settings</span>
        </nav>
      </header>

      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto' }}>
        {/* Settings sidebar */}
        <aside style={{ width: 200, padding: '24px 0 24px 20px', flexShrink: 0 }}>
          {['General', 'Payments', 'Checkout', 'Shipping', 'Taxes', 'Customer events', 'Domains', 'Notifications'].map(item => (
            <div key={item} style={{ padding: '8px 16px', fontSize: 13, color: item === 'Customer events' ? '#1a1c1d' : '#616161', fontWeight: item === 'Customer events' ? 600 : 400, background: item === 'Customer events' ? '#e4e5e7' : 'transparent', borderRadius: 8, marginBottom: 2, cursor: 'pointer' }}>
              {item}
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px 40px', maxWidth: 640 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Customer events</h1>
          <p style={{ fontSize: 13, color: '#616161', marginBottom: 24 }}>Connect tracking pixels and analytics to measure your store&apos;s performance.</p>

          {/* Meta Pixel section */}
          <section style={{ background: '#fff', border: '1px solid #e1e3e5', borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1877f215', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>f</div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Meta Pixel</h2>
                <p style={{ fontSize: 12, color: '#616161', margin: 0 }}>Facebook & Instagram ad tracking</p>
              </div>
              {saved && <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#1a8052', background: '#e3f1e8', padding: '4px 12px', borderRadius: 999, border: '1px solid #b4dfc4' }}>Connected ✓</span>}
            </div>

            {!saved ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Pixel ID</label>
                  <input
                    type="text"
                    aria-label="Pixel ID"
                    value={pixelId}
                    onChange={e => setPixelId(e.target.value)}
                    placeholder="548392017263841"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #c9cccf', borderRadius: 8, fontSize: 14, fontFamily: 'monospace' }}
                  />
                  <p style={{ fontSize: 11, color: '#8c9196', marginTop: 4 }}>Find this in Meta Events Manager → Data Sources → Your Pixel → Settings</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Conversions API access token</label>
                  <input
                    type="text"
                    aria-label="Access token"
                    value={accessToken}
                    onChange={e => setAccessToken(e.target.value)}
                    placeholder="EAABsbCS1iHgBO..."
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #c9cccf', borderRadius: 8, fontSize: 14, fontFamily: 'monospace' }}
                  />
                  <p style={{ fontSize: 11, color: '#8c9196', marginTop: 4 }}>Generate in Meta Events Manager → Settings → Conversions API → Generate access token</p>
                </div>
                <button
                  role="button"
                  aria-label="Save pixel configuration"
                  onClick={handleSave}
                  disabled={!pixelId.trim() || !accessToken.trim()}
                  style={{ alignSelf: 'flex-start', padding: '10px 20px', background: pixelId.trim() && accessToken.trim() ? '#1a1c1d' : '#e1e3e5', color: pixelId.trim() && accessToken.trim() ? '#fff' : '#8c9196', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: pixelId.trim() && accessToken.trim() ? 'pointer' : 'default' }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div style={{ padding: '16px', background: '#f1f8f4', borderRadius: 8, border: '1px solid #b4dfc4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#1a8052', fontWeight: 700 }}>✓</span>
                  {/* Heading (not a span) so Ouija's DOM serializer captures it for the
                      step-complete verification — see structure.headings in /api/verify. */}
                  <h3 style={{ fontWeight: 600, color: '#1a8052', margin: 0, fontSize: 14 }}>Meta Pixel connected successfully</h3>
                </div>
                <div style={{ fontSize: 12, color: '#616161' }}>
                  Pixel ID: <code style={{ fontFamily: 'monospace' }}>{pixelId}</code> · Token configured
                </div>
              </div>
            )}
          </section>

          {/* Other pixels (decoration) */}
          <section style={{ background: '#fff', border: '1px solid #e1e3e5', borderRadius: 12, padding: 24, opacity: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#616161' }}>G</div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#8c9196' }}>Google Analytics</h2>
                <p style={{ fontSize: 12, color: '#8c9196', margin: 0 }}>Not configured</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
