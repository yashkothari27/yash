/**
 * UIAnimations — GSAP ScrollTrigger-driven reveal and interaction animations.
 */
class UIAnimations {
    constructor() {
        this._initRevealAnimations();
        this._initTechSlider();
        this._initMagneticButtons();
        this._initCopyEmail();
        this._initMobileMenu();
        this._initParallax();
    }

    _initRevealAnimations() {
        const reveals = document.querySelectorAll('.reveal-text');
        reveals.forEach((el, i) => {
            ScrollTrigger.create({
                trigger: el,
                start: 'top 88%',
                once: true,
                onEnter: () => {
                    gsap.to(el, {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        delay: (i % 4) * 0.1,
                        ease: 'power3.out',
                    });
                    el.classList.add('revealed');
                },
            });
        });
    }

    _initTechSlider() {
        const track = document.getElementById('tech-slider-track');
        const slider = document.getElementById('tech-slider');
        const prevBtn = document.getElementById('tech-prev');
        const nextBtn = document.getElementById('tech-next');

        const techStack = [
            { icon: '<svg viewBox="0 0 24 24" width="36" height="36" fill="none"><path d="M12 1.5l-8 14h4l4-7 4 7h4L12 1.5z" fill="#00f0ff"/><path d="M12 22.5l8-7H4l8 7z" fill="#00f0ff" opacity="0.6"/></svg>', title: 'Solidity', tag: 'Smart Contracts', desc: 'Production-grade EVM contract development' },
            { icon: '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M11.944 17.97L4.585 13.62 12 1.31l7.415 12.31-7.47 4.35zm0 2.998l-7.263-4.23L12 22.69l7.32-5.952-7.376 4.23z" fill="#627EEA"/></svg>', title: 'Ethereum', tag: 'Network', desc: 'L1 protocol and DeFi ecosystem' },
            { icon: '<svg viewBox="0 0 24 24" width="36" height="36"><polygon points="12,2 2,12 12,22 22,12" fill="none" stroke="#E2761B" stroke-width="1.5"/><polygon points="12,6 6,12 12,18 18,12" fill="#E2761B" opacity="0.3"/><circle cx="12" cy="12" r="2" fill="#E2761B"/></svg>', title: 'Hyperledger Besu', tag: 'Private Chain', desc: 'Enterprise-grade private blockchain infrastructure' },
            { icon: '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M4 4h16v2H4zm0 14h16v2H4zm2-10h12v2H6zm0 4h12v2H6z" fill="#FFF100"/></svg>', title: 'Hardhat', tag: 'Development', desc: 'Testing, deployment, and debugging' },
            { icon: '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M12 2C9.243 2 7 4.243 7 7v3H5v12h14V10h-2V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v3H9V7c0-1.654 1.346-3 3-3z" fill="#E8491D"/></svg>', title: 'Foundry', tag: 'Development', desc: 'Blazing-fast Solidity framework' },
            { icon: '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#6F4CBA" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="#6F4CBA" opacity="0.5"/></svg>', title: 'The Graph', tag: 'Indexing', desc: 'Subgraph development and queries' },
            { icon: '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M11.998 2C6.477 2 2 6.477 2 11.998S6.477 22 11.998 22 22 17.52 22 11.998 17.52 2 11.998 2zm6.81 8.998h-4.812V6.186c2.736.68 4.588 2.626 4.818 4.812h-.006zM11 6.186v4.812H6.19C6.417 8.538 8.536 6.419 11 6.186zm0 6.812v4.818c-2.463-.231-4.583-2.352-4.812-4.818H11zm1 4.818v-4.818h4.812c-.231 2.466-2.352 4.587-4.812 4.818z" fill="#65C2CB"/></svg>', title: 'IPFS', tag: 'Storage', desc: 'Decentralized content addressing' },
            { icon: '<svg viewBox="0 0 24 24" width="36" height="36"><circle cx="12" cy="12" r="2.5" fill="#61DAFB"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="1"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="1" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="1" transform="rotate(120 12 12)"/></svg>', title: 'React / Next.js', tag: 'Frontend', desc: 'Modern dApp user interfaces' },
            { icon: '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M12 2L2 19.778h3.333L12 7.556l6.667 12.222H22L12 2z" fill="#68A063"/><path d="M12 22a3 3 0 100-6 3 3 0 000 6z" fill="#68A063" opacity="0.6"/></svg>', title: 'Node.js / NestJS', tag: 'Backend', desc: 'Server-side blockchain services & APIs' },
            { icon: '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M3 3h18v18H3V3z" fill="none" stroke="#3178C6" stroke-width="1.5"/><text x="12" y="17" text-anchor="middle" font-size="12" font-weight="bold" fill="#3178C6">TS</text></svg>', title: 'TypeScript', tag: 'Language', desc: 'Type-safe application development' },
            { icon: '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M4 12h16M12 4v16M7 7l10 10M17 7L7 17" stroke="#00f0ff" stroke-width="1.5" stroke-linecap="round" fill="none"/><circle cx="12" cy="12" r="3" fill="none" stroke="#00f0ff" stroke-width="1.5"/></svg>', title: 'Web3.js / Ethers.js', tag: 'Library', desc: 'Web3 provider and contract interaction' },
            { icon: '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M12 3L4 9v6l8 6 8-6V9l-8-6zm0 2.5L18 10v4l-6 4.5L6 14v-4l6-4.5z" fill="#4DB33D"/><path d="M12 7l4 3v4l-4 3-4-3v-4l4-3z" fill="#4DB33D" opacity="0.4"/></svg>', title: 'MongoDB / PostgreSQL', tag: 'Database', desc: 'NoSQL & relational data management' },
        ];

        track.innerHTML = techStack.map(t => `
      <div class="tech-card">
        <span class="tech-card__icon">${t.icon}</span>
        <h3 class="tech-card__title">${t.title}</h3>
        <span class="tech-card__tag">${t.tag}</span>
        <p class="tech-card__desc">${t.desc}</p>
      </div>
    `).join('');

        const scrollAmount = 240;
        prevBtn.addEventListener('click', () => {
            slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    _initMagneticButtons() {
        const buttons = document.querySelectorAll('.btn, .wallet-btn, .social-link, .tech-slider__btn');
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    _initCopyEmail() {
        const btn = document.getElementById('copy-email-btn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const email = btn.dataset.email;
            navigator.clipboard.writeText(email).then(() => {
                const original = btn.textContent;
                btn.textContent = 'Copied!';
                btn.classList.add('btn--copied');
                setTimeout(() => {
                    btn.textContent = original;
                    btn.classList.remove('btn--copied');
                }, 2000);
            });
        });
    }

    _initMobileMenu() {
        const hamburger = document.getElementById('nav-hamburger');
        const menu = document.getElementById('mobile-menu');
        const links = menu.querySelectorAll('.mobile-menu__link');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            menu.classList.toggle('active');
            document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    _initParallax() {
        const cinematic = document.querySelector('.section--cinematic');
        if (!cinematic) return;

        gsap.to(cinematic, {
            backgroundPositionY: '30%',
            ease: 'none',
            scrollTrigger: {
                trigger: cinematic,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });
    }
}
