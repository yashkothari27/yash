/**
 * Cursor — Custom multi-state cursor with dot + outline circle.
 */
class Cursor {
    constructor() {
        this.el = document.getElementById('cursor');
        this.dot = this.el.querySelector('.cursor__dot');
        this.outline = this.el.querySelector('.cursor__outline');
        this.mx = 0;
        this.my = 0;
        this.dx = 0;
        this.dy = 0;
        this.ox = 0;
        this.oy = 0;

        // Check for touch device
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.el.style.display = 'none';
            return;
        }

        this._bind();
        this._loop();
    }

    _bind() {
        document.addEventListener('mousemove', (e) => {
            this.mx = e.clientX;
            this.my = e.clientY;
        });

        // Interactive elements
        const hoverables = document.querySelectorAll('a, button, .project-card, .social-link, .tech-card');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => this.el.classList.add('cursor--hover'));
            el.addEventListener('mouseleave', () => this.el.classList.remove('cursor--hover'));
        });

        // Game play button — crosshair state
        const playBtn = document.getElementById('play-node-rush');
        if (playBtn) {
            playBtn.addEventListener('mouseenter', () => {
                this.el.classList.remove('cursor--hover');
                this.el.classList.add('cursor--crosshair');
            });
            playBtn.addEventListener('mouseleave', () => {
                this.el.classList.remove('cursor--crosshair');
            });
        }

        // Hide on mouse leave
        document.addEventListener('mouseleave', () => { this.el.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { this.el.style.opacity = '1'; });
    }

    _loop() {
        // Dot follows directly
        this.dx = this.mx;
        this.dy = this.my;
        this.dot.style.transform = `translate(${this.dx - 4}px, ${this.dy - 4}px)`;

        // Outline follows with easing
        this.ox += (this.mx - this.ox) * 0.15;
        this.oy += (this.my - this.oy) * 0.15;
        this.outline.style.transform = `translate(${this.ox - 20}px, ${this.oy - 20}px)`;

        requestAnimationFrame(() => this._loop());
    }

    // Re-bind hover states (call after dynamic content changes)
    refresh() {
        const hoverables = document.querySelectorAll('a, button, .project-card, .social-link, .tech-card');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => this.el.classList.add('cursor--hover'));
            el.addEventListener('mouseleave', () => this.el.classList.remove('cursor--hover'));
        });
    }
}
