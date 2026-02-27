/**
 * SmoothScroller — Lenis wrapper with pause/resume API.
 */
class SmoothScroller {
    constructor() {
        this.lenis = new Lenis({
            lerp: 0.07,
            smoothWheel: true,
            wheelMultiplier: 1,
        });
        this._raf = this._raf.bind(this);
        // Sync Lenis with GSAP ScrollTrigger
        this.lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            this.lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    _raf(time) {
        this.lenis.raf(time);
        requestAnimationFrame(this._raf);
    }

    pause() {
        this.lenis.stop();
    }

    resume() {
        this.lenis.start();
    }

    scrollTo(target, options = {}) {
        this.lenis.scrollTo(target, options);
    }

    destroy() {
        this.lenis.destroy();
    }
}
