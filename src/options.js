const api = typeof browser !== "undefined" ? browser : chrome;

const defaults = {
  mode: "safe",
  killAiOverview: true,
  killAiTab: true,
  killAiHotkey: true,
};

const savedFlash = document.getElementById("saved");
let flashTimer = null;

(async function load() {
  const cfg = await getCfg();
  for (const radio of document.querySelectorAll('input[name="mode"]')) {
    radio.checked = radio.value === cfg.mode;
  }
  paintCards(cfg.mode);
  document.getElementById("killAiTab").checked = cfg.killAiTab;
  document.getElementById("killAiHotkey").checked = cfg.killAiHotkey;
})();

document.querySelectorAll('input[name="mode"]').forEach((r) => {
  r.addEventListener("change", () => {
    paintCards(r.value);
    save({ mode: r.value, killAiOverview: r.value === "destroy" });
  });
});

["killAiTab", "killAiHotkey"].forEach((id) => {
  document.getElementById(id).addEventListener("change", (e) => {
    save({ [id]: e.target.checked });
  });
});

function paintCards(mode) {
  for (const card of document.querySelectorAll(".mode-card")) {
    card.classList.toggle("selected", card.dataset.mode === mode);
  }
}

async function getCfg() {
  try {
    return { ...defaults, ...(await api.storage.sync.get(defaults)) };
  } catch (_) {
    return { ...defaults, ...(await api.storage.local.get(defaults)) };
  }
}

async function save(patch) {
  try {
    await api.storage.sync.set(patch);
  } catch (_) {
    await api.storage.local.set(patch);
  }
  flashSaved();
}

function flashSaved() {
  savedFlash.hidden = false;
  savedFlash.style.opacity = "1";
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => {
    savedFlash.style.opacity = "0";
    setTimeout(() => (savedFlash.hidden = true), 250);
  }, 1200);
}
