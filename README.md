# Reddit → Redlib Auto-Redirect

A Tampermonkey/Violentmonkey userscript that **automatically redirects you from Reddit to [Redlib](https://github.com/redlib-org/redlib)** when an age-gate, NSFW login wall, or ID verification prompt appears.

No more handing your ID to Reddit or dodgy third-party verification services. The script detects the blocking popup, health-checks available Redlib instances, and sends you to the same page on a working instance — instantly and silently.

## The Problem

Reddit now enforces age verification for NSFW content in certain regions (UK, parts of EU) via a third-party service called **Persona**, which requires uploading a government-issued ID or facial scan. Even if you're logged in and over 18, Reddit may:

- Show an **"Add your birthday"** popup that loops endlessly
- Display a **"Mature Content — Log in to confirm your age"** modal
- Demand **government ID verification** through Persona
- **Withhold the actual page content** server-side (so simply hiding the popup leaves a blank page)

This script bypasses all of that by redirecting to **Redlib**, a privacy-respecting Reddit frontend that proxies content through servers outside affected regions.

## Install

### Prerequisites

- [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Edge, Firefox, Safari) **or** [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Edge, Firefox)

### One-Click Install

👉 **[Click here to install the userscript](https://raw.githubusercontent.com/trinlol/reddit-redlib-redirect/main/reddit-redlib-redirect.user.js)**

Your userscript manager will open a confirmation page. Click **Install**.

### Manual Install

1. Open your userscript manager dashboard (click the extension icon → **Dashboard**)
2. Create a new script
3. Paste the contents of [`reddit-redlib-redirect.user.js`](reddit-redlib-redirect.user.js)
4. Save (`Ctrl+S`)

## What It Detects

| Gate Type | Selector / Trigger |
|---|---|
| Birthday age-gate | `#age-gate-interstitial`, `age-gate-dialog` |
| NSFW login wall | `#configured-xpromo-blocking_xpromo_nsfw_blocking_desktop` |
| NSFW xpromo variants | `[id*="blocking_xpromo_nsfw"]`, `[id*="xpromo-nsfw-blocking"]` |
| Channel NSFW confirmation | `rs-nsfw-channel-confirmation` |
| Persona ID verification | `iframe[src*="withpersona.com"]`, `[id*="persona"]` |
| Async age-gate loader | `shreddit-async-loader[bundlename*="age_gate"]` |

## How It Works

```
You visit www.reddit.com/r/example/comments/abc123/post_title
         │
         ▼
  Script monitors DOM via MutationObserver
         │
         ▼
  Age-gate / NSFW wall detected?
         │
    NO ──┤── YES
    │         │
    │         ▼
    │    Health-check Redlib instances (HEAD request, 3s timeout)
    │         │
    │         ▼
    │    Redirect to first healthy instance:
    │    redlib.catsarch.com/r/example/comments/abc123/post_title
    │
    ▼
  Normal Reddit browsing continues
```

## Redlib Instances

The script ships with these instances (in priority order):

| Instance | Location |
|---|---|
| `redlib.catsarch.com` | 🇺🇸 US |
| `redlib.nohost.network` | 🇲🇽 MX |
| `red.artemislena.eu` | 🇩🇪 DE |
| `redlib.r4fo.com` | 🇩🇪 DE |

Before redirecting, the script pings each instance to make sure it's online. If your preferred instance is down, it automatically falls through to the next.

### Set a Preferred Instance

1. Right-click the **Tampermonkey icon** in your browser toolbar
2. Hover over **Reddit → Redlib Auto-Redirect**
3. Click **⚙️ Set preferred Redlib instance**
4. Enter the URL (e.g. `https://redlib.catsarch.com`) or leave blank for auto-selection

Find more instances at the [official Redlib instances list](https://github.com/redlib-org/redlib-instances).

## FAQ

**Q: Why not just remove the popup with a userscript?**
Because Reddit's server **doesn't send the page content** to your browser when a gate is active. Removing the popup leaves a blank page. The content was never there.

**Q: Does this redirect every Reddit page?**
No. It only triggers when a blocking gate or verification popup is detected. Normal Reddit browsing is unaffected.

**Q: Can I use this with a VPN instead?**
Yes! If you use a VPN to a non-UK/EU country, Reddit won't show these gates at all, making this script unnecessary. This script is for people who don't want to use a VPN.

**Q: What is Redlib?**
[Redlib](https://github.com/redlib-org/redlib) is an open-source, privacy-respecting frontend for Reddit. It doesn't require an account, doesn't track you, and serves content through its own servers.

## License

[MIT](LICENSE)
