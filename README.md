# Kasina θ Pro

## Neuro-Entrainment System v2.0.0

> *"La conscience est une musique que l'on peut accorder"*

![Version](https://img.shields.io/badge/version-2.0.0-purple)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA](https://img.shields.io/badge/PWA-offline-blue)

**Kasina θ Pro** est une Progressive Web App open-source de génération de sessions audio-visuelles pour la méditation, l'entraînement cérébral et le bien-être. Elle combine battements binauraux, stimulation lumineuse photic, géométrie sacrée et synchronisation physiologique.

🌐 **[Demo Live](https://cybermind.fr/apps/kasina-pro/)** | 📖 **[Blog Article](https://cybermind.fr/2024/kasina-theta-pro/)**

---

## 🧠 Philosophie

### L'Entrainement Neuronal

Le cerveau produit naturellement des ondes électromagnétiques à différentes fréquences :

| Onde | Fréquence | État |
|------|-----------|------|
| **δ Delta** | 0.5-4 Hz | Sommeil profond, régénération |
| **θ Theta** | 4-8 Hz | Méditation, créativité, rêve |
| **α Alpha** | 8-13 Hz | Relaxation, apprentissage |
| **β Beta** | 13-30 Hz | Concentration, analyse |
| **γ Gamma** | 30-100 Hz | Insight, transcendance |

Kasina θ Pro utilise le phénomène d'**entrainement neuronal** : exposé à des stimuli rythmiques (son + lumière), le cerveau synchronise naturellement son activité sur ces fréquences.

### Approche Holistique

Le projet intègre :
- **Neurosciences** : Battements binauraux, isochroniques
- **Géométrie Sacrée** : Mandalas, Fleur de Vie, Sri Yantra
- **Traditions Contemplatives** : Pranayama, affirmations, rituels
- **Technologie Mobile** : IMU, microphone, capteurs
- **Standards AVS** : AudioStrobe®, SpectraStrobe™

---

## ✨ Fonctionnalités

### 🎧 Audio Engine
- Battements binauraux (50-655 Hz)
- Formes d'onde : Sine, Square, Triangle, Sawtooth
- Pink noise calibré
- Whispers subliminaux (9 langues + Sanskrit)
- **Anti-habituation** : micro-variations aléatoires
- **Clock maître** : `AudioContext.currentTime` (sample-accurate)

### 🌀 Visual Engine
- **Géométries sacrées** : Fleur de Vie, Sri Yantra, Métatron, Torus, Fibonacci, Vesica Piscis
- Mandalas configurables (pétales, couches, rotation)
- **Effets halo** pulsants synchronisés
- Système de particules réactif

### 👓 GanzFrames / Lumière
- Beat 0.5-40 Hz avec phase L/R
- RGB complet, 16 ColorSets
- **AudioStrobe®** : 2 canaux ~19kHz
- **SpectraStrobe™** : 6 canaux RGB (17.5-20 kHz)

### ☯ Synchronisation
- **Respiration** : Carré, 4-7-8, Cohérence cardiaque
- **Marche méditative** : Tempo + détection IMU
- **Micro/Souffle** : Détection respiratoire temps réel
- **EEG Phase Sweep** : Transitions θ→α, δ→θ, β→α→θ

### 📱 Capteurs Mobile
- IMU (accéléromètre/gyroscope)
- Détection de pas et cadence
- **Détection fatigue** (variabilité du pas)
- Synchronisation souffle via micro

### 🕯️ Mode Rituel
- Intention de session
- Clôture consciente avec statistiques
- Export journal personnel

### 📲 PWA Offline
- Installation sur écran d'accueil
- Fonctionnement 100% hors-ligne
- Mode plein écran verrouillé

---

## 🚀 Installation

### Utilisation en ligne
```
https://cybermind.fr/apps/kasina-pro/
```

### Installation locale
```bash
git clone https://github.com/gandalf-music/kasina-pro.git
cd kasina-pro
python -m http.server 8080
# ou: npx serve .
```

### PWA Mobile
1. Ouvrir dans Chrome/Safari
2. Menu → "Ajouter à l'écran d'accueil"
3. L'app fonctionne désormais offline

---

## 📖 Guide Rapide

1. **Choisir un profil** : Delta → Gamma
2. **Sélectionner un sous-profil** : Méditation, Focus, Créativité...
3. **Ajuster les paramètres** audio/visuel/sync
4. **Mode Rituel** (optionnel) : poser une intention
5. **Générer & Lancer** la session
6. **Suivre les guides** respiration/mandala

### Paramètres Recommandés

| Objectif | Profil | Durée | Respiration |
|----------|--------|-------|-------------|
| Sommeil | Delta | 45 min | 4-0-8-0 |
| Méditation | Theta | 30 min | 4-4-6-2 |
| Relaxation | Alpha | 20 min | 4-2-6-0 |
| Focus | Beta | 25 min | 3-3-3-0 |

---

## 🔬 Architecture

```
kasina-pro/
├── index.html          # Interface
├── manifest.json       # PWA
├── sw.js              # Service Worker
├── css/main.css       # Styles
├── js/
│   ├── profiles.js    # Profils & whispers
│   ├── audio-engine.js # Audio & encodage
│   ├── visual-engine.js # Mandalas
│   ├── sensors.js     # IMU & micro
│   └── app.js         # Orchestration
└── assets/icon.svg
```

### Encodage AudioStrobe®
```
Signal = Audio + (Carrier_19kHz × LightMod × Level)
```

### Encodage SpectraStrobe™
```
6 porteuses @ 17.5/18.0/18.5/19.0/19.5/20.0 kHz
L: RGB gauche | R: RGB droite
```

---

## ⚠️ Sécurité

### ÉPILEPSIE
**Les stimulations lumineuses peuvent déclencher des crises.**
Ne pas utiliser avec antécédents d'épilepsie.

### Recommandations
- Sessions courtes au début (5-10 min)
- Volume modéré
- Ne pas utiliser en conduisant
- Consulter un professionnel si troubles psy

---

## 📤 Exports

| Format | Description |
|--------|-------------|
| **WAV** | Audio 44.1kHz 16-bit + encodage |
| **MP3** | Audio 192kbps + encodage |
| **KBS** | Kasina Basic Session (natif) |
| **JSON** | Preset complet importable |

---

## 🤝 Contribution

Contributions bienvenues ! Fork + PR.

### Roadmap
- [ ] HRV (variabilité cardiaque)
- [ ] Biofeedback EEG
- [ ] Sessions guidées vocales
- [ ] Multi-utilisateurs sync

---

## 📜 Licence

MIT License - Libre utilisation et modification.

---

## 🙏 Crédits

- **MindPlace** : Spécifications AudioStrobe®/SpectraStrobe™
- Traditions contemplatives orientales et occidentales
- Communauté open-source neuro-entrainment

---

## 📞 Contact

- **Blog** : [cybermind.fr](https://cybermind.fr)
- **GitHub** : [github.com/gandalf-music/kasina-pro](https://github.com/gandalf-music/kasina-pro)
- **Auteur** : Gandalf @ CyberMind

---

*"La méditation n'est pas une évasion, c'est une plongée dans la nature profonde de l'esprit."*

**Kasina θ Pro** — Accordez votre conscience. 🧿
