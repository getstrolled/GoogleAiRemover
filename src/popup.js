const api = typeof browser !== "undefined" ? browser : chrome;

const pauseBtn = document.getElementById("pause-btn");
const pauseTitle = pauseBtn.querySelector(".big-btn-title");
const pauseSub = pauseBtn.querySelector(".big-btn-sub");
const pill = document.getElementById("mode-pill");

(async function load() {
  const [pauseRes, cfg] = await Promise.all([
    api.runtime.sendMessage({ type: "get-pause" }),
    api.storage.sync.get({ mode: "safe" }),
  ]);
  paint(!!(pauseRes && pauseRes.paused), cfg.mode);
})();

pauseBtn.addEventListener("click", async () => {
  const cur = await api.runtime.sendMessage({ type: "get-pause" });
  const next = !(cur && cur.paused);
  await api.runtime.sendMessage({ type: "set-pause", value: next });
  const cfg = await api.storage.sync.get({ mode: "safe" });
  paint(next, cfg.mode);

  try {
    const tabs = await api.tabs.query({ active: true, currentWindow: true });
    const t = tabs && tabs[0];
    if (t && t.id != null) {
      const url = t.url || "";
      const onGoogleSearch = /google\.[^/]+\/search/.test(url);

      if (next && onGoogleSearch) {
        // pausing for -ai and removal of marker
        const cleaned = stripNoAi(url);
        if (cleaned !== url) {
          await api.tabs.update(t.id, { url: cleaned });
        } else {
          await api.tabs.reload(t.id);
        }
      } else if (t.id != null) {
        await api.tabs.reload(t.id);
      }
    }
  } catch (_) {}

  window.close();
});

document.getElementById("options-link").addEventListener("click", (e) => {
  e.preventDefault();
  api.runtime.openOptionsPage();
});

function paint(paused, mode) {
  if (paused) {
    pauseBtn.classList.add("off");
    pauseTitle.textContent = "Turn back on";
    pauseSub.textContent = "currently paused for this session";
    pill.textContent = "paused";
    pill.className = "pill paused";
  } else {
    pauseBtn.classList.remove("off");
    pauseTitle.textContent = "Turn off for this session";
    pauseSub.textContent = "re-enables when you close the browser";
    pill.textContent = mode === "destroy" ? "destroy" : "safe";
    pill.className = "pill " + (mode === "destroy" ? "destroy" : "");
  }
}

function stripNoAi(raw) {
  try {
    const u = new URL(raw);
    const q = u.searchParams.get("q");
    if (!q) return raw;
    const cleaned = q.replace(/(^|\s)-ai(\s|$)/gi, " ").replace(/\s+/g, " ").trim();
    if (cleaned === q) return raw;
    if (cleaned) u.searchParams.set("q", cleaned);
    else u.searchParams.delete("q");
    return u.toString();
  } catch (_) {
    return raw;
  }
}
