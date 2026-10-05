// ==UserScript==
// @name         Reddit → Redlib Auto-Redirect on Age/NSFW Gate
// @namespace    https://github.com/trinlol/reddit-redlib-redirect
// @version      1.0
// @description  Detects Reddit age-gate, NSFW login walls, and ID verification prompts - redirects to the same page on a Redlib instance
// @author       trinlol
// @match        https://www.reddit.com/*
// @match        https://reddit.com/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @license      MIT
// @homepageURL  https://github.com/trinlol/reddit-redlib-redirect
// @supportURL   https://github.com/trinlol/reddit-redlib-redirect/issues
// @downloadURL  https://raw.githubusercontent.com/trinlol/reddit-redlib-redirect/main/reddit-redlib-redirect.user.js
// @updateURL    https://raw.githubusercontent.com/trinlol/reddit-redlib-redirect/main/reddit-redlib-redirect.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ─────────────────────────────────────────────────────────
    //  Redlib instances (ordered by preference)
    //  - Excludes SFW-only instances
    //  - You can reorder or add your own
    // ─────────────────────────────────────────────────────────
    const INSTANCES = [
        'https://redlib.catsarch.com',
        'https://redlib.nohost.network',
        'https://red.artemislena.eu',
        'https://redlib.r4fo.com'
    ];

    // ─────────────────────────────────────────────────────────
    //  User preference (set via Tampermonkey menu)
    // ─────────────────────────────────────────────────────────
    const preferred = GM_getValue('preferredInstance', '');

    GM_registerMenuCommand('⚙️ Set preferred Redlib instance', () => {
        const choice = prompt(
            'Enter your preferred Redlib instance URL (or leave blank for auto):\n\n' +
            'Available:\n' + INSTANCES.join('\n'),
            preferred
        );
        if (choice !== null) {
            GM_setValue('preferredInstance', choice.trim());
            alert('Saved! Will use: ' + (choice.trim() || 'auto (first reachable)'));
        }
    });

    // ─────────────────────────────────────────────────────────
    //  Selectors that indicate a blocking gate
    // ─────────────────────────────────────────────────────────
    const GATE_SELECTORS = [
        // Birthday / age-gate prompts
        '#age-gate-interstitial',
        'age-gate-dialog',
        'shreddit-async-loader[bundlename*="age_gate"]',

        // NSFW login / xpromo blocking modals
        '#configured-xpromo-blocking_xpromo_nsfw_blocking_desktop',
        '[id*="blocking_xpromo_nsfw"]',
        '[id*="xpromo-nsfw-blocking"]',

        // NSFW channel confirmation
        'rs-nsfw-channel-confirmation',

        // Persona third-party ID verification
        'iframe[src*="withpersona.com"]',
        '[id*="persona"]'
    ].join(', ');

    let redirecting = false;

    // ─────────────────────────────────────────────────────────
    //  URL builder — keeps the full Reddit path on Redlib
    // ─────────────────────────────────────────────────────────
    function buildRedlibUrl(instance) {
        return instance + window.location.pathname + window.location.search + window.location.hash;
    }

    // ─────────────────────────────────────────────────────────
    //  Redirect logic with health-check fallback chain
    // ─────────────────────────────────────────────────────────
    function redirectToRedlib() {
        if (redirecting) return;
        redirecting = true;

        const orderedInstances = preferred
            ? [preferred, ...INSTANCES.filter(i => i !== preferred)]
            : [...INSTANCES];

        let tried = 0;

        function tryNext() {
            if (tried >= orderedInstances.length) {
                // All health checks failed — go to the first one anyway
                window.location.replace(buildRedlibUrl(orderedInstances[0]));
                return;
            }

            const instance = orderedInstances[tried];
            tried++;

            GM_xmlhttpRequest({
                method: 'HEAD',
                url: instance,
                timeout: 3000,
                onload: () => {
                    window.location.replace(buildRedlibUrl(instance));
                },
                onerror: tryNext,
                ontimeout: tryNext
            });
        }

        tryNext();
    }

    // ─────────────────────────────────────────────────────────
    //  Gate detection
    // ─────────────────────────────────────────────────────────
    function checkForGate() {
        if (redirecting) return false;
        const gate = document.querySelector(GATE_SELECTORS);
        if (gate) {
            console.log('[Redlib Redirect] Gate detected:', gate.tagName, gate.id || '');
            redirectToRedlib();
            return true;
        }
        return false;
    }

    // ─────────────────────────────────────────────────────────
    //  Start monitoring
    // ─────────────────────────────────────────────────────────

    // Immediate check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkForGate);
    } else {
        checkForGate();
    }

    // MutationObserver for SPA-injected gates
    const observer = new MutationObserver(() => {
        if (checkForGate()) {
            observer.disconnect();
        }
    });

    const startObserving = () => {
        const target = document.body || document.documentElement;
        if (target) {
            observer.observe(target, { childList: true, subtree: true });
        } else {
            requestAnimationFrame(startObserving);
        }
    };
    startObserving();
})();
