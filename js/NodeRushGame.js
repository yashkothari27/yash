/**
 * NodeRushGame — The "Node Rush" mini-game.
 * Catch valid data packets, avoid malicious ones.
 */
class NodeRushGame {
    constructor(smoothScroller, walletManager) {
        this.scroller = smoothScroller;
        this.walletManager = walletManager;

        this.overlay = document.getElementById('game-overlay');
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = document.getElementById('game-score');
        this.finalScoreEl = document.getElementById('final-score');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.shareBtn = document.getElementById('share-score-btn');
        this.mintBtn = document.getElementById('mint-score-btn');

        this.running = false;
        this.score = 0;
        this.player = { x: 0, y: 0, width: 30, height: 30, speed: 8 };
        this.packets = [];
        this.particles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 60; // frames between spawns
        this.difficulty = 1;
        this.frameCount = 0;
        this.keys = { left: false, right: false };
        this.touchStartX = null;
        this.animFrameId = null;

        this.storageKey = 'node_rush_leaderboard';

        this._bind();
        this._renderLeaderboard();
    }

    _bind() {
        // Play buttons
        document.getElementById('play-node-rush').addEventListener('click', () => this.open());
        document.getElementById('game-close').addEventListener('click', () => this.close());
        document.getElementById('play-again-btn').addEventListener('click', () => this.restart());

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (!this.running) return;
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
        });
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
        });

        // Touch
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchStartX = e.touches[0].clientX;
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.touchStartX === null) return;
            const touchX = e.touches[0].clientX;
            const diff = touchX - this.touchStartX;
            this.player.x += diff * 0.8;
            this.player.x = Math.max(0, Math.min(this.canvas.width / this._dpr() - this.player.width, this.player.x));
            this.touchStartX = touchX;
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => {
            this.touchStartX = null;
        });

        // Share on X
        this.shareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const text = encodeURIComponent(`I scored ${this.score} on Yash Kothari's Node Rush game! Can you beat it? ${window.location.href}`);
            window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
        });

        // Mint score NFT
        this.mintBtn.addEventListener('click', async () => {
            if (!this.walletManager || !this.walletManager.isConnected()) return;
            try {
                this.mintBtn.textContent = 'Prompting...';
                // Trigger a mock transaction on Sepolia
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                // Send a minimal self-transaction to demonstrate MetaMask integration
                await signer.sendTransaction({
                    to: await signer.getAddress(),
                    value: 0n,
                    data: ethers.toUtf8Bytes(`NodeRush:Score:${this.score}:${Date.now()}`),
                });
                this.mintBtn.textContent = 'Minted!';
            } catch (err) {
                console.error('Mint failed:', err);
                this.mintBtn.textContent = 'Mint Score as NFT';
            }
        });
    }

    _dpr() {
        return Math.min(window.devicePixelRatio, 2);
    }

    _resizeCanvas() {
        const dpr = this._dpr();
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.scale(dpr, dpr);
        this.logicalWidth = w;
        this.logicalHeight = h;
    }

    open() {
        this.overlay.classList.add('active');
        if (this.scroller) this.scroller.pause();
        this._resizeCanvas();
        this.start();
    }

    close() {
        this.running = false;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        this.overlay.classList.remove('active');
        this.gameOverScreen.style.display = 'none';
        if (this.scroller) this.scroller.resume();
    }

    start() {
        this.score = 0;
        this.packets = [];
        this.particles = [];
        this.frameCount = 0;
        this.difficulty = 1;
        this.spawnInterval = 60;
        this.running = true;
        this.gameOverScreen.style.display = 'none';
        this.scoreEl.textContent = '0';

        // Position player
        this.player.x = this.logicalWidth / 2 - this.player.width / 2;
        this.player.y = this.logicalHeight - 80;

        this._loop();
    }

    restart() {
        this.start();
    }

    _loop() {
        if (!this.running) return;
        this.animFrameId = requestAnimationFrame(() => this._loop());
        this._update();
        this._draw();
    }

    _update() {
        this.frameCount++;

        // Increase difficulty over time
        if (this.frameCount % 300 === 0) {
            this.difficulty += 0.3;
            this.spawnInterval = Math.max(15, 60 - this.difficulty * 5);
        }

        // Player movement
        if (this.keys.left) this.player.x -= this.player.speed;
        if (this.keys.right) this.player.x += this.player.speed;
        this.player.x = Math.max(0, Math.min(this.logicalWidth - this.player.width, this.player.x));

        // Spawn packets
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this._spawnPacket();
        }

        // Update packets
        for (let i = this.packets.length - 1; i >= 0; i--) {
            const p = this.packets[i];
            p.y += p.speed;
            p.rotation += p.rotSpeed;

            // Check collision with player
            if (this._collides(p)) {
                if (p.malicious) {
                    this._gameOver();
                    return;
                } else {
                    this.score += 10;
                    this.scoreEl.textContent = this.score;
                    this._spawnParticles(p.x + p.size / 2, p.y + p.size / 2, p.color);
                    this.packets.splice(i, 1);
                    continue;
                }
            }

            // Off screen
            if (p.y > this.logicalHeight + 20) {
                this.packets.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.life--;
            pt.alpha = pt.life / pt.maxLife;
            if (pt.life <= 0) this.particles.splice(i, 1);
        }
    }

    _spawnPacket() {
        const isMalicious = Math.random() < 0.25 + this.difficulty * 0.02;
        const size = 18 + Math.random() * 12;
        const shapes = ['square', 'triangle', 'hexagon'];
        this.packets.push({
            x: Math.random() * (this.logicalWidth - size),
            y: -size,
            size,
            speed: 2 + this.difficulty * 0.6 + Math.random() * 1.5,
            malicious: isMalicious,
            color: isMalicious ? '#ff3b3b' : (Math.random() > 0.5 ? '#00f0ff' : '#22c55e'),
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            rotation: 0,
            rotSpeed: (Math.random() - 0.5) * 0.05,
        });
    }

    _collides(packet) {
        const px = this.player.x;
        const py = this.player.y;
        const pw = this.player.width;
        const ph = this.player.height;
        return (
            packet.x < px + pw &&
            packet.x + packet.size > px &&
            packet.y < py + ph &&
            packet.y + packet.size > py
        );
    }

    _spawnParticles(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.5;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                color,
                life: 30 + Math.random() * 20,
                maxLife: 50,
                alpha: 1,
            });
        }
    }

    _draw() {
        const ctx = this.ctx;
        const w = this.logicalWidth;
        const h = this.logicalHeight;

        // Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, w, h);

        // Grid lines (subtle)
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 60) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Draw packets
        for (const p of this.packets) {
            ctx.save();
            ctx.translate(p.x + p.size / 2, p.y + p.size / 2);
            ctx.rotate(p.rotation);

            // Glow
            const glowSize = p.size * 1.5;
            const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            glow.addColorStop(0, p.color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);

            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.9;

            if (p.shape === 'square') {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            } else if (p.shape === 'triangle') {
                ctx.beginPath();
                ctx.moveTo(0, -p.size / 2);
                ctx.lineTo(p.size / 2, p.size / 2);
                ctx.lineTo(-p.size / 2, p.size / 2);
                ctx.closePath();
                ctx.fill();
            } else {
                // Hexagon
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i - Math.PI / 6;
                    const hx = Math.cos(angle) * (p.size / 2);
                    const hy = Math.sin(angle) * (p.size / 2);
                    if (i === 0) ctx.moveTo(hx, hy);
                    else ctx.lineTo(hx, hy);
                }
                ctx.closePath();
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            ctx.restore();
        }

        // Draw particles
        for (const pt of this.particles) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = pt.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Draw player
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;
        const time = Date.now() * 0.003;
        const pulseSize = this.player.width / 2 + Math.sin(time) * 3;

        // Player aura
        const aura = ctx.createRadialGradient(px, py, 0, px, py, pulseSize * 3);
        aura.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
        aura.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(px, py, pulseSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Player core
        ctx.beginPath();
        ctx.arc(px, py, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = '#00f0ff';
        ctx.fill();

        // Player inner
        ctx.beginPath();
        ctx.arc(px, py, pulseSize * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }

    _gameOver() {
        this.running = false;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

        this.finalScoreEl.textContent = this.score;
        this.gameOverScreen.style.display = 'flex';

        // Show mint button if wallet connected
        if (this.walletManager && this.walletManager.isConnected()) {
            this.mintBtn.style.display = 'inline-flex';
            this.mintBtn.textContent = 'Mint Score as NFT';
        } else {
            this.mintBtn.style.display = 'none';
        }

        // Save to leaderboard
        this._saveScore(this.score);
        this._renderLeaderboard();
    }

    _saveScore(score) {
        try {
            let lb = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            lb.push({ score, date: new Date().toLocaleDateString() });
            lb.sort((a, b) => b.score - a.score);
            lb = lb.slice(0, 5);
            localStorage.setItem(this.storageKey, JSON.stringify(lb));
        } catch (e) {
            // Silent
        }
    }

    _getLeaderboard() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch {
            return [];
        }
    }

    _renderLeaderboard() {
        const preview = document.getElementById('leaderboard-preview');
        if (!preview) return;
        const lb = this._getLeaderboard().slice(0, 3);
        if (lb.length === 0) {
            preview.innerHTML = '<p class="mono-muted" style="color: rgba(255,255,255,0.3);">No scores yet. Be the first!</p>';
            return;
        }
        preview.innerHTML = lb.map((entry, i) =>
            `<div class="lb-entry"><span class="lb-rank">#${i + 1}</span> ${entry.score} pts</div>`
        ).join('');
    }
}
