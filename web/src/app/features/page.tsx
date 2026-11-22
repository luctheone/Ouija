import CompassMark from '@/components/CompassMark';
import React from 'react';

export default function FeaturesPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '120px 32px 80px', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <p className="section-eyebrow">How it works</p>
        <h1 className="hero" style={{ padding: 0, fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, letterSpacing: '-.03em', color: 'var(--text-hi)', lineHeight: 1.1, maxWidth: 600, margin: '0 auto' }}>
          Built for the cross-site<br />
          <em>blind spot.</em>
        </h1>
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 12 }}>
        <FeatureCard
          icon={<CompassMark size={18} />}
          title="Selective agentic framework"
          description="One lean agent handles the known path — fast, single call per step. Complex reasoning only activates when genuinely needed: figuring out an unknown flow from scratch, or diagnosing a failure."
          tags={[{ label: 'Hot path', detail: 'single structured call' }, { label: 'Cold path', detail: 'iterative tool-use loop' }]}
        />
        <FeatureCard
          icon="◈"
          title="Visual journey graph"
          description="Every session is a stateful graph — nodes are actions, edges are transitions, forks are breakpoints. Visible to both end user and vendor admin. Persisted per session for aggregate intelligence."
          tags={[{ label: 'State, not search', detail: 'held in memory, mutated per step, never vector-searched' }]}
        />
        <FeatureCard
          icon="⚡"
          title="Failure detection & recovery"
          description="When expected state diverges from observed, the graph forks into red. A diagnosis agent investigates, hypothesizes what went wrong, and proposes a human-friendly recovery path."
          tags={[{ label: 'Graceful floor', detail: 'wrong pick costs seconds, not accounts' }]}
        />
        <FeatureCard
          icon="◆"
          title="Bespoke mode + admin intelligence"
          description="Vendors ingest documentation — Ouija retrieves it via metadata lookup for precision guidance. Admin panel visualizes sessions, success rates, and offers a synthesis chatbot."
          tags={[{ label: 'Warm', detail: 'metadata key lookup' }, { label: 'Cold', detail: 'Exa search for unknown SaaS' }]}
        />
      </div>

      {/* Principle callout */}
      <div className="glint" style={{ marginTop: 48, padding: '42px 32px', borderRadius: 20, textAlign: 'center', background: 'linear-gradient(165deg, var(--espresso) 0%, var(--espresso-deep) 100%)', boxShadow: 'var(--shadow-card-h)' }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--amber-glow)', marginBottom: 14 }}>
          Core principle
        </p>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 30, color: 'var(--on-espresso-hi)', marginBottom: 14 }}>
          &ldquo;Guide, never act.&rdquo;
        </p>
        <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.7, color: 'var(--on-espresso)', maxWidth: 460, margin: '0 auto' }}>
          Ouija operates in the user&apos;s real, sensitive accounts. It perceives, reasons,
          points, and verifies — every consequential action is performed by the human.
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, tags }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: { label: string; detail: string }[];
}) {
  return (
    <div className="glass" style={{ padding: '28px 26px', borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--mark-bg)', border: '1px solid var(--mark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mark-color)', fontSize: 15 }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-hi)', letterSpacing: '-.01em' }}>{title}</h2>
      <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.7, color: 'var(--text-lo)', flex: 1 }}>{description}</p>
      <div style={{ paddingTop: 14, borderTop: '1px solid oklch(1 0 0/.06)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tags.map((t) => (
          <span key={t.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
            <span style={{ padding: '2px 8px', borderRadius: 4, fontWeight: 700, color: 'var(--mark-color)', background: 'var(--mark-bg)', border: '1px solid var(--mark-border)' }}>
              {t.label}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{t.detail}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
