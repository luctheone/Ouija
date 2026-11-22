'use client';

import { useState, useEffect } from 'react';
import CompassMark from '@/components/CompassMark';

export default function StripeConnectDemo() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'redirecting'>('idle');
  // Stripe redirects back here with ?success=true (return_url) or ?refresh=true
  // (link expired). Without reading these the page looked like nothing happened.
  const [returned, setReturned] = useState<null | 'success' | 'refresh'>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('success')) setReturned('success');
    else if (p.get('refresh')) setReturned('refresh');
  }, []);

  async function startOnboarding() {
    setStatus('loading');

    try {
      const res = await fetch('/api/demo/stripe-connect-link', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create onboarding link');
      const { url } = await res.json();
      setStatus('redirecting');
      window.location.href = url;
    } catch {
      setStatus('idle');
      alert('Could not start Stripe onboarding. Check that Stripe test keys are configured.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f5e6d3', fontFamily: "'Manrope', -apple-system, sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      {/* Honesty banner */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#1a1a2e', color: '#f5e6d3', padding: '8px 24px', fontSize: 12, fontWeight: 500, textAlign: 'center', borderBottom: '2px solid #c8956c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#c8956c', fontWeight: 700, fontSize: 13 }}><CompassMark size={13} /><span>ouija</span></a>
        <span style={{ color: '#f5e6d380' }}>|</span>
        <span>Demo marketplace — Stripe Connect test mode. No real money or data.</span>
      </div>

      {/* Platform branding */}
      <div style={{ textAlign: 'center', maxWidth: 520, marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#c8956c', marginBottom: 12 }}>DEMO MARKETPLACE</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>Start selling on our platform</h1>
        <p style={{ fontSize: 15, color: '#a09080', lineHeight: 1.6 }}>
          To receive payments, you need to complete Stripe&apos;s identity and business verification.
          This typically takes 5-10 minutes and requires your business details.
        </p>
      </div>

      {/* Onboarding card */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,149,108,0.2)', borderRadius: 16, padding: '32px 40px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
        {returned === 'success' ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#7dd3a0' }}>Verification submitted</h2>
            <p style={{ fontSize: 13, color: '#a09080', lineHeight: 1.5 }}>
              Your details are with Stripe for review. Once approved, your account can start
              receiving payments — you don&apos;t need to do anything else here.
            </p>
          </>
        ) : returned === 'refresh' ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Onboarding link expired</h2>
            <p style={{ fontSize: 13, color: '#a09080', marginBottom: 24, lineHeight: 1.5 }}>
              That link timed out before you finished. Start a fresh one to continue.
            </p>
            <button
              role="button"
              aria-label="Restart seller onboarding"
              onClick={startOnboarding}
              disabled={status !== 'idle'}
              style={{
                padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: status === 'idle' ? 'pointer' : 'default',
                background: status === 'idle' ? 'linear-gradient(135deg, #c8956c, #a07050)' : '#555',
                color: 'white', border: 'none', borderRadius: 999, width: '100%',
                boxShadow: status === 'idle' ? '0 4px 20px rgba(200,149,108,0.3)' : 'none', transition: 'all .2s',
              }}
            >
              {status === 'idle' ? 'Restart onboarding →' : status === 'loading' ? 'Creating onboarding link...' : 'Redirecting to Stripe...'}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Seller Verification (KYB)</h2>
            <p style={{ fontSize: 13, color: '#a09080', marginBottom: 24, lineHeight: 1.5 }}>
              You&apos;ll be redirected to Stripe to verify your identity and business details.
              Once verified, you can start receiving payments from customers.
            </p>

            <div style={{ fontSize: 11, color: '#706050', marginBottom: 16, padding: '8px 12px', borderRadius: 8, background: 'rgba(200,149,108,0.08)', border: '1px solid rgba(200,149,108,0.15)' }}>
              You&apos;ll need: Business name, address, EIN/registration number, bank account details, government ID
            </div>

            <button
              role="button"
              aria-label="Start seller onboarding"
              onClick={startOnboarding}
              disabled={status !== 'idle'}
              style={{
                padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: status === 'idle' ? 'pointer' : 'default',
                background: status === 'idle' ? 'linear-gradient(135deg, #c8956c, #a07050)' : '#555',
                color: 'white', border: 'none', borderRadius: 999, width: '100%',
                boxShadow: status === 'idle' ? '0 4px 20px rgba(200,149,108,0.3)' : 'none',
                transition: 'all .2s',
              }}
            >
              {status === 'idle' && 'Start seller onboarding →'}
              {status === 'loading' && 'Creating onboarding link...'}
              {status === 'redirecting' && 'Redirecting to Stripe...'}
            </button>
          </>
        )}
      </div>

      {/* Info footer */}
      <div style={{ marginTop: 32, fontSize: 11, color: '#605040', textAlign: 'center', maxWidth: 400 }}>
        <p>This uses Stripe Connect in <strong>test mode</strong>. Use test data (test routing number: 110000000, test account: 000123456789).</p>
      </div>
    </div>
  );
}
