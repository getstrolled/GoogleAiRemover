<div align="center">

<img src="icons/icon-128.png" width="96" alt="logo" />

# GoogleAiRemover

Strip Google's AI Overview, the AI Mode tab, and the Tab-to-AI hotkey out of your search results. Chrome and Firefox.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-green.svg)](manifest.json)
[![Browsers](https://img.shields.io/badge/browsers-chrome%20%7C%20firefox-orange.svg)](#install)

</div>

---

## What it does

- Kills Google's AI Overview (two modes, you pick)
- Hides the "AI Mode" tab in the search filter row
- Blocks the Tab-to-AI-Mode keyboard shortcut
- One-click "off for this session" toggle in the toolbar

## The two modes

**Safe mode** — appends `-ai` to your search query. Google quietly hides the AI Overview when it sees a negative term. The page is otherwise untouched.
- Pro: works on every Google variant regardless of how they restructure the DOM.
- Con: filters out results that contain the word "ai", which sucks if you're searching for AI stuff on purpose.

**Full destruction mode** — leaves your query alone and rips the AI Overview out of the DOM after it loads.
- Pro: no query pollution, no filtered results.
- Con: on slow connections you might see it flash for a moment before it's removed. Selectors break occasionally when Google reshuffles their markup.

Switch between them in Settings.

## Install

- **Chrome Web Store** — not approved yet
- **Firefox Add-ons** — not approved yet

## Permissions

Only two:

- `storage` — to remember your settings
- `activeTab` — to reload the current tab when you toggle pause
- host access to `google.com` and a few country variants

No analytics, no remote code, nothing leaves your browser.

## Issues

Google reshuffles their DOM constantly. If something breaks, [open an issue](https://github.com/getstrolled/GoogleAiRemover/issues) with:
- Your browser + version
- The Google domain you were on (`.com`, `.de`, etc.)
- A screenshot of the AI Overview that wasn't removed (with devtools open if possible)

## License

[MIT](LICENSE)
