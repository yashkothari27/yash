/**
 * Loader — Preload manager with progress UI and blockchain-themed messages.
 */
class Loader {
  constructor() {
    this.el = document.getElementById('loader');
    this.percentEl = document.getElementById('loader-percentage');
    this.messageEl = document.getElementById('loader-message');
    this.progress = 0;
    this.messages = [
      'Initializing chain...',
      'Compiling contracts...',
      'Syncing nodes...',
      'Verifying proofs...',
      'Mining genesis block...',
      'Deploying bytecode...',
      'Hashing merkle tree...',
      'Connecting peers...',
      'Validating state...',
      'Finalizing blocks...'
    ];
    this._messageIndex = 0;
    this._messageInterval = null;
    this._resolveReady = null;
    this.ready = new Promise(resolve => { this._resolveReady = resolve; });
  }

  start() {
    this._messageInterval = setInterval(() => {
      this._messageIndex = (this._messageIndex + 1) % this.messages.length;
      this.messageEl.textContent = this.messages[this._messageIndex];
    }, 800);
    // Simulate loading progress
    this._simulateProgress();
  }

  _simulateProgress() {
    const step = () => {
      if (this.progress >= 100) {
        this.complete();
        return;
      }
      // Variable speed — slows near the end
      const increment = this.progress < 70 ? Math.random() * 8 + 2 : Math.random() * 3 + 0.5;
      this.progress = Math.min(100, this.progress + increment);
      this.percentEl.textContent = Math.round(this.progress) + '%';
      const delay = this.progress < 70 ? 60 + Math.random() * 80 : 100 + Math.random() * 150;
      setTimeout(step, delay);
    };
    step();
  }

  setProgress(value) {
    this.progress = Math.min(100, value);
    this.percentEl.textContent = Math.round(this.progress) + '%';
    if (this.progress >= 100) this.complete();
  }

  complete() {
    clearInterval(this._messageInterval);
    this.percentEl.textContent = '100%';
    this.messageEl.textContent = 'Ready.';
    setTimeout(() => {
      this.el.classList.add('loaded');
      setTimeout(() => {
        this.el.style.display = 'none';
        if (this._resolveReady) this._resolveReady();
      }, 800);
    }, 400);
  }
}
