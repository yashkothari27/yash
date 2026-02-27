/**
 * NetworkStats — Live Ethereum gas price and block number fetcher.
 */
class NetworkStats {
    constructor() {
        this.el = document.getElementById('network-stats');
        this.interval = null;
        this.provider = null;

        this._init();
    }

    async _init() {
        try {
            // Use ethers default provider (public endpoints)
            this.provider = ethers.getDefaultProvider('mainnet');
            await this._fetch();
            this.interval = setInterval(() => this._fetch(), 15000);
        } catch (err) {
            console.warn('NetworkStats: Could not connect to provider', err);
            this.el.innerHTML = '<span class="mono-muted">ETH Mainnet | Gas: -- Gwei | Block: #-------</span>';
        }
    }

    async _fetch() {
        if (!this.provider) return;
        try {
            const [feeData, blockNumber] = await Promise.all([
                this.provider.getFeeData(),
                this.provider.getBlockNumber(),
            ]);

            const gasGwei = feeData.gasPrice
                ? (Number(feeData.gasPrice) / 1e9).toFixed(1)
                : '--';

            this.el.innerHTML = `<span class="mono-muted">ETH Mainnet | Gas: ${gasGwei} Gwei | Block: #${blockNumber.toLocaleString()}</span>`;
        } catch (err) {
            console.warn('NetworkStats fetch error:', err);
        }
    }

    destroy() {
        if (this.interval) clearInterval(this.interval);
    }
}
