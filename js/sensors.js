/**
 * KASINA θ PRO - SENSORS MODULE
 * IMU (accéléromètre/gyroscope), détection de fatigue, micro pour souffle
 */

class SensorsManager {
    constructor() {
        // IMU State
        this.imuEnabled = false;
        this.imuPermission = false;
        this.accel = { x: 0, y: 0, z: 0 };
        this.gyro = { alpha: 0, beta: 0, gamma: 0 };
        
        // Step detection
        this.steps = 0;
        this.stepTimestamps = [];
        this.lastStepTime = 0;
        this.stepThreshold = 1.2;
        this.stepCooldown = 300;
        this.cadence = 0;
        
        // Fatigue detection
        this.stepIntervals = [];
        this.fatigueLevel = 0;
        this.stepVariability = 0;
        this.stepRegularity = 100;
        
        // Microphone / Breath detection
        this.micEnabled = false;
        this.audioContext = null;
        this.analyser = null;
        this.micStream = null;
        this.breathPhase = 'unknown';
        this.breathAmplitude = 0;
        this.breathHistory = [];
        this.lastBreathPeak = 0;
        this.detectedBreathRate = 0;
        
        // Callbacks
        this.onStep = null;
        this.onCadenceUpdate = null;
        this.onFatigueUpdate = null;
        this.onBreathDetected = null;
        this.onIMUUpdate = null;
    }
    
    async requestIMUPermission() {
        if (typeof DeviceMotionEvent !== 'undefined' && 
            typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceMotionEvent.requestPermission();
                this.imuPermission = permission === 'granted';
                return this.imuPermission;
            } catch (e) {
                console.error('IMU permission error:', e);
                return false;
            }
        }
        this.imuPermission = true;
        return true;
    }
    
    async enableIMU() {
        if (!this.imuPermission) {
            const granted = await this.requestIMUPermission();
            if (!granted) return false;
        }
        
        this.motionHandler = this.handleDeviceMotion.bind(this);
        this.orientationHandler = this.handleDeviceOrientation.bind(this);
        
        window.addEventListener('devicemotion', this.motionHandler);
        window.addEventListener('deviceorientation', this.orientationHandler);
        
        this.imuEnabled = true;
        return true;
    }
    
    disableIMU() {
        if (this.motionHandler) {
            window.removeEventListener('devicemotion', this.motionHandler);
        }
        if (this.orientationHandler) {
            window.removeEventListener('deviceorientation', this.orientationHandler);
        }
        this.imuEnabled = false;
    }
    
    handleDeviceMotion(event) {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;
        
        this.accel = { x: acc.x || 0, y: acc.y || 0, z: acc.z || 0 };
        
        const magnitude = Math.sqrt(this.accel.x ** 2 + this.accel.y ** 2 + this.accel.z ** 2);
        this.detectStep(magnitude);
        
        if (this.onIMUUpdate) {
            this.onIMUUpdate(this.accel, this.gyro);
        }
    }
    
    handleDeviceOrientation(event) {
        this.gyro = { alpha: event.alpha || 0, beta: event.beta || 0, gamma: event.gamma || 0 };
    }
    
    detectStep(magnitude) {
        const now = Date.now();
        
        if (magnitude > 9.8 + this.stepThreshold && now - this.lastStepTime > this.stepCooldown) {
            this.steps++;
            this.lastStepTime = now;
            this.stepTimestamps.push(now);
            
            if (this.stepTimestamps.length > 20) this.stepTimestamps.shift();
            
            if (this.stepTimestamps.length >= 2) {
                const interval = now - this.stepTimestamps[this.stepTimestamps.length - 2];
                this.stepIntervals.push(interval);
                if (this.stepIntervals.length > 30) this.stepIntervals.shift();
            }
            
            this.updateCadence();
            this.updateFatigue();
            
            if (this.onStep) this.onStep(this.steps, this.cadence);
        }
    }
    
    updateCadence() {
        if (this.stepTimestamps.length < 2) { this.cadence = 0; return; }
        
        const recentSteps = this.stepTimestamps.slice(-10);
        const timeSpan = recentSteps[recentSteps.length - 1] - recentSteps[0];
        
        if (timeSpan > 0) {
            this.cadence = Math.round((recentSteps.length - 1) / (timeSpan / 60000));
            if (this.onCadenceUpdate) this.onCadenceUpdate(this.cadence);
        }
    }
    
    updateFatigue() {
        if (this.stepIntervals.length < 5) {
            this.fatigueLevel = 0;
            this.stepVariability = 0;
            this.stepRegularity = 100;
            return;
        }
        
        const mean = this.stepIntervals.reduce((a, b) => a + b, 0) / this.stepIntervals.length;
        const variance = this.stepIntervals.reduce((sum, val) => sum + (val - mean) ** 2, 0) / this.stepIntervals.length;
        const stdDev = Math.sqrt(variance);
        
        this.stepVariability = (stdDev / mean) * 100;
        this.stepRegularity = Math.max(0, 100 - this.stepVariability * 2);
        
        if (this.stepVariability < 5) {
            this.fatigueLevel = this.stepVariability * 4;
        } else if (this.stepVariability < 10) {
            this.fatigueLevel = 20 + (this.stepVariability - 5) * 8;
        } else {
            this.fatigueLevel = 60 + Math.min(40, (this.stepVariability - 10) * 4);
        }
        
        let trend = 'stable';
        if (this.stepIntervals.length >= 10) {
            const recentAvg = this.stepIntervals.slice(-5).reduce((a, b) => a + b, 0) / 5;
            const olderAvg = this.stepIntervals.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;
            
            if (recentAvg > olderAvg * 1.1) trend = 'increasing';
            else if (recentAvg < olderAvg * 0.9) trend = 'decreasing';
        }
        
        if (this.onFatigueUpdate) {
            this.onFatigueUpdate({ level: this.fatigueLevel, variability: this.stepVariability, regularity: this.stepRegularity, trend });
        }
    }
    
    getSuggestedTempo(baseTempo) {
        if (this.fatigueLevel < 30) return baseTempo;
        else if (this.fatigueLevel < 60) return Math.round(baseTempo * 0.95);
        else return Math.round(baseTempo * 0.9);
    }
    
    async enableMicrophone() {
        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({ 
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
            });
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(this.micStream);
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            
            source.connect(this.analyser);
            this.micEnabled = true;
            this.startBreathDetection();
            
            return true;
        } catch (e) {
            console.error('Microphone error:', e);
            return false;
        }
    }
    
    disableMicrophone() {
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.micEnabled = false;
        this.breathDetectionRunning = false;
    }
    
    startBreathDetection() {
        if (!this.analyser) return;
        
        this.breathDetectionRunning = true;
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        const detect = () => {
            if (!this.breathDetectionRunning) return;
            
            this.analyser.getByteFrequencyData(dataArray);
            
            const lowFreqBins = dataArray.slice(5, 25);
            const avgAmplitude = lowFreqBins.reduce((a, b) => a + b, 0) / lowFreqBins.length;
            
            this.breathAmplitude = avgAmplitude / 255;
            this.breathHistory.push({ time: Date.now(), amplitude: this.breathAmplitude });
            
            const fiveSecondsAgo = Date.now() - 5000;
            this.breathHistory = this.breathHistory.filter(h => h.time > fiveSecondsAgo);
            
            this.analyzeBreathPattern();
            requestAnimationFrame(detect);
        };
        
        detect();
    }
    
    analyzeBreathPattern() {
        if (this.breathHistory.length < 20) return;
        
        const recent = this.breathHistory.slice(-30);
        const avgAmplitude = recent.reduce((a, b) => a + b.amplitude, 0) / recent.length;
        const threshold = avgAmplitude * 0.3;
        
        const prevPhase = this.breathPhase;
        
        if (this.breathAmplitude > avgAmplitude + threshold) {
            this.breathPhase = 'inhale';
        } else if (this.breathAmplitude < avgAmplitude - threshold) {
            this.breathPhase = 'exhale';
        } else {
            if (prevPhase === 'inhale') this.breathPhase = 'hold';
            else if (prevPhase === 'exhale') this.breathPhase = 'pause';
        }
        
        if (this.breathPhase === 'inhale' && prevPhase !== 'inhale') {
            const now = Date.now();
            if (this.lastBreathPeak > 0) {
                const interval = now - this.lastBreathPeak;
                if (interval > 2000 && interval < 15000) {
                    this.detectedBreathRate = Math.round(60000 / interval);
                }
            }
            this.lastBreathPeak = now;
        }
        
        if (this.onBreathDetected && prevPhase !== this.breathPhase) {
            this.onBreathDetected({ phase: this.breathPhase, amplitude: this.breathAmplitude, rate: this.detectedBreathRate });
        }
    }
    
    getMicLevel() { return this.breathAmplitude; }
    getBreathInfo() { return { phase: this.breathPhase, amplitude: this.breathAmplitude, rate: this.detectedBreathRate }; }
    
    calibrateIMU() {
        if (this.stepIntervals.length > 5) {
            const avgInterval = this.stepIntervals.reduce((a, b) => a + b, 0) / this.stepIntervals.length;
            this.stepCooldown = avgInterval * 0.7;
        }
        this.steps = 0;
        this.stepTimestamps = [];
        this.stepIntervals = [];
        this.fatigueLevel = 0;
        return { cooldown: this.stepCooldown, threshold: this.stepThreshold };
    }
    
    calibrateMicrophone(sensitivity = 50) {
        this.breathThreshold = 0.3 - (sensitivity / 100) * 0.25;
    }
    
    getStatus() {
        return {
            imu: { enabled: this.imuEnabled, permission: this.imuPermission, accel: this.accel, steps: this.steps, cadence: this.cadence },
            fatigue: { level: this.fatigueLevel, variability: this.stepVariability, regularity: this.stepRegularity },
            mic: { enabled: this.micEnabled, breathPhase: this.breathPhase, breathRate: this.detectedBreathRate, amplitude: this.breathAmplitude }
        };
    }
    
    destroy() { this.disableIMU(); this.disableMicrophone(); }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = SensorsManager; }
