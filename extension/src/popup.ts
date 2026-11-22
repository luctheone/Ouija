const keyInput = document.getElementById('key') as HTMLInputElement;
const connectBtn = document.getElementById('connect') as HTMLButtonElement;
const coldQuery = document.getElementById('cold-query') as HTMLInputElement;
const coldBtn = document.getElementById('cold-start') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLDivElement;

const DEFAULT_BACKEND = process.env.OUIJA_BACKEND_URL || 'http://localhost:3000';

// Demo key → flow mapping
const DEMO_KEYS: Record<string, { company: string; flow: string; type: 'shopify' | 'stripe' | 'aws' }> = {
  ouija_demo_shopify_2025: { company: 'shopify', flow: 'meta-pixel-connect', type: 'shopify' },
  ouija_demo_stripe_2025: { company: 'stripe', flow: 'payment-link-webhook', type: 'stripe' },
  ouija_demo_aws_2025: { company: 'aws', flow: 'iam-cross-account-role', type: 'aws' },
};

chrome.storage.local.get(['apiKey'], ({ apiKey }) => {
  if (apiKey) {
    showConnected();
  } else {
    connectBtn.onclick = connect;
    coldBtn.onclick = coldStart;
  }
});

async function connect() {
  const key = keyInput.value.trim();
  if (!key) return;

  // Clear previous session state on any new connection
  chrome.storage.session.remove(['ouija_messages', 'ouija_guidance_started', 'ouija_status', 'ouija_clipboard_items']);

  const demoConfig = DEMO_KEYS[key];

  if (demoConfig) {
    // Demo key — auto-start session with pre-cached graph
    status.textContent = 'Loading demo flow...';
    status.className = 'status';

    try {
      const deviceId = await getDeviceId();
      const res = await fetch(`${DEFAULT_BACKEND}/api/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          company: demoConfig.company,
          flow: demoConfig.flow,
          demo_key_type: demoConfig.type,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Server ${res.status}: ${errBody.slice(0, 100)}`);
      }

      const data = await res.json();

      chrome.storage.local.set({
        apiKey: key,
        ouija_backend_url: DEFAULT_BACKEND,
        ouija_demo_key_type: demoConfig.type,
        ouija_flow: demoConfig.flow,
        ouija_session: data.session_id,
        ouija_graph: data.graph,
        ouija_position: data.position,
        ouija_token: data.session_token,
      }, () => {
        const authMsg = { type: 'AUTH_SUCCESS', apiKey: key, backendUrl: DEFAULT_BACKEND };
        chrome.runtime.sendMessage(authMsg);
        // Also inject content script into current tab in case it wasn't loaded
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.scripting?.executeScript?.({
              target: { tabId: tabs[0].id },
              files: ['dist/content.js'],
            }).catch(() => {});
            // Send directly to the tab as well (with small delay for script init)
            setTimeout(() => {
              chrome.tabs.sendMessage(tabs[0]!.id!, authMsg).catch(() => {});
            }, 200);
          }
        });
        showConnected();
        status.textContent = `Demo ready — ${data.graph.nodes.length} steps`;
        status.className = 'status connected';
      });
    } catch (e) {
      status.textContent = (e as Error).message || 'Could not start demo';
      status.className = 'status error';
    }
  } else {
    // Regular API key — start session via key validation
    status.textContent = 'Validating key...';
    status.className = 'status';

    try {
      const deviceId = await getDeviceId();
      const res = await fetch(`${DEFAULT_BACKEND}/api/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, api_key: key }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(res.status === 401 ? 'Invalid API key' : `Server ${res.status}: ${errBody.slice(0, 100)}`);
      }

      const data = await res.json();

      chrome.storage.local.set({
        apiKey: key,
        ouija_backend_url: DEFAULT_BACKEND,
        ouija_session: data.session_id,
        ouija_graph: data.graph,
        ouija_position: data.position,
        ouija_token: data.session_token,
      }, () => {
        const authMsg = { type: 'AUTH_SUCCESS', apiKey: key, backendUrl: DEFAULT_BACKEND };
        chrome.runtime.sendMessage(authMsg);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.scripting?.executeScript?.({
              target: { tabId: tabs[0].id },
              files: ['dist/content.js'],
            }).catch(() => {});
            setTimeout(() => {
              chrome.tabs.sendMessage(tabs[0]!.id!, authMsg).catch(() => {});
            }, 200);
          }
        });
        showConnected();
        status.textContent = `Ready — ${data.graph.nodes.length} steps`;
        status.className = 'status connected';
      });
    } catch (e) {
      status.textContent = (e as Error).message || 'Invalid key';
      status.className = 'status error';
    }
  }
}

function showConnected() {
  status.textContent = 'Connected';
  status.className = 'status connected';
  keyInput.value = '••••••••';
  connectBtn.textContent = 'Disconnect';
  connectBtn.onclick = disconnect;
}

function disconnect() {
  chrome.storage.local.remove(['apiKey', 'ouija_demo_key_type', 'ouija_flow', 'ouija_backend_url', 'ouija_session', 'ouija_graph', 'ouija_position', 'ouija_welcomed'], () => {
    chrome.storage.session.remove(['ouija_messages', 'ouija_guidance_started', 'ouija_status', 'ouija_clipboard_items']);
    chrome.runtime.sendMessage({ type: 'AUTH_CLEARED' });
    status.textContent = '';
    status.className = 'status';
    keyInput.value = '';
    connectBtn.textContent = 'Connect';
    connectBtn.onclick = connect;
  });
}

async function coldStart() {
  const query = coldQuery.value.trim();
  if (!query) return;

  status.textContent = 'Researching & planning...';
  status.className = 'status';
  coldBtn.disabled = true;

  try {
    const deviceId = await getDeviceId();
    const res = await fetch(`${DEFAULT_BACKEND}/api/sessions/cold-start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, query }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed');
    }

    const data = await res.json();

    const coldKey = `cold_${Date.now()}`;
    chrome.storage.local.set({
      apiKey: coldKey,
      ouija_backend_url: DEFAULT_BACKEND,
      ouija_session: data.session_id,
      ouija_graph: data.graph,
      ouija_position: data.position,
      ouija_token: data.session_token,
    }, () => {
      chrome.runtime.sendMessage({ type: 'AUTH_SUCCESS', apiKey: coldKey, backendUrl: DEFAULT_BACKEND });
      status.textContent = `Ready — ${data.graph.nodes.length} steps planned`;
      status.className = 'status connected';
    });
  } catch (e) {
    status.textContent = (e as Error).message || 'Something went wrong';
    status.className = 'status error';
  }

  coldBtn.disabled = false;
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
