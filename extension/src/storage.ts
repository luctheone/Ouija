// Storage utilities — chrome.storage.local for persistent cross-tab state

export function getDeviceId(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['deviceId'], (result) => {
      if (result.deviceId) {
        resolve(result.deviceId as string);
      } else {
        const id = crypto.randomUUID();
        chrome.storage.local.set({ deviceId: id }, () => resolve(id));
      }
    });
  });
}

export function getApiKey(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiKey'], (result) => {
      resolve((result.apiKey as string) || null);
    });
  });
}

export function setApiKey(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ apiKey: key }, resolve);
  });
}

export function clearApiKey(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['apiKey'], resolve);
  });
}

export function getDemoKeyType(): Promise<'shopify' | 'stripe' | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['ouija_demo_key_type'], (result) => {
      resolve((result.ouija_demo_key_type as 'shopify' | 'stripe') || null);
    });
  });
}

export function setDemoKeyType(type: 'shopify' | 'stripe'): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ ouija_demo_key_type: type }, resolve);
  });
}
