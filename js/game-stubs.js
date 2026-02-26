// Game stubs - provides minimal interfaces that the chip designer expects
// This allows the designer to run standalone without the full game

// Stub game object with research manager that always returns true
window.game = {
    researchManager: {
        isUnlocked: () => true
    },
    gameState: {
        persistentStats: {
            tierProduced: {}
        }
    },
    pauseGameForUI: () => {},
    resumeGameFromUI: () => {},
    recordFirmwareChallengeComplete: () => {},
    recordNandChallengeComplete: () => {}
};

// Stub void shop - enable transcendent workboard and expanded gates
window.voidShop = {
    hasTranscendentWorkboard: () => true,
    hasExpandedGateLibrary: () => true,
    hasPurchased: () => true,
    // Generic upgrades proxy — all upgrades report level 1
    upgrades: new Proxy({}, {
        get: () => ({ currentLevel: 1, name: 'Unlocked' })
    })
};

// Stub prestige shop - max blueprint level
window.prestigeShop = {
    getBonus: (id) => {
        if (id === 'circuit_blueprints') return 3;
        return 0;
    }
};

// All firmware tiers unlocked — no chip production gating
window.isFirmwareTierUnlocked = () => true;
window.getFirmwareTierProgress = () => null;

// Stub locale manager
window.localeManager = {
    register: () => {},
    get: (key) => key
};

// Stub notifications
window.notifications = {
    show: (msg) => console.log('[Notification]', msg)
};

// Stub translation function - returns the key with namespace stripped
window.t = function(key) {
    const parts = key.split('.');
    const last = parts[parts.length - 1];
    return last.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
};

// Stub audio manager
window.audioManager = {
    play: () => {},
    playSFX: () => {}
};

// Stub Icons helper (used in production chain HTML)
window.Icons = {
    get: (name, size, color) => {
        const icons = {
            power: '\u26A1',
            link: '\uD83D\uDD17',
            brain: '\uD83E\uDDE0',
            package: '\uD83D\uDCE6',
            arrowRight: '\u2192',
            lock: '\uD83D\uDD12',
            star: '\u2B50'
        };
        return `<span style="font-size:${size || 14}px;color:${color || '#fff'}">${icons[name] || '\u25CF'}</span>`;
    }
};

// Stub MACHINE_RESEARCH_MAP (all machines "unlocked")
window.MACHINE_RESEARCH_MAP = {};

// Stub RESEARCH_DATA
window.RESEARCH_DATA = {};

// Stub NandBonusEffects (challenge bonus descriptions)
window.NandBonusEffects = {};
