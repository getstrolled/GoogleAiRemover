# Privacy Policy — GoogleAiRemover

**Last updated: 2026-04-23**

GoogleAiRemover does not collect, store, transmit, or share any personal data, browsing data, or any other user data.

## What the extension does

- Modifies the layout of Google search result pages (`*.google.com` and country variants) inside your browser to hide Google's AI Overview, hide the "AI Mode" tab, and block the Tab-to-AI-Mode keyboard shortcut.
- Optionally appends `-ai` to your search query (Safe mode) so Google itself filters out the AI Overview.

All of this happens locally in your browser. Nothing is sent anywhere.

## What it stores

- Your settings (selected mode, toggle states) are stored locally via `chrome.storage.sync`. If you are signed into Chrome with sync enabled, Chrome itself may sync these settings across your own devices. The extension author has no access to this data.
- A per-session pause flag is stored in `chrome.storage.session` and is cleared when the browser is closed.

## What it does NOT do

- No analytics
- No telemetry
- No tracking
- No remote code execution
- No external network requests
- No data sold or shared with anyone

## Permissions explained

- `storage` — to remember your settings.
- `activeTab` — to reload the current Google tab when you toggle the pause button.
- Host access to `*.google.com` and country variants — to run the AI-removal logic on Google search pages only.

## Contact

Open an issue: https://github.com/getstrolled/GoogleAiRemover/issues

## Changes

If this policy ever changes, the new version will be committed to this repository with a new "Last updated" date.
