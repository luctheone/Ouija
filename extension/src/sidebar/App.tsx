import { useState, useEffect, useRef, useCallback } from 'react';
import React from 'react';

// ── Linkify + bold helper ────────────────────────────────────────────────────

function linkifyText(text: string): React.ReactNode {
  // Unwrap markdown bold around a bare URL (**http...**) so the asterisks don't bleed
  // into the href; bolding a link adds nothing visually anyway.
  text = text.replace(/\*\*\s*(https?:\/\/[^\s*]+)\s*\*\*/g, '$1');

  // Split on URLs and bold markdown
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const boldRegex = /\*\*(.+?)\*\*/g;

  // First pass: split by URLs
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    // Check if this part is a URL
    if (urlRegex.test(part)) {
      // Reset lastIndex after test
      urlRegex.lastIndex = 0;
      // Strip trailing markdown/punctuation that isn't part of the URL.
      const url = part.replace(/[*).,!?;:]+$/, '');
      const trailing = part.slice(url.length);
      return (
        <React.Fragment key={i}>
          <a
            href={url}
            className="ouija-link"
            onClick={(e) => {
              e.preventDefault();
              window.parent.postMessage({ type: 'NAVIGATE_TO', url }, '*');
            }}
          >
            {url}
          </a>
          {trailing}
        </React.Fragment>
      );
    }
    // Process bold within non-URL parts
    const boldParts = part.split(boldRegex);
    if (boldParts.length === 1) {
      return <React.Fragment key={i}>{part}</React.Fragment>;
    }
    // boldParts alternates: text, captured bold content, text, captured, ...
    return (
      <React.Fragment key={i}>
        {boldParts.map((bp, j) =>
          j % 2 === 1 ? <strong key={j}>{bp}</strong> : <React.Fragment key={j}>{bp}</React.Fragment>
        )}
      </React.Fragment>
    );
  });
}

interface GraphNode {
  id: string;
  site: string;
  selector_hint: string;
  instruction: string;
  verify_condition: string;
  confidence?: number;
}

interface GraphEdge {
  from: string;
  to: string;
  condition?: string;
}

interface JourneyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  welcome_message?: string;
}

interface Fork {
  at: string;
  branch: GraphNode[];
  deadEnd: boolean;
  hypothesis?: string;
  recovery_instruction?: string;
}

interface GuidanceResult {
  elementIndex: number;
  tooltip: string;
  pointDirection: string;
  done: boolean;
  confidence: number;
}

interface VerifyResult {
  completed: boolean;
  evidence: string;
}

interface Message {
  id: string;
  role: 'ai' | 'user' | 'system' | 'agent-step';
  text: string;
}

type Status = 'idle' | 'ready' | 'loading' | 'analyzing' | 'found' | 'verifying' | 'diagnosing' | 'done' | 'complete' | 'error';

// Guard chrome.* access. After an extension reload, an orphaned sidebar iframe (from the old
// version, still living in an open tab) has its chrome APIs INVALIDATED — chrome.storage becomes
// undefined. An unguarded access then throws inside a React effect and white-screens the whole
// sidebar. This wrapper makes that degrade silently; the fix for the user is to refresh the tab.
function safeChrome(fn: () => void) {
  try { fn(); } catch { /* extension context invalidated — degrade silently */ }
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [graph, setGraph] = useState<JourneyGraph | null>(null);
  const [position, setPosition] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [status, setStatus] = useState<Status>('idle');
  const [graphPanelOpen, setGraphPanelOpen] = useState(false);
  const [clipboardOpen, setClipboardOpen] = useState(false);
  const [clipboardItems, setClipboardItems] = useState<{ label: string; value: string }[]>([]);

  // Persist clipboard to chrome.storage.session (survives tab switches, dies on browser close)
  useEffect(() => {
    safeChrome(() => chrome.storage.session.get(['ouija_clipboard_items'], (result) => {
      if (chrome.runtime.lastError) return;
      if (result.ouija_clipboard_items?.length) {
        setClipboardItems((prev) => {
          const seen = new Set(prev.map((i) => i.value));
          const additions = (result.ouija_clipboard_items as { label: string; value: string }[]).filter((i) => !seen.has(i.value));
          return additions.length === 0 ? prev : [...prev, ...additions];
        });
      }
    }));
  }, []);
  useEffect(() => {
    if (clipboardItems.length > 0) {
      // Stamp savedAt so the content script's TTL purge stays coherent regardless of which
      // context (sidebar vs content) wrote last. Empty → cleared explicitly elsewhere.
      try { chrome.storage.session.set({ ouija_clipboard_items: clipboardItems, ouija_clipboard_savedAt: Date.now() }); } catch {}
    }
  }, [clipboardItems]);
  const [forks, setForks] = useState<Fork[]>([]);
  const [agentStep, setAgentStep] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [backendUrl, setBackendUrl] = useState('');
  const [ouijaToken, setOuijaToken] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatStreaming, setChatStreaming] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const currentNode = graph?.nodes.find((n) => n.id === position) ?? null;
  const currentIndex = graph?.nodes.findIndex((n) => n.id === position) ?? -1;

  // B4 — contextual "what to do before Done" subtext. The Done click is a real, required step
  // (verification gate), but users (even the founder) forget its precondition — especially on
  // a "go to a website" step where they navigate away and don't know to come back and confirm.
  // So we surface a step-specific reminder right above the Done button.
  const doneHintText = (() => {
    if (!currentNode) return '';
    const domain = (currentNode.site || '').replace(/^https?:\/\//, '').split('/')[0];
    const instr = currentNode.instruction || '';
    const isNav = /\b(go to|navigate|open|head (to|over|back)|visit|switch to|return to|sign ?in|log ?in|continue to)\b/i.test(instr);
    if (isNav) {
      return domain
        ? `Head to ${domain} and do this, then come back and press Done ✓.`
        : `Once you're on the page and you've done this, press Done ✓.`;
    }
    return 'Done this on the page? Press Done ✓ to continue.';
  })();

  const addMessage = useCallback((role: Message['role'], text: string) => {
    setMessages((prev) => {
      const updated = [...prev, { id: String(Date.now() + Math.random()), role, text }];
      try { chrome.storage.session.set({ ouija_messages: updated.slice(-40) }); } catch {}
      return updated;
    });
  }, []);

  const setMessagesAndPersist = useCallback((msgs: Message[]) => {
    setMessages(msgs);
    try { chrome.storage.session.set({ ouija_messages: msgs.slice(-40) }); } catch {}
  }, []);

  // Load persisted messages + status on init
  useEffect(() => {
    try {
      chrome.storage.session.get(['ouija_messages', 'ouija_guidance_started', 'ouija_status'], (result) => {
        if (result.ouija_messages && result.ouija_messages.length > 0) {
          setMessages(result.ouija_messages);
        }
        if (result.ouija_guidance_started) {
          setStatus(result.ouija_status || 'found');
        }
      });
    } catch {}
  }, []);

  // Cross-tab sync: listen for storage changes from other tabs
  useEffect(() => {
    function onStorageChanged(changes: { [key: string]: chrome.storage.StorageChange }, area: string) {
      if (area !== 'session') return;
      if (changes.ouija_messages?.newValue) {
        setMessages(changes.ouija_messages.newValue);
      }
      if (changes.ouija_status?.newValue) {
        setStatus(changes.ouija_status.newValue);
      }
      // Keep the header badge / item list in sync when another tab copies something.
      // MERGE (union), never replace — the content script and this sidebar both persist to
      // this key, and two near-simultaneous copies (the AWS "Copy credentials" button) can
      // momentarily write a single-item array. Replacing with it would drop the other
      // credential, which a fresh content script then reads on the next page. Only ADD;
      // clear only on an explicit removal (e.g. reconnect clears the session key).
      if (changes.ouija_clipboard_items) {
        const next = changes.ouija_clipboard_items.newValue as { label: string; value: string }[] | undefined;
        if (!next || next.length === 0) {
          setClipboardItems((prev) => (prev.length === 0 ? prev : []));
        } else {
          setClipboardItems((prev) => {
            const seen = new Set(prev.map((i) => i.value));
            const additions = next.filter((i) => !seen.has(i.value));
            return additions.length === 0 ? prev : [...prev, ...additions];
          });
        }
      }
    }
    try { chrome.storage.onChanged.addListener(onStorageChanged); } catch {}
    return () => { try { chrome.storage.onChanged.removeListener(onStorageChanged); } catch {} };
  }, []);

  // Persist only STABLE statuses. Transient in-flight states (analyzing/verifying/
  // diagnosing) own their recovery timeouts on `window`, which don't survive a tab
  // switch or reload — persisting them would strand another tab in a spinner with no
  // pending request and no timer.
  useEffect(() => {
    if (status === 'found' || status === 'complete' || status === 'error') {
      try { chrome.storage.session.set({ ouija_status: status }); } catch {}
    }
  }, [status]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pull the chameleon scheme once mounted (race-proof vs the content script's push-on-load).
  useEffect(() => {
    window.parent.postMessage({ type: 'REQUEST_THEME' }, '*');
  }, []);

  // Backtick closes sidebar even when iframe is focused
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== '`' || e.ctrlKey || e.metaKey || e.altKey) return;
      // Don't toggle if the chat input is focused
      const active = document.activeElement;
      if (
        active?.tagName === 'INPUT' ||
        active?.tagName === 'TEXTAREA' ||
        (active as HTMLElement)?.isContentEditable
      ) return;
      e.preventDefault();
      window.parent.postMessage({ type: 'TOGGLE_SIDEBAR_FROM_IFRAME' }, '*');
    }
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  useEffect(() => {
    safeChrome(() => chrome.storage.local.get(['ouija_backend_url', 'ouija_session', 'ouija_graph', 'ouija_position', 'ouija_demo_key_type', 'ouija_token'], (result) => {
      if (chrome.runtime.lastError) return;
      if (result.ouija_backend_url) setBackendUrl(result.ouija_backend_url);
      if (result.ouija_session) setSessionId(result.ouija_session);
      if (result.ouija_graph) setGraph(result.ouija_graph);
      if (result.ouija_position) setPosition(result.ouija_position);
      if (result.ouija_token) setOuijaToken(result.ouija_token);

      // Derive company name from demo_key_type or graph's first node site
      if (result.ouija_demo_key_type) {
        setCompanyName(result.ouija_demo_key_type.charAt(0).toUpperCase() + result.ouija_demo_key_type.slice(1));
      } else if (result.ouija_graph?.nodes?.[0]?.site) {
        const site = result.ouija_graph.nodes[0].site;
        if (site.includes('shopify')) setCompanyName('Shopify');
        else if (site.includes('facebook') || site.includes('meta')) setCompanyName('Meta');
        else if (site.includes('stripe')) setCompanyName('Stripe');
        else setCompanyName(site.split('.')[0].charAt(0).toUpperCase() + site.split('.')[0].slice(1));
      }

      // Check if guidance already started (persisted from another tab or previous page)
      chrome.storage.session.get(['ouija_messages', 'ouija_guidance_started'], (sessionResult) => {
        const hasPersistedMessages = sessionResult.ouija_messages && sessionResult.ouija_messages.length > 0;
        const guidanceStarted = sessionResult.ouija_guidance_started;

        if (hasPersistedMessages && guidanceStarted) {
          setStatus('found');
        } else if (result.ouija_graph && !guidanceStarted) {
          if (!hasPersistedMessages) {
            const welcome = result.ouija_graph.welcome_message || "I'm Ouija — I'll guide you step by step.";
            addMessage('ai', welcome);
          }
          // Auto-begin guidance — no button needed
          const firstNode = result.ouija_graph.nodes[0];
          setPosition(firstNode.id);
          chrome.storage.local.set({ ouija_position: firstNode.id });
          try { chrome.storage.session.set({ ouija_guidance_started: true }); } catch {}
          setStatus('found');
        } else if (guidanceStarted) {
          setStatus('found');
        }
      });
    }));
  }, [addMessage]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data?.type) return;

      switch (data.type) {
        case 'PAGE_CONTEXT':
          break;

        case 'THEME_SCHEME': {
          // UI chameleon: the content script matched the host page to a pre-set scheme and
          // sent its CSS custom properties. The whole sidebar palette derives from --ouija-h
          // (hue) and --ouija-c (chroma), so applying these re-tints everything at once.
          const vars = (data.vars || {}) as Record<string, string>;
          for (const [k, v] of Object.entries(vars)) {
            if (typeof v === 'string') document.documentElement.style.setProperty(k, v);
          }
          // Surface mode: light on a bright host, dark on a dark host. The .ouija-light
          // overrides in styles.css flip text + surfaces for legibility on the light glass.
          document.documentElement.classList.toggle('ouija-light', data.mode === 'light');
          break;
        }

        case 'CLIPBOARD_SAVE': {
          const { label, value } = data as { label: string; value: string };
          setClipboardItems(prev => {
            const exists = prev.some(i => i.value === value);
            if (exists) return prev;
            return [...prev, { label, value }];
          });
          setClipboardOpen(true);
          break;
        }

        case 'CLIPBOARD_PANEL_OPENED':
          setClipboardOpen(true);
          break;

        case 'CLIPBOARD_PANEL_CLOSED':
          setClipboardOpen(false);
          break;

        case 'ANALYSIS_STATUS':
          if (data.status === 'analyzing') setStatus('analyzing');
          // 'idle' = the content script found no interactive elements (page still
          // loading / empty view). Revert out of the spinner so the action buttons
          // reappear and the user isn't softlocked with no way forward.
          if (data.status === 'idle') setStatus((s) => (s === 'analyzing' ? 'found' : s));
          if (data.status === 'error') {
            setStatus('error');
            addMessage('system', 'Something went wrong — click "I\'m stuck" for help.');
          }
          break;

        case 'GUIDANCE_RESULT': {
          const result = data.result as GuidanceResult;
          setStatus('found');
          if (result.tooltip) addMessage('ai', result.tooltip);
          break;
        }

        case 'STEP_DONE':
          handleStepDone();
          break;

        case 'VERIFY_RESULT': {
          if ((window as any).__ouijaVerifyTimeout) { clearTimeout((window as any).__ouijaVerifyTimeout); (window as any).__ouijaVerifyTimeout = null; }
          const vr = data.result as VerifyResult;
          if (vr.completed) {
            addMessage('system', '✓ Verified');
            handleStepDone();
          } else {
            addMessage('ai', "Hmm, that doesn't look complete yet.");
            const node = graph?.nodes.find((n) => n.id === position);
            if (node) {
              // For non-URL conditions, retry with a screenshot for better visual verification
              const isUrlCondition = /URL contains/i.test(node.verify_condition || '');
              if (!isUrlCondition) {
                window.parent.postMessage(
                  { type: 'REQUEST_SCREENSHOT_CHAT', message: `I just attempted this step: "${node.instruction}". Look at my screen — did I complete it?` },
                  '*'
                );
              } else {
                addMessage('ai', "Take your time — I'll be here. Check the current step above for what you need to do.");
              }
            }
            setStatus('found');
          }
          break;
        }

        case 'DIAGNOSIS_RESULT': {
          handleDiagnosisResult(data.result);
          break;
        }

        case 'WRONG_PAGE': {
          const expectedSite = data.expected_site as string;
          const cleanSite = expectedSite.replace(/^https?:\/\//, '');
          addMessage('ai', `You need to navigate to ${cleanSite} for this step. Click here: https://${cleanSite}`);
          setStatus('found');
          break;
        }

        case 'CHAT_STREAM': {
          const streamText = data.text as string;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'ai' && last.id.startsWith('chat-stream-')) {
              return [...prev.slice(0, -1), { ...last, text: streamText }];
            }
            return [...prev, { id: `chat-stream-${Date.now()}`, role: 'ai', text: streamText }];
          });
          break;
        }

        case 'CHAT_DONE': {
          console.log('[Ouija Sidebar] Chat complete');
          setChatStreaming(false);
          if ((window as any).__ouijaChatTimeout) {
            clearTimeout((window as any).__ouijaChatTimeout);
            (window as any).__ouijaChatTimeout = null;
          }
          // Persist final messages including the completed stream
          setMessages((prev) => {
            try { chrome.storage.session.set({ ouija_messages: prev.slice(-40) }); } catch {}
            return prev;
          });
          break;
        }

        case 'GRAPH_PANEL_CLOSED': {
          setGraphPanelOpen(false);
          break;
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [graph, position, sessionId, backendUrl, addMessage]);

  async function startSession() {
    // Graph should already be loaded by popup connect flow
    // If not, try loading from storage
    if (graph) {
      setStatus('ready');
      return;
    }
    setStatus('loading');
    try {
      const stored = await new Promise<any>((resolve) => {
        chrome.storage.local.get(['ouija_graph', 'ouija_session', 'ouija_position'], resolve);
      });
      if (stored.ouija_graph) {
        setGraph(stored.ouija_graph);
        setSessionId(stored.ouija_session || '');
        setPosition(stored.ouija_position || stored.ouija_graph.nodes[0].id);
        setStatus('ready');
      } else {
        setStatus('error');
        addMessage('system', 'No flow loaded. Enter your API key in the extension popup first.');
      }
    } catch {
      setStatus('error');
      addMessage('system', 'Could not load session.');
    }
  }

  function beginGuidance() {
    if (!graph) return;
    dismissWelcome();
    const firstNode = graph.nodes[0];
    setPosition(firstNode.id);
    chrome.storage.local.set({ ouija_position: firstNode.id });
    try { chrome.storage.session.set({ ouija_guidance_started: true }); } catch {}
    setStatus('found');
    // Don't hardcode a message — request guidance from LLM based on current page
    requestGuidanceForNode(firstNode);
  }

  function requestGuidanceForNode(node: GraphNode) {
    window.parent.postMessage(
      { type: 'REQUEST_GUIDANCE', step_instruction: node.instruction, position: node.id },
      '*'
    );
  }

  function requestGuidance() {
    if (!currentNode) return;
    setStatus('analyzing');
    requestGuidanceForNode(currentNode);
  }

  async function requestDiagnosis(errorSignal: string) {
    if (!graph || !currentNode) return;

    setStatus('diagnosing');
    setAgentStep('Failure point detected');
    addMessage('agent-step', 'Failure point detected');

    await sleep(600);
    setAgentStep('Research agent running');
    addMessage('agent-step', 'Research agent searching for context...');

    await sleep(400);
    setAgentStep('Docs agent checking');
    addMessage('agent-step', 'Checking client documentation...');

    // Delegate to content script which has real DOM elements
    window.parent.postMessage(
      { type: 'REQUEST_DIAGNOSIS', error_signal: errorSignal },
      '*'
    );
  }

  function handleDiagnosisResult(result: any) {
    if (!result) {
      setAgentStep('');
      addMessage('system', 'Diagnosis failed — try again.');
      setStatus('error');
      return;
    }

    if (result.error) {
      setAgentStep('');
      addMessage('system', 'Diagnosis failed — try again.');
      setStatus('error');
      return;
    }

    if (result.severity === 'simple') {
      setAgentStep('');
      addMessage('ai', result.nudge);
      setStatus('found');
      return;
    }

    // Complex: show diagnosis flow
    setAgentStep('Diagnosis complete');
    addMessage('agent-step', 'Deploying suggested branch');

    // Add fork to state
    const newFork: Fork = {
      at: position,
      branch: result.fork.branch,
      deadEnd: result.fork.deadEnd,
      hypothesis: result.hypothesis,
      recovery_instruction: result.recovery_instruction,
    };
    setForks((prev) => [...prev, newFork]);

    // Show the recovery instruction
    addMessage('ai', result.recovery_instruction);

    // If not dead end, splice the recovery branch into the LIVE graph and move the
    // position onto it. Without this, position stays on the old stuck node, so
    // confirmStep would verify the wrong condition and handleStepDone would follow
    // the old node's edge — orphaning the recovery the agent just built.
    if (!result.fork.deadEnd && result.fork.branch.length > 0 && graph) {
      const branch = result.fork.branch as GraphNode[];
      const recoveryNode = branch[0];
      const existingIds = new Set(graph.nodes.map((n) => n.id));
      const newNodes = branch.filter((n: GraphNode) => !existingIds.has(n.id));
      // Fork edge off the stuck node, then chain the recovery steps.
      const branchEdges: GraphEdge[] = [{ from: position, to: recoveryNode.id, condition: 'recovery' }];
      for (let i = 0; i < branch.length - 1; i++) {
        branchEdges.push({ from: branch[i].id, to: branch[i + 1].id });
      }
      // Rejoin the main flow: after recovery, continue to wherever the stuck node was
      // originally headed — otherwise completing the recovery dead-ends the whole journey.
      const mainNext = graph.edges.find((e) => e.from === position && e.to !== recoveryNode.id)?.to;
      const lastBranchId = branch[branch.length - 1].id;
      if (mainNext && mainNext !== lastBranchId) {
        branchEdges.push({ from: lastBranchId, to: mainNext, condition: 'rejoin' });
      }
      const mergedGraph: JourneyGraph = {
        ...graph,
        nodes: [...graph.nodes, ...newNodes],
        edges: [...graph.edges, ...branchEdges],
      };
      setGraph(mergedGraph);
      setPosition(recoveryNode.id);
      chrome.storage.local.set({ ouija_graph: mergedGraph, ouija_position: recoveryNode.id });
      setStatus('found');
      requestGuidanceForNode(recoveryNode);
    } else {
      addMessage('ai', "I've hit a wall on this path. Let me know if you'd like to try something else.");
      setStatus('error');
    }

    setAgentStep('');
    // Auto-open graph panel to show the fork
    if (!graphPanelOpen) {
      setGraphPanelOpen(true);
      window.parent.postMessage({ type: 'TOGGLE_GRAPH_PANEL' }, '*');
    }
    // Push fork state to content script for the graph panel
    window.parent.postMessage({ type: 'GRAPH_FORKS_UPDATE', forks: [...forks, newFork] }, '*');
  }

  function dismissWelcome() {
    window.parent.postMessage({ type: 'DISMISS_WELCOME' }, '*');
  }

  function sendChat() {
    const text = chatInput.trim();
    if (!text || chatStreaming) return;
    console.log('[Ouija Sidebar] Sending chat:', text);
    dismissWelcome();
    addMessage('user', text);
    setChatInput('');
    setChatStreaming(true);

    // Detect if the user wants a screenshot-based response
    const needsScreenshot = /look at|what do you see|can you see|check my|see my screen|look here|show me|look at this/i.test(text);
    if (needsScreenshot) {
      window.parent.postMessage(
        { type: 'REQUEST_SCREENSHOT_CHAT', message: text },
        '*'
      );
    } else {
      window.parent.postMessage(
        { type: 'REQUEST_CHAT', message: text },
        '*'
      );
    }

    // Show a "taking longer" message if no response after 10s
    const timeoutId = setTimeout(() => {
      setChatStreaming((streaming) => {
        if (streaming) {
          addMessage('system', 'Hmm, taking longer than expected...');
        }
        return streaming;
      });
    }, 10000);
    // Store timeout so we can clear it on CHAT_DONE
    (window as any).__ouijaChatTimeout = timeoutId;
  }

  function reportStuck() {
    dismissWelcome();
    addMessage('user', "I'm stuck");
    requestDiagnosis('User reported being stuck — cannot find or complete the expected action');
  }

  async function handleStepDone() {
    if (!graph || !currentNode) return;

    const edge = graph.edges.find((e) => e.from === currentNode.id);
    const nextNodeId = edge?.to ?? null;
    const nextNode = nextNodeId ? graph.nodes.find((n) => n.id === nextNodeId) : null;

    // Skip the advance write for local fallback sessions — 'local_*' is not a valid
    // uuid, so every events insert / journey_graphs update would 500 in Postgres.
    if (backendUrl && sessionId && !sessionId.startsWith('local_')) {
      // The advance call is the BILLING/AUDIT event — it MUST carry the session token, or
      // /api/sessions/advance (requireSession) 401s and the ledger silently never writes.
      const advanceHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (ouijaToken) advanceHeaders['X-Ouija-Token'] = ouijaToken;
      fetch(`${backendUrl}/api/sessions/advance`, {
        method: 'POST',
        headers: advanceHeaders,
        body: JSON.stringify({
          session_id: sessionId,
          completed_step: currentNode.id,
          next_step: nextNodeId,
        }),
      }).catch(() => {});
    }

    window.parent.postMessage({ type: 'CONFIRM_STEP', nextStep: currentIndex + 1 }, '*');

    if (nextNode) {
      setPosition(nextNode.id);
      chrome.storage.local.set({ ouija_position: nextNode.id });
      addMessage('system', '✓ Step complete — moving on');
      setStatus('analyzing');
      requestGuidanceForNode(nextNode);
    } else {
      setPosition('');
      setStatus('complete');
      addMessage('ai', "You're all done — nicely done.");
      chrome.storage.local.remove(['ouija_session', 'ouija_graph', 'ouija_position']);
      // Flow complete → purge ephemeral clipboard credentials (PDPA: cleared on session end).
      setClipboardItems([]);
      try { chrome.storage.session.remove(['ouija_clipboard_items', 'ouija_clipboard_savedAt']); } catch {}
      window.parent.postMessage({ type: 'CLEAR_CLIPBOARD' }, '*');
    }
  }

  function confirmStep() {
    dismissWelcome();
    if (!currentNode) return;
    addMessage('user', 'Done');
    setStatus('verifying');
    window.parent.postMessage(
      { type: 'REQUEST_VERIFY', verify_condition: currentNode.verify_condition },
      '*'
    );
    const timeout = setTimeout(() => {
      setStatus((s) => {
        if (s === 'verifying') {
          addMessage('system', 'Verification timed out — try again or click "I\'m stuck".');
          return 'found';
        }
        return s;
      });
    }, 15000);
    (window as any).__ouijaVerifyTimeout = timeout;
  }

  return (
    <div className="ouija-sidebar">
      {/* Header */}
      <header className="ouija-header">
        <div className="ouija-mark"><svg width="18" height="18" viewBox="0 0 100 100" fill="none" style={{display:'block',flexShrink:0}}><circle cx="50" cy="50" r="43" stroke="currentColor" strokeWidth="1.5" /><line x1="80.4" y1="19.6" x2="75.6" y2="24.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".38" /><line x1="80.4" y1="80.4" x2="75.6" y2="75.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".38" /><line x1="19.6" y1="80.4" x2="24.4" y2="75.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".38" /><line x1="19.6" y1="19.6" x2="24.4" y2="24.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".38" /><path d="M50,12 L56,36 L50,50 L44,36 Z" fill="currentColor" /><path d="M50,88 L44,64 L50,50 L56,64 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M88,50 L64,44 L50,50 L64,56 Z" fill="currentColor" opacity=".68" /><path d="M12,50 L36,44 L50,50 L36,56 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity=".52" /><circle cx="50" cy="50" r="4.5" fill="currentColor" /></svg></div>
        <div className="ouija-header-text">
          <span className="ouija-identity">Ouija</span>
          {companyName && <span className="ouija-page-label">{companyName}</span>}
        </div>
        <div className="ouija-header-actions">
          <button
            className={`ouija-header-icon${clipboardOpen ? ' active' : ''}`}
            onClick={() => { window.parent.postMessage({ type: 'TOGGLE_CLIPBOARD_PANEL' }, '*'); }}
            title="Clipboard"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
            {clipboardItems.length > 0 && <span className="ouija-header-badge">{clipboardItems.length}</span>}
          </button>
          {graph && (
            <span className="ouija-step-counter">
              {currentIndex + 1} / {graph.nodes.length}
            </span>
          )}
        </div>
      </header>

      {/* Progress dots with Advanced button to open external graph panel */}
      {graph && (
        <div className="ouija-progress">
          {graph.nodes.map((node, i) => {
            const isFork = forks.some((f) => f.at === node.id);
            const nodeStatus = isFork ? 'error' : i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'future';
            return (
              <div key={node.id} className={`ouija-node ouija-node--${nodeStatus}`}>
                <div className="ouija-node-dot" />
                {i < graph.nodes.length - 1 && <div className="ouija-node-seg" />}
              </div>
            );
          })}
          <button
            className={`ouija-advanced-btn${graphPanelOpen ? ' ouija-advanced-btn--active' : ''}`}
            onClick={() => {
              if (graphPanelOpen) {
                window.parent.postMessage({ type: 'CLOSE_GRAPH_PANEL_ONLY' }, '*');
                setGraphPanelOpen(false);
              } else {
                setGraphPanelOpen(true);
                window.parent.postMessage({ type: 'TOGGLE_GRAPH_PANEL' }, '*');
                window.parent.postMessage({ type: 'GRAPH_FORKS_UPDATE', forks }, '*');
              }
            }}
          >
            {graphPanelOpen ? 'Close graph' : 'Advanced'}
          </button>
        </div>
      )}

      {/* Current step instruction */}
      {currentNode && status !== 'ready' && status !== 'idle' && status !== 'complete' && (
        <div className="ouija-step-instruction">{currentNode.instruction}</div>
      )}

      {/* Messages */}
      <div className="ouija-messages">
        {messages.map((msg, msgIdx) => (
          <React.Fragment key={msg.id}>
            <div className={`ouija-bubble ouija-bubble--${msg.role}`}>
              {msg.role === 'ai' || msg.role === 'system' ? linkifyText(msg.text) : msg.text}
            </div>
            {msgIdx === 0 && msg.role === 'ai' && (status === 'ready' || status === 'idle' || status === 'found') && (
              <button
                className="ouija-btn--dismiss-overlay"
                onClick={() => dismissWelcome()}
              >
                Hide overlay
              </button>
            )}
          </React.Fragment>
        ))}
        {/* Typing indicator when loading */}
        {(status === 'analyzing' || chatStreaming) && (
          <div className="ouija-bubble ouija-bubble--ai ouija-typing">
            <span className="ouija-typing-dot" />
            <span className="ouija-typing-dot" />
            <span className="ouija-typing-dot" />
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Footer: Chat input + Action buttons below */}
      <footer className="ouija-footer">
        <div className="ouija-chat-input-area">
          <input
            className="ouija-chat-input"
            type="text"
            placeholder="Ask Ouija..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); }}
            disabled={chatStreaming}
          />
          <button
            className="ouija-chat-send"
            onClick={sendChat}
            disabled={chatStreaming || !chatInput.trim()}
            aria-label="Send message"
          >
            {chatStreaming ? '...' : '↑'}
          </button>
        </div>

        <div className="ouija-actions">
          {!graph && status === 'idle' && (
            <div className="ouija-status-pill">Enter your API key in the extension popup to begin.</div>
          )}
          {status === 'loading' && (
            <div className="ouija-status-pill">Starting...</div>
          )}
          {status === 'analyzing' && (
            <div className="ouija-status-pill">Looking at the page...</div>
          )}
          {status === 'verifying' && (
            <div className="ouija-status-pill">Verifying...</div>
          )}
          {status === 'diagnosing' && (
            <div className="ouija-status-pill ouija-status-pill--diagnosing">
              {agentStep || 'Diagnosing...'}
            </div>
          )}
          {(status === 'found' || status === 'error') && (
            <>
              {doneHintText && (
                <div className="ouija-done-hint">{doneHintText}</div>
              )}
              <div className="ouija-action-row">
                <button className="ouija-btn ouija-btn--primary" onClick={confirmStep}>
                  Done ✓
                </button>
                <button className="ouija-btn ouija-btn--ghost" onClick={reportStuck}>
                  I'm stuck
                </button>
              </div>
            </>
          )}
          {status === 'complete' && (
            <div className="ouija-status-pill ouija-status-pill--success">Journey complete</div>
          )}
        </div>
      </footer>
    </div>
  );
}

function getDeviceId(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['deviceId'], (result) => {
      if (result.deviceId) {
        resolve(result.deviceId);
      } else {
        const id = crypto.randomUUID();
        chrome.storage.local.set({ deviceId: id }, () => resolve(id));
      }
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

