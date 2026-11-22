import React from 'react';
import { HostPage } from './HostPage.jsx';
import { SidebarPanel } from '../../components/surfaces/SidebarPanel.jsx';
import { MessageBubble } from '../../components/surfaces/MessageBubble.jsx';
import { GlassInput } from '../../components/forms/GlassInput.jsx';
import { Spotlight } from '../../components/overlay/Spotlight.jsx';
import { Pointer } from '../../components/overlay/Pointer.jsx';
import { Coachmark } from '../../components/overlay/Coachmark.jsx';

/* The scripted journey: guiding the user to connect "Beacon Ads" to their
   "Northwind" store — hopping between two host sites, the heart of Ouija. */
const STEPS = [
  {
    site: 'store', nav: 'Home', target: 'nav', point: 'right',
    msg: "Let\u2019s connect Beacon Ads to your store. First, open <b>Settings</b> in the left menu.",
    coach: { arrow: 'right', html: 'Open <b>Settings</b> \u2192' },
    advance: 'I opened Settings',
  },
  {
    site: 'store', nav: 'Settings', target: 'cta', point: 'left',
    msg: "Perfect. Now <b>Save</b> to make sure your store info is up to date.",
    coach: { arrow: 'up', html: 'Click <b>Save</b>' },
    advance: 'Done — what\u2019s next?',
  },
  {
    site: 'store', nav: 'Settings', target: null,
    msg: "Saved. Switch over to your <b>Beacon Ads</b> tab and let me know when you\u2019re there.",
    advance: 'I\u2019m on Beacon Ads',
  },
  {
    site: 'ads', nav: 'Data sources', target: 'cta', point: 'left',
    msg: "Great \u2014 we\u2019re in Beacon Ads. Click <b>Connect a website</b> to add a new pixel.",
    coach: { arrow: 'up', html: 'Click <b>Connect a website</b>' },
    advance: 'I clicked it',
  },
  {
    site: 'ads', nav: 'Data sources', target: null, input: true,
    msg: "Which store should I connect? Pop in your domain and I\u2019ll match it.",
    advance: 'Connect it',
  },
  {
    site: 'ads', nav: 'Data sources', target: 'cta', point: 'left',
    msg: "Here\u2019s your Pixel ID. Copy it, then head back to Northwind and paste it under <b>Settings \u203a Customer events</b>.",
    coach: { arrow: 'up', html: 'Paste this into <b>Customer events</b>', copy: 'px_8f3c20a91b4e' },
    advance: 'Pasted it',
  },
  {
    site: 'ads', nav: 'Data sources', target: null, success: true,
    msg: "Your pixel is connected \u2014 nicely done. You\u2019re all set to track sales.",
    advance: 'Finish',
    done: true,
  },
];

export function OuijaExtension() {
  const [step, setStep] = React.useState(0);
  const [collapsed, setCollapsed] = React.useState(false);
  const [thinking, setThinking] = React.useState(false);
  const [rect, setRect] = React.useState(null);
  const stageRef = React.useRef(null);
  const targetsRef = React.useRef({});

  const s = STEPS[step];
  const total = STEPS.length - 1; // last is the success cap

  // measure the active target relative to the stage
  React.useLayoutEffect(() => {
    let raf2;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!s.target || !stageRef.current) { setRect(null); return; }
        const node = targetsRef.current[s.target];
        if (!node) { setRect(null); return; }
        const c = stageRef.current.getBoundingClientRect();
        const r = node.getBoundingClientRect();
        setRect({ top: r.top - c.top, left: r.left - c.left, w: r.width, h: r.height });
      });
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [step]);

  const advance = () => {
    if (s.done) { setStep(0); return; }
    setThinking(true);
    setTimeout(() => { setThinking(false); setStep((n) => Math.min(n + 1, STEPS.length - 1)); }, 650);
  };

  const PAD = 7;
  return (
    <div ref={stageRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <HostPage site={s.site} activeNav={s.nav} targets={targetsRef.current} key={s.site + s.nav} />

      {/* on-page overlay layer */}
      {!collapsed && rect && !thinking && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, pointerEvents: 'none' }}>
          <Spotlight radius={12}
            style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.w + PAD * 2, height: rect.h + PAD * 2 }} />
          {s.point === 'left' && (
            <Pointer direction="right" style={{ top: rect.top + rect.h / 2 - 17, left: rect.left - 50 }} />
          )}
          {s.point === 'right' && (
            <Pointer direction="right" style={{ top: rect.top + rect.h / 2 - 17, left: rect.left + rect.w + 16 }} />
          )}
          {s.coach && (
            <Coachmark arrow={s.coach.arrow} html={s.coach.html} copyValue={s.coach.copy}
              key={step}
              style={{ position: 'absolute',
                top: rect.top + rect.h + 20,
                left: Math.min(rect.left, (stageRef.current?.clientWidth || 900) - 320) }} />
          )}
        </div>
      )}

      {/* the floating Ouija sidebar */}
      <div style={{ position: 'absolute', top: 'var(--panel-margin)', right: 'var(--panel-margin)', bottom: 'var(--panel-margin)', zIndex: 60, display: 'flex', alignItems: collapsed ? 'flex-start' : 'stretch', pointerEvents: 'auto' }}>
        <SidebarPanel
          subtitle="Connect Beacon Ads"
          step={Math.min(step + 1, total)}
          totalSteps={total}
          collapsed={collapsed}
          thinking={thinking}
          advanceLabel={thinking ? 'One moment\u2026' : s.advance}
          onAdvance={advance}
          onCollapse={() => setCollapsed(true)}
          onExpand={() => setCollapsed(false)}
          style={collapsed ? undefined : { maxHeight: '100%' }}
        >
          <MessageBubble key={'m' + step} html={s.msg} variant={s.success ? 'success' : 'guidance'} animate />
          {s.input && (
            <div style={{ marginTop: 4 }}>
              <GlassInput label="Store domain" placeholder="store.example.com"
                defaultValue="northwind.shop" mono />
            </div>
          )}
        </SidebarPanel>
      </div>
    </div>
  );
}
