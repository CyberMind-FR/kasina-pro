/**
 * KASINA θ PRO - MAIN APPLICATION v2.0.0
 * Full orchestration of audio, visual, and sensor modules
 */

class KasinaProApp {
    constructor() {
        console.log('[Kasina] Initializing...');
        try {
            this.audioEngine = new AudioEngine();
            this.visualEngine = null;
            this.sensors = new SensorsManager();
        } catch(e) {
            console.error('[Kasina] Error creating engines:', e);
        }
        this.currentProfile = 'theta';
        this.currentSubprofile = null;
        this.currentSweep = null;
        this.syncMode = 'breath';
        this.encodingType = 'none';
        this.isPlaying = false;
        this.isPreviewing = false;
        this.ritualMode = false;
        this.sessionIntention = '';
        this.startTime = 0;
        this.pausedAt = 0;
        this.breathCount = 0;
        this.stepCount = 0;
        this.deferredPrompt = null;
        this.init();
    }
    
    async init() {
        console.log('[Kasina] init() started');
        try {
            await this.showSplash();
            console.log('[Kasina] Splash done');
            
            // Hide splash BEFORE showing safety modal (z-index conflict)
            document.getElementById('splashScreen').classList.add('hidden');
            
            if (!localStorage.getItem('kasina-safety-accepted')) {
                console.log('[Kasina] Showing safety modal...');
                await this.showSafetyModal();
            }
            console.log('[Kasina] Safety accepted');
            
            this.initUI();
            console.log('[Kasina] UI done');
            
            this.initTabs();
            console.log('[Kasina] Tabs done');
            
            this.initProfiles();
            console.log('[Kasina] Profiles done');
            
            this.initControls();
            console.log('[Kasina] Controls done');
            
            this.initSensors();
            console.log('[Kasina] Sensors done');
            
            this.initPWA();
            console.log('[Kasina] PWA done');
            
            this.visualEngine = new VisualEngine('mandalaCanvas');
            console.log('[Kasina] VisualEngine created');
            
            this.visualEngine.startPreviewLoop();
            console.log('[Kasina] Preview started');
            
            this.selectProfile('theta');
            console.log('[Kasina] Profile selected');
            
            console.log('[Kasina] ✓ App ready!');
        } catch(e) {
            console.error('[Kasina] INIT ERROR:', e);
            document.getElementById('splashScreen').innerHTML = '<div style="color:red;padding:20px;">Error: ' + e.message + '</div>';
        }
    }
    
    async showSplash() { return new Promise(r => setTimeout(r, 1500)); }
    
    async showSafetyModal() {
        return new Promise(resolve => {
            const modal = document.getElementById('safetyModal');
            const checkbox = document.getElementById('safetyAccept');
            const btn = document.getElementById('safetyConfirm');
            modal.style.display = 'flex';
            checkbox.addEventListener('change', () => btn.disabled = !checkbox.checked);
            btn.addEventListener('click', () => {
                localStorage.setItem('kasina-safety-accepted', 'true');
                modal.style.display = 'none';
                resolve();
            });
        });
    }
    
    initUI() {
        document.getElementById('menuBtn').addEventListener('click', () => document.getElementById('sideMenu').classList.add('open'));
        document.getElementById('closeMenuBtn').addEventListener('click', () => document.getElementById('sideMenu').classList.remove('open'));
        document.getElementById('menuNewSession').addEventListener('click', e => { e.preventDefault(); this.resetSession(); document.getElementById('sideMenu').classList.remove('open'); });
        document.getElementById('menuSavePreset').addEventListener('click', e => { e.preventDefault(); this.exportPreset(); document.getElementById('sideMenu').classList.remove('open'); });
        document.getElementById('menuLoadPreset').addEventListener('click', e => { e.preventDefault(); this.importPreset(); document.getElementById('sideMenu').classList.remove('open'); });
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('ritualModeBtn').addEventListener('click', () => { this.ritualMode = !this.ritualMode; this.showToast(this.ritualMode ? '🕯️ Mode rituel activé' : 'Mode rituel désactivé'); });
        document.getElementById('skipRitual').addEventListener('click', () => { document.getElementById('ritualModal').style.display = 'none'; this.startSession(); });
        document.getElementById('startRitual').addEventListener('click', () => { this.sessionIntention = document.getElementById('ritualIntention').value; document.getElementById('ritualModal').style.display = 'none'; this.startSession(); });
        document.querySelectorAll('.ritual-preset').forEach(btn => btn.addEventListener('click', () => {
            const intents = { 'paix': 'Je cultive la paix intérieure.', 'clarté': 'Je cherche la clarté mentale.', 'guérison': 'Je permets à mon corps de se régénérer.', 'créativité': 'J\'ouvre ma créativité.', 'énergie': 'Je me recharge en énergie.', 'lâcher-prise': 'Je relâche ce qui ne me sert plus.' };
            document.getElementById('ritualIntention').value = intents[btn.dataset.intent] || '';
        }));
        document.getElementById('closeRitual').addEventListener('click', () => { document.getElementById('closingModal').style.display = 'none'; this.closePlayer(); });
        document.getElementById('exportSession').addEventListener('click', () => this.exportSessionLog());
    }
    
    initTabs() {
        document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        }));
    }
    
    initProfiles() {
        const grid = document.getElementById('profilesGrid');
        grid.innerHTML = Object.entries(PROFILES).map(([key, p]) => `<div class="profile-card profile-${p.color}" data-profile="${key}"><div class="profile-wave">${p.wave}</div><div class="profile-name">${p.name}</div><div class="profile-freq">${p.freqRange}</div></div>`).join('');
        grid.querySelectorAll('.profile-card').forEach(card => card.addEventListener('click', () => this.selectProfile(card.dataset.profile)));
        document.querySelectorAll('.sweep-btn').forEach(btn => btn.addEventListener('click', () => {
            document.querySelectorAll('.sweep-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentSweep = SWEEP_PROFILES[btn.dataset.sweep];
            this.drawSweepVisualizer();
        }));
    }
    
    selectProfile(key) {
        this.currentProfile = key;
        const profile = PROFILES[key];
        document.querySelectorAll('.profile-card').forEach(c => c.classList.remove('active'));
        document.querySelector(`[data-profile="${key}"]`).classList.add('active');
        this.renderSubprofiles(profile);
        if (profile.subprofiles.length > 0) this.selectSubprofile(profile.subprofiles[0]);
    }
    
    renderSubprofiles(profile) {
        const grid = document.getElementById('subprofilesGrid');
        grid.innerHTML = profile.subprofiles.map(sub => `<div class="subprofile-card" data-subprofile="${sub.id}"><span class="subprofile-icon">${sub.icon}</span><div class="subprofile-info"><div class="subprofile-name">${sub.name}</div><div class="subprofile-details">Δ${sub.freqRight - sub.freqLeft}Hz · ${sub.beat}Hz</div></div></div>`).join('');
        grid.querySelectorAll('.subprofile-card').forEach(card => card.addEventListener('click', () => {
            const sub = profile.subprofiles.find(s => s.id === card.dataset.subprofile);
            this.selectSubprofile(sub);
        }));
    }
    
    selectSubprofile(sub) {
        this.currentSubprofile = sub;
        document.querySelectorAll('.subprofile-card').forEach(c => c.classList.remove('active'));
        document.querySelector(`[data-subprofile="${sub.id}"]`)?.classList.add('active');
        document.getElementById('freqLeft').value = sub.freqLeft;
        document.getElementById('freqRight').value = sub.freqRight;
        document.getElementById('beatFreq').value = sub.beat;
        document.getElementById('beatFreqDisplay').textContent = `${sub.beat} Hz`;
        document.getElementById('breathInhale').value = sub.breath.inhale;
        document.getElementById('breathHold').value = sub.breath.hold;
        document.getElementById('breathExhale').value = sub.breath.exhale;
        document.getElementById('breathPause').value = sub.breath.pause;
        document.getElementById('walkTempo').value = sub.walkTempo || 60;
        document.getElementById('walkTempoDisplay').textContent = `${sub.walkTempo || 60} bpm`;
        document.getElementById('redValue').value = sub.rgb.r;
        document.getElementById('greenValue').value = sub.rgb.g;
        document.getElementById('blueValue').value = sub.rgb.b;
        document.getElementById('redDisplay').textContent = `${sub.rgb.r}%`;
        document.getElementById('greenDisplay').textContent = `${sub.rgb.g}%`;
        document.getElementById('blueDisplay').textContent = `${sub.rgb.b}%`;
        this.syncMode = sub.syncMode;
        document.querySelectorAll('.sync-mode-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === sub.syncMode));
        document.getElementById('intervalControl').style.display = sub.syncMode === 'interval' ? 'block' : 'none';
        const whispers = getWhispers(sub.whisperKey, document.getElementById('whisperLang').value);
        document.getElementById('whisperText').value = whispers.join(', ');
        this.visualEngine.setColors(sub.rgb.r, sub.rgb.g, sub.rgb.b);
        this.updateFreqDisplay();
        this.updateBreathVisualizer();
    }
    
    initControls() {
        const ss = (id, did, fmt) => { const s = document.getElementById(id), d = document.getElementById(did); if(s&&d) s.addEventListener('input', () => d.textContent = fmt(s.value)); };
        ss('toneVolume', 'toneVolumeDisplay', v => `${v} dB`);
        ss('noiseVolume', 'noiseVolumeDisplay', v => `${v} dB`);
        ss('whisperVolume', 'whisperVolumeDisplay', v => `${v} dB`);
        ss('whisperInterval', 'whisperIntervalDisplay', v => `${v}s`);
        ss('walkTempo', 'walkTempoDisplay', v => `${v} bpm`);
        ss('beatFreq', 'beatFreqDisplay', v => `${v} Hz`);
        ss('brightness', 'brightnessDisplay', v => `${v}%`);
        ss('lightPhase', 'lightPhaseDisplay', v => `${v}%`);
        ss('antiHabituation', 'antiHabituationDisplay', v => `${v}%`);
        ss('redValue', 'redDisplay', v => `${v}%`);
        ss('greenValue', 'greenDisplay', v => `${v}%`);
        ss('blueValue', 'blueDisplay', v => `${v}%`);
        ss('haloIntensity', 'haloIntensityDisplay', v => `${v}%`);
        ss('particleCount', 'particleCountDisplay', v => v);
        ss('carrierFreq', 'carrierFreqDisplay', v => `${(v/1000).toFixed(1)} kHz`);
        ss('encodingLevel', 'encodingLevelDisplay', v => `${v} dB`);
        ss('micSensitivity', 'micSensitivityDisplay', v => `${v}%`);
        ss('mandalaPetals', 'mandalaPetalsDisplay', v => v);
        ss('mandalaLayers', 'mandalaLayersDisplay', v => v);
        
        document.getElementById('freqLeft').addEventListener('input', () => this.updateFreqDisplay());
        document.getElementById('freqRight').addEventListener('input', () => this.updateFreqDisplay());
        ['breathInhale', 'breathHold', 'breathExhale', 'breathPause'].forEach(id => document.getElementById(id).addEventListener('input', () => this.updateBreathVisualizer()));
        
        document.querySelectorAll('.breath-preset').forEach(btn => btn.addEventListener('click', () => {
            const [i, h, e, p] = btn.dataset.pattern.split('-').map(Number);
            document.getElementById('breathInhale').value = i;
            document.getElementById('breathHold').value = h;
            document.getElementById('breathExhale').value = e;
            document.getElementById('breathPause').value = p;
            this.updateBreathVisualizer();
        }));
        
        document.querySelectorAll('.tempo-preset').forEach(btn => btn.addEventListener('click', () => {
            const tempo = parseInt(btn.dataset.tempo);
            if (tempo === 0) { document.getElementById('vmaDisplay').style.display = 'block'; }
            else { document.getElementById('walkTempo').value = tempo; document.getElementById('walkTempoDisplay').textContent = `${tempo} bpm`; document.getElementById('vmaDisplay').style.display = 'none'; }
        }));
        
        document.querySelectorAll('.duration-preset').forEach(btn => btn.addEventListener('click', () => document.getElementById('duration').value = btn.dataset.dur));
        
        document.querySelectorAll('.sync-mode-btn').forEach(btn => btn.addEventListener('click', () => {
            document.querySelectorAll('.sync-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.syncMode = btn.dataset.mode;
            document.getElementById('intervalControl').style.display = this.syncMode === 'interval' ? 'block' : 'none';
        }));
        
        document.querySelectorAll('#sndWaveform .waveform-btn').forEach(btn => btn.addEventListener('click', () => {
            document.querySelectorAll('#sndWaveform .waveform-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }));
        
        document.querySelectorAll('.encoding-btn').forEach(btn => btn.addEventListener('click', () => {
            document.querySelectorAll('.encoding-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.encodingType = btn.dataset.encoding;
            document.getElementById('encodingParams').style.display = this.encodingType !== 'none' ? 'block' : 'none';
        }));
        
        document.getElementById('mandalaPattern').addEventListener('change', e => this.visualEngine.pattern = e.target.value);
        document.getElementById('mandalaPetals').addEventListener('input', e => this.visualEngine.petals = parseInt(e.target.value));
        document.getElementById('mandalaLayers').addEventListener('input', e => this.visualEngine.layers = parseInt(e.target.value));
        
        document.querySelectorAll('.color-preset').forEach(btn => btn.addEventListener('click', () => {
            const r = parseInt(btn.dataset.r), g = parseInt(btn.dataset.g), b = parseInt(btn.dataset.b);
            document.getElementById('redValue').value = r;
            document.getElementById('greenValue').value = g;
            document.getElementById('blueValue').value = b;
            document.getElementById('redDisplay').textContent = `${r}%`;
            document.getElementById('greenDisplay').textContent = `${g}%`;
            document.getElementById('blueDisplay').textContent = `${b}%`;
            this.visualEngine.setColors(r, g, b);
        }));
        
        ['redValue', 'greenValue', 'blueValue'].forEach(id => document.getElementById(id).addEventListener('input', () => {
            this.visualEngine.setColors(parseInt(document.getElementById('redValue').value), parseInt(document.getElementById('greenValue').value), parseInt(document.getElementById('blueValue').value));
        }));
        
        document.getElementById('whisperLang').addEventListener('change', e => {
            if (this.currentSubprofile) {
                const whispers = getWhispers(this.currentSubprofile.whisperKey, e.target.value);
                document.getElementById('whisperText').value = whispers.join(', ');
            }
        });
        
        document.getElementById('previewBtn').addEventListener('click', () => this.togglePreview());
        document.getElementById('stopPreviewBtn').addEventListener('click', () => this.stopPreview());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetToProfile());
        document.getElementById('generateBtn').addEventListener('click', () => this.generateAndPlay());
        document.getElementById('exportWav').addEventListener('click', () => this.exportAudio('wav'));
        document.getElementById('exportMp3').addEventListener('click', () => this.exportAudio('mp3'));
        document.getElementById('exportKbs').addEventListener('click', () => this.exportKBS());
        document.getElementById('exportPreset').addEventListener('click', () => this.exportPreset());
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayback());
        document.getElementById('closePlayerBtn').addEventListener('click', () => this.endSession());
        document.getElementById('playerProgress').addEventListener('click', e => this.seekTo(e));
    }
    
    initSensors() {
        document.getElementById('enableImuBtn').addEventListener('click', async () => {
            const enabled = await this.sensors.enableIMU();
            if (enabled) { document.getElementById('enableImuBtn').textContent = '✓ IMU Actif'; document.getElementById('calibrateImuBtn').disabled = false; this.showToast('📱 IMU activé'); }
            else this.showToast('❌ IMU non disponible');
        });
        document.getElementById('calibrateImuBtn').addEventListener('click', () => { const cal = this.sensors.calibrateIMU(); this.showToast(`📐 Calibré`); });
        this.sensors.onIMUUpdate = (accel) => { document.getElementById('accelX').textContent = accel.x.toFixed(2); document.getElementById('accelY').textContent = accel.y.toFixed(2); document.getElementById('accelZ').textContent = accel.z.toFixed(2); };
        this.sensors.onStep = (steps, cadence) => { document.getElementById('imuSteps').textContent = steps; document.getElementById('imuCadence').textContent = `${cadence} bpm`; document.getElementById('currentVMA').textContent = cadence; };
        this.sensors.onFatigueUpdate = (fatigue) => {
            const fill = document.getElementById('fatigueFill');
            fill.style.strokeDashoffset = 251 - (fatigue.level / 100) * 251;
            document.getElementById('fatigueText').textContent = `${Math.round(fatigue.level)}%`;
            fill.style.stroke = fatigue.level < 30 ? 'var(--accent-alpha)' : fatigue.level < 60 ? 'var(--accent-beta)' : 'var(--accent-gamma)';
            document.getElementById('stepVariability').textContent = `${fatigue.variability.toFixed(1)}%`;
            document.getElementById('stepRegularity').textContent = `${fatigue.regularity.toFixed(0)}%`;
            document.getElementById('fatigueTrend').textContent = fatigue.trend === 'increasing' ? '↑ Fatigue' : fatigue.trend === 'decreasing' ? '↓ Récup' : '→ Stable';
        };
        document.getElementById('enableMicBtn').addEventListener('click', async () => {
            const enabled = await this.sensors.enableMicrophone();
            if (enabled) { document.getElementById('enableMicBtn').textContent = '✓ Micro Actif'; document.getElementById('breathStatus').textContent = 'Détection active'; this.showToast('🎤 Micro activé'); this.updateMicLevel(); }
            else this.showToast('❌ Micro non disponible');
        });
        this.sensors.onBreathDetected = (breath) => document.getElementById('breathStatus').textContent = `${breath.phase} - ${breath.rate} resp/min`;
    }
    
    updateMicLevel() {
        if (!this.sensors.micEnabled) return;
        const level = this.sensors.getMicLevel() * 100;
        const el = document.getElementById('micLevel');
        if (el) el.style.width = `${level}%`;
        requestAnimationFrame(() => this.updateMicLevel());
    }
    
    initPWA() {
        window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); this.deferredPrompt = e; document.getElementById('installBtn').style.display = 'block'; });
        document.getElementById('installBtn').addEventListener('click', async () => { if (this.deferredPrompt) { this.deferredPrompt.prompt(); this.deferredPrompt = null; document.getElementById('installBtn').style.display = 'none'; }});
        window.addEventListener('online', () => { document.getElementById('offlineIndicator').textContent = '🟢 En ligne'; document.getElementById('offlineIndicator').classList.add('online'); });
        window.addEventListener('offline', () => { document.getElementById('offlineIndicator').textContent = '🔴 Hors ligne'; document.getElementById('offlineIndicator').classList.remove('online'); });
        if (navigator.onLine) { document.getElementById('offlineIndicator').textContent = '🟢 En ligne'; document.getElementById('offlineIndicator').classList.add('online'); }
    }
    
    updateFreqDisplay() {
        const left = parseInt(document.getElementById('freqLeft').value) || 210;
        const right = parseInt(document.getElementById('freqRight').value) || 214;
        const diff = Math.abs(right - left);
        document.getElementById('freqLeftDisplay').textContent = left;
        document.getElementById('freqRightDisplay').textContent = right;
        const wave = diff < 4 ? 'δ' : diff < 8 ? 'θ' : diff < 14 ? 'α' : diff < 30 ? 'β' : 'γ';
        document.getElementById('freqDiffDisplay').textContent = `Δ ${diff} Hz ${wave}`;
    }
    
    updateBreathVisualizer() {
        const i = parseFloat(document.getElementById('breathInhale').value);
        const h = parseFloat(document.getElementById('breathHold').value);
        const e = parseFloat(document.getElementById('breathExhale').value);
        const p = parseFloat(document.getElementById('breathPause').value);
        const total = i + h + e + p, w = 200, cy = 30, amp = 20;
        let path = `M 0 ${cy}`;
        const iEnd = (i/total)*w; path += ` L ${iEnd} ${cy-amp}`;
        const hEnd = ((i+h)/total)*w; path += ` L ${hEnd} ${cy-amp}`;
        const eEnd = ((i+h+e)/total)*w; path += ` L ${eEnd} ${cy+amp*0.3}`;
        path += ` L ${w} ${cy+amp*0.3}`;
        document.getElementById('breathSvg').innerHTML = `<path d="${path}" fill="none" stroke="var(--accent-alpha)" stroke-width="2"/><text x="${iEnd/2}" y="55" font-size="8" fill="var(--text-dim)" text-anchor="middle">${i}s</text><text x="${(iEnd+hEnd)/2}" y="55" font-size="8" fill="var(--text-dim)" text-anchor="middle">${h}s</text><text x="${(hEnd+eEnd)/2}" y="55" font-size="8" fill="var(--text-dim)" text-anchor="middle">${e}s</text><text x="${(eEnd+w)/2}" y="55" font-size="8" fill="var(--text-dim)" text-anchor="middle">${p}s</text>`;
    }
    
    drawSweepVisualizer() {
        if (!this.currentSweep) return;
        const canvas = document.getElementById('sweepCanvas');
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.parentElement.offsetWidth, h = canvas.height = 60;
        ctx.clearRect(0,0,w,h);
        ctx.beginPath(); ctx.strokeStyle = '#7c6aef'; ctx.lineWidth = 2;
        let x = 0;
        this.currentSweep.segments.forEach((seg, idx) => {
            const segW = seg.duration * w, startY = h - (seg.startFreq/50)*h, endY = h - (seg.endFreq/50)*h;
            if (idx === 0) ctx.moveTo(x, startY);
            ctx.lineTo(x + segW, endY);
            x += segW;
        });
        ctx.stroke();
    }
    
    getParams() {
        return {
            freqLeft: parseInt(document.getElementById('freqLeft').value) || 210,
            freqRight: parseInt(document.getElementById('freqRight').value) || 214,
            duration: parseInt(document.getElementById('duration').value) * 60,
            fadeTime: parseInt(document.getElementById('fadeTime').value) || 5,
            toneVolume: Math.pow(10, parseInt(document.getElementById('toneVolume').value) / 20),
            noiseVolume: Math.pow(10, parseInt(document.getElementById('noiseVolume').value) / 20),
            whisperVolume: Math.pow(10, parseInt(document.getElementById('whisperVolume').value) / 20),
            whisperInterval: parseInt(document.getElementById('whisperInterval').value),
            whisperText: document.getElementById('whisperText').value.split(',').map(s => s.trim()).filter(s => s),
            breathInhale: parseFloat(document.getElementById('breathInhale').value),
            breathHold: parseFloat(document.getElementById('breathHold').value),
            breathExhale: parseFloat(document.getElementById('breathExhale').value),
            breathPause: parseFloat(document.getElementById('breathPause').value),
            walkTempo: parseInt(document.getElementById('walkTempo').value),
            syncMode: this.syncMode,
            beat: parseFloat(document.getElementById('beatFreq').value),
            lightModDepth: 100,
            brightness: parseFloat(document.getElementById('brightness').value),
            lightPhase: parseFloat(document.getElementById('lightPhase').value),
            lightWaveform: 'sine',
            sndWaveform: document.querySelector('#sndWaveform .waveform-btn.active')?.dataset.wf || 'sine',
            antiHabituation: parseInt(document.getElementById('antiHabituation').value) / 100,
            rgb: { r: parseInt(document.getElementById('redValue').value), g: parseInt(document.getElementById('greenValue').value), b: parseInt(document.getElementById('blueValue').value) },
            encoding: this.encodingType,
            carrierFreq: parseInt(document.getElementById('carrierFreq').value),
            encodingLevel: parseInt(document.getElementById('encodingLevel').value),
            sweepProfile: this.currentSweep
        };
    }
    
    async togglePreview() {
        if (this.isPreviewing) { this.stopPreview(); return; }
        await this.audioEngine.startPreview(this.getParams());
        this.isPreviewing = true;
        document.getElementById('previewBtn').style.display = 'none';
        document.getElementById('stopPreviewBtn').style.display = 'block';
        setTimeout(() => this.stopPreview(), 15000);
    }
    
    stopPreview() { this.audioEngine.stopPreview(); this.isPreviewing = false; document.getElementById('previewBtn').style.display = 'block'; document.getElementById('stopPreviewBtn').style.display = 'none'; }
    resetToProfile() { if (this.currentSubprofile) { this.selectSubprofile(this.currentSubprofile); this.showToast('↺ Réinitialisé'); }}
    
    async generateAndPlay() { this.stopPreview(); if (this.ritualMode) { document.getElementById('ritualModal').style.display = 'flex'; return; } this.startSession(); }
    
    async startSession() {
        const params = this.getParams();
        document.getElementById('progressContainer').classList.add('active');
        document.getElementById('generateBtn').disabled = true;
        try {
            await this.audioEngine.generateSession(params, (progress, text) => { document.getElementById('progressFill').style.width = `${progress}%`; document.getElementById('progressText').textContent = text; });
            document.getElementById('progressContainer').classList.remove('active');
            document.getElementById('generateBtn').disabled = false;
            this.openPlayer();
        } catch (e) { console.error(e); this.showToast('❌ Erreur'); document.getElementById('progressContainer').classList.remove('active'); document.getElementById('generateBtn').disabled = false; }
    }
    
    openPlayer() {
        const params = this.getParams(), profile = PROFILES[this.currentProfile];
        document.getElementById('configPanel').classList.add('hidden');
        document.getElementById('playerInterface').classList.add('active');
        document.getElementById('totalTime').textContent = this.formatTime(params.duration);
        document.getElementById('playerWaveSymbol').textContent = profile.wave;
        document.getElementById('playerWaveSymbol').style.color = `var(--accent-${profile.color})`;
        document.getElementById('playerProfileName').textContent = profile.name;
        document.getElementById('playerSubprofileName').textContent = this.currentSubprofile?.name || '';
        const badge = document.getElementById('encodingBadge');
        if (this.encodingType === 'audiostrobe') { badge.style.display = 'flex'; badge.className = 'encoding-badge as'; document.getElementById('encodingBadgeText').textContent = 'AudioStrobe®'; }
        else if (this.encodingType === 'spectrastrobe') { badge.style.display = 'flex'; badge.className = 'encoding-badge ss'; document.getElementById('encodingBadgeText').textContent = 'SpectraStrobe™'; }
        else badge.style.display = 'none';
        if (this.sessionIntention) { document.getElementById('intentionText').textContent = this.sessionIntention; document.getElementById('intentionDisplay').style.display = 'block'; }
        else document.getElementById('intentionDisplay').style.display = 'none';
        this.breathCount = 0; this.stepCount = 0;
        document.getElementById('statBreaths').textContent = '0'; document.getElementById('statSteps').textContent = '0';
        this.visualEngine.stopPreviewLoop();
        this.visualEngine.canvas = document.getElementById('mainCanvas');
        this.visualEngine.ctx = this.visualEngine.canvas.getContext('2d');
        this.visualEngine.resize();
        this.visualEngine.initParticles(parseInt(document.getElementById('particleCount').value));
        this.startPlayback();
    }
    
    startPlayback() {
        const params = this.getParams(), offset = this.pausedAt;
        this.audioEngine.play(offset);
        this.startTime = this.audioEngine.audioContext.currentTime - offset;
        this.isPlaying = true;
        document.getElementById('playIcon').style.display = 'none';
        document.getElementById('pauseIcon').style.display = 'block';
        this.visualEngine.start(() => this.audioEngine.getCurrentTime(), t => this.audioEngine.getBreathPhase(t, params), t => this.audioEngine.calculateLightMod(t, params), () => params.beat);
        this.animate();
    }
    
    stopPlayback() { if (!this.isPlaying) return; this.pausedAt = this.audioEngine.pause(); this.isPlaying = false; this.visualEngine.stop(); document.getElementById('playIcon').style.display = 'block'; document.getElementById('pauseIcon').style.display = 'none'; }
    togglePlayback() { this.isPlaying ? this.stopPlayback() : this.startPlayback(); }
    
    seekTo(e) {
        const rect = e.currentTarget.getBoundingClientRect(), pct = (e.clientX - rect.left) / rect.width, params = this.getParams(), wasPlaying = this.isPlaying;
        if (wasPlaying) this.audioEngine.stop();
        this.pausedAt = pct * params.duration;
        if (wasPlaying) this.startPlayback();
    }
    
    animate() {
        if (!this.isPlaying) return;
        const params = this.getParams(), currentTime = this.audioEngine.getCurrentTime();
        document.getElementById('currentTime').textContent = this.formatTime(currentTime);
        document.getElementById('playerProgressFill').style.width = `${(currentTime / params.duration) * 100}%`;
        this.updateBreathGuide(currentTime, params);
        this.updateWalkIndicator(currentTime, params);
        this.updateWhisperDisplay(currentTime, params);
        this.updateGanzVisual(currentTime, params);
        if (currentTime >= params.duration) { this.endSession(); return; }
        requestAnimationFrame(() => this.animate());
    }
    
    updateBreathGuide(t, params) {
        const breath = this.audioEngine.getBreathPhase(t, params), circle = document.getElementById('breathCircle');
        circle.className = 'breath-circle ' + breath.phase;
        const labels = { 'inhale': 'Inspire', 'hold': 'Retiens', 'exhale': 'Expire', 'pause': 'Pause' };
        document.getElementById('breathText').textContent = labels[breath.phase];
        document.getElementById('breathTimer').textContent = Math.ceil(breath.remaining);
        const cycle = params.breathInhale + params.breathHold + params.breathExhale + params.breathPause;
        const newCount = Math.floor(t / cycle);
        if (newCount > this.breathCount) { this.breathCount = newCount; document.getElementById('statBreaths').textContent = this.breathCount; }
    }
    
    updateWalkIndicator(t, params) {
        const stepInterval = 60 / (params.walkTempo || 60), stepPhase = (t % (stepInterval * 2)) / stepInterval;
        document.getElementById('footLeft').classList.toggle('active', stepPhase < 1);
        document.getElementById('footRight').classList.toggle('active', stepPhase >= 1);
        const newSteps = Math.floor(t / stepInterval);
        if (newSteps > this.stepCount) { this.stepCount = newSteps; document.getElementById('statSteps').textContent = this.stepCount; }
    }
    
    updateWhisperDisplay(t, params) {
        const indicator = document.getElementById('whisperIndicator');
        if (this.audioEngine.shouldWhisper(t, params) && params.whisperText.length > 0) {
            document.getElementById('whisperDisplay').textContent = params.whisperText[Math.floor(t / 10) % params.whisperText.length];
            indicator.classList.add('active');
        } else indicator.classList.remove('active');
    }
    
    updateGanzVisual(t, params) {
        const lightMod = this.audioEngine.calculateLightMod(t, params), r = params.rgb.r * 2.55, g = params.rgb.g * 2.55, b = params.rgb.b * 2.55;
        const lC = `rgb(${Math.round(r*lightMod.left)},${Math.round(g*lightMod.left)},${Math.round(b*lightMod.left)})`;
        const rC = `rgb(${Math.round(r*lightMod.right)},${Math.round(g*lightMod.right)},${Math.round(b*lightMod.right)})`;
        document.getElementById('ganzLeftEye').style.background = lC; document.getElementById('ganzLeftEye').style.boxShadow = `0 0 15px ${lC}`;
        document.getElementById('ganzRightEye').style.background = rC; document.getElementById('ganzRightEye').style.boxShadow = `0 0 15px ${rC}`;
    }
    
    endSession() {
        this.stopPlayback(); this.audioEngine.stop();
        if (this.ritualMode) {
            document.getElementById('closingDuration').textContent = this.formatTime(this.pausedAt || this.getParams().duration);
            document.getElementById('closingBreaths').textContent = this.breathCount;
            document.getElementById('closingSteps').textContent = this.stepCount;
            if (this.sessionIntention) { document.getElementById('closingIntentionDisplay').textContent = `"${this.sessionIntention}"`; document.getElementById('closingIntentionDisplay').style.display = 'block'; }
            else document.getElementById('closingIntentionDisplay').style.display = 'none';
            document.getElementById('closingModal').style.display = 'flex';
        } else this.closePlayer();
    }
    
    closePlayer() {
        document.getElementById('playerInterface').classList.remove('active');
        document.getElementById('configPanel').classList.remove('hidden');
        this.visualEngine.canvas = document.getElementById('mandalaCanvas');
        this.visualEngine.ctx = this.visualEngine.canvas.getContext('2d');
        this.visualEngine.startPreviewLoop();
        this.pausedAt = 0; this.sessionIntention = '';
    }
    
    resetSession() { this.closePlayer(); this.selectProfile('theta'); this.currentSweep = null; document.querySelectorAll('.sweep-btn').forEach(b => b.classList.remove('active')); }
    
    async exportAudio(format) {
        if (!this.audioEngine.buffer) await this.audioEngine.generateSession(this.getParams(), () => {});
        this.showToast(`Export ${format.toUpperCase()}...`);
        const blob = format === 'wav' ? this.audioEngine.bufferToWav() : await this.audioEngine.bufferToMp3();
        if (!blob) { this.showToast('❌ Erreur'); return; }
        const params = this.getParams(), profile = PROFILES[this.currentProfile];
        const enc = this.encodingType === 'audiostrobe' ? '-AS' : this.encodingType === 'spectrastrobe' ? '-SS' : '';
        this.download(blob, `kasina-${profile.name.toLowerCase()}-${this.currentSubprofile?.name || 'custom'}${enc}-${params.duration/60}min.${format}`);
        this.showToast(`✓ ${format.toUpperCase()} exporté!`);
    }
    
    exportKBS() {
        const params = this.getParams(), profile = PROFILES[this.currentProfile];
        let kbs = `# Kasina Basic Session - Kasina θ Pro\n# ${profile.name} - ${this.currentSubprofile?.name || 'Custom'}\n# ${new Date().toISOString()}\n\n[Global]\nColorControlMode=3\n\n[Segment1]\nTime=${params.duration.toFixed(2)}\nBeat=${params.beat.toFixed(2)}\nLPitch=${params.freqLeft.toFixed(2)}\nRPitch=${params.freqRight.toFixed(2)}\nLPhase=${params.lightPhase.toFixed(0)}\nBright=${params.brightness.toFixed(0)}\nRed=${params.rgb.r}\nGreen=${params.rgb.g}\nBlue=${params.rgb.b}\n`;
        this.download(new Blob([kbs], { type: 'text/plain' }), `kasina-${profile.name.toLowerCase()}.kbs`);
        this.showToast('✓ KBS exporté!');
    }
    
    exportPreset() {
        const preset = { version: '2.0.0', name: `${PROFILES[this.currentProfile].name} - ${this.currentSubprofile?.name || 'Custom'}`, createdAt: new Date().toISOString(), profile: this.currentProfile, subprofile: this.currentSubprofile?.id, sweep: this.currentSweep, params: this.getParams(), visual: { pattern: this.visualEngine.pattern, petals: this.visualEngine.petals, layers: this.visualEngine.layers }};
        this.download(new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' }), `kasina-preset-${Date.now()}.kasina.json`);
        this.showToast('✓ Preset exporté!');
    }
    
    importPreset() {
        const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,.kasina.json';
        input.addEventListener('change', e => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => { try { const preset = JSON.parse(ev.target.result); if (preset.profile) this.selectProfile(preset.profile); this.showToast('✓ Preset chargé!'); } catch { this.showToast('❌ Fichier invalide'); }};
            reader.readAsText(file);
        });
        input.click();
    }
    
    exportSessionLog() {
        const log = { date: new Date().toISOString(), profile: this.currentProfile, subprofile: this.currentSubprofile?.name, intention: this.sessionIntention, duration: this.formatTime(this.pausedAt || this.getParams().duration), breaths: this.breathCount, steps: this.stepCount, notes: document.getElementById('closingNotes').value };
        this.download(new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' }), `kasina-session-${Date.now()}.json`);
    }
    
    download(blob, filename) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href); }
    toggleFullscreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => this.showToast('Fullscreen non supporté')); else document.exitFullscreen(); }
    formatTime(s) { const m = Math.floor(s / 60); return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`; }
    showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
}

document.addEventListener('DOMContentLoaded', () => { window.kasinaApp = new KasinaProApp(); });
