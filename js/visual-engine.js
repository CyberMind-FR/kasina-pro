/**
 * KASINA θ PRO - VISUAL ENGINE MODULE
 * Géométries sacrées, mandalas, halos, particules
 * Synchronisation sample-accurate avec l'audio
 */

class VisualEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.animationFrame = null;
        
        // Mandala settings
        this.pattern = 'flower';
        this.petals = 8;
        this.layers = 4;
        this.rotation = 0;
        this.pulsePhase = 0;
        
        // Halo settings
        this.haloIntensity = 0.6;
        this.haloPulseSync = 'breath';
        
        // Particles
        this.particles = [];
        this.particleCount = 50;
        
        // Colors
        this.rgb = { r: 50, g: 30, b: 100 };
        this.brightness = 0.7;
        
        // Audio sync callback
        this.getAudioTime = null;
        this.getBreathPhase = null;
        this.getLightMod = null;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const rect = this.canvas.parentElement?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }
    
    setColors(r, g, b, brightness = 0.7) {
        this.rgb = { r, g, b };
        this.brightness = brightness;
    }
    
    initParticles(count = 50) {
        this.particleCount = count;
        this.particles = [];
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 3 + 1,
                alpha: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 30 - 15
            });
        }
    }
    
    // ============================================
    // SACRED GEOMETRY PATTERNS
    // ============================================
    
    drawFlowerOfLife(cx, cy, radius, layers, rotation, pulse) {
        const ctx = this.ctx;
        const r = radius * (0.8 + pulse * 0.2);
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        
        // Central circle
        ctx.beginPath();
        ctx.arc(0, 0, r / 6, 0, Math.PI * 2);
        ctx.strokeStyle = this.getColor(0.6);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Flower petals
        for (let layer = 1; layer <= layers; layer++) {
            const layerRadius = (r / 6) * layer;
            const petalCount = layer === 1 ? 6 : layer * 6;
            
            for (let i = 0; i < petalCount; i++) {
                const angle = (i / petalCount) * Math.PI * 2;
                const px = Math.cos(angle) * layerRadius;
                const py = Math.sin(angle) * layerRadius;
                
                ctx.beginPath();
                ctx.arc(px, py, r / 6, 0, Math.PI * 2);
                ctx.strokeStyle = this.getColor(0.4 + layer * 0.1);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
    
    drawSriYantra(cx, cy, size, rotation, pulse) {
        const ctx = this.ctx;
        const s = size * (0.85 + pulse * 0.15);
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        
        // Outer square (Bhupura)
        ctx.strokeStyle = this.getColor(0.5);
        ctx.lineWidth = 2;
        ctx.strokeRect(-s/2, -s/2, s, s);
        
        // Lotus petals (outer ring)
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const x1 = Math.cos(angle) * s * 0.4;
            const y1 = Math.sin(angle) * s * 0.4;
            const x2 = Math.cos(angle + 0.1) * s * 0.45;
            const y2 = Math.sin(angle + 0.1) * s * 0.45;
            const x3 = Math.cos(angle - 0.1) * s * 0.45;
            const y3 = Math.sin(angle - 0.1) * s * 0.45;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();
            ctx.strokeStyle = this.getColor(0.4);
            ctx.stroke();
        }
        
        // Triangles (9 interlocking)
        const triangles = [
            { up: true, scale: 0.35 },
            { up: false, scale: 0.32 },
            { up: true, scale: 0.28 },
            { up: false, scale: 0.24 },
            { up: true, scale: 0.18 }
        ];
        
        triangles.forEach((t, idx) => {
            ctx.beginPath();
            if (t.up) {
                ctx.moveTo(0, -s * t.scale);
                ctx.lineTo(-s * t.scale * 0.866, s * t.scale * 0.5);
                ctx.lineTo(s * t.scale * 0.866, s * t.scale * 0.5);
            } else {
                ctx.moveTo(0, s * t.scale);
                ctx.lineTo(-s * t.scale * 0.866, -s * t.scale * 0.5);
                ctx.lineTo(s * t.scale * 0.866, -s * t.scale * 0.5);
            }
            ctx.closePath();
            ctx.strokeStyle = this.getColor(0.5 + idx * 0.1);
            ctx.stroke();
        });
        
        // Central bindu
        ctx.beginPath();
        ctx.arc(0, 0, 4 + pulse * 3, 0, Math.PI * 2);
        ctx.fillStyle = this.getColor(1);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawMetatronCube(cx, cy, size, rotation, pulse) {
        const ctx = this.ctx;
        const s = size * (0.85 + pulse * 0.15);
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        
        // 13 circles of Metatron's Cube
        const positions = [
            { x: 0, y: 0 }, // Center
        ];
        
        // Inner hexagon
        for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            positions.push({ x: Math.cos(angle) * s * 0.2, y: Math.sin(angle) * s * 0.2 });
        }
        
        // Outer hexagon
        for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3 + Math.PI / 6;
            positions.push({ x: Math.cos(angle) * s * 0.35, y: Math.sin(angle) * s * 0.35 });
        }
        
        // Draw connecting lines
        ctx.strokeStyle = this.getColor(0.3);
        ctx.lineWidth = 1;
        
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                ctx.beginPath();
                ctx.moveTo(positions[i].x, positions[i].y);
                ctx.lineTo(positions[j].x, positions[j].y);
                ctx.stroke();
            }
        }
        
        // Draw circles
        positions.forEach((pos, idx) => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, s * 0.06, 0, Math.PI * 2);
            ctx.strokeStyle = this.getColor(0.6);
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        ctx.restore();
    }
    
    drawTorus(cx, cy, size, rotation, pulse) {
        const ctx = this.ctx;
        const outerRadius = size * 0.4 * (0.9 + pulse * 0.1);
        const tubeRadius = size * 0.15;
        const segments = 36;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const nextAngle = ((i + 1) / segments) * Math.PI * 2;
            
            // Draw tube segment
            for (let j = 0; j < 12; j++) {
                const tubeAngle = (j / 12) * Math.PI * 2;
                const x1 = Math.cos(angle) * (outerRadius + Math.cos(tubeAngle) * tubeRadius);
                const y1 = Math.sin(angle) * (outerRadius + Math.cos(tubeAngle) * tubeRadius) * 0.4;
                const x2 = Math.cos(nextAngle) * (outerRadius + Math.cos(tubeAngle) * tubeRadius);
                const y2 = Math.sin(nextAngle) * (outerRadius + Math.cos(tubeAngle) * tubeRadius) * 0.4;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = this.getColor(0.3 + Math.abs(Math.sin(tubeAngle)) * 0.4);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
    
    drawFibonacciSpiral(cx, cy, size, rotation, pulse) {
        const ctx = this.ctx;
        const s = size * (0.85 + pulse * 0.15);
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const numPoints = 200;
        
        ctx.beginPath();
        
        for (let i = 0; i < numPoints; i++) {
            const r = Math.sqrt(i) * s * 0.025;
            const theta = i * goldenAngle;
            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Draw dots
            if (i % 5 === 0) {
                ctx.fillStyle = this.getColor(0.5 + (i / numPoints) * 0.3);
                ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
            }
        }
        
        ctx.strokeStyle = this.getColor(0.4);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawVesicaPiscis(cx, cy, size, rotation, pulse) {
        const ctx = this.ctx;
        const r = size * 0.3 * (0.9 + pulse * 0.1);
        const offset = r * 0.5;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        
        // Two overlapping circles
        ctx.beginPath();
        ctx.arc(-offset, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = this.getColor(0.5);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(offset, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        
        // Vesica (intersection)
        ctx.beginPath();
        ctx.arc(-offset, 0, r, -Math.PI/3, Math.PI/3);
        ctx.arc(offset, 0, r, Math.PI*2/3, Math.PI*4/3);
        ctx.fillStyle = this.getColor(0.2);
        ctx.fill();
        
        // Eye in center
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = this.getColor(0.8);
        ctx.fill();
        
        ctx.restore();
    }
    
    // ============================================
    // HALO EFFECT
    // ============================================
    drawHalo(cx, cy, baseRadius, intensity, pulse) {
        const ctx = this.ctx;
        const numRings = 5;
        
        for (let i = 0; i < numRings; i++) {
            const ringRadius = baseRadius * (1 + i * 0.15) * (0.9 + pulse * 0.1);
            const alpha = intensity * (1 - i / numRings) * 0.3;
            
            ctx.beginPath();
            ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = this.getColor(alpha);
            ctx.lineWidth = 3 - i * 0.5;
            ctx.stroke();
        }
        
        // Inner glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
        gradient.addColorStop(0, this.getColor(intensity * 0.15));
        gradient.addColorStop(0.5, this.getColor(intensity * 0.05));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
    }
    
    // ============================================
    // PARTICLES
    // ============================================
    updateAndDrawParticles(breathScale = 1) {
        const ctx = this.ctx;
        
        this.particles.forEach(p => {
            // Update position
            p.x += p.vx * breathScale;
            p.y += p.vy * breathScale;
            
            // Wrap around
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;
            
            // Draw
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * breathScale, 0, Math.PI * 2);
            ctx.fillStyle = this.getColor(p.alpha * breathScale, p.hue);
            ctx.fill();
        });
    }
    
    // ============================================
    // COLOR HELPERS
    // ============================================
    getColor(alpha = 1, hueOffset = 0) {
        const r = Math.round(this.rgb.r * 2.55 * this.brightness);
        const g = Math.round(this.rgb.g * 2.55 * this.brightness);
        const b = Math.round(this.rgb.b * 2.55 * this.brightness);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // ============================================
    // MAIN RENDER LOOP
    // ============================================
    render(time, breathPhase, lightMod, beat) {
        const ctx = this.ctx;
        
        // Clear with fade trail
        ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Calculate pulse from breath
        let pulse = 0.5;
        if (breathPhase) {
            switch (breathPhase.phase) {
                case 'inhale': pulse = 0.5 + breathPhase.progress * 0.5; break;
                case 'hold': pulse = 1; break;
                case 'exhale': pulse = 1 - breathPhase.progress * 0.5; break;
                case 'pause': pulse = 0.5; break;
            }
        }
        
        // Calculate breath scale for particles
        let breathScale = 1;
        if (breathPhase) {
            breathScale = breathPhase.phase === 'inhale' ? 1 + breathPhase.progress * 0.3 :
                         breathPhase.phase === 'exhale' ? 1.3 - breathPhase.progress * 0.3 : 
                         breathPhase.phase === 'hold' ? 1.3 : 1;
        }
        
        // Update rotation
        this.rotation += 0.001 + (beat || 4) * 0.0001;
        
        // Draw halo
        const haloRadius = Math.min(this.width, this.height) * 0.35;
        this.drawHalo(this.centerX, this.centerY, haloRadius, this.haloIntensity, pulse);
        
        // Draw mandala based on pattern
        const mandalaSize = Math.min(this.width, this.height) * 0.8;
        
        switch (this.pattern) {
            case 'flower':
                this.drawFlowerOfLife(this.centerX, this.centerY, mandalaSize / 2, this.layers, this.rotation, pulse);
                break;
            case 'sri-yantra':
                this.drawSriYantra(this.centerX, this.centerY, mandalaSize, this.rotation * 0.3, pulse);
                break;
            case 'metatron':
                this.drawMetatronCube(this.centerX, this.centerY, mandalaSize, this.rotation * 0.5, pulse);
                break;
            case 'torus':
                this.drawTorus(this.centerX, this.centerY, mandalaSize, this.rotation * 2, pulse);
                break;
            case 'fibonacci':
                this.drawFibonacciSpiral(this.centerX, this.centerY, mandalaSize, this.rotation, pulse);
                break;
            case 'vesica':
                this.drawVesicaPiscis(this.centerX, this.centerY, mandalaSize, this.rotation * 0.2, pulse);
                break;
        }
        
        // Draw particles
        this.updateAndDrawParticles(breathScale);
        
        // Light flash effect synced to beat
        if (lightMod && lightMod.left > 0.8) {
            ctx.fillStyle = this.getColor(0.05);
            ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    start(getAudioTime, getBreathPhase, getLightMod, getBeat) {
        this.isRunning = true;
        this.initParticles(this.particleCount);
        
        const animate = () => {
            if (!this.isRunning) return;
            
            const time = getAudioTime ? getAudioTime() : performance.now() / 1000;
            const breathPhase = getBreathPhase ? getBreathPhase(time) : null;
            const lightMod = getLightMod ? getLightMod(time) : null;
            const beat = getBeat ? getBeat() : 4;
            
            this.render(time, breathPhase, lightMod, beat);
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    // ============================================
    // PREVIEW RENDER (for config panel)
    // ============================================
    renderPreview() {
        this.resize();
        const pulse = 0.5 + Math.sin(performance.now() / 1000) * 0.3;
        this.rotation = performance.now() / 5000;
        
        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw pattern
        const size = Math.min(this.width, this.height) * 0.9;
        
        switch (this.pattern) {
            case 'flower':
                this.drawFlowerOfLife(this.centerX, this.centerY, size / 2, this.layers, this.rotation, pulse);
                break;
            case 'sri-yantra':
                this.drawSriYantra(this.centerX, this.centerY, size, this.rotation * 0.3, pulse);
                break;
            case 'metatron':
                this.drawMetatronCube(this.centerX, this.centerY, size, this.rotation * 0.5, pulse);
                break;
            case 'torus':
                this.drawTorus(this.centerX, this.centerY, size, this.rotation * 2, pulse);
                break;
            case 'fibonacci':
                this.drawFibonacciSpiral(this.centerX, this.centerY, size, this.rotation, pulse);
                break;
            case 'vesica':
                this.drawVesicaPiscis(this.centerX, this.centerY, size, this.rotation * 0.2, pulse);
                break;
        }
    }
    
    startPreviewLoop() {
        const loop = () => {
            if (!this.isRunning) {
                this.renderPreview();
                this.previewFrame = requestAnimationFrame(loop);
            }
        };
        loop();
    }
    
    stopPreviewLoop() {
        if (this.previewFrame) {
            cancelAnimationFrame(this.previewFrame);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualEngine;
}
