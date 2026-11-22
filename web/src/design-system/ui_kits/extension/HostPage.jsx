/* Generic, made-up third-party host sites the user is being guided through.
   Intentionally NOT a recreation of any real product — Ouija is brand-neutral
   and must sit on top of *anything*. Two looks: a store admin and an ads manager. */
import React from 'react';

const STYLE_ID = 'ouija-host-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .host { position: absolute; inset: 0; display: grid; grid-template-columns: 232px 1fr;
    font-family: 'Manrope', system-ui, sans-serif; background: #f3f4f7; color: #3a3f4b; overflow: hidden; }
  .host__nav { background: #fff; border-right: 1px solid #e8eaef; padding: 20px 16px; display: flex; flex-direction: column; gap: 4px; }
  .host__brand { display:flex; align-items:center; gap:10px; padding: 4px 8px 18px; font-weight: 800; font-size: 16px; color:#1f2430; }
  .host__brand .logo { width: 26px; height: 26px; border-radius: 8px; display:grid; place-items:center; color:#fff; font-size:14px; }
  .host__navitem { display:flex; align-items:center; gap:11px; padding: 9px 11px; border-radius: 9px; font-size: 14px; font-weight: 600; color:#5b6170; cursor: default; }
  .host__navitem .ic { width:18px;height:18px; opacity:.7; }
  .host__navitem.active { background:#eef1f8; color:#1f2430; }
  .host__navitem .dot { width:7px;height:7px;border-radius:50%;background:#cfd5e0;margin-left:auto; }

  .host__main { padding: 26px 34px; overflow: hidden; }
  .host__top { display:flex; align-items:center; justify-content:space-between; margin-bottom: 24px; }
  .host__h1 { font-size: 24px; font-weight: 800; color:#1f2430; letter-spacing:-0.02em; }
  .host__crumb { font-size:13px; color:#8a91a0; font-weight:600; }
  .host__actions { display:flex; gap:10px; }
  .host__btn { border:none; border-radius:9px; font-family:inherit; font-weight:700; font-size:13.5px; padding:9px 16px; cursor:default; }
  .host__btn--ghost { background:#fff; color:#5b6170; border:1px solid #e2e5ec; }

  .host__grid { display:grid; grid-template-columns: 1fr 1fr; gap:18px; }
  .host__card { background:#fff; border:1px solid #e8eaef; border-radius:14px; padding:20px; }
  .host__card h3 { margin:0 0 6px; font-size:15px; font-weight:700; color:#1f2430; }
  .host__card p { margin:0; font-size:13px; color:#8a91a0; line-height:1.5; }
  .host__stat { font-size:30px; font-weight:800; color:#1f2430; margin-top:10px; letter-spacing:-0.02em; }
  .host__skel { height:11px;background:#edeef2;border-radius:6px;margin-top:10px;}
  .host__skel.s2{width:70%}

  /* ads-manager skin */
  .host--ads { background:#f5f6f8; }
  .host--ads .host__nav { background:#101522; border-right-color:#1c2436; }
  .host--ads .host__brand { color:#fff; }
  .host--ads .host__navitem { color:#9aa3b8; }
  .host--ads .host__navitem.active { background:#1b2334; color:#fff; }
  .host--ads .host__navitem .dot { background:#3a455e; }
  `;
  document.head.appendChild(el);
}

const Box = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="ic" {...p}/>;

export function HostPage({ site = 'store', activeNav, targets = {} }) {
  const isAds = site === 'ads';
  const nav = isAds
    ? ['Overview', 'Campaigns', 'Audiences', 'Data sources', 'Settings']
    : ['Home', 'Orders', 'Products', 'Customers', 'Settings'];
  const reg = (id) => (node) => { if (node) targets[id] = node; };

  return (
    <div className={`host ${isAds ? 'host--ads' : ''}`}>
      <aside className="host__nav">
        <div className="host__brand">
          <span className="logo" style={{ background: isAds ? '#5b8cff' : '#1f9e78' }}>{isAds ? 'B' : 'N'}</span>
          {isAds ? 'Beacon Ads' : 'Northwind'}
        </div>
        {nav.map((label) => {
          const active = label === activeNav;
          const isTarget = (isAds && label === 'Data sources') || (!isAds && label === 'Settings');
          return (
            <div key={label} ref={isTarget ? reg('nav') : null}
                 className={`host__navitem ${active ? 'active' : ''}`}>
              <Box><rect x="3" y="3" width="18" height="18" rx="4"/></Box>
              {label}
              {active && <span className="dot" style={{ background: '#7174ee' }} />}
            </div>
          );
        })}
      </aside>

      <main className="host__main">
        <div className="host__top">
          <div>
            <div className="host__crumb">{isAds ? 'Beacon Ads' : 'Northwind'} · {activeNav}</div>
            <div className="host__h1">{isAds ? 'Data sources' : activeNav}</div>
          </div>
          <div className="host__actions">
            <button className="host__btn host__btn--ghost">Help</button>
            <button ref={reg('cta')} className="host__btn"
              style={{ background: isAds ? '#5b8cff' : '#1f9e78', color: '#fff' }}>
              {isAds ? 'Connect a website' : 'Save'}
            </button>
          </div>
        </div>

        <div className="host__grid">
          <div className="host__card"><h3>{isAds ? 'Website events' : 'Today\u2019s orders'}</h3>
            <p>{isAds ? 'Track visits and purchases from your store.' : 'Across all sales channels.'}</p>
            <div className="host__stat">{isAds ? '—' : '128'}</div></div>
          <div className="host__card"><h3>{isAds ? 'Pixel status' : 'Revenue'}</h3>
            <p>{isAds ? 'No pixel connected yet.' : 'Last 7 days.'}</p>
            <div className="host__stat">{isAds ? 'Off' : '$8.4k'}</div></div>
          <div className="host__card" style={{ gridColumn: '1 / -1' }}>
            <h3>{isAds ? 'Setup checklist' : 'Recent activity'}</h3>
            <div className="host__skel"></div><div className="host__skel s2"></div><div className="host__skel"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
