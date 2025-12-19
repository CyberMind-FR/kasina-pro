---
title: "Kasina θ Pro : L'Art de l'Entrainement Neuronal"
date: 2024-12-19
updated: 2024-12-19
categories:
  - Projets
  - Bien-être
  - Open Source
tags:
  - meditation
  - neuroscience
  - pwa
  - audiostrobe
  - spectrastrobe
  - brainwave
  - sacred-geometry
  - binaural
  - kasina
  - mindplace
  - javascript
cover: /images/kasina-theta-pro-cover.jpg
excerpt: "Présentation de Kasina θ Pro v2.1, une Progressive Web App open-source pour générer des sessions audio-visuelles de méditation et d'entraînement cérébral. Géométries sacrées réactives, encodage AudioStrobe® et SpectraStrobe™, synchronisation physiologique."
---

# Kasina θ Pro : L'Art de l'Entrainement Neuronal

> *"La conscience est une musique que l'on peut accorder"*

Après plusieurs mois de développement, je suis heureux de présenter **Kasina θ Pro**, une Progressive Web App (PWA) open-source dédiée à la génération de sessions audio-visuelles pour la méditation et l'entraînement cérébral.

<!-- more -->

## 🌐 Liens Rapides

- **[Demo Live](https://brain.maegia.tv)** — Essayez directement dans votre navigateur
- **[GitHub Repository](https://github.com/CyberMind-FR/kasina-pro)** — Code source MIT

---

## 🧠 La Philosophie : Entrainement Neuronal

Notre cerveau produit naturellement des ondes électromagnétiques à différentes fréquences, chacune correspondant à un état de conscience particulier :

| Onde | Fréquence | État de Conscience |
|------|-----------|-------------------|
| **δ Delta** | 0.5-4 Hz | Sommeil profond, régénération cellulaire |
| **θ Theta** | 4-8 Hz | Méditation profonde, créativité, accès inconscient |
| **α Alpha** | 8-13 Hz | Relaxation éveillée, apprentissage optimal |
| **β Beta** | 13-30 Hz | Concentration active, analyse, productivité |
| **γ Gamma** | 30-100 Hz | États de conscience élevés, insight |

Le phénomène d'**entrainement neuronal** (brainwave entrainment) exploite la tendance naturelle du cerveau à synchroniser son activité sur des stimuli rythmiques externes. En combinant :

- **Battements binauraux** (différence de fréquence entre oreilles)
- **Stimulation lumineuse photic** (via lunettes GanzFrames)
- **Géométries sacrées** pour la contemplation visuelle

...on peut influencer de manière non-invasive les rythmes cérébraux et faciliter l'accès à des états méditatifs, créatifs ou de concentration profonde.

### Approche Holistique

Le projet intègre plusieurs dimensions :

- **Neurosciences** : Battements binauraux, isochroniques
- **Géométrie Sacrée** : Mandalas, Fleur de Vie, Sri Yantra
- **Traditions Contemplatives** : Pranayama, affirmations, rituels
- **Technologie Mobile** : IMU, microphone, capteurs physiologiques
- **Standards AVS** : AudioStrobe®, SpectraStrobe™

---

## ✨ Les Fonctionnalités

### 🎧 Audio Engine Avancé

L'application génère des **battements binauraux** précis avec :

- Fréquences L/R indépendantes (50-655 Hz)
- Multiples formes d'onde : Sine, Square, Triangle, Sawtooth
- **Pink noise** calibré pour masquer les distractions
- **Whispers subliminaux** en 9 langues + Sanskrit
- **Anti-habituation** : micro-variations aléatoires pour maintenir l'attention du cerveau

Le tout orchestré par un **clock maître unique** basé sur `AudioContext.currentTime` garantissant une synchronisation sample-accurate entre audio et visuels.

```javascript
// Clock maître - synchronisation parfaite
getMasterTime() {
    return this.audioContext.currentTime;
}
```

### 🌀 Visual Engine v2.1 — Géométries Ultra-Réactives

La version 2.1 apporte un moteur visuel entièrement repensé :

#### Géométries Sacrées Disponibles

| Pattern | Description | Effets Dynamiques |
|---------|-------------|-------------------|
| 🌸 **Fleur de Vie** | Harmonie universelle | Wobble sur les pétales, glow central pulsant |
| 🔺 **Sri Yantra** | Méditation tantrique | Triangles oscillants, lotus rotatif, bindu |
| ⬡ **Cube de Métatron** | Structure de l'univers | 13 cercles phasés individuellement |
| 🍩 **Torus** | Flux énergétique | Twist animé, déformation au beat |
| 🐚 **Spirale Fibonacci** | Nombre d'or | Vague lumineuse parcourant la spirale |
| 👁️ **Vesica Piscis** | Union des opposés | Cercles respirants, œil central |

#### Réactivité Dynamique

- **Synchronisation Respiration** : expansion sur l'inspire (jusqu'à 1.4x), contraction sur l'expire
- **Pulse au Beat** : attaque rapide, décroissance exponentielle douce
- **Ripples** : ondulations concentriques à chaque battement
- **Particules réactives** : orbitent et pulsent avec le rythme
- **Halos multi-couches** : 5 anneaux lumineux pulsants
- **Trails/Afterglow** : persistance hypnotique des images

### 👓 GanzFrames / Encodage Lumineux

Pour les utilisateurs d'appareils AVS (Audio-Visual Stimulation) comme le **MindPlace Kasina** ou **Limina**, l'application encode les signaux de contrôle lumineux directement dans les fichiers audio :

#### AudioStrobe® (2 canaux)

```
Signal = Audio + (Carrier_19kHz × Modulation_Lumière × Niveau)
```

- 2 canaux : Gauche / Droite
- Porteuse : ~19 kHz (modulée en amplitude)

#### SpectraStrobe™ (6 canaux RGB)

```
Porteuses :
  L-R @ 17.5 kHz    R-R @ 19.0 kHz
  L-G @ 18.0 kHz    R-G @ 19.5 kHz
  L-B @ 18.5 kHz    R-B @ 20.0 kHz
```

- Contrôle RGB complet pour chaque œil
- 16 ColorSets prédéfinis
- Exportez en WAV/MP3, copiez sur la carte SD du Kasina !

### ☯ Synchronisation Intelligente

#### Modes de Respiration

| Pattern | Inhale | Hold | Exhale | Pause | Usage |
|---------|--------|------|--------|-------|-------|
| Carré | 4s | 4s | 4s | 4s | Équilibre |
| 4-7-8 | 4s | 7s | 8s | 0s | Relaxation profonde |
| Cohérence | 5s | 0s | 5s | 0s | Cohérence cardiaque |

#### Marche Méditative

- Tempo ajustable 40-120 BPM
- **Détection IMU** : le tempo s'adapte à votre cadence réelle
- Synchronisation automatique des whispers avec les pas

#### EEG Phase Sweep

Transitions progressives entre états cérébraux :

- θ → α (méditation vers relaxation)
- δ → θ (sommeil profond vers rêve)
- β → α → θ (concentration vers méditation)
- Cycle complet personnalisable

### 📱 Capteurs Mobile

Sur smartphone, l'application exploite les **capteurs natifs** :

- **IMU (Accéléromètre/Gyroscope)** :
  - Détection du rythme de pas
  - Calcul de la cadence en temps réel
  - **Détection de fatigue** par analyse de la variabilité du pas

- **Microphone** :
  - Détection des phases respiratoires (inhale/exhale)
  - Calcul de la fréquence respiratoire
  - Synchronisation automatique des visuels

### 🕯️ Mode Rituel

Inspiré des traditions contemplatives :

1. **Poser une intention** avant la session (6 presets + custom)
2. **Pratiquer** en pleine conscience avec affichage discret
3. **Clôturer** avec statistiques détaillées :
   - Durée effective
   - Nombre de respirations
   - Pas comptés
   - Notes personnelles
4. **Exporter** un journal de pratique (JSON)

### 📲 PWA Offline

Kasina θ Pro est une **Progressive Web App** complète :

- ✅ Installation sur écran d'accueil (mobile & desktop)
- ✅ Fonctionnement **100% hors-ligne** après première visite
- ✅ Mode **plein écran verrouillé** pour immersion totale
- ✅ Service Worker avec cache intelligent
- ✅ Aucune dépendance serveur

---

## 📤 Formats d'Export

| Format | Description |
|--------|-------------|
| **WAV** | Audio 44.1kHz 16-bit avec encodage lumineux |
| **MP3** | Audio 192kbps compressé (via lamejs) |
| **KBS** | Kasina Basic Session (format natif MindPlace) |
| **JSON** | Preset complet importable/exportable |

---

## 🚀 Installation

### Utilisation en Ligne

Rendez-vous directement sur :

```
https://brain.maegia.tv
```

### Installation Locale

```bash
git clone https://github.com/CyberMind-FR/kasina-pro.git
cd kasina-pro
python -m http.server 8080
# ou: npx serve .
```

Puis ouvrez `http://localhost:8080`

### Installation PWA (Mobile/Desktop)

1. Ouvrez le lien dans Chrome/Safari
2. Menu navigateur → **"Ajouter à l'écran d'accueil"**
3. L'app fonctionne désormais offline !

---

## 📖 Guide Rapide

### Première Session

1. **Choisir un profil** : Delta, Theta, Alpha, Beta ou Gamma
2. **Sélectionner un sous-profil** : Méditation, Focus, Créativité, Sommeil...
3. **Ajuster les paramètres** dans les onglets Audio/Visuel/Sync
4. **Mode Rituel** (optionnel) : poser une intention consciente
5. **Générer & Lancer** la session
6. **Suivre les guides** respiration et mandala

### Paramètres Recommandés par Objectif

| Objectif | Profil | Durée | Respiration |
|----------|--------|-------|-------------|
| Sommeil | Delta | 45 min | 4-0-8-0 |
| Méditation | Theta | 30 min | 4-4-6-2 |
| Relaxation | Alpha | 20 min | 4-2-6-0 |
| Focus | Beta | 25 min | 3-3-3-0 |
| Créativité | Theta | 20 min | 4-2-6-0 |

---

## 🔬 Architecture Technique

```
kasina-pro/
├── index.html          # Interface principale
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker (cache offline)
├── CNAME              # Domaine GitHub Pages
├── css/
│   └── main.css       # Styles (~36KB)
├── js/
│   ├── profiles.js    # 20 profils + whispers 9 langues
│   ├── audio-engine.js # Génération audio + encodage AS/SS
│   ├── visual-engine.js # Mandalas ultra-réactifs v2.1
│   ├── sensors.js     # IMU + microphone + fatigue
│   └── app.js         # Orchestration complète
└── assets/
    └── icon.svg       # Icône PWA
```

### Clock Maître Unique

Toute la synchronisation repose sur `AudioContext.currentTime` :

```javascript
// La lumière est dérivée de l'audio (sample-accurate)
calculateLightMod(t, params) {
    const wavePhase = t * params.beat * Math.PI * 2;
    return Math.sin(wavePhase) * 0.5 + 0.5;
}
```

### Anti-Habituation

Pour éviter que le cerveau ne "s'habitue" aux stimuli :

```javascript
getMicroVariation(t, baseFreq, amount) {
    const v1 = Math.sin(t * 0.1) * 0.3;
    const v2 = Math.sin(t * 0.23) * 0.2;
    const v3 = Math.sin(t * 0.07) * 0.5;
    return baseFreq + (v1 + v2 + v3) * amount * baseFreq * 0.02;
}
```

---

## ⚠️ Avertissements de Sécurité

### 🚨 ÉPILEPSIE

**Les stimulations lumineuses peuvent déclencher des crises chez les personnes épileptiques ou photosensibles. Ne pas utiliser si vous avez des antécédents d'épilepsie.**

### Recommandations Générales

- Commencez par des sessions courtes (5-10 min)
- Volume audio modéré, jamais à fond
- Ne pas utiliser en conduisant ou en opérant des machines
- Position sécurisée (assis ou allongé)
- Consultez un professionnel si troubles psychiatriques

---

## 🗺️ Roadmap

Fonctionnalités en développement :

- [ ] **HRV** : Intégration de la variabilité cardiaque
- [ ] **Biofeedback EEG** : Support Muse, OpenBCI...
- [ ] **Sessions guidées vocales** : Méditations narrées
- [ ] **Multi-utilisateurs sync** : Sessions de groupe
- [ ] **Export MIDI** : Pour synthétiseurs modulaires

---

## 🤝 Contribution

Contributions bienvenues ! Fork + Pull Request sur GitHub.

Le projet est sous **licence MIT** — libre utilisation et modification.

---

## 🙏 Crédits

- **MindPlace** : Spécifications AudioStrobe®/SpectraStrobe™
- Traditions contemplatives orientales et occidentales
- Communauté open-source neuro-entrainment

---

## 📞 Contact

- **Blog** : [cybermind.fr](https://cybermind.fr)
- **GitHub** : [github.com/CyberMind-FR/kasina-pro](https://github.com/CyberMind-FR/kasina-pro)
- **Demo** : [brain.maegia.tv](https://brain.maegia.tv)
- **Auteur** : Gandalf @ CyberMind

---

## Conclusion

Kasina θ Pro représente une convergence entre :

- Les **neurosciences** modernes
- Les **traditions contemplatives** millénaires  
- La **technologie web** actuelle

L'objectif n'est pas de remplacer une pratique méditative authentique, mais d'offrir un **outil d'exploration** pour ceux qui souhaitent expérimenter avec les états de conscience.

Comme le disait Aldous Huxley : *"Les portes de la perception se nettoient, et tout apparaît tel qu'il est : infini."*

*"La méditation n'est pas une évasion, c'est une plongée dans la nature profonde de l'esprit."*

**Kasina θ Pro** — Accordez votre conscience. 🧿

---

**Tags** : #meditation #neuroscience #pwa #audiostrobe #spectrastrobe #brainwave #opensource #kasina #mindplace #sacred-geometry #binaural

**Ressources** :
- [MindPlace - Fabricant du Kasina](https://mindplace.com/)
- [Brainwave Entrainment - Wikipedia](https://en.wikipedia.org/wiki/Brainwave_entrainment)
- [AudioStrobe Specification](http://audiostrobe.com/)
- [Sacred Geometry - Wikipedia](https://en.wikipedia.org/wiki/Sacred_geometry)
