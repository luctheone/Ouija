'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import CompassMark from '@/components/CompassMark';
import GraphEditor from '@/components/GraphEditor';
import JourneyTree from '@/components/JourneyTree';
import '@/components/journey-tree.css';
import '../admin.css';

type Tab = 'analytics' | 'journey' | 'docs';

interface Company { id: string; name: string; site: string; status: string; session_count: number; api_key?: string; }
interface Doc { id: string; site: string; task: string; content: string; graph_template: any; created_at: string; }
interface SessionData { id: string; device_id: string; status: string; started_at: string; events: any[]; }
interface Stats { total: number; completed: number; abandoned: number; active: number; }

export default function CompanyConsolePage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, abandoned: 0, active: 0 });
  const [tab, setTab] = useState<Tab>('analytics');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { if (companyId) fetchData(); }, [companyId]);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setCompany(data.company);
      setDocs(data.docs || []);
      setSessions(data.sessions || []);
      setStats(data.stats);
    } catch { /* */ }
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, company_id: companyId }),
      });

      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = '';
      setChatMessages(prev => [...prev, { role: 'ai', text: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiText += decoder.decode(value, { stream: true });
        setChatMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'ai', text: aiText };
          return updated;
        });
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong — try again.' }]);
    }
    setChatLoading(false);
  }

  // Doc add form state
  const [showDocForm, setShowDocForm] = useState(false);
  const [docTask, setDocTask] = useState('');
  const [docContent, setDocContent] = useState('');

  async function addDoc() {
    if (!docTask || !docContent || !company) return;
    await fetch(`/api/admin/companies/${companyId}/docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ site: company.site, task: docTask, content: docContent }),
    });
    setDocTask(''); setDocContent(''); setShowDocForm(false);
    fetchData();
  }

  // Welcome message form
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [welcomeSaving, setWelcomeSaving] = useState(false);

  useEffect(() => {
    const gDoc = docs.find(d => d.graph_template);
    if (gDoc?.graph_template?.welcome_message) {
      setWelcomeMessage(gDoc.graph_template.welcome_message);
    }
  }, [docs]);

  async function saveWelcomeMessage() {
    const gDoc = docs.find(d => d.graph_template);
    if (!gDoc || !company) return;
    setWelcomeSaving(true);
    try {
      await fetch(`/api/admin/companies/${companyId}/docs/${gDoc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          graph_template: { ...gDoc.graph_template, welcome_message: welcomeMessage },
        }),
      });
      await fetchData();
    } catch { /* */ }
    setWelcomeSaving(false);
  }

  // Breakpoint form (structured)
  const [bpNode, setBpNode] = useState('');
  const [bpFailure, setBpFailure] = useState('');
  const [bpSymptoms, setBpSymptoms] = useState('');
  const [bpFix, setBpFix] = useState('');
  const [bpSeverity, setBpSeverity] = useState<'simple' | 'complex'>('simple');

  async function addBreakpoint() {
    if (!bpNode || !bpFailure || !company) return;
    const flow = docs.find(d => d.graph_template)?.task || 'default';
    const content = JSON.stringify({
      common_failure: bpFailure,
      symptoms: bpSymptoms,
      suggested_fix: bpFix,
      severity: bpSeverity,
    });
    await fetch(`/api/admin/companies/${companyId}/breakpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ site: company.site, flow, node_id: bpNode, content }),
    });
    setBpNode(''); setBpFailure(''); setBpSymptoms(''); setBpFix(''); setBpSeverity('simple');
    fetchData();
  }

  if (!company) return <div className="page"><div className="ouija-loader" style={{ paddingTop: 120 }}><div className="ouija-loader-ring" /><span className="ouija-loader-text">Loading company</span></div></div>;

  const graphDoc = docs.find(d => d.graph_template);
  const graphNodes = graphDoc?.graph_template?.nodes || [];
  const breakpointDocs = docs.filter(d => {
    if (!d.task.includes(':')) return false;
    try { const p = JSON.parse(d.content); return !!p.common_failure; } catch { return false; }
  });
  const nodeDocs = docs.filter(d => {
    if (!d.task.includes(':')) return false;
    try { JSON.parse(d.content); return false; } catch { return true; }
  });
  const generalDocs = docs.filter(d => !d.task.includes(':') && !d.graph_template);

  return (
    <div className="page">
      {/* Company header */}
      <div className="admin-head">
        <div className="admin-id">
          <a href="/admin" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: 13, marginRight: 12 }}>← Back</a>
          <div className="admin-mark"><CompassMark size={20} /></div>
          <div>
            <div className="admin-title">{company.name}</div>
            <div className="admin-sub">{company.site} · {company.status}</div>
          </div>
        </div>
      </div>

      {/* API Key card */}
      <div className="glass" style={{ padding: '16px 22px', borderRadius: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Extension API Key</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-lo)' }}>
            Share this key with end users to connect them to this company&apos;s guided flow.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <code style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--mark-color)', padding: '6px 12px', borderRadius: 8, background: 'var(--mark-bg)', border: '1px solid var(--mark-border)' }}>
            {company.api_key || 'generating...'}
          </code>
          <button
            onClick={() => {
              if (company.api_key) navigator.clipboard.writeText(company.api_key);
            }}
            style={{ padding: '6px 12px', borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer', color: 'var(--btn-text)', background: 'var(--btn-bg)', border: '1px solid var(--btn-border)', transition: 'all .15s' }}
          >
            Copy
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="console-tabs">
        <button className={`console-tab ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>Analytics</button>
        <button className={`console-tab ${tab === 'journey' ? 'active' : ''}`} onClick={() => setTab('journey')}>Journey Chart</button>
        <button className={`console-tab ${tab === 'docs' ? 'active' : ''}`} onClick={() => setTab('docs')}>Documentation</button>
      </div>

      {/* Tab content */}
      <div className="console-content">
        {tab === 'analytics' && (
          <>
            {/* Stats */}
            <div className="stats">
              <div className="stat-card glass">
                <div className="stat-label">Sessions</div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-sub">Total guided</div>
              </div>
              <div className="stat-card glass stat-success">
                <div className="stat-label">Completed</div>
                <div className="stat-value v-success">{stats.completed}</div>
                <div className="stat-sub">Finished</div>
              </div>
              <div className="stat-card glass stat-warn">
                <div className="stat-label">Abandoned</div>
                <div className="stat-value v-warn">{stats.abandoned}</div>
                <div className="stat-sub">Dropped off</div>
              </div>
              <div className="stat-card glass">
                <div className="stat-label">Active</div>
                <div className="stat-value">{stats.active}</div>
                <div className="stat-sub">In progress</div>
              </div>
            </div>

            {/* Sessions list */}
            <div className="glass" style={{ borderRadius: 18, padding: '22px 20px', marginTop: 12 }}>
              <div className="card-header"><span className="card-title">Recent sessions</span></div>
              {sessions.length > 0 ? sessions.slice(0, 8).map(s => (
                <div key={s.id} className="session-row">
                  <div className={`s-dot ${s.status === 'completed' ? 'done' : s.status === 'active' ? 'live' : 'stall'}`} />
                  <div className="s-info">
                    <div className="s-id">{s.device_id.slice(0, 12)}...</div>
                    <div className="s-meta">{s.status} · {new Date(s.started_at).toLocaleString()}</div>
                  </div>
                  <div className={`s-steps ${s.status === 'completed' ? 'done' : ''}`}>
                    {s.events?.length || 0} events
                  </div>
                </div>
              )) : (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No sessions yet.</p>
              )}
            </div>
          </>
        )}

        {tab === 'journey' && (
          <>
            {/* Welcome message */}
            {graphDoc && (
              <div className="glass" style={{ borderRadius: 16, padding: '20px 24px', marginBottom: 12 }}>
                <div className="card-header" style={{ marginBottom: 10 }}>
                  <span className="card-title">Welcome message</span>
                  <span className="card-meta">Shown when the sidebar first loads this graph</span>
                </div>
                <textarea
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  placeholder="Enter a welcome message shown before the first step..."
                  className="console-input"
                  style={{ width: '100%', minHeight: 80, resize: 'vertical', marginBottom: 10 }}
                />
                <button onClick={saveWelcomeMessage} className="create-btn" disabled={welcomeSaving}>
                  {welcomeSaving ? 'Saving...' : 'Save welcome message'}
                </button>
              </div>
            )}

            {/* Read-only flow visualization (the journey at a glance, above the editor) */}
            {(() => {
              const gt = graphDoc?.graph_template;
              if (!gt?.nodes?.length) return null;
              return (
                <div className="glass" style={{ padding: '18px 20px', borderRadius: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                    Flow preview
                  </div>
                  <JourneyTree graph={gt} position={gt.nodes[0]?.id || ''} />
                </div>
              );
            })()}

            {/* Journey graph editor */}
            <div style={{ marginBottom: 12 }}>
              <GraphEditor
                graph={graphDoc?.graph_template || null}
                breakpoints={breakpointDocs}
                welcomeMessage={welcomeMessage}
                onSave={async (graph) => {
                  const res = graphDoc
                    ? await fetch(`/api/admin/companies/${companyId}/docs/${graphDoc.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ graph_template: graph }),
                      })
                    : await fetch(`/api/admin/companies/${companyId}/docs`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          site: company.site,
                          task: 'default',
                          content: '',
                          graph_template: graph,
                        }),
                      });
                  // Surface failures to the editor (which shows a save-error state)
                  // instead of silently clearing the dirty flag.
                  if (!res.ok) throw new Error('Graph save failed');
                  await fetchData();
                }}
              />
            </div>

            {/* Add breakpoint — structured */}
            <div className="glass" style={{ borderRadius: 16, padding: '20px 24px' }}>
              <div className="card-header" style={{ marginBottom: 12 }}>
                <span className="card-title">Add breakpoint</span>
                <span className="card-meta">Common failure points + recovery instructions</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={bpNode} onChange={e => setBpNode(e.target.value)} className="console-input" style={{ width: 200 }}>
                    <option value="">Select node...</option>
                    {graphNodes.map((n: any) => <option key={n.id} value={n.id}>{n.id}: {n.instruction?.slice(0, 30)}</option>)}
                  </select>
                  <select value={bpSeverity} onChange={e => setBpSeverity(e.target.value as 'simple' | 'complex')} className="console-input" style={{ width: 120 }}>
                    <option value="simple">Simple</option>
                    <option value="complex">Complex</option>
                  </select>
                </div>
                <input value={bpFailure} onChange={e => setBpFailure(e.target.value)} placeholder="What goes wrong? (e.g. 'Button not visible')" className="console-input" />
                <input value={bpSymptoms} onChange={e => setBpSymptoms(e.target.value)} placeholder="What does the user see? (e.g. 'Page shows loading spinner')" className="console-input" />
                <input value={bpFix} onChange={e => setBpFix(e.target.value)} placeholder="Suggested fix (e.g. 'Scroll down — the button is below the fold')" className="console-input" />
                <button onClick={addBreakpoint} className="create-btn" style={{ alignSelf: 'flex-start' }}>Add breakpoint</button>
              </div>
            </div>
          </>
        )}

        {tab === 'docs' && (
          <>
            {/* Doc list */}
            <div className="glass" style={{ borderRadius: 18, padding: '22px 24px', marginBottom: 12 }}>
              <div className="card-header" style={{ marginBottom: 16 }}>
                <span className="card-title">Documentation</span>
                <button onClick={() => setShowDocForm(!showDocForm)} className="add-company-btn" style={{ position: 'relative', right: 0 }}>+ Add doc</button>
              </div>
              {generalDocs.length > 0 ? generalDocs.map(d => (
                <div key={d.id} className="session-row">
                  <div className="s-dot done" />
                  <div className="s-info">
                    <div className="s-id">{d.task}</div>
                    <div className="s-meta">{d.site} · {d.content.length.toLocaleString()} chars</div>
                  </div>
                  <div className="s-steps">{d.graph_template ? '📊 Graph' : '📄 Doc'}</div>
                </div>
              )) : (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No documentation added yet.</p>
              )}
            </div>

            {/* Add doc form */}
            {showDocForm && (
              <div className="glass" style={{ borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={docTask} onChange={e => setDocTask(e.target.value)} placeholder="Task key (e.g. meta-pixel-connect)" className="console-input" style={{ flex: 1 }} />
                    {graphNodes.length > 0 && (
                      <select
                        className="console-input"
                        style={{ width: 200 }}
                        onChange={e => {
                          if (e.target.value) {
                            const flow = docs.find(d => d.graph_template)?.task || 'default';
                            setDocTask(`${flow}:${e.target.value}`);
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="">Attach to node (optional)</option>
                        {graphNodes.map((n: any) => <option key={n.id} value={n.id}>{n.id}: {n.instruction?.slice(0, 25)}</option>)}
                      </select>
                    )}
                  </div>
                  <textarea value={docContent} onChange={e => setDocContent(e.target.value)} placeholder="Paste documentation content here..." className="console-input" style={{ minHeight: 120, resize: 'vertical' }} />
                  <button onClick={addDoc} className="create-btn" style={{ alignSelf: 'flex-start' }}>Save documentation</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Persistent chatbot */}
      <div className="chat-card glass glint" style={{ marginTop: 16 }}>
        <div className="chat-head">
          <div className="chat-mark"><CompassMark size={16} /></div>
          <div>
            <div className="chat-title">Synthesis agent</div>
            <div className="chat-sub">Query {company.name}&apos;s onboarding data</div>
          </div>
        </div>
        {chatMessages.length > 0 && (
          <div className="chat-msgs" style={{ maxHeight: 200, overflowY: 'auto' }}>
            {chatMessages.map((m, i) => (
              <div key={i} className={`chat-bub ${m.role === 'user' ? 'chat-bub-user' : ''}`}>
                {m.text || (chatLoading && i === chatMessages.length - 1 ? '...' : '')}
              </div>
            ))}
            <div ref={chatEnd} />
          </div>
        )}
        <div className="chat-input-row">
          <input
            className="chat-input"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendChat()}
            placeholder="Where are users getting stuck?"
          />
          <button onClick={sendChat} className="chat-send" disabled={chatLoading}>
            {chatLoading ? '...' : 'Ask'}
          </button>
        </div>
      </div>
    </div>
  );
}
