/**
 * ChainExperience — Dual-canvas procedural blockchain animation engine.
 * Generates frames procedurally: particles converging into a blockchain network structure.
 */
class ChainExperience {
    constructor() {
        this.fgCanvas = document.getElementById('chain-canvas');
        this.bgCanvas = document.getElementById('ambient-canvas');
        this.fgCtx = this.fgCanvas.getContext('2d');
        this.bgCtx = this.bgCanvas.getContext('2d');
        this.heroOverlay = document.getElementById('hero-overlay');
        this.scrollHint = document.getElementById('hero-scroll-hint');

        this.totalFrames = 242;
        this.currentFrame = 0;
        this.particles = [];
        this.connections = [];
        this.numParticles = 80;
        this.numNodes = 12;

        this._resize();
        this._initParticles();
        this._setupScrollTrigger();
        this._bindEvents();

        // Show scroll hint after a delay
        setTimeout(() => this.scrollHint.classList.add('visible'), 2000);
    }

    _resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.width = w;
        this.height = h;

        this.fgCanvas.width = w * dpr;
        this.fgCanvas.height = h * dpr;
        this.fgCanvas.style.width = w + 'px';
        this.fgCanvas.style.height = h + 'px';
        this.fgCtx.scale(dpr, dpr);

        this.bgCanvas.width = w * dpr;
        this.bgCanvas.height = h * dpr;
        this.bgCtx.scale(dpr, dpr);
    }

    _initParticles() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        // Main chain nodes — arranged in a horizontal chain
        this.chainNodes = [];
        for (let i = 0; i < this.numNodes; i++) {
            const angle = (i / this.numNodes) * Math.PI * 2;
            const radius = Math.min(this.width, this.height) * 0.25;
            this.chainNodes.push({
                targetX: cx + Math.cos(angle) * radius,
                targetY: cy + Math.sin(angle) * radius,
                startX: Math.random() * this.width,
                startY: Math.random() * this.height,
                size: 4 + Math.random() * 4,
                pulsePhase: Math.random() * Math.PI * 2,
            });
        }

        // Ambient particles
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: 1 + Math.random() * 2,
                alpha: 0.1 + Math.random() * 0.3,
            });
        }
    }

    _setupScrollTrigger() {
        const self = this;
        ScrollTrigger.create({
            trigger: '#hero',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
            onUpdate: (st) => {
                self.currentFrame = Math.floor(st.progress * (self.totalFrames - 1));
                self._render();
            },
            onLeave: () => {
                self.heroOverlay.style.display = 'none';
            },
            onEnterBack: () => {
                self.heroOverlay.style.display = 'flex';
            },
        });

        // Control hero overlay opacity based on scroll
        gsap.to(this.heroOverlay, {
            opacity: 0,
            scrollTrigger: {
                trigger: '#hero',
                start: '10% top',
                end: '25% top',
                scrub: true,
            },
        });
    }

    _bindEvents() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this._resize();
                this._initParticles();
                this._render();
            }, 200);
        });
        // Initial render
        this._render();
    }

    _render() {
        const progress = this.currentFrame / (this.totalFrames - 1);
        this._drawForeground(progress);
        this._drawBackground(progress);
    }

    _drawForeground(progress) {
        const ctx = this.fgCtx;
        const w = this.width;
        const h = this.height;
        const cx = w / 2;
        const cy = h / 2;
        const time = Date.now() * 0.001;

        ctx.clearRect(0, 0, w, h);

        // Dark background with subtle radial gradient
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.7);
        grad.addColorStop(0, 'rgba(0, 20, 30, 1)');
        grad.addColorStop(1, 'rgba(10, 10, 10, 1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Draw ambient particles
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha * (0.3 + progress * 0.7)})`;
            ctx.fill();
        }

        // Draw chain nodes — converging based on progress
        const convergeProgress = Math.min(1, progress * 2); // Converge in first half
        const pulseProgress = Math.max(0, (progress - 0.3) / 0.7); // Pulse in second part

        for (let i = 0; i < this.chainNodes.length; i++) {
            const node = this.chainNodes[i];
            const eased = this._easeInOutCubic(convergeProgress);
            const x = node.startX + (node.targetX - node.startX) * eased;
            const y = node.startY + (node.targetY - node.startY) * eased;
            node.currentX = x;
            node.currentY = y;

            const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.3 + 0.7;
            const nodeSize = node.size * (1 + pulseProgress * 0.5 * pulse);

            // Glow
            const glowSize = nodeSize * (3 + pulseProgress * 4);
            const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
            glowGrad.addColorStop(0, `rgba(0, 240, 255, ${0.3 * pulseProgress * pulse})`);
            glowGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(x, y, glowSize, 0, Math.PI * 2);
            ctx.fill();

            // Core node
            ctx.beginPath();
            ctx.arc(x, y, nodeSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 240, 255, ${0.5 + pulseProgress * 0.5})`;
            ctx.fill();

            // Inner bright
            ctx.beginPath();
            ctx.arc(x, y, nodeSize * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + pulseProgress * 0.4})`;
            ctx.fill();
        }

        // Draw connections between nodes (chain links)
        if (convergeProgress > 0.3) {
            const linkAlpha = Math.min(1, (convergeProgress - 0.3) / 0.7);
            ctx.strokeStyle = `rgba(0, 240, 255, ${linkAlpha * 0.35})`;
            ctx.lineWidth = 1.5;

            for (let i = 0; i < this.chainNodes.length; i++) {
                const a = this.chainNodes[i];
                const b = this.chainNodes[(i + 1) % this.chainNodes.length];

                if (a.currentX && b.currentX) {
                    ctx.beginPath();
                    ctx.moveTo(a.currentX, a.currentY);
                    ctx.lineTo(b.currentX, b.currentY);
                    ctx.stroke();

                    // Energy pulse traveling along connection
                    if (pulseProgress > 0) {
                        const pulsePos = ((time * 0.5 + i * 0.3) % 1);
                        const px = a.currentX + (b.currentX - a.currentX) * pulsePos;
                        const py = a.currentY + (b.currentY - a.currentY) * pulsePos;
                        const pulseGrad = ctx.createRadialGradient(px, py, 0, px, py, 8);
                        pulseGrad.addColorStop(0, `rgba(0, 240, 255, ${0.8 * pulseProgress})`);
                        pulseGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
                        ctx.fillStyle = pulseGrad;
                        ctx.beginPath();
                        ctx.arc(px, py, 8, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            // Cross-connections for mesh effect
            if (convergeProgress > 0.6) {
                const meshAlpha = (convergeProgress - 0.6) / 0.4;
                ctx.strokeStyle = `rgba(139, 92, 246, ${meshAlpha * 0.15})`;
                ctx.lineWidth = 0.5;
                for (let i = 0; i < this.chainNodes.length; i++) {
                    for (let j = i + 2; j < this.chainNodes.length; j++) {
                        if ((i + j) % 3 !== 0) continue;
                        const a = this.chainNodes[i];
                        const b = this.chainNodes[j];
                        if (!a.currentX || !b.currentX) continue;
                        const dist = Math.hypot(b.currentX - a.currentX, b.currentY - a.currentY);
                        if (dist > this.width * 0.4) continue;
                        ctx.beginPath();
                        ctx.moveTo(a.currentX, a.currentY);
                        ctx.lineTo(b.currentX, b.currentY);
                        ctx.stroke();
                    }
                }
            }
        }

        // Hexagonal block shapes appearing in late progress
        if (progress > 0.5) {
            const blockAlpha = (progress - 0.5) / 0.5;
            for (let i = 0; i < 3; i++) {
                const node = this.chainNodes[i * 4 % this.chainNodes.length];
                if (!node.currentX) continue;
                this._drawHexagon(ctx, node.currentX, node.currentY, 20 + i * 5, `rgba(0, 240, 255, ${blockAlpha * 0.15})`, time + i);
            }
        }
    }

    _drawHexagon(ctx, x, y, size, color, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation * 0.3);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = Math.cos(angle) * size;
            const py = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    _drawBackground(progress) {
        const ctx = this.bgCtx;
        const w = this.width;
        const h = this.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        // Create ambient glow based on current animation state
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.8);
        const intensity = 0.15 + progress * 0.3;
        grad.addColorStop(0, `rgba(0, ${Math.floor(100 + progress * 140)}, ${Math.floor(150 + progress * 105)}, ${intensity})`);
        grad.addColorStop(0.5, `rgba(0, ${Math.floor(40 + progress * 60)}, ${Math.floor(60 + progress * 80)}, ${intensity * 0.5})`);
        grad.addColorStop(1, 'rgba(10, 10, 10, 1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Subtle violet accent
        const vGrad = ctx.createRadialGradient(w * 0.3, h * 0.7, 0, w * 0.3, h * 0.7, w * 0.5);
        vGrad.addColorStop(0, `rgba(139, 92, 246, ${progress * 0.08})`);
        vGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = vGrad;
        ctx.fillRect(0, 0, w, h);
    }

    _easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}
