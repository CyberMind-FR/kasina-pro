/**
 * KASINA θ PRO - VISUAL ENGINE v2.1
 * Géométries sacrées ULTRA-RÉACTIVES
 * Synchronisation dynamique beat/breath/light
 */

class VisualEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.animationFrame = null;
        this.previewFrame = null;
        
        // Mandala settings
        this.pattern = 'flower';
        this.petals = 8;
        this.layers = 4;
        this.rotation = 0;
        
        // Dynamic state
        this.breathScale = 1;
        this.lightMod = { left: 0.5, right: 0.5 };
        this.lastBeatTime = 0;
        this.beatPulse = 0;
        
        // Trail/afterglow
        this.trailOpacity = 0.12;
        this.enableTrails = true;
        
        // Halo
        this.haloIntensity = 0.6;
        this.haloLayers = 5;
        
        // Ripples
        this.ripples = [];
        this.maxRipples = 5;
        
        // Particles
        this.particles = [];
        this.particleCount = 80;
        this.particleReactivity = 0.8;
        
        // Colors
        this.rgb = { r: 50, g: 30, b: 100 };
        this.brightness = 0.7;
        this.glowIntensity = 1.5;
        
        // Audio sync callbacks
        this.getAudioTime = null;
        this.getBreathPhase = null;
        this.getLightMod = null;
        this.getBeat = null;
        
        this.lastTime = 0;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const rect = this.canvas.parentElement?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.baseRadius = Math.min(this.width, this.height) * 0.35;
    }
    
    setColors(r, g, b, brightness = 0.7) {
        this.rgb = { r, g, b };
        this.brightness = brightness;
    }
    
    getColor(alpha = 1, boost = 0) {
        const b = this.brightness + boost;
        return `rgba(${Math.min(255, this.rgb.r * 2.55 * b)}, ${Math.min(255, this.rgb.g * 2.55 * b)}, ${Math.min(255, this.rgb.b * 2.55 * b)}, ${alpha})`;
    }
    
    getGlowColor(alpha = 1) {
        return `rgba(${this.rgb.r * 2.55}, ${this.rgb.g * 2.55}, ${this.rgb.b * 2.55}, ${alpha})`;
    }
    
    // ============================================
    // PARTICLES - REACTIVE
    // ============================================
    
    initParticles(count = 80) {
        this.particleCount = count;
        this.particles = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * this.baseRadius * 1.5;
            this.particles.push({
                x: this.centerX + Math.cos(angle) * dist,
                y: this.centerY + Math.sin(angle) * dist,
                radius: Math.random() * 4 + 1,
                alpha: Math.random() * 0.6 + 0.2,
                orbitSpeed: (Math.random() - 0.5) * 0.02,
                orbitRadius: dist,
                angle: angle
            });
        }
    }
    
    updateParticles(breathScale, beatPulse, lightMod) {
        const avgLight = (lightMod.left + lightMod.right) / 2;
        this.particles.forEach(p => {
            p.angle += p.orbitSpeed * (1 + beatPulse * 2);
            const dynamicRadius = p.orbitRadius * breathScale;
            const beatExpand = beatPulse * 30 * this.particleReactivity;
            const targetX = this.centerX + Math.cos(p.angle) * (dynamicRadius + beatExpand);
            const targetY = this.centerY + Math.sin(p.angle) * (dynamicRadius + beatExpand);
            p.x += (targetX - p.x) * 0.1;
            p.y += (targetY - p.y) * 0.1;
            p.currentAlpha = p.alpha * (0.5 + avgLight * 0.5) * (1 + beatPulse * 0.5);
            p.currentRadius = p.radius * (1 + beatPulse * 0.5);
        });
    }
    
    drawParticles() {
        const ctx = this.ctx;
        this.particles.forEach(p => {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.currentRadius * 3);
            grad.addColorStop(0, this.getGlowColor(p.currentAlpha || p.alpha));
            grad.addColorStop(0.5, this.getGlowColor((p.currentAlpha || p.alpha) * 0.3));
            grad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.currentRadius * 3, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        });
    }
    
    // ============================================
    // RIPPLES
    // ============================================
    
    addRipple(intensity = 1) {
        if (this.ripples.length >= this.maxRipples) this.ripples.shift();
        this.ripples.push({ radius: 0, maxRadius: this.baseRadius * 2, alpha: 0.6 * intensity, speed: 3 + intensity * 2, lineWidth: 2 + intensity * 2 });
    }
    
    updateRipples() {
        this.ripples = this.ripples.filter(r => { r.radius += r.speed; r.alpha *= 0.97; return r.alpha > 0.01 && r.radius < r.maxRadius; });
    }
    
    drawRipples() {
        const ctx = this.ctx;
        this.ripples.forEach(r => {
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.getColor(r.alpha);
            ctx.lineWidth = r.lineWidth * (1 - r.radius / r.maxRadius);
            ctx.stroke();
        });
    }
    
    // ============================================
    // DYNAMIC HALO
    // ============================================
    
    drawHalo(cx, cy, baseRadius, intensity, breathScale, beatPulse, lightMod) {
        const ctx = this.ctx;
        const avgLight = (lightMod.left + lightMod.right) / 2;
        
        for (let i = 0; i < this.haloLayers; i++) {
            const layerProgress = i / this.haloLayers;
            const phase = Date.now() * 0.001 + i * 0.5;
            const breathEffect = breathScale * 0.3;
            const beatEffect = beatPulse * 0.2;
            const waveEffect = Math.sin(phase) * 0.05;
            const radius = baseRadius * (1.2 + layerProgress * 0.6) * (1 + breathEffect + beatEffect + waveEffect);
            const alpha = intensity * (1 - layerProgress * 0.7) * avgLight;
            
            const grad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.5, this.getGlowColor(alpha * 0.3));
            grad.addColorStop(0.8, this.getGlowColor(alpha * 0.6));
            grad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.getColor(alpha * 0.4);
            ctx.lineWidth = 1 + beatPulse * 2;
            ctx.stroke();
        }
    }
    
    // ============================================
    // SACRED GEOMETRY PATTERNS - ENHANCED
    // ============================================
    
    drawFlowerOfLife(cx, cy, radius, layers, rotation, breathScale, beatPulse) {
        const ctx = this.ctx;
        const r = radius * breathScale;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        
        if (beatPulse > 0.1) {
            ctx.shadowColor = this.getGlowColor(0.8);
            ctx.shadowBlur = 20 * beatPulse * this.glowIntensity;
        }
        
        // Central pulsing
        const centralPulse = 1 + beatPulse * 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, (r / 6) * centralPulse, 0, Math.PI * 2);
        ctx.strokeStyle = this.getColor(0.8 + beatPulse * 0.2);
        ctx.lineWidth = 2 + beatPulse * 2;
        ctx.stroke();
        
        const centralGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r / 6);
        centralGrad.addColorStop(0, this.getGlowColor(0.4 + beatPulse * 0.3));
        centralGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = centralGrad;
        ctx.fill();
        
        // Flower petals
        for (let layer = 1; layer <= layers; layer++) {
            const layerRadius = (r / 6) * layer;
            const petalCount = layer === 1 ? 6 : layer * 6;
            const layerAlpha = 0.7 - layer * 0.1 + beatPulse * 0.2;
            
            for (let i = 0; i < petalCount; i++) {
                const angle = (i / petalCount) * Math.PI * 2;
                const wobble = Math.sin(Date.now() * 0.002 + i) * beatPulse * 5;
                const px = Math.cos(angle) * (layerRadius + wobble);
                const py = Math.sin(angle) * (layerRadius + wobble);
                
                ctx.beginPath();
                ctx.arc(px, py, r / 6, 0, Math.PI * 2);
                ctx.strokeStyle = this.getColor(layerAlpha);
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }
        ctx.restore();
    }
    
    drawSriYantra(cx, cy, size, rotation, breathScale, beatPulse) {
        const ctx = this.ctx;
        const s = size * breathScale;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation * 0.3);
        
        ctx.shadowColor = this.getGlowColor(0.6);
        ctx.shadowBlur = 15 * beatPulse * this.glowIntensity;
        
        // Bhupura
        const sq = s * (1 + beatPulse * 0.1);
        ctx.strokeStyle = this.getColor(0.5);
        ctx.lineWidth = 2;
        ctx.strokeRect(-sq/2, -sq/2, sq, sq);
        
        // Lotus petals
        [16, 8].forEach((count, li) => {
            const pr = s * (0.45 - li * 0.08);
            const ps = s * 0.08;
            const lr = Date.now() * 0.0005 * (li % 2 ? 1 : -1);
            for (let i = 0; i < count; i++) {
                const a = (i / count) * Math.PI * 2 + lr;
                const px = Math.cos(a) * pr;
                const py = Math.sin(a) * pr;
                ctx.beginPath();
                ctx.ellipse(px, py, ps * (1 + beatPulse * 0.3), ps * 0.4, a + Math.PI/2, 0, Math.PI * 2);
                ctx.strokeStyle = this.getColor(0.6 + beatPulse * 0.2);
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
        
        // Triangles
        const triangles = [
            { r: 0.38, up: true }, { r: 0.32, up: false }, { r: 0.28, up: true },
            { r: 0.24, up: false }, { r: 0.20, up: true }, { r: 0.16, up: false },
            { r: 0.12, up: true }, { r: 0.08, up: false }, { r: 0.04, up: true }
        ];
        triangles.forEach((t, idx) => {
            const tr = s * t.r * (1 + beatPulse * 0.15);
            const ph = Math.sin(Date.now() * 0.001 + idx * 0.5) * beatPulse * 3;
            ctx.beginPath();
            if (t.up) { ctx.moveTo(0, -tr + ph); ctx.lineTo(tr * 0.866, tr * 0.5 + ph); ctx.lineTo(-tr * 0.866, tr * 0.5 + ph); }
            else { ctx.moveTo(0, tr + ph); ctx.lineTo(tr * 0.866, -tr * 0.5 + ph); ctx.lineTo(-tr * 0.866, -tr * 0.5 + ph); }
            ctx.closePath();
            ctx.strokeStyle = this.getColor(0.7 - idx * 0.05 + beatPulse * 0.2);
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });
        
        // Bindu
        const bs = s * 0.02 * (1 + beatPulse);
        const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, bs * 3);
        bg.addColorStop(0, this.getColor(1));
        bg.addColorStop(0.5, this.getGlowColor(0.5));
        bg.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(0, 0, bs * 3, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, bs, 0, Math.PI * 2);
        ctx.fillStyle = this.getColor(1);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawMetatronCube(cx, cy, size, rotation, breathScale, beatPulse) {
        const ctx = this.ctx;
        const s = size * breathScale * 0.5;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        
        ctx.shadowColor = this.getGlowColor(0.5);
        ctx.shadowBlur = 10 * beatPulse * this.glowIntensity;
        
        const positions = [{ x: 0, y: 0 },
            ...Array(6).fill(0).map((_, i) => ({ x: Math.cos(i * Math.PI / 3) * s * 0.5, y: Math.sin(i * Math.PI / 3) * s * 0.5 })),
            ...Array(6).fill(0).map((_, i) => ({ x: Math.cos(i * Math.PI / 3 + Math.PI / 6) * s, y: Math.sin(i * Math.PI / 3 + Math.PI / 6) * s }))
        ];
        
        ctx.strokeStyle = this.getColor(0.3 + beatPulse * 0.2);
        ctx.lineWidth = 1;
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                ctx.beginPath();
                ctx.moveTo(positions[i].x, positions[i].y);
                ctx.lineTo(positions[j].x, positions[j].y);
                ctx.stroke();
            }
        }
        
        positions.forEach((pos, idx) => {
            const phase = Date.now() * 0.003 + idx * 0.5;
            const ip = Math.sin(phase) * 0.2 + 1;
            const cr = s * 0.15 * ip * (1 + beatPulse * 0.3);
            
            const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, cr * 2);
            grad.addColorStop(0, this.getGlowColor(0.4 + beatPulse * 0.3));
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, cr * 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, cr, 0, Math.PI * 2);
            ctx.strokeStyle = this.getColor(0.7 + beatPulse * 0.2);
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        ctx.restore();
    }
    
    drawTorus(cx, cy, size, rotation, breathScale, beatPulse) {
        const ctx = this.ctx;
        const s = size * breathScale * 0.4;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation * 0.5);
        
        const rings = 24, segments = 32;
        const R = s, r = s * 0.35;
        const twist = Date.now() * 0.001;
        
        ctx.shadowColor = this.getGlowColor(0.4);
        ctx.shadowBlur = 8 * beatPulse * this.glowIntensity;
        
        for (let i = 0; i < rings; i++) {
            const theta = (i / rings) * Math.PI * 2 + twist;
            const alpha = 0.3 + Math.sin(theta * 2 + beatPulse * Math.PI) * 0.2;
            
            ctx.beginPath();
            for (let j = 0; j <= segments; j++) {
                const phi = (j / segments) * Math.PI * 2;
                const pulseR = R * (1 + beatPulse * 0.2 * Math.sin(phi * 3));
                const x = (pulseR + r * Math.cos(phi)) * Math.cos(theta);
                const y = (pulseR + r * Math.cos(phi)) * Math.sin(theta) * 0.5;
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = this.getColor(alpha + beatPulse * 0.2);
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    drawFibonacciSpiral(cx, cy, size, rotation, breathScale, beatPulse) {
        const ctx = this.ctx;
        const s = size * breathScale;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation * 0.2);
        
        ctx.shadowColor = this.getGlowColor(0.5);
        ctx.shadowBlur = 12 * beatPulse * this.glowIntensity;
        
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const points = 300;
        const animOffset = Date.now() * 0.0005;
        
        for (let i = 0; i < points; i++) {
            const progress = i / points;
            const angle = i * goldenAngle + animOffset;
            const dist = Math.sqrt(i) * s * 0.05;
            
            const wavePhase = (progress * 10 - Date.now() * 0.003) % 1;
            const wavePulse = Math.max(0, Math.sin(wavePhase * Math.PI)) * beatPulse;
            
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            const dotSize = (2 + progress * 3) * (1 + wavePulse);
            const alpha = (0.3 + progress * 0.4) * (1 + wavePulse * 0.5);
            
            const grad = ctx.createRadialGradient(x, y, 0, x, y, dotSize * 2);
            grad.addColorStop(0, this.getGlowColor(alpha));
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, dotSize * 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = this.getColor(alpha);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawVesicaPiscis(cx, cy, size, rotation, breathScale, beatPulse) {
        const ctx = this.ctx;
        const s = size * breathScale * 0.4;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation * 0.1);
        
        ctx.shadowColor = this.getGlowColor(0.5);
        ctx.shadowBlur = 15 * beatPulse * this.glowIntensity;
        
        const offset = s * 0.5 * (1 + beatPulse * 0.2);
        const breathing = Math.sin(Date.now() * 0.002) * s * 0.05;
        
        ctx.beginPath();
        ctx.arc(-offset / 2 + breathing, 0, s, 0, Math.PI * 2);
        ctx.strokeStyle = this.getColor(0.6 + beatPulse * 0.2);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(offset / 2 - breathing, 0, s, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(-offset / 2 + breathing, 0, s, -Math.PI / 3, Math.PI / 3);
        ctx.arc(offset / 2 - breathing, 0, s, Math.PI * 2 / 3, Math.PI * 4 / 3);
        ctx.closePath();
        const vg = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.8);
        vg.addColorStop(0, this.getGlowColor(0.4 + beatPulse * 0.3));
        vg.addColorStop(1, 'transparent');
        ctx.fillStyle = vg;
        ctx.fill();
        
        const es = s * 0.15 * (1 + beatPulse * 0.5);
        const eg = ctx.createRadialGradient(0, 0, 0, 0, 0, es * 2);
        eg.addColorStop(0, this.getColor(1));
        eg.addColorStop(0.5, this.getGlowColor(0.5));
        eg.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(0, 0, es * 2, 0, Math.PI * 2);
        ctx.fillStyle = eg;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, es, 0, Math.PI * 2);
        ctx.fillStyle = this.getColor(1);
        ctx.fill();
        
        ctx.restore();
    }
    
    // ============================================
    // MAIN RENDER
    // ============================================
    
    render(time) {
        if (!this.isRunning) return;
        
        this.lastTime = time;
        const ctx = this.ctx;
        const t = this.getAudioTime ? this.getAudioTime() : time * 0.001;
        const beat = this.getBeat ? this.getBeat() : 4;
        
        let breathPhase = { phase: 'inhale', progress: 0.5 };
        if (this.getBreathPhase) breathPhase = this.getBreathPhase(t);
        if (this.getLightMod) this.lightMod = this.getLightMod(t);
        
        // Breath scale
        const bp = breathPhase.progress || 0.5;
        if (breathPhase.phase === 'inhale') this.breathScale = 1 + bp * 0.4;
        else if (breathPhase.phase === 'exhale') this.breathScale = 1.4 - bp * 0.4;
        else if (breathPhase.phase === 'hold') this.breathScale = 1.4;
        else this.breathScale = 1;
        
        // Beat pulse
        const beatPhase = (t * beat) % 1;
        this.beatPulse = Math.exp(-beatPhase * 5) * (this.lightMod.left + this.lightMod.right) / 2;
        
        // Ripple on beat
        if (beatPhase < 0.05 && t - this.lastBeatTime > 0.2) {
            this.addRipple(this.beatPulse);
            this.lastBeatTime = t;
        }
        
        // Trail effect
        if (this.enableTrails) {
            ctx.fillStyle = `rgba(10, 10, 15, ${this.trailOpacity})`;
            ctx.fillRect(0, 0, this.width, this.height);
        } else {
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        this.updateRipples();
        this.updateParticles(this.breathScale, this.beatPulse, this.lightMod);
        this.rotation += 0.002 * (1 + this.beatPulse);
        
        // Draw layers
        this.drawHalo(this.centerX, this.centerY, this.baseRadius, this.haloIntensity, this.breathScale, this.beatPulse, this.lightMod);
        this.drawRipples();
        this.drawParticles();
        
        // Main geometry
        const size = this.baseRadius;
        switch (this.pattern) {
            case 'flower': this.drawFlowerOfLife(this.centerX, this.centerY, size, this.layers, this.rotation, this.breathScale, this.beatPulse); break;
            case 'sri': this.drawSriYantra(this.centerX, this.centerY, size, this.rotation, this.breathScale, this.beatPulse); break;
            case 'metatron': this.drawMetatronCube(this.centerX, this.centerY, size, this.rotation, this.breathScale, this.beatPulse); break;
            case 'torus': this.drawTorus(this.centerX, this.centerY, size, this.rotation, this.breathScale, this.beatPulse); break;
            case 'fibonacci': this.drawFibonacciSpiral(this.centerX, this.centerY, size, this.rotation, this.breathScale, this.beatPulse); break;
            case 'vesica': this.drawVesicaPiscis(this.centerX, this.centerY, size, this.rotation, this.breathScale, this.beatPulse); break;
        }
        
        this.animationFrame = requestAnimationFrame((t) => this.render(t));
    }
    
    start(getAudioTime, getBreathPhase, getLightMod, getBeat) {
        this.getAudioTime = getAudioTime;
        this.getBreathPhase = getBreathPhase;
        this.getLightMod = getLightMod;
        this.getBeat = getBeat;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.initParticles(this.particleCount);
        this.render(this.lastTime);
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    }
    
    // ============================================
    // PREVIEW MODE
    // ============================================
    
    renderPreview() {
        const ctx = this.ctx;
        const t = Date.now() * 0.001;
        
        const simBreath = (Math.sin(t * 0.5) + 1) / 2;
        const simBeat = Math.exp(-((t * 4) % 1) * 5) * 0.5;
        const simLight = { left: 0.5 + Math.sin(t * 4) * 0.3, right: 0.5 + Math.cos(t * 4) * 0.3 };
        const breathScale = 1 + simBreath * 0.3;
        
        ctx.fillStyle = `rgba(10, 10, 15, 0.1)`;
        ctx.fillRect(0, 0, this.width, this.height);
        
        this.rotation += 0.003;
        
        this.drawHalo(this.centerX, this.centerY, this.baseRadius * 0.6, this.haloIntensity * 0.5, breathScale, simBeat, simLight);
        
        const size = this.baseRadius * 0.6;
        switch (this.pattern) {
            case 'flower': this.drawFlowerOfLife(this.centerX, this.centerY, size, this.layers, this.rotation, breathScale, simBeat); break;
            case 'sri': this.drawSriYantra(this.centerX, this.centerY, size, this.rotation, breathScale, simBeat); break;
            case 'metatron': this.drawMetatronCube(this.centerX, this.centerY, size, this.rotation, breathScale, simBeat); break;
            case 'torus': this.drawTorus(this.centerX, this.centerY, size, this.rotation, breathScale, simBeat); break;
            case 'fibonacci': this.drawFibonacciSpiral(this.centerX, this.centerY, size, this.rotation, breathScale, simBeat); break;
            case 'vesica': this.drawVesicaPiscis(this.centerX, this.centerY, size, this.rotation, breathScale, simBeat); break;
        }
    }
    
    startPreviewLoop() {
        this.stopPreviewLoop();
        const loop = () => {
            if (!this.isRunning) {
                this.renderPreview();
                this.previewFrame = requestAnimationFrame(loop);
            }
        };
        loop();
    }
    
    stopPreviewLoop() {
        if (this.previewFrame) { cancelAnimationFrame(this.previewFrame); this.previewFrame = null; }
    }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = VisualEngine; }
