class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private isPlayingBgm: boolean = false;

  constructor() {
    // Initialize on first user interaction typically, but we setup structure here
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3; // Default volume
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx?.currentTime || 0);
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 1, fadeOut: boolean = true) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playHitBrick() {
    this.playTone(400 + Math.random() * 200, 'square', 0.1, 0.5);
  }

  public playHitPaddle() {
    this.playTone(300, 'sine', 0.1, 0.6);
  }

  public playHitWall() {
    this.playTone(150, 'triangle', 0.05, 0.4);
  }

  public playPowerUp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    
    // Arpeggio up
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.2);
    });
  }

  public playLifeLost() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  public playLevelComplete() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    const timing = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

    melody.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now + timing[i]);
      gain.gain.exponentialRampToValueAtTime(0.01, now + timing[i] + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + timing[i]);
      osc.stop(now + timing[i] + 0.3);
    });
  }

  public playExplosion() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    // White noise buffer
    const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    noise.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  public startBGM() {
    if (this.isPlayingBgm || this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    this.isPlayingBgm = true;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.15;
    this.bgmGain.connect(this.masterGain);

    // Simple bassline loop
    const createBass = () => {
      if (!this.isPlayingBgm || !this.ctx || !this.bgmGain) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
      osc.frequency.setValueAtTime(87.31, this.ctx.currentTime + 0.5); // F2
      
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.0);
      
      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.0);
      
      this.bgmOscillators.push(osc);
      
      // Cleanup
      osc.onended = () => {
        const idx = this.bgmOscillators.indexOf(osc);
        if (idx > -1) this.bgmOscillators.splice(idx, 1);
      };
    };

    // Very basic interval sequencer
    const interval = setInterval(() => {
        if(!this.isPlayingBgm) {
            clearInterval(interval);
            return;
        }
        createBass();
    }, 1000);
  }

  public stopBGM() {
    this.isPlayingBgm = false;
    this.bgmOscillators.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    this.bgmOscillators = [];
    if (this.bgmGain) {
      this.bgmGain.disconnect();
      this.bgmGain = null;
    }
  }
}

export const audioService = new AudioService();