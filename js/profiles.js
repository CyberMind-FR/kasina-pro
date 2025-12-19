/**
 * KASINA θ PRO - PROFILES & WHISPERS MODULE
 * Profils d'ondes cérébrales et affirmations multilingues
 */

const PROFILES = {
    delta: {
        name: 'Delta', wave: 'δ', freqRange: '0.5-4 Hz', color: 'delta',
        description: 'Sommeil profond, régénération, guérison',
        subprofiles: [
            { id: 'delta-sleep', name: 'Sommeil', icon: '🌙', freqLeft: 100, freqRight: 102, beat: 2, breath: { inhale: 4, hold: 0, exhale: 8, pause: 0 }, walkTempo: 0, syncMode: 'breath', rgb: { r: 20, g: 20, b: 80 }, whisperKey: 'sleep' },
            { id: 'delta-healing', name: 'Guérison', icon: '💚', freqLeft: 136, freqRight: 139, beat: 3, breath: { inhale: 5, hold: 2, exhale: 7, pause: 2 }, walkTempo: 0, syncMode: 'breath', rgb: { r: 20, g: 60, b: 40 }, whisperKey: 'healing' },
            { id: 'delta-release', name: 'Lâcher-prise', icon: '🍃', freqLeft: 90, freqRight: 93, beat: 3, breath: { inhale: 4, hold: 0, exhale: 10, pause: 2 }, walkTempo: 0, syncMode: 'breath', rgb: { r: 30, g: 40, b: 60 }, whisperKey: 'release' }
        ]
    },
    theta: {
        name: 'Theta', wave: 'θ', freqRange: '4-8 Hz', color: 'theta',
        description: 'Méditation, créativité, intuition',
        subprofiles: [
            { id: 'theta-meditation', name: 'Méditation', icon: '🧘', freqLeft: 210, freqRight: 214, beat: 4, breath: { inhale: 4, hold: 4, exhale: 6, pause: 2 }, walkTempo: 50, syncMode: 'breath', rgb: { r: 50, g: 30, b: 100 }, whisperKey: 'meditation' },
            { id: 'theta-creativity', name: 'Créativité', icon: '🎨', freqLeft: 200, freqRight: 206, beat: 6, breath: { inhale: 4, hold: 2, exhale: 6, pause: 0 }, walkTempo: 60, syncMode: 'breath', rgb: { r: 70, g: 40, b: 90 }, whisperKey: 'creativity' },
            { id: 'theta-intuition', name: 'Intuition', icon: '✨', freqLeft: 216, freqRight: 222, beat: 6, breath: { inhale: 5, hold: 5, exhale: 5, pause: 5 }, walkTempo: 45, syncMode: 'breath', rgb: { r: 60, g: 30, b: 100 }, whisperKey: 'intuition' },
            { id: 'theta-walking', name: 'Marche', icon: '🚶', freqLeft: 205, freqRight: 210, beat: 5, breath: { inhale: 4, hold: 0, exhale: 4, pause: 0 }, walkTempo: 60, syncMode: 'walk', rgb: { r: 40, g: 50, b: 80 }, whisperKey: 'walking' }
        ]
    },
    alpha: {
        name: 'Alpha', wave: 'α', freqRange: '8-13 Hz', color: 'alpha',
        description: 'Relaxation, apprentissage, flow',
        subprofiles: [
            { id: 'alpha-relax', name: 'Relaxation', icon: '☁️', freqLeft: 200, freqRight: 210, beat: 10, breath: { inhale: 4, hold: 2, exhale: 6, pause: 0 }, walkTempo: 55, syncMode: 'breath', rgb: { r: 30, g: 90, b: 70 }, whisperKey: 'relax' },
            { id: 'alpha-learning', name: 'Apprentissage', icon: '📚', freqLeft: 220, freqRight: 230, beat: 10, breath: { inhale: 4, hold: 4, exhale: 4, pause: 0 }, walkTempo: 70, syncMode: 'breath', rgb: { r: 40, g: 80, b: 60 }, whisperKey: 'learning' },
            { id: 'alpha-stress', name: 'Anti-Stress', icon: '🌿', freqLeft: 194, freqRight: 204, beat: 10, breath: { inhale: 4, hold: 7, exhale: 8, pause: 0 }, walkTempo: 50, syncMode: 'breath', rgb: { r: 30, g: 100, b: 50 }, whisperKey: 'antistress' },
            { id: 'alpha-morning', name: 'Éveil', icon: '🌅', freqLeft: 208, freqRight: 220, beat: 12, breath: { inhale: 3, hold: 0, exhale: 5, pause: 2 }, walkTempo: 65, syncMode: 'breath', rgb: { r: 80, g: 60, b: 30 }, whisperKey: 'morning' }
        ]
    },
    beta: {
        name: 'Beta', wave: 'β', freqRange: '13-30 Hz', color: 'beta',
        description: 'Focus, productivité, énergie',
        subprofiles: [
            { id: 'beta-focus', name: 'Focus', icon: '🎯', freqLeft: 200, freqRight: 215, beat: 15, breath: { inhale: 3, hold: 3, exhale: 3, pause: 0 }, walkTempo: 80, syncMode: 'walk', rgb: { r: 100, g: 80, b: 20 }, whisperKey: 'focus' },
            { id: 'beta-work', name: 'Travail', icon: '💻', freqLeft: 190, freqRight: 208, beat: 18, breath: { inhale: 4, hold: 2, exhale: 4, pause: 0 }, walkTempo: 75, syncMode: 'interval', rgb: { r: 90, g: 70, b: 30 }, whisperKey: 'work' },
            { id: 'beta-energy', name: 'Énergie', icon: '⚡', freqLeft: 180, freqRight: 200, beat: 20, breath: { inhale: 2, hold: 0, exhale: 2, pause: 0 }, walkTempo: 100, syncMode: 'walk', rgb: { r: 100, g: 60, b: 20 }, whisperKey: 'energy' },
            { id: 'beta-confidence', name: 'Confiance', icon: '🦁', freqLeft: 195, freqRight: 212, beat: 17, breath: { inhale: 3, hold: 3, exhale: 4, pause: 0 }, walkTempo: 90, syncMode: 'walk', rgb: { r: 100, g: 50, b: 30 }, whisperKey: 'confidence' }
        ]
    },
    gamma: {
        name: 'Gamma', wave: 'γ', freqRange: '30-100 Hz', color: 'gamma',
        description: 'Cognition élevée, insight, transcendance',
        subprofiles: [
            { id: 'gamma-insight', name: 'Insight', icon: '💎', freqLeft: 200, freqRight: 240, beat: 40, breath: { inhale: 3, hold: 6, exhale: 6, pause: 0 }, walkTempo: 70, syncMode: 'breath', rgb: { r: 100, g: 40, b: 70 }, whisperKey: 'insight' },
            { id: 'gamma-transcend', name: 'Transcendance', icon: '🌌', freqLeft: 172, freqRight: 212, beat: 40, breath: { inhale: 4, hold: 8, exhale: 8, pause: 4 }, walkTempo: 45, syncMode: 'breath', rgb: { r: 70, g: 30, b: 100 }, whisperKey: 'transcend' },
            { id: 'gamma-problem', name: 'Résolution', icon: '🧩', freqLeft: 185, freqRight: 225, beat: 40, breath: { inhale: 4, hold: 4, exhale: 4, pause: 2 }, walkTempo: 80, syncMode: 'interval', rgb: { r: 90, g: 50, b: 80 }, whisperKey: 'problem' },
            { id: 'gamma-peak', name: 'Performance', icon: '🏆', freqLeft: 190, freqRight: 235, beat: 45, breath: { inhale: 3, hold: 2, exhale: 3, pause: 0 }, walkTempo: 95, syncMode: 'walk', rgb: { r: 100, g: 40, b: 60 }, whisperKey: 'peak' }
        ]
    }
};

// EEG SWEEP PROFILES (Phase transitions)
const SWEEP_PROFILES = {
    'theta-alpha': {
        name: 'θ → α Éveil Doux',
        segments: [
            { duration: 0.3, startFreq: 4, endFreq: 4 },
            { duration: 0.4, startFreq: 4, endFreq: 10 },
            { duration: 0.3, startFreq: 10, endFreq: 10 }
        ]
    },
    'delta-theta': {
        name: 'δ → θ Émergence',
        segments: [
            { duration: 0.3, startFreq: 2, endFreq: 2 },
            { duration: 0.4, startFreq: 2, endFreq: 6 },
            { duration: 0.3, startFreq: 6, endFreq: 6 }
        ]
    },
    'alpha-beta': {
        name: 'α → β Activation',
        segments: [
            { duration: 0.2, startFreq: 10, endFreq: 10 },
            { duration: 0.5, startFreq: 10, endFreq: 18 },
            { duration: 0.3, startFreq: 18, endFreq: 18 }
        ]
    },
    'beta-alpha-theta': {
        name: 'β → α → θ Descente',
        segments: [
            { duration: 0.2, startFreq: 18, endFreq: 18 },
            { duration: 0.3, startFreq: 18, endFreq: 10 },
            { duration: 0.3, startFreq: 10, endFreq: 6 },
            { duration: 0.2, startFreq: 6, endFreq: 6 }
        ]
    },
    'full-cycle': {
        name: 'Cycle Complet',
        segments: [
            { duration: 0.15, startFreq: 10, endFreq: 6 },
            { duration: 0.2, startFreq: 6, endFreq: 3 },
            { duration: 0.3, startFreq: 3, endFreq: 3 },
            { duration: 0.2, startFreq: 3, endFreq: 6 },
            { duration: 0.15, startFreq: 6, endFreq: 10 }
        ]
    }
};

// MULTI-LANGUAGE WHISPERS
const WHISPERS = {
    fr: {
        sleep: ['je me laisse aller au sommeil', 'mon corps se régénère', 'je suis en paix profonde', 'le sommeil me guérit'],
        healing: ['mon corps sait guérir', 'la guérison coule en moi', 'chaque souffle me renouvelle', 'je me répare'],
        release: ['je lâche tout contrôle', 'je fais confiance à la vie', 'tout est parfait ainsi', 'je libère'],
        meditation: ['tu es aimé', 'tu es en sécurité', 'tout est bien', 'je suis présent', 'paix intérieure'],
        creativity: ['les idées coulent librement', 'je suis un canal créatif', 'mon imagination est infinie'],
        intuition: ['je fais confiance à mon intuition', 'ma sagesse intérieure me guide', 'je sais'],
        walking: ['chaque pas est une prière', 'je marche en conscience', 'la terre me porte'],
        relax: ['je me détends profondément', 'mon corps est léger', 'la paix m\'habite'],
        learning: ['j\'absorbe facilement', 'ma mémoire est excellente', 'apprendre est un plaisir'],
        antistress: ['le stress me quitte', 'je choisis la paix', 'tout va bien se passer'],
        morning: ['je m\'éveille en douceur', 'cette journée sera belle', 'gratitude pour ce nouveau jour'],
        focus: ['je suis totalement concentré', 'mon attention est laser', 'je suis dans le flow'],
        work: ['j\'avance efficacement', 'les solutions viennent à moi', 'je maîtrise mon sujet'],
        energy: ['l\'énergie coule en moi', 'je suis vivant et fort', 'je peux tout accomplir'],
        confidence: ['je crois en moi', 'j\'ose et je réussis', 'je mérite le succès'],
        insight: ['la clarté m\'envahit', 'les connexions se révèlent', 'tout fait sens'],
        transcend: ['je suis un avec le tout', 'les limites se dissolvent', 'amour universel'],
        problem: ['les réponses émergent', 'mon esprit synthétise', 'la solution apparaît'],
        peak: ['je suis à mon maximum', 'l\'excellence est mon état naturel', 'je transcende mes limites']
    },
    en: {
        sleep: ['I let myself drift to sleep', 'my body regenerates', 'I am in deep peace', 'sleep heals me'],
        healing: ['my body knows how to heal', 'healing flows through me', 'each breath renews me', 'I am healing'],
        release: ['I release all control', 'I trust life', 'everything is perfect as it is', 'I let go'],
        meditation: ['you are loved', 'you are safe', 'all is well', 'I am present', 'inner peace'],
        creativity: ['ideas flow freely', 'I am a creative channel', 'my imagination is infinite'],
        intuition: ['I trust my intuition', 'my inner wisdom guides me', 'I know'],
        walking: ['each step is a prayer', 'I walk in awareness', 'the earth supports me'],
        relax: ['I relax deeply', 'my body is light', 'peace dwells in me'],
        learning: ['I absorb easily', 'my memory is excellent', 'learning is a joy'],
        antistress: ['stress leaves me', 'I choose peace', 'everything will be fine'],
        morning: ['I awaken gently', 'this day will be beautiful', 'gratitude for this new day'],
        focus: ['I am fully focused', 'my attention is laser sharp', 'I am in the flow'],
        work: ['I progress efficiently', 'solutions come to me', 'I master my subject'],
        energy: ['energy flows through me', 'I am alive and strong', 'I can accomplish anything'],
        confidence: ['I believe in myself', 'I dare and succeed', 'I deserve success'],
        insight: ['clarity washes over me', 'connections reveal themselves', 'everything makes sense'],
        transcend: ['I am one with everything', 'boundaries dissolve', 'universal love'],
        problem: ['answers emerge', 'my mind synthesizes', 'the solution appears'],
        peak: ['I am at my peak', 'excellence is my natural state', 'I transcend my limits']
    },
    es: {
        sleep: ['me dejo llevar al sueño', 'mi cuerpo se regenera', 'estoy en paz profunda'],
        healing: ['mi cuerpo sabe sanar', 'la sanación fluye en mí', 'cada respiración me renueva'],
        release: ['suelto todo control', 'confío en la vida', 'todo es perfecto así'],
        meditation: ['eres amado', 'estás seguro', 'todo está bien', 'estoy presente'],
        creativity: ['las ideas fluyen libremente', 'soy un canal creativo'],
        intuition: ['confío en mi intuición', 'mi sabiduría interior me guía'],
        walking: ['cada paso es una oración', 'camino con consciencia'],
        relax: ['me relajo profundamente', 'mi cuerpo está ligero'],
        learning: ['absorbo fácilmente', 'mi memoria es excelente'],
        antistress: ['el estrés me abandona', 'elijo la paz'],
        morning: ['despierto suavemente', 'este día será hermoso'],
        focus: ['estoy totalmente concentrado', 'mi atención es precisa'],
        work: ['avanzo eficientemente', 'las soluciones vienen a mí'],
        energy: ['la energía fluye en mí', 'estoy vivo y fuerte'],
        confidence: ['creo en mí', 'me atrevo y triunfo'],
        insight: ['la claridad me invade', 'las conexiones se revelan'],
        transcend: ['soy uno con todo', 'los límites se disuelven'],
        problem: ['las respuestas emergen', 'mi mente sintetiza'],
        peak: ['estoy en mi máximo', 'la excelencia es mi estado natural']
    },
    de: {
        sleep: ['ich lasse mich in den Schlaf gleiten', 'mein Körper regeneriert sich', 'ich bin in tiefem Frieden'],
        healing: ['mein Körper weiß zu heilen', 'Heilung fließt durch mich'],
        meditation: ['du bist geliebt', 'du bist sicher', 'alles ist gut', 'ich bin präsent'],
        creativity: ['Ideen fließen frei', 'ich bin ein kreativer Kanal'],
        focus: ['ich bin voll konzentriert', 'meine Aufmerksamkeit ist scharf'],
        energy: ['Energie fließt durch mich', 'ich bin lebendig und stark'],
        confidence: ['ich glaube an mich', 'ich wage und gewinne']
    },
    it: {
        sleep: ['mi lascio andare al sonno', 'il mio corpo si rigenera', 'sono in pace profonda'],
        meditation: ['sei amato', 'sei al sicuro', 'tutto va bene', 'sono presente'],
        creativity: ['le idee fluiscono liberamente', 'sono un canale creativo'],
        focus: ['sono totalmente concentrato', 'la mia attenzione è precisa']
    },
    pt: {
        sleep: ['me deixo ir para o sono', 'meu corpo se regenera', 'estou em paz profunda'],
        meditation: ['você é amado', 'você está seguro', 'tudo está bem', 'estou presente'],
        creativity: ['as ideias fluem livremente', 'sou um canal criativo'],
        focus: ['estou totalmente focado', 'minha atenção é precisa']
    },
    ja: {
        sleep: ['眠りに身を委ねる', '体が再生する', '深い平和の中にいる'],
        meditation: ['愛されている', '安全である', 'すべてが良い', '今ここにいる'],
        creativity: ['アイデアが自由に流れる', '創造の器である'],
        focus: ['完全に集中している', '注意は鋭い']
    },
    zh: {
        sleep: ['我让自己进入睡眠', '我的身体在再生', '我处于深深的平静中'],
        meditation: ['你是被爱的', '你是安全的', '一切都好', '我在当下'],
        creativity: ['思想自由流动', '我是创造的通道'],
        focus: ['我完全专注', '我的注意力如激光般敏锐']
    },
    sa: { // Sanskrit mantras
        sleep: ['ॐ शान्ति', 'नमो अमिताभ'],
        meditation: ['ॐ मणि पद्मे हूँ', 'सो हम्', 'ॐ', 'शान्ति शान्ति शान्ति'],
        creativity: ['सरस्वती नमः', 'ॐ गं गणपतये नमः'],
        healing: ['ॐ भेषज्ये नमः', 'ॐ त्र्यम्बकं यजामहे'],
        transcend: ['तत् त्वम् असि', 'अहम् ब्रह्मास्मि', 'सर्वं खल्विदं ब्रह्म']
    }
};

// Get whispers for a given key and language
function getWhispers(whisperKey, lang = 'fr') {
    const langWhispers = WHISPERS[lang] || WHISPERS['fr'];
    return langWhispers[whisperKey] || langWhispers['meditation'] || [];
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PROFILES, SWEEP_PROFILES, WHISPERS, getWhispers };
}
