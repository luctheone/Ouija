'use client';

import { useState } from 'react';
import CompassMark from '@/components/CompassMark';

export default function StripeStorefrontMockup() {
  const [embedCode, setEmbedCode] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [embedSaved, setEmbedSaved] = useState(false);
  const [secretSaved, setSecretSaved] = useState(false);

  function saveEmbed() {
    if (!embedCode.trim()) return;
    setEmbedSaved(true);
  }

  function saveSecret() {
    if (!webhookSecret.trim()) return;
    setSecretSaved(true);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter', -apple-system, sans-serif", color: '#1a1a1a' }}>
      {/* Honesty banner */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, background: '#1a1a2e', color: '#f5e6d3', padding: '8px 24px', fontSize: 12, fontWeight: 500, textAlign: 'center', borderBottom: '2px solid #c8956c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#c8956c', fontWeight: 700, fontSize: 13 }}><CompassMark size={13} /><span>ouija</span></a>
        <span style={{ color: '#f5e6d380' }}>|</span>
        <span>This is a demo storefront — Ouija guides you through embedding Stripe&apos;s payment button.</span>
      </div>

      {/* Store header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '16px 32px', marginTop: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>S</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>My Demo Store</div>
            <div style={{ fontSize: 11, color: '#666' }}>store-settings.mystore.com</div>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 24, fontSize: 13, color: '#666' }}>
          <span>Products</span>
          <span>Orders</span>
          <span style={{ color: '#1a1a1a', fontWeight: 600, borderBottom: '2px solid #667eea', paddingBottom: 2 }}>Settings</span>
          <span>Analytics</span>
        </nav>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Payment Settings</h1>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>Configure your payment button and webhook to start accepting payments.</p>

        {/* Section 1: Payment Button Embed */}
        <section style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#635bff15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#635bff" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Payment Button</h2>
              <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Paste your Stripe Buy Button embed code below</p>
            </div>
            {embedSaved && <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#22c55e', background: '#f0fdf4', padding: '4px 12px', borderRadius: 999, border: '1px solid #bbf7d0' }}>Configured ✓</span>}
          </div>

          {!embedSaved ? (
            <>
              <p style={{ fontSize: 13, color: '#444', marginBottom: 12, lineHeight: 1.6 }}>
                Go to your <strong>Stripe Dashboard → Payment Links</strong>, create a payment link, then click <strong>&ldquo;Buy Button&rdquo;</strong> to generate the embed code. Paste it here:
              </p>
              <textarea
                aria-label="Embed code"
                value={embedCode}
                onChange={e => { setEmbedCode(e.target.value); setEmbedSaved(!!e.target.value.trim()); }}
                placeholder={'<script async src="https://js.stripe.com/v3/buy-button.js"></script>\n<stripe-buy-button\n  buy-button-id="buy_btn_1234..."\n  publishable-key="pk_test_..."\n></stripe-buy-button>'}
                style={{ width: '100%', minHeight: 120, padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.5 }}
              />
              <button
                role="button"
                aria-label="Save embed code"
                onClick={saveEmbed}
                disabled={!embedCode.trim()}
                style={{ marginTop: 12, padding: '10px 20px', background: embedCode.trim() ? '#635bff' : '#d1d5db', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: embedCode.trim() ? 'pointer' : 'default' }}
              >
                Save payment button
              </button>
            </>
          ) : (
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', margin: '0 0 8px' }}>Payment button configured</h3>
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#475569', whiteSpace: 'pre-wrap', maxHeight: 80, overflow: 'hidden' }}>{embedCode.slice(0, 200)}...</div>
            </div>
          )}
        </section>

        {/* Section 2: Webhook Configuration */}
        <section style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5920015', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59200" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Webhook Secret</h2>
              <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Paste your webhook signing secret to verify payment events</p>
            </div>
            {secretSaved && <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#22c55e', background: '#f0fdf4', padding: '4px 12px', borderRadius: 999, border: '1px solid #bbf7d0' }}>Configured ✓</span>}
          </div>

          {!secretSaved ? (
            <>
              <p style={{ fontSize: 13, color: '#444', marginBottom: 12, lineHeight: 1.6 }}>
                In your <strong>Stripe Dashboard → Developers → Webhooks</strong>, add an endpoint for <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 3, fontSize: 11 }}>checkout.session.completed</code>. Then copy the <strong>Signing secret</strong> (starts with <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 3, fontSize: 11 }}>whsec_</code>):
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <input
                  type="text"
                  aria-label="Webhook secret"
                  value={webhookSecret}
                  onChange={e => { setWebhookSecret(e.target.value); setSecretSaved(!!e.target.value.trim()); }}
                  placeholder="whsec_..."
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontFamily: 'monospace' }}
                />
                <button
                  role="button"
                  aria-label="Save webhook secret"
                  onClick={saveSecret}
                  disabled={!webhookSecret.trim()}
                  style={{ padding: '10px 20px', background: webhookSecret.trim() ? '#635bff' : '#d1d5db', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: webhookSecret.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
                >
                  Save secret
                </button>
              </div>
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, fontSize: 12, color: '#92400e' }}>
                ⚠️ The signing secret is shown once in Stripe. If you navigate away without copying it, you&apos;ll need to reveal or recreate it.
              </div>
            </>
          ) : (
            <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#22c55e' }}>✓</span>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#166534', margin: 0 }}>Webhook secret configured</h3>
                <code style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>{webhookSecret.slice(0, 12)}...{webhookSecret.slice(-4)}</code>
              </div>
            </div>
          )}
        </section>

        {/* Completion state */}
        {embedSaved && secretSaved && (
          <div style={{ marginTop: 24, padding: '20px 24px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🎉</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#166534', marginBottom: 4 }}>Payment setup complete!</h3>
            <p style={{ fontSize: 13, color: '#15803d' }}>Your store can now accept payments and receive webhook notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
