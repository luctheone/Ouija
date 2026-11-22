export default function PricingPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '128px 32px 96px', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p className="section-eyebrow">Pricing · metered billing via</p>
        <div style={{ fontSize: 'clamp(2.6rem,6vw,3.8rem)', fontWeight: 800, letterSpacing: '-0.045em', color: '#635bff', lineHeight: 1 }}>stripe</div>
      </div>

      {/* Single box */}
      <div className="glass glint" style={{ borderRadius: 24, padding: '44px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'var(--mark-bg)', border: '1px solid var(--mark-border)', marginBottom: 26 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--mark-color)' }} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mark-color)' }}>Usage-based</span>
        </div>

        <h2 style={{ fontSize: 'clamp(1.7rem,3.2vw,2.3rem)', fontWeight: 800, letterSpacing: '-.025em', color: 'var(--text-hi)', marginBottom: 18 }}>
          Pay per onboarding
        </h2>

        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.72, color: 'var(--text-md)', maxWidth: 500, marginBottom: 30 }}>
          Ouija gives you transparency into the entire user journey &amp; proof that we&apos;re actively
          exterminating churn.{' '}
          <strong style={{ color: 'var(--text-hi)', fontWeight: 700 }}>Only pay when we actually save you lost money.</strong>
        </p>

        {/* Billing formula */}
        <div style={{ width: '100%', maxWidth: 500, padding: '22px', borderRadius: 16, background: 'linear-gradient(165deg, var(--espresso) 0%, var(--espresso-deep) 100%)', border: '1px solid oklch(0.62 0.12 56 / 0.40)', marginBottom: 30, boxShadow: 'var(--shadow-card)' }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--amber-glow)', marginBottom: 12 }}>How billing works</p>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(13px,2.4vw,15px)', fontWeight: 600, color: 'var(--on-espresso-hi)', lineHeight: 1.6 }}>
            bespoke&nbsp;cost <span style={{ color: 'var(--amber-glow)', fontWeight: 800 }}>×</span> successful&nbsp;onboards <span style={{ color: 'var(--on-espresso)' }}>/&nbsp;month</span>
          </p>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--on-espresso)', marginTop: 10 }}>
            Stripe bills you on this formula — metered per completed journey.
          </p>
        </div>

        <a href="/#setup" className="hero-btn" style={{ fontSize: 14, padding: '13px 40px' }}>Demo Ouija! →</a>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginTop: 18, maxWidth: 460, lineHeight: 1.6 }}>
          Every billed onboarding is verifiable in your admin journey-graph ledger — auditable, transparent.
        </p>
      </div>
    </div>
  );
}
