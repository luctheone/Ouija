'use client';

import { useState } from 'react';
import CompassMark from '@/components/CompassMark';

const EMBED_CODE = `<script async src="https://js.stripe.com/v3/buy-button.js"></script>
<stripe-buy-button
  buy-button-id="buy_btn_1Qdemo0CZ6qsJgndJ8aXyZ12"
  publishable-key="pk_test_51Demo0CZ6qsJgndJ4kQp"
></stripe-buy-button>`;

const SIGNING_SECRET = 'whsec_demo_0000000000000000000000000000';

const PURPLE = '#635bff';

function copyToBoth(label: string, value: string) {
  // Write to the real OS clipboard (so the user can paste with ⌘V) AND mirror into
  // Ouija's cross-tab clipboard panel.
  try { navigator.clipboard?.writeText(value); } catch { /* */ }
  window.postMessage({ type: 'OUIJA_CLIPBOARD', label, value }, '*');
}

export default function StripeDashboardMock() {
  const [buttonCreated, setButtonCreated] = useState(false);
  const [webhookCreated, setWebhookCreated] = useState(false);

  const card: React.CSSProperties = { background: '#fff', border: '1px solid #e3e8ee', borderRadius: 12, padding: 28, marginBottom: 24 };
  const primaryBtn: React.CSSProperties = { background: PURPLE, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' };
  const ghostBtn: React.CSSProperties = { background: '#fff', color: PURPLE, border: `1px solid ${PURPLE}`, borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
  const copiedNote: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1a7f37' };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fa', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: '#1a1f36', fontSize: 14 }}>
      {/* Honesty banner */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, background: '#1a1a2e', color: '#f5e6d3', padding: '8px 24px', fontSize: 12, fontWeight: 500, textAlign: 'center', borderBottom: '2px solid #c8956c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#c8956c', fontWeight: 700, fontSize: 13 }}><CompassMark size={13} /><span>ouija</span></a>
        <span style={{ color: '#f5e6d380' }}>|</span>
        <span>This is a mockup of the Stripe Dashboard (test mode) — Ouija guides it with the same DOM perception it uses on real sites.</span>
      </div>

      {/* Top bar */}
      <header style={{ background: '#0a2540', height: 52, marginTop: 36, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>stripe</span>
        <span style={{ background: '#3b5bdb', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5 }}>TEST MODE</span>
        <span style={{ marginLeft: 'auto', color: '#adbdcc', fontSize: 13 }}>Demo Store · acct_1Demo</span>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Set up payments</h1>
        <p style={{ color: '#697386', marginBottom: 28 }}>Two steps to accept payments on your store: create a payment button, then add a webhook. Each one gives you a value to paste into your storefront.</p>

        {/* Card 1 — Payment button */}
        <section style={card}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>1 · Payment button</h2>
          {!buttonCreated ? (
            <>
              <p style={{ color: '#697386', marginBottom: 16 }}>Create a Stripe Buy Button for your product, ready to embed on your storefront.</p>
              <button role="button" aria-label="Create payment button"
                onClick={() => { setButtonCreated(true); copyToBoth('Embed code', EMBED_CODE); }}
                style={primaryBtn}>
                Create payment button
              </button>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a7f37', marginBottom: 8 }}>Payment button created</h3>
              <p style={copiedNote}>✓ Embed code copied to your clipboard</p>
              <p style={{ color: '#697386', fontSize: 13, margin: '8px 0 10px' }}>Paste it into your storefront&apos;s Payment Button field.</p>
              <textarea readOnly aria-label="Embed code" value={EMBED_CODE}
                style={{ width: '100%', minHeight: 86, padding: '10px 12px', border: '1px solid #cbd2e0', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', resize: 'vertical', background: '#f6f8fa', color: '#1a1f36' }} />
              <button role="button" aria-label="Copy embed code again" onClick={() => copyToBoth('Embed code', EMBED_CODE)} style={{ ...ghostBtn, marginTop: 10 }}>
                Copy code again
              </button>
            </>
          )}
        </section>

        {/* Card 2 — Webhook */}
        <section style={card}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>2 · Webhook</h2>
          {!webhookCreated ? (
            <>
              <p style={{ color: '#697386', marginBottom: 16 }}>Add a webhook endpoint so Stripe notifies your store when a customer completes checkout (<code style={{ fontFamily: 'monospace', fontSize: 12 }}>checkout.session.completed</code>).</p>
              <button role="button" aria-label="Create webhook endpoint"
                onClick={() => { setWebhookCreated(true); copyToBoth('Signing secret', SIGNING_SECRET); }}
                style={primaryBtn}>
                Create webhook endpoint
              </button>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a7f37', marginBottom: 8 }}>Webhook created</h3>
              <p style={copiedNote}>✓ Signing secret copied to your clipboard</p>
              <p style={{ color: '#697386', fontSize: 13, margin: '8px 0 10px' }}>Listening for <code style={{ fontFamily: 'monospace', fontSize: 12 }}>checkout.session.completed</code>. Paste this secret into your storefront&apos;s Webhook Secret field.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <code aria-label="Signing secret" style={{ flex: 1, padding: '10px 12px', background: '#f6f8fa', border: '1px solid #cbd2e0', borderRadius: 8, fontFamily: 'monospace', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{SIGNING_SECRET}</code>
                <button role="button" aria-label="Copy signing secret again" onClick={() => copyToBoth('Signing secret', SIGNING_SECRET)} style={{ ...ghostBtn, whiteSpace: 'nowrap' }}>
                  Copy again
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
