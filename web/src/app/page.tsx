'use client';

import { useEffect, useState } from 'react';
import CompassMark from '../components/CompassMark';

export default function Home() {
  const [sessionCount, setSessionCount] = useState<number | null>(null);

  useEffect(() => {
    const handler = () => {
      document.querySelector('nav.ouija-nav')?.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setSessionCount(d.sessions_guided))
      .catch(() => setSessionCount(0));
    const interval = setInterval(() => {
      fetch('/api/stats').then(r => r.json()).then(d => setSessionCount(d.sessions_guided)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-glow" />
        <p className="hero-eyebrow">Cross-site onboarding guidance</p>
        <h1>
          Onboarding doesn&apos;t have to end<br />
          <em>at your domain.</em>
        </h1>
        <p className="hero-sub">
          Ouija is the world&apos;s first tool to follow users cross-site to abolish
          onboarding churn. It sees the page, points the way, and never acts.
        </p>
        <div className="hero-cta">
          <a href="#setup" className="hero-btn glint">Demo Ouija! →</a>
          <span className="hero-note">For SuperAI NEXT hackathon judges</span>
        </div>

        {sessionCount !== null && (
          <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mark-color)', boxShadow: '0 0 8px var(--mark-color)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-md)', letterSpacing: '.02em' }}>
              {sessionCount} onboarding session{sessionCount !== 1 ? 's' : ''} guided
            </span>
          </div>
        )}

        {/* Product preview */}
        <div className="preview-wrap">
          <div className="preview-frame glint">
            <BrowserMockup
              url="app.shopify.com/admin/settings/channels"
              ctaLabel="Connect channel"
              step="3/6"
              msg={<>Click the <b>Connect channel</b> button — I&apos;ve highlighted it for you.</>}
              nodes={[1, 1, 0, 0, 0, 0]}
            />
          </div>
          <div className="preview-overlay">
            <button className="play-btn">
              <svg className="play-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
          <span className="preview-label">Demo video</span>
        </div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────────────────── */}
      <section className="marquee-section">
        <p className="marquee-label">Guides across any site</p>
        <div className="marquee-track">
          {[...CAROUSEL_CARDS, ...CAROUSEL_CARDS].map((card, i) => (
            <div key={i} className="marquee-card">
              <BrowserMockup {...card} />
            </div>
          ))}
        </div>
      </section>

      {/* ── SETUP STEPS ─────────────────────────────────────────── */}
      <section className="setup-section" id="setup">
        <p className="section-eyebrow">Try it yourself</p>
        <h2 className="section-h2">Set up in under two minutes.</h2>
        <p className="section-sub">You must be on <strong style={{ color: 'var(--text-hi)' }}>Google Chrome</strong> to use this extension. Stay on this page — Ouija will greet you right here.</p>

        <div className="steps">
          <div className="step-card">
            <div className="step-num">1</div>
            <div>
              <div className="step-title">Download &amp; load the extension</div>
              <p className="step-body">
                <a href="/ouija-extension.zip" download className="skip-link" style={{ fontWeight: 700 }}>⬇ Download Ouija extension</a> (ZIP, ~144KB).<br /><br />
                Unzip it anywhere on your computer. Then open a new tab → type{' '}
                <span className="step-code">chrome://extensions</span> → enable <strong style={{ color: 'var(--text-hi)' }}>Developer Mode</strong> (toggle, top right) → click <strong style={{ color: 'var(--text-hi)' }}>&ldquo;Load unpacked&rdquo;</strong> → select the unzipped <span className="step-code">ouija-extension</span> folder.<br /><br />
                Come back to this page when done.
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">2</div>
            <div>
              <div className="step-title">Activate Ouija on this page</div>
              <p className="step-body">
                You should see the Ouija icon (<span style={{ display: 'inline-flex', verticalAlign: '-2px', color: 'var(--mark-color)' }}><CompassMark size={13} /></span>) in your Chrome toolbar. Click it → a popup appears.<br /><br />
                Paste one of these demo keys and click <strong style={{ color: 'var(--text-hi)' }}>Connect</strong>:
              </p>
              <CopyKeyPill name="SHOPIFY" code="ouija_demo_shopify_2025" label="Shopify → Meta Pixel" />
              <CopyKeyPill name="STRIPE" code="ouija_demo_stripe_2025" label="Stripe Payment Link" />
              <CopyKeyPill name="AWS" code="ouija_demo_aws_2025" label="AWS IAM Role" />
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">3</div>
            <div>
              <div className="step-title">Ouija greets you — right here</div>
              <p className="step-body">
                A sidebar appears on the right side of this page. You&apos;ll see a 👋 waving hand and a color pulse across the page — that&apos;s Ouija confirming the overlay is working.<br /><br />
<span style={{ display: 'inline-block', marginTop: 6, padding: '8px 14px', borderRadius: 10, background: 'var(--mark-bg)', border: '1px solid var(--mark-border)', color: 'var(--text-hi)', fontWeight: 600 }}>Press <span className="kbd">`</span> (backtick) anytime to show/hide the sidebar.</span>
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">4</div>
            <div>
              <div className="step-title">Follow the guided onboarding flow</div>
              <p className="step-body">
                Ouija will navigate you through the full setup journey. It highlights elements,
                tells you exactly what to click, and verifies each step. At the end, check the{' '}
                <a href="/admin" className="skip-link" style={{ fontWeight: 600 }}>admin panel</a> to see your own completed session.
              </p>
            </div>
          </div>
        </div>

        <p className="skip-note">
          Don&apos;t want to set it up?{' '}
          <a href="#" className="skip-link">Watch the video ↑</a>
        </p>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="ouija-footer">
        <p><span className="accent">✦ Ouija</span> · SuperAI NEXT Hackathon 2026 · AWS + Vercel</p>
      </footer>
    </>
  );
}

// ── Carousel data ──────────────────────────────────────────────────────────

const CAROUSEL_CARDS: BrowserMockupProps[] = [
  { url: 'app.shopify.com/admin/home', navBg: '#f2f2f0', bg: '#fff', ctaBg: '#1a8052', ctaLabel: 'Connect channel', step: '3/6', nodes: [1, 1, 0, 0, 0, 0], msg: <>Click the <b>Connect channel</b> button — I&apos;ve highlighted it.</> },
  { url: 'app.shopify.com/admin/settings', navBg: '#f2f2f0', bg: '#fff', ctaBg: '#1a8052', ctaLabel: 'Save changes', step: '4/6', nodes: [1, 1, 1, 0, 0, 0], msg: <>Click <b>Save changes</b> to confirm.</> },
  { url: 'business.facebook.com/events-manager', navBg: '#e4e6eb', bg: '#f0f2f5', ctaBg: '#1877f2', ctaLabel: 'Add pixel', step: '5/6', nodes: [1, 1, 1, 1, 0, 0], msg: <>Click <b>Add pixel</b> in the sources panel.</> },
  { url: 'dashboard.stripe.com/webhooks', navBg: '#f0f3f8', bg: '#f6f9fc', ctaBg: '#5469d4', ctaLabel: 'Add endpoint', step: '2/5', nodes: [1, 0, 0, 0, 0], msg: <>Click <b>Add endpoint</b> to register your URL.</> },
  { url: 'app.shopify.com/admin/apps/ouija', navBg: '#f2f2f0', bg: '#fff', ctaBg: '#1a8052', ctaLabel: 'Enable pixel', step: '6/6', nodes: [1, 1, 1, 1, 1, 0], msg: <>Toggle <b>Enable pixel</b> — almost done.</> },
];

// ── Browser mockup component ───────────────────────────────────────────────

interface BrowserMockupProps {
  url: string;
  navBg?: string;
  bg?: string;
  ctaBg?: string;
  ctaLabel: string;
  step: string;
  nodes: number[];
  msg: React.ReactNode;
}

function BrowserMockup({ url, navBg = '#f2f2f0', bg = '#fff', ctaBg = '#1a8052', ctaLabel, step, nodes, msg }: BrowserMockupProps) {
  return (
    <div className="bc">
      <div className="bc-bar">
        <div className="bc-lights">
          <span className="bc-r" /><span className="bc-y" /><span className="bc-g" />
        </div>
        <div className="bc-url">{url}</div>
      </div>
      <div className="bc-body">
        {/* Host page */}
        <div className="hp" style={{ '--hp-nav-bg': navBg, '--hp-bg': bg, '--hp-cta-bg': ctaBg, '--hp-ni-hi': ctaBg.replace(')', ',.14)').replace('rgb', 'rgba').replace('#', '') } as React.CSSProperties}>
          <div className="hp-nav" style={{ background: navBg }}>
            <div className="hp-logo" style={{ background: `${ctaBg}30` }} />
            <div className="hp-ni hi" style={{ background: `${ctaBg}1a` }} />
            <div className="hp-ni" /><div className="hp-ni" />
            <div className="hp-ni" /><div className="hp-ni" />
          </div>
          <div className="hp-main" style={{ background: bg }}>
            <div className="hp-h" />
            <div className="hp-b w9" /><div className="hp-b w8" />
            <div className="hp-b w6" /><div className="hp-b w9" />
            <div className="hp-cta" style={{ background: ctaBg }}>{ctaLabel}</div>
          </div>
        </div>
        {/* Ouija sidebar mock */}
        <div className="om">
          <div className="om-head">
            <div className="om-mark"><CompassMark size={14} /></div>
            <div>
              <span className="om-name">Ouija</span>
              <span className="om-step">guided setup</span>
            </div>
            <span className="om-counter">{step}</span>
          </div>
          <div className="om-nodes">
            {nodes.map((s, i) => (
              <span key={i}>
                {i > 0 && <span className={`on-seg${s === 1 && nodes[i - 1] === 1 ? ' d' : ''}`} />}
                <span className={`on ${s === 1 ? 'd' : i === nodes.indexOf(0) ? 'n' : 'f'}`} />
              </span>
            ))}
          </div>
          <div className="om-body">
            <div className="ob ai">{msg}</div>
            <div className="ob sys">✓ Step verified</div>
          </div>
          <div className="om-foot">
            <div className="ob-btn">Done ✓</div>
            <div className="ob-btn sec">Check</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyKeyPill({ name, code, label }: { name: string; code: string; label: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="key-pill" style={{ marginTop: 8 }}>
      <span className="key-code" style={{ fontWeight: 800, letterSpacing: '.08em' }}>{name}</span>
      <span className="key-label">{label}</span>
      <button
        onClick={handleCopy}
        style={{
          marginLeft: 'auto', padding: '6px 16px', borderRadius: 999,
          fontSize: 11, fontWeight: 800, cursor: 'pointer',
          color: copied ? 'var(--success)' : 'oklch(0.50 0.17 47)',
          background: copied ? 'oklch(0.56 0.15 150/.10)' : 'var(--mark-bg)',
          border: `1px solid ${copied ? 'oklch(0.56 0.15 150/.30)' : 'var(--mark-border)'}`,
          transition: 'all .22s cubic-bezier(0.34,1.32,0.64,1)',
          transform: copied ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        {copied ? '✓ Copied!' : 'Copy'}
      </button>
    </div>
  );
}
