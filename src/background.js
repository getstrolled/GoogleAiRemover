const api = typeof browser !== "undefined" ? browser : chrome;

const defaults = {
  mode: "safe",
  killAiOverview: true,
  killAiTab: true,
  killAiHotkey: true,
};

api.runtime.onInstalled.addListener(async () => {
  try {
    const stored = await api.storage.sync.get(defaults);
    await api.storage.sync.set({ ...defaults, ...stored });
  } catch (_) {
    try {
      const local = await api.storage.local.get(defaults);
      await api.storage.local.set({ ...defaults, ...local });
    } catch (__) {}
  }
});

let pausedMem = false;

async function readPaused() {
  try {
    const s = await api.storage.session.get({ paused: false });
    pausedMem = !!s.paused;
  } catch (_) {}
  return pausedMem;
}

async function writePaused(v) {
  pausedMem = !!v;
  try {
    await api.storage.session.set({ paused: pausedMem });
  } catch (_) {}
  broadcastPause(pausedMem);
}

async function broadcastPause(v) {
  try {
    const tabs = await api.tabs.query({ url: "*://*.google.com/*" });
    for (const t of tabs) {
      if (t.id == null) continue;
      api.tabs.sendMessage(t.id, { type: "pause-changed", value: v }).catch(() => {});
    }
  } catch (_) {}
}

api.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || !msg.type) return;
  if (msg.type === "get-pause") {
    readPaused().then((v) => sendResponse({ paused: v }));
    return true;
  }
  if (msg.type === "set-pause") {
    writePaused(msg.value).then(() => sendResponse({ ok: true, paused: pausedMem }));
    return true;
  }
});

readPaused();
