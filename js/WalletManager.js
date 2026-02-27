/**
 * WalletManager — Ethers.js wallet integration with ENS, network detection, and UI state management.
 */
class WalletManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.ensName = null;
        this.networkName = null;
        this.connected = false;

        this.btn = document.getElementById('wallet-btn');
        this.btnText = document.getElementById('wallet-btn-text');
        this.heroEyebrow = document.getElementById('hero-eyebrow');
        this.signGuestbookBtn = document.getElementById('sign-guestbook-btn');
        this.mintScoreBtn = document.getElementById('mint-score-btn');

        this._createTooltip();
        this._bind();
        this._checkExistingConnection();
    }

    _createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'wallet-tooltip';
        this.tooltip.innerHTML = `
      <span class="wallet-tooltip__network" id="wallet-network"></span>
      <button class="wallet-tooltip__disconnect" id="wallet-disconnect">Disconnect</button>
    `;
        this.btn.appendChild(this.tooltip);
        this.btn.style.position = 'relative';

        document.getElementById('wallet-disconnect').addEventListener('click', (e) => {
            e.stopPropagation();
            this.disconnect();
        });
    }

    _bind() {
        this.btn.addEventListener('click', () => {
            if (!this.connected) this.connect();
        });
    }

    async _checkExistingConnection() {
        if (typeof window.ethereum === 'undefined') return;
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await this._handleConnected(accounts[0]);
            }
        } catch (e) {
            // Silent fail
        }
    }

    async connect() {
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask or another Web3 wallet to connect.');
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);
            if (accounts.length > 0) {
                await this._handleConnected(accounts[0]);
            }
        } catch (err) {
            console.error('Wallet connection failed:', err);
        }
    }

    async _handleConnected(address) {
        this.address = address;
        this.connected = true;
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();

        // Get network
        const network = await this.provider.getNetwork();
        this.networkName = this._getNetworkName(network.chainId);

        // Try ENS resolution
        try {
            const mainnetProvider = ethers.getDefaultProvider('mainnet');
            this.ensName = await mainnetProvider.lookupAddress(address);
        } catch (e) {
            this.ensName = null;
        }

        this._updateUI();
        this._listenForChanges();

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('walletConnected', {
            detail: { address, ensName: this.ensName, networkName: this.networkName }
        }));
    }

    _getNetworkName(chainId) {
        const networks = {
            1n: 'Ethereum Mainnet',
            5n: 'Goerli Testnet',
            11155111n: 'Sepolia Testnet',
            137n: 'Polygon',
            80001n: 'Mumbai',
            42161n: 'Arbitrum',
            10n: 'Optimism',
            8453n: 'Base',
            84532n: 'Base Sepolia',
        };
        return networks[chainId] || `Chain ${chainId}`;
    }

    _truncateAddress(addr) {
        return addr.slice(0, 6) + '...' + addr.slice(-4);
    }

    _updateUI() {
        const displayName = this.ensName || this._truncateAddress(this.address);

        // Button state
        this.btn.classList.add('connected');
        this.btnText.textContent = displayName;

        // Network tooltip
        const networkEl = document.getElementById('wallet-network');
        if (networkEl) networkEl.textContent = this.networkName;

        // Hero greeting
        if (this.heroEyebrow) {
            this.heroEyebrow.textContent = `GM, ${displayName}`;
        }

        // Guestbook button
        if (this.signGuestbookBtn) {
            this.signGuestbookBtn.textContent = 'Sign the Guestbook';
        }

        // Mint score button
        if (this.mintScoreBtn) {
            this.mintScoreBtn.style.display = 'inline-flex';
        }
    }

    disconnect() {
        this.address = null;
        this.ensName = null;
        this.connected = false;
        this.provider = null;
        this.signer = null;

        // Reset UI
        this.btn.classList.remove('connected');
        this.btnText.textContent = 'Connect Wallet';
        if (this.heroEyebrow) {
            this.heroEyebrow.textContent = 'BLOCKCHAIN DEVELOPER';
        }
        if (this.signGuestbookBtn) {
            this.signGuestbookBtn.textContent = 'Connect Wallet to Sign';
        }
        if (this.mintScoreBtn) {
            this.mintScoreBtn.style.display = 'none';
        }

        window.dispatchEvent(new CustomEvent('walletDisconnected'));
    }

    _listenForChanges() {
        if (!window.ethereum) return;

        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                this.disconnect();
            } else {
                this._handleConnected(accounts[0]);
            }
        });

        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });
    }

    async signMessage(message) {
        if (!this.signer) throw new Error('No signer available');
        return await this.signer.signMessage(message);
    }

    getAddress() { return this.address; }
    getDisplayName() { return this.ensName || (this.address ? this._truncateAddress(this.address) : null); }
    isConnected() { return this.connected; }
}
