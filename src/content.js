(() => {
  const api = typeof browser !== "undefined" ? browser : chrome;

  const defaults = {
    mode: "safe",
    killAiOverview: true,
    killAiTab: true,
    killAiHotkey: true,
  };

  let cfg = { ...defaults };
  let paused = false;

  init();

  async function init() {
    try {
      const stored = await api.storage.sync.get(defaults);
      cfg = { ...defaults, ...stored };
    } catch (_) {
      try {
        const local = await api.storage.local.get(defaults);
        cfg = { ...defaults, ...local };
      } catch (__) {}
    }

    try {
      const r = await api.runtime.sendMessage({ type: "get-pause" });
      paused = !!(r && r.paused);
    } catch (_) {
      paused = false;
    }

    if (!paused && cfg.mode === "safe") maybeRedirectWithNoAi();

    applyClasses();
    if (!paused) start();

    api.runtime.onMessage.addListener((msg) => {
      if (!msg || msg.type !== "pause-changed") return;
      paused = !!msg.value;
      if (paused) stop();
      else {
        applyClasses();
        start();
      }
    });

    api.storage.onChanged.addListener((changes, area) => {
      if (area === "session") return;
      let dirty = false;
      for (const k of Object.keys(changes)) {
        if (k in defaults) {
          cfg[k] = changes[k].newValue;
          dirty = true;
        }
      }
      if (dirty && !paused) {
        applyClasses();
        sweep();
      }
    });
  }

  function maybeRedirectWithNoAi() {
    const url = new URL(location.href);
    const q = url.searchParams.get("q");
    if (!q) return;
    if (/(^|\s)-ai(\s|$)/i.test(q)) return;
    url.searchParams.set("q", q + " -ai");
    location.replace(url.toString());
  }

  function applyClasses() {
    const html = document.documentElement;
    if (!html) return;
    html.classList.toggle("sc-kill-aio", !paused && cfg.mode === "destroy" && cfg.killAiOverview);
    html.classList.toggle("sc-kill-aitab", !paused && cfg.killAiTab);
  }

  let observer = null;
  let hotkeyHandler = null;
  let submitHandler = null;
  let sweepQueued = false;

  function start() {
    sweep();

    if (cfg.mode === "safe" && !submitHandler) {
      submitHandler = (e) => {
        if (paused || cfg.mode !== "safe") return;
        const form = e.target;
        if (!(form instanceof HTMLFormElement)) return;
        const input = form.querySelector('textarea[name="q"], input[name="q"]');
        if (!input) return;
        const v = input.value || "";
        if (/(^|\s)-ai(\s|$)/i.test(v)) return;
        input.value = v.trimEnd() + " -ai";
      };
      document.addEventListener("submit", submitHandler, true);
    }

    if (!observer) {
      observer = new MutationObserver(() => {
        if (sweepQueued) return;
        sweepQueued = true;
        requestAnimationFrame(() => {
          sweepQueued = false;
          sweep();
        });
      });
    }

    const target = document.body || document.documentElement;
    observer.observe(target, { childList: true, subtree: true });

    if (cfg.killAiHotkey && !hotkeyHandler) {
      hotkeyHandler = (e) => {
        if (paused) return;
        if (e.key !== "Tab" || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
        const t = e.target;
        if (!t || !(t instanceof HTMLElement)) return;
        const isSearchBox =
          t.matches('textarea[name="q"], input[name="q"], textarea.gLFyf, input.gLFyf');
        if (!isSearchBox) return;
        if (document.querySelector('a[href*="udm=50"], [aria-label*="AI Mode" i]')) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      window.addEventListener("keydown", hotkeyHandler, true);
    }
  }

  function stop() {
    if (observer) observer.disconnect();
    observer = null;
    if (hotkeyHandler) {
      window.removeEventListener("keydown", hotkeyHandler, true);
      hotkeyHandler = null;
    }
    if (submitHandler) {
      document.removeEventListener("submit", submitHandler, true);
      submitHandler = null;
    }
    document.documentElement.classList.remove("sc-kill-aio", "sc-kill-aitab");
  }

  function sweep() {
    if (paused) return;
    if (cfg.mode === "destroy" && cfg.killAiOverview) killAiOverview();
    if (cfg.killAiTab) killAiTab();
  }

  // ai overview selectors  

  const aiOverviewSelectors = [
    'div[data-attrid="AIO"]',
    'div[data-async-context*="aio"]',
    'div[data-async-context*="ai_overview"]',
    'div[data-async-context^="ai_o"]',
    'div[data-async-type^="ai_o"]',
    'div[data-async-type*="ai_overview"]',
    'div[jsname="UCYmEd"]',
    'div[jsname="cAFhGd"]',
    'div[jscontroller="hYIE3"]',
    'div[jscontroller="JMOwte"]',
    'div[jscontroller="MAccHc"]',
    'div[jscontroller="iDPoPb"]',
    'div[jscontroller="OnlBO"]',
    'div[jscontroller="K9p0Pe"]',
    'c-wiz[data-page-cfg*="aiOverview"]',
    'c-wiz[data-async-context^="ai_o"]',
    'div[data-subtree="aio"]',
    'div[data-mcareid]',
    'div[aria-label="AI Overview"]',
    'div[aria-label="AI overview"]',
    'div[aria-label="KI-Übersicht"]',
    'div[aria-label="Aperçu IA"]',
    'div[aria-label="Vista general de IA"]',
    'div[aria-label="Panoramica IA"]',
  ];

  // header language fallback
  const aiHeaderRe = /^(ai overview|ai-overview|ki[-\s]übersicht|ki[-\s]ubersicht|aperçu ia|apercu ia|vista general de ia|panoramica ia|visão geral da ia|visao geral da ia|ai 概要|ai 概览|ai 概觀|ai genel bakış|ai genel bakis|обзор ии|przegląd ai|przeglad ai)\b/i;

  function killAiOverview() {
    for (const sel of aiOverviewSelectors) {
      for (const el of document.querySelectorAll(sel)) el.remove();
    }

    for (const h of document.querySelectorAll("h1, h2, h3, [role='heading'], [aria-level]")) {
      const txt = (h.textContent || "").trim();
      if (aiHeaderRe.test(txt)) {
        const block = h.closest("c-wiz, [data-hveid], [jscontroller], section");
        if (block && block !== document.body) block.remove();
      }
    }

    // gemini and bard link removal 
    for (const a of document.querySelectorAll('a[href*="gemini.google.com"], a[href*="bard.google.com"]')) {
      const block = a.closest("c-wiz, div[data-hveid], div[jscontroller]");
      if (block && block !== document.body && !block.contains(document.querySelector("#search>*>*>*>h3"))) {
        block.remove();
      }
    }

    // ai typical disclaimer detection
    for (const el of document.querySelectorAll('div[role="region"], c-wiz')) {
      const txt = (el.textContent || "").toLowerCase();
      if (
        txt.includes("generative ai is experimental") ||
        txt.includes("ai-antworten können fehler enthalten") ||
        txt.includes("ki-antworten können fehler") ||
        txt.includes("les réponses ia peuvent contenir") ||
        txt.includes("las respuestas de ia pueden")
      ) {
        if (el !== document.body) el.remove();
      }
    }
  }

  // bye bye shitty ai tab

  function killAiTab() {
    for (const a of document.querySelectorAll('a[href*="udm=50"]')) {
      const item = a.closest('[role="listitem"], li, div');
      (item || a).remove();
    }
    for (const el of document.querySelectorAll('[aria-label*="AI Mode" i], [aria-label*="AI mode" i]')) {
      el.remove();
    }
  }
})();
