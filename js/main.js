/**
 * main.js — Application entry point.
 * Orchestrates initialization of all modules in the correct order.
 */
(function () {
    'use strict';

    // 1. Start Loader immediately
    const loader = new Loader();
    loader.start();

    // 2. Once loader completes and DOM is ready, initialize everything
    loader.ready.then(() => {
        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger);

        // Smooth scrolling
        const smoothScroller = new SmoothScroller();

        // Chain animation engine (dual canvas + scroll)
        const chainExperience = new ChainExperience();

        // Custom cursor
        const cursor = new Cursor();

        // UI scroll animations, tech slider, interactions
        const uiAnimations = new UIAnimations();

        // Web3 wallet manager
        const walletManager = new WalletManager();

        // On-chain guestbook
        const guestbook = new Guestbook(walletManager);

        // Node Rush game (lazy — initialized but only opens on button click)
        const nodeRushGame = new NodeRushGame(smoothScroller, walletManager);

        // Live network stats
        const networkStats = new NetworkStats();

        // Nav links smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                e.preventDefault();
                smoothScroller.scrollTo(href, { offset: -80 });
            });
        });

        // Refresh cursor targets after dynamic content
        setTimeout(() => cursor.refresh && cursor.refresh(), 500);
    });
})();
