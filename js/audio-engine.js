/**
 * KASINA θ PRO - AUDIO ENGINE MODULE
 * Clock maître unique (AudioContext.currentTime)
 * Encodage AudioStrobe® et SpectraStrobe™
 * Anti-habituation avec micro-variations
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterClock = 0;
        this.isRunning = false;
        this.nodes = {};
        this.buffer = null;
        this.sourceNode = null;
        this.analyser = null;
        
        // Encoding settings
        this.encodingType = 'none'; // 'none', 'audiostrobe', 'spectrastrobe'
        this.carrierFreq = 19000;
        this.encodingLevel = -18;
        
        // Anti-habituation
        this.antiHabituationLevel = 0.15;
        this.microVariationPhase = 0;
        
        // Light sync callback
        this.onLightUpdate = null;
    }
    
    async init() {
        if (this.audioContext) return;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ 
            sampleRate: 44100,
            latencyHint: 'playback'
        });
    }
    
    getMasterTime() {
        return this.audioContext ? this.audioContext.currentTime : 0;
    }
    
    dbToLinear(db) {
        return Math.pow(10, db / 20);
    }
    
    // ============================================
    // PINK NOISE GENERATOR
    // ============================================
    generatePinkNoise(length) {
        const output = new Float32Array(length);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        
        for (let i = 0; i < length; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
        return output;
    }
    
    // ============================================
    // ANTI-HABITUATION MICRO-VARIATIONS
    // ============================================
    getMicroVariation(t, baseFreq, amount) {
        if (amount <= 0) return baseFreq;
        
        // Multiple slow oscillators for organic variation
        const v1 = Math.sin(t * 0.1) * 0.3;
        const v2 = Math.sin(t * 0.23) * 0.2;
        const v3 = Math.sin(t * 0.07) * 0.5;
        
        const variation = (v1 + v2 + v3) * amount * baseFreq * 0.02;
        return baseFreq + variation;
    }
    
    // ============================================
    // AUDIOSTROBE ENCODING (2 channels)
    // ============================================
    generateAudioStrobe(t, lightModL, lightModR, params) {
        const carrierFreq = params.carrierFreq || 19000;
        const level = this.dbToLinear(params.encodingLevel || -18);
        
        // Carrier wave
        const carrier = Math.sin(2 * Math.PI * carrierFreq * t);
        
        // AM modulated signals for left and right
        const asLeft = carrier * lightModL * level;
        const asRight = carrier * lightModR * level;
        
        return { left: asLeft, right: asRight };
    }
    
    // ============================================
    // SPECTRASTROBE ENCODING (6 RGB channels)
    // ============================================
    generateSpectraStrobe(t, lightModL, lightModR, rgb, params) {
        const baseFreq = params.carrierFreq || 17500;
        const level = this.dbToLinear(params.encodingLevel || -18);
        
        // RGB values normalized
        const r = rgb.r / 100;
        const g = rgb.g / 100;
        const b = rgb.b / 100;
        
        // 6 carrier frequencies (500Hz spacing)
        const freqLR = baseFreq;
        const freqLG = baseFreq + 500;
        const freqLB = baseFreq + 1000;
        const freqRR = baseFreq + 1500;
        const freqRG = baseFreq + 2000;
        const freqRB = baseFreq + 2500;
        
        // Generate each channel
        const ssLR = Math.sin(2 * Math.PI * freqLR * t) * r * lightModL;
        const ssLG = Math.sin(2 * Math.PI * freqLG * t) * g * lightModL;
        const ssLB = Math.sin(2 * Math.PI * freqLB * t) * b * lightModL;
        const ssRR = Math.sin(2 * Math.PI * freqRR * t) * r * lightModR;
        const ssRG = Math.sin(2 * Math.PI * freqRG * t) * g * lightModR;
        const ssRB = Math.sin(2 * Math.PI * freqRB * t) * b * lightModR;
        
        // Mix into stereo
        const left = (ssLR + ssLG + ssLB) * level / 3;
        const right = (ssRR + ssRG + ssRB) * level / 3;
        
        return { left, right };
    }
    
    // ============================================
    // LIGHT MODULATION (sample-accurate from audio)
    // ============================================
    calculateLightMod(t, params) {
        const beat = params.beat || 4;
        const depth = (params.lightModDepth || 100) / 100;
        const brightness = (params.brightness || 70) / 100;
        const phase = (params.lightPhase || 50) / 100;
        
        // Apply waveform
        let modL, modR;
        const wavePhase = t * beat * Math.PI * 2;
        
        switch (params.lightWaveform || 'sine') {
            case 'square':
                modL = Math.sin(wavePhase) > 0 ? 1 : 0;
                modR = Math.sin(wavePhase + phase * Math.PI * 2) > 0 ? 1 : 0;
                break;
            case 'triangle':
                modL = Math.abs(((t * beat * 2) % 2) - 1);
                modR = Math.abs((((t + phase / beat) * beat * 2) % 2) - 1);
                break;
            case 'sawtooth':
                modL = (t * beat) % 1;
                modR = ((t + phase / beat) * beat) % 1;
                break;
            default: // sine
                modL = (Math.sin(wavePhase) * 0.5 + 0.5);
                modR = (Math.sin(wavePhase + phase * Math.PI * 2) * 0.5 + 0.5);
        }
        
        // Apply depth and brightness
        modL = modL * depth + (1 - depth);
        modR = modR * depth + (1 - depth);
        modL *= brightness;
        modR *= brightness;
        
        return { left: modL, right: modR };
    }
    
    // ============================================
    // WHISPER SYNTHESIS (basic formant)
    // ============================================
    generateWhisperSample(t, params) {
        const baseFreq = 280 + Math.sin(t * 2.5) * 40;
        const f1 = Math.sin(2 * Math.PI * baseFreq * t);
        const f2 = Math.sin(2 * Math.PI * (baseFreq * 1.5) * t) * 0.5;
        const f3 = Math.sin(2 * Math.PI * (baseFreq * 2.2) * t) * 0.25;
        const noise = (Math.random() * 2 - 1) * 0.2;
        
        return (f1 + f2 + f3 + noise) * 0.35;
    }
    
    // ============================================
    // BREATH PHASE CALCULATION
    // ============================================
    getBreathPhase(t, params) {
        const cycle = params.breathInhale + params.breathHold + params.breathExhale + params.breathPause;
        const pos = t % cycle;
        
        if (pos < params.breathInhale) {
            return { phase: 'inhale', progress: pos / params.breathInhale, remaining: params.breathInhale - pos };
        }
        if (pos < params.breathInhale + params.breathHold) {
            return { phase: 'hold', progress: (pos - params.breathInhale) / Math.max(0.1, params.breathHold), remaining: params.breathInhale + params.breathHold - pos };
        }
        if (pos < params.breathInhale + params.breathHold + params.breathExhale) {
            return { phase: 'exhale', progress: (pos - params.breathInhale - params.breathHold) / params.breathExhale, remaining: params.breathInhale + params.breathHold + params.breathExhale - pos };
        }
        return { phase: 'pause', progress: (pos - params.breathInhale - params.breathHold - params.breathExhale) / Math.max(0.1, params.breathPause), remaining: cycle - pos };
    }
    
    shouldWhisper(t, params) {
        const cycle = params.breathInhale + params.breathHold + params.breathExhale + params.breathPause;
        
        if (params.syncMode === 'breath') {
            const pos = t % cycle;
            const exhaleStart = params.breathInhale + params.breathHold;
            return pos >= exhaleStart && pos < exhaleStart + 0.5;
        } else if (params.syncMode === 'walk') {
            const stepInterval = 60 / (params.walkTempo || 60);
            const stepNum = Math.floor(t / stepInterval);
            return stepNum % 8 === 0 && (t % stepInterval) < 0.3;
        }
        return (t % (params.whisperInterval || 20)) < 0.5;
    }
    
    // ============================================
    // EEG SWEEP FREQUENCY CALCULATION
    // ============================================
    calculateSweepFreq(t, duration, sweepProfile) {
        if (!sweepProfile || !sweepProfile.segments) return 4;
        
        const progress = (t / duration);
        let cumulative = 0;
        
        for (const segment of sweepProfile.segments) {
            if (progress <= cumulative + segment.duration) {
                const segProgress = (progress - cumulative) / segment.duration;
                return segment.startFreq + (segment.endFreq - segment.startFreq) * segProgress;
            }
            cumulative += segment.duration;
        }
        
        return sweepProfile.segments[sweepProfile.segments.length - 1].endFreq;
    }
    
    // ============================================
    // MAIN AUDIO GENERATION
    // ============================================
    async generateSession(params, onProgress) {
        await this.init();
        
        const sampleRate = this.audioContext.sampleRate;
        const numSamples = params.duration * sampleRate;
        
        const leftChannel = new Float32Array(numSamples);
        const rightChannel = new Float32Array(numSamples);
        
        // Generate pink noise
        if (onProgress) onProgress(5, 'Génération pink noise...');
        const pinkNoise = this.generatePinkNoise(numSamples);
        
        const chunkSize = sampleRate * 3;
        
        for (let chunk = 0; chunk < Math.ceil(numSamples / chunkSize); chunk++) {
            const start = chunk * chunkSize;
            const end = Math.min(start + chunkSize, numSamples);
            
            for (let i = start; i < end; i++) {
                const t = i / sampleRate;
                
                // Apply sweep if active
                let currentBeat = params.beat;
                if (params.sweepProfile) {
                    currentBeat = this.calculateSweepFreq(t, params.duration, params.sweepProfile);
                }
                
                // Anti-habituation micro-variations
                const freqLeftVar = this.getMicroVariation(t, params.freqLeft, params.antiHabituation || 0.15);
                const freqRightVar = this.getMicroVariation(t, params.freqRight, params.antiHabituation || 0.15);
                
                // Base tones with waveform
                let toneL, toneR;
                const waveform = params.sndWaveform || 'sine';
                const phaseL = 2 * Math.PI * freqLeftVar * t;
                const phaseR = 2 * Math.PI * freqRightVar * t;
                
                switch (waveform) {
                    case 'square':
                        toneL = Math.sin(phaseL) > 0 ? 1 : -1;
                        toneR = Math.sin(phaseR) > 0 ? 1 : -1;
                        break;
                    case 'triangle':
                        toneL = Math.asin(Math.sin(phaseL)) * 2 / Math.PI;
                        toneR = Math.asin(Math.sin(phaseR)) * 2 / Math.PI;
                        break;
                    case 'sawtooth':
                        toneL = ((t * freqLeftVar) % 1) * 2 - 1;
                        toneR = ((t * freqRightVar) % 1) * 2 - 1;
                        break;
                    default:
                        toneL = Math.sin(phaseL);
                        toneR = Math.sin(phaseR);
                }
                
                toneL *= params.toneVolume;
                toneR *= params.toneVolume;
                
                // Pink noise
                const pink = pinkNoise[i] * params.noiseVolume;
                
                // Whisper
                let whisper = 0;
                if (this.shouldWhisper(t, params)) {
                    const wt = t % 2;
                    const env = Math.sin(Math.PI * wt / 0.5) * (wt < 0.5 ? 1 : 0);
                    whisper = this.generateWhisperSample(t, params) * env * params.whisperVolume;
                }
                
                // Light modulation (sample-accurate)
                const lightMod = this.calculateLightMod(t, { ...params, beat: currentBeat });
                
                // Encoding signals
                let encLeft = 0, encRight = 0;
                if (params.encoding === 'audiostrobe') {
                    const as = this.generateAudioStrobe(t, lightMod.left, lightMod.right, params);
                    encLeft = as.left;
                    encRight = as.right;
                } else if (params.encoding === 'spectrastrobe') {
                    const ss = this.generateSpectraStrobe(t, lightMod.left, lightMod.right, params.rgb, params);
                    encLeft = ss.left;
                    encRight = ss.right;
                }
                
                // Envelope (fade in/out)
                let envelope = 1;
                if (t < params.fadeTime) {
                    envelope = t / params.fadeTime;
                } else if (t > params.duration - params.fadeTime) {
                    envelope = (params.duration - t) / params.fadeTime;
                }
                
                // Final mix
                leftChannel[i] = ((toneL + pink + whisper) * envelope + encLeft) * 0.8;
                rightChannel[i] = ((toneR + pink + whisper) * envelope + encRight) * 0.8;
                
                // Clip protection
                leftChannel[i] = Math.max(-1, Math.min(1, leftChannel[i]));
                rightChannel[i] = Math.max(-1, Math.min(1, rightChannel[i]));
            }
            
            if (onProgress) {
                const progress = 10 + (end / numSamples) * 80;
                onProgress(progress, `${Math.round(end / sampleRate)}s / ${params.duration}s`);
            }
            
            // Yield to UI
            await new Promise(r => setTimeout(r, 0));
        }
        
        // Create buffer
        if (onProgress) onProgress(95, 'Création du buffer...');
        
        this.buffer = this.audioContext.createBuffer(2, numSamples, sampleRate);
        this.buffer.copyToChannel(leftChannel, 0);
        this.buffer.copyToChannel(rightChannel, 1);
        
        // Store for export
        this.generatedLeft = leftChannel;
        this.generatedRight = rightChannel;
        this.generatedParams = params;
        
        if (onProgress) onProgress(100, 'Prêt !');
        
        return this.buffer;
    }
    
    // ============================================
    // PLAYBACK CONTROL
    // ============================================
    play(offset = 0) {
        if (!this.buffer || !this.audioContext) return;
        
        this.stop();
        
        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = this.buffer;
        
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        
        this.sourceNode.start(0, offset);
        this.startTime = this.audioContext.currentTime - offset;
        this.isRunning = true;
        
        this.sourceNode.onended = () => {
            this.isRunning = false;
        };
    }
    
    pause() {
        if (!this.isRunning) return 0;
        const elapsed = this.audioContext.currentTime - this.startTime;
        this.stop();
        return elapsed;
    }
    
    stop() {
        if (this.sourceNode) {
            try { this.sourceNode.stop(); } catch(e) {}
            this.sourceNode = null;
        }
        this.isRunning = false;
    }
    
    getCurrentTime() {
        if (!this.isRunning || !this.audioContext) return 0;
        return this.audioContext.currentTime - this.startTime;
    }
    
    getAnalyserData() {
        if (!this.analyser) return null;
        const data = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteTimeDomainData(data);
        return data;
    }
    
    // ============================================
    // EXPORT FUNCTIONS
    // ============================================
    bufferToWav() {
        if (!this.buffer) return null;
        
        const numCh = 2;
        const sr = this.buffer.sampleRate;
        const bits = 16;
        const bytesPerSample = bits / 8;
        const blockAlign = numCh * bytesPerSample;
        const dataLen = this.buffer.length * blockAlign;
        const bufLen = 44 + dataLen;
        
        const ab = new ArrayBuffer(bufLen);
        const v = new DataView(ab);
        
        const writeString = (offset, str) => {
            for (let i = 0; i < str.length; i++) {
                v.setUint8(offset + i, str.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        v.setUint32(4, bufLen - 8, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        v.setUint32(16, 16, true);
        v.setUint16(20, 1, true);
        v.setUint16(22, numCh, true);
        v.setUint32(24, sr, true);
        v.setUint32(28, sr * blockAlign, true);
        v.setUint16(32, blockAlign, true);
        v.setUint16(34, bits, true);
        writeString(36, 'data');
        v.setUint32(40, dataLen, true);
        
        const L = this.buffer.getChannelData(0);
        const R = this.buffer.getChannelData(1);
        let offset = 44;
        
        for (let i = 0; i < this.buffer.length; i++) {
            const sL = Math.max(-1, Math.min(1, L[i]));
            const sR = Math.max(-1, Math.min(1, R[i]));
            v.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7FFF, true);
            v.setInt16(offset + 2, sR < 0 ? sR * 0x8000 : sR * 0x7FFF, true);
            offset += 4;
        }
        
        return new Blob([ab], { type: 'audio/wav' });
    }
    
    async bufferToMp3() {
        if (!this.buffer || typeof lamejs === 'undefined') return null;
        
        const L = this.buffer.getChannelData(0);
        const R = this.buffer.getChannelData(1);
        const Li = new Int16Array(L.length);
        const Ri = new Int16Array(R.length);
        
        for (let i = 0; i < L.length; i++) {
            Li[i] = Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767)));
            Ri[i] = Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767)));
        }
        
        const encoder = new lamejs.Mp3Encoder(2, this.buffer.sampleRate, 192);
        const mp3Data = [];
        const blockSize = 1152;
        
        for (let i = 0; i < Li.length; i += blockSize) {
            const buf = encoder.encodeBuffer(
                Li.subarray(i, i + blockSize),
                Ri.subarray(i, i + blockSize)
            );
            if (buf.length > 0) mp3Data.push(buf);
        }
        
        const end = encoder.flush();
        if (end.length > 0) mp3Data.push(end);
        
        return new Blob(mp3Data, { type: 'audio/mp3' });
    }
    
    // ============================================
    // REAL-TIME PREVIEW
    // ============================================
    async startPreview(params) {
        await this.init();
        
        const merger = this.audioContext.createChannelMerger(2);
        
        const oscLeft = this.audioContext.createOscillator();
        oscLeft.type = params.sndWaveform || 'sine';
        oscLeft.frequency.value = params.freqLeft;
        
        const gainLeft = this.audioContext.createGain();
        gainLeft.gain.value = params.toneVolume;
        
        oscLeft.connect(gainLeft);
        gainLeft.connect(merger, 0, 0);
        
        const oscRight = this.audioContext.createOscillator();
        oscRight.type = params.sndWaveform || 'sine';
        oscRight.frequency.value = params.freqRight;
        
        const gainRight = this.audioContext.createGain();
        gainRight.gain.value = params.toneVolume;
        
        oscRight.connect(gainRight);
        gainRight.connect(merger, 0, 1);
        
        const master = this.audioContext.createGain();
        master.gain.value = 0.7;
        merger.connect(master);
        master.connect(this.audioContext.destination);
        
        oscLeft.start();
        oscRight.start();
        
        this.previewNodes = { oscLeft, oscRight, gainLeft, gainRight, master };
        this.isPreview = true;
        
        return () => this.stopPreview();
    }
    
    stopPreview() {
        if (!this.previewNodes) return;
        
        try {
            this.previewNodes.oscLeft.stop();
            this.previewNodes.oscRight.stop();
        } catch(e) {}
        
        this.previewNodes = null;
        this.isPreview = false;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioEngine;
}
