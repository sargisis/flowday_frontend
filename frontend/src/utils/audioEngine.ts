
// src/utils/audioEngine.ts

export class AudioEngine {
    private ctx: AudioContext | null = null;
    private gainNode: GainNode | null = null;
    private isPlaying: boolean = false;

    constructor() {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            this.ctx = new AudioContextClass();
        }
    }

    // Generates Brown Noise (Lower frequency, deep rumble like waterfalls/thunder)
    // Much better for focus than White Noise.
    public playBrownNoise() {
        if (!this.ctx) return;
        if (this.isPlaying) return;

        // Create buffer
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Compensate for gain loss
        }

        const brownNoise = this.ctx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        // Lowpass filter to make it softer
        const lowPass = this.ctx.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.value = 400; // Deep sound

        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        // Fade in
        this.gainNode.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 2);

        brownNoise.connect(lowPass);
        lowPass.connect(this.gainNode);
        this.gainNode.connect(this.ctx.destination);
        brownNoise.start(0);

        this.isPlaying = true;
    }

    public stop() {
        if (!this.ctx || !this.gainNode || !this.isPlaying) return;

        // Fade out
        this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);

        setTimeout(() => {
            if (this.ctx) this.ctx.suspend();
            this.isPlaying = false;
        }, 1000);

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public toggle() {
        if (this.isPlaying) {
            this.stop();
            return false;
        } else {
            if (this.ctx?.state === 'suspended') {
                this.ctx.resume();
            }
            this.playBrownNoise();
            return true;
        }
    }
}

let lastOut = 0;
export const focusAudio = new AudioEngine();
