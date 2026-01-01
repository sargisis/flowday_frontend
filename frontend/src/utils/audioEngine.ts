
// src/utils/audioEngine.ts

export type SoundType = 'brown' | 'white' | 'pink';

export class AudioEngine {
    private ctx: AudioContext | null = null;
    private gainNode: GainNode | null = null;
    private isPlaying: boolean = false;
    private currentType: SoundType = 'brown';
    private sourceNode: AudioBufferSourceNode | null = null;

    constructor() {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            this.ctx = new AudioContextClass();
        }
    }

    private createNoiseBuffer(type: SoundType): AudioBuffer | null {
        if (!this.ctx) return null;
        const bufferSize = 2 * this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);

        if (type === 'white') {
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
        } else if (type === 'pink') {
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11; // (roughly) compensate for gain
                b6 = white * 0.115926;
            }
        } else {
            // Brown noise (default)
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
        }
        return buffer;
    }

    public play(type: SoundType = 'brown') {
        if (!this.ctx) return;

        // If already playing same type, do nothing
        if (this.isPlaying && this.currentType === type) return;

        // If playing different type, stop first
        if (this.isPlaying) {
            this.stop(true); // immediate stop for switch
        }

        this.currentType = type;
        const buffer = this.createNoiseBuffer(type);
        if (!buffer) return;

        this.sourceNode = this.ctx.createBufferSource();
        this.sourceNode.buffer = buffer;
        this.sourceNode.loop = true;

        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 2);

        // Filter based on type to shape the tone
        const filter = this.ctx.createBiquadFilter();
        if (type === 'brown') {
            filter.type = 'lowpass';
            filter.frequency.value = 400;
        } else if (type === 'pink') {
            // Rain-like
            filter.type = 'lowpass';
            filter.frequency.value = 800;
        } else {
            // White noise - cut harsh highs
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
        }

        this.sourceNode.connect(filter);
        filter.connect(this.gainNode);
        this.gainNode.connect(this.ctx.destination);

        this.sourceNode.start(0);
        this.isPlaying = true;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public stop(immediate = false) {
        if (!this.ctx || !this.gainNode || !this.isPlaying) return;

        const fadeTime = immediate ? 0.1 : 1;
        this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fadeTime);

        // Keep reference to stop later
        const source = this.sourceNode;
        setTimeout(() => {
            try {
                source?.stop();
            } catch (e) { /* ignore */ }
        }, fadeTime * 1000 + 100);

        this.isPlaying = false;
    }

    public toggle(type: SoundType = 'brown') {
        if (this.isPlaying && this.currentType === type) {
            this.stop();
            return false; // stopped
        } else {
            this.play(type);
            return true; // playing
        }
    }

    public getActiveType() {
        return this.isPlaying ? this.currentType : null;
    }
}

export const focusAudio = new AudioEngine();
