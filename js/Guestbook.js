/**
 * Guestbook — On-chain guestbook with personal_sign and localStorage persistence.
 */
class Guestbook {
    constructor(walletManager) {
        this.walletManager = walletManager;
        this.storageKey = 'portfolio_guestbook';
        this.entries = this._loadEntries();

        this.ticker = document.getElementById('guestbook-ticker');
        this.countEl = document.getElementById('guestbook-count');
        this.signBtn = document.getElementById('sign-guestbook-btn');

        this._render();
        this._bind();
    }

    _loadEntries() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    _saveEntries() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    }

    _bind() {
        this.signBtn.addEventListener('click', async () => {
            if (!this.walletManager.isConnected()) {
                this.walletManager.connect();
                return;
            }
            await this._signGuestbook();
        });

        window.addEventListener('walletConnected', () => {
            this.signBtn.textContent = 'Sign the Guestbook';
        });

        window.addEventListener('walletDisconnected', () => {
            this.signBtn.textContent = 'Connect Wallet to Sign';
        });
    }

    async _signGuestbook() {
        const address = this.walletManager.getAddress();
        if (!address) return;

        // Check if already signed
        if (this.entries.some(e => e.address.toLowerCase() === address.toLowerCase())) {
            this.signBtn.textContent = 'Already Signed!';
            setTimeout(() => { this.signBtn.textContent = 'Sign the Guestbook'; }, 2000);
            return;
        }

        const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        const message = `I visited Yash Kothari's portfolio on ${date}`;

        try {
            this.signBtn.textContent = 'Signing...';
            const signature = await this.walletManager.signMessage(message);
            const displayName = this.walletManager.getDisplayName();

            this.entries.push({
                address,
                displayName,
                date,
                signature: signature.slice(0, 20) + '...',
                timestamp: Date.now(),
            });

            this._saveEntries();
            this._render();
            this.signBtn.textContent = 'Signed!';
            setTimeout(() => { this.signBtn.textContent = 'Sign the Guestbook'; }, 2000);
        } catch (err) {
            console.error('Guestbook signing failed:', err);
            this.signBtn.textContent = 'Sign the Guestbook';
        }
    }

    _render() {
        // Update count
        const count = this.entries.length;
        this.countEl.textContent = `${count} builder${count !== 1 ? 's have' : ' has'} visited`;

        if (count === 0) {
            this.ticker.innerHTML = '<p style="font-family: var(--font-mono); font-size: 0.8rem; color: rgba(17,17,17,0.3);">Be the first to sign the guestbook.</p>';
            return;
        }

        // Create ticker with duplicate for seamless loop
        const entriesHtml = this.entries.map(e =>
            `<span class="guestbook__entry">${e.displayName || e.address.slice(0, 6) + '...' + e.address.slice(-4)} · ${e.date}</span>`
        ).join('');

        this.ticker.innerHTML = `
      <div class="guestbook__ticker-track">
        ${entriesHtml}
        ${entriesHtml}
      </div>
    `;
    }
}
