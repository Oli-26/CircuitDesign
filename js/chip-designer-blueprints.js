// Circuit Blueprint Manager - Save/load reusable gate groups in chip designer
// Unlocked via circuit_blueprints prestige upgrade (knowledge category)

class CircuitBlueprintManager {
    constructor() {
        this.storageKey = 'chipFab_circuit_blueprints';
        this.blueprints = [];
        this.load();
    }

    // Limits per prestige level
    static LIMITS = [
        { maxBlueprints: 3, maxGates: 8 },
        { maxBlueprints: 5, maxGates: 16 },
        { maxBlueprints: 8, maxGates: 24 }
    ];

    getPrestigeLevel() {
        const bonus = window.prestigeShop?.getBonus('circuit_blueprints');
        return bonus || 0;
    }

    isUnlocked() {
        return this.getPrestigeLevel() > 0;
    }

    getMaxBlueprints() {
        const level = this.getPrestigeLevel();
        if (level <= 0) return 0;
        const idx = Math.min(level, CircuitBlueprintManager.LIMITS.length) - 1;
        return CircuitBlueprintManager.LIMITS[idx].maxBlueprints;
    }

    getMaxGatesPerBlueprint() {
        const level = this.getPrestigeLevel();
        if (level <= 0) return 0;
        const idx = Math.min(level, CircuitBlueprintManager.LIMITS.length) - 1;
        return CircuitBlueprintManager.LIMITS[idx].maxGates;
    }

    // Save a blueprint from selected components and wires
    // components: array of ChipComponent refs, wires: array of ChipWire refs
    save(name, components, wires) {
        if (!this.isUnlocked()) return null;
        if (this.blueprints.length >= this.getMaxBlueprints()) return null;

        const ComponentTypes = window.ChipComponentTypes;
        // Count gates (exclude INPUT/OUTPUT)
        const gateCount = components.filter(c =>
            c.type !== ComponentTypes.INPUT && c.type !== ComponentTypes.OUTPUT
        ).length;
        if (gateCount > this.getMaxGatesPerBlueprint()) return null;
        if (components.length === 0) return null;

        // Normalize positions to (0,0) origin
        const minX = Math.min(...components.map(c => c.gridX));
        const minY = Math.min(...components.map(c => c.gridY));

        const compMap = new Map(); // component ref -> index in saved array
        const savedComponents = components.map((c, i) => {
            compMap.set(c, i);
            return {
                type: c.type,
                relX: c.gridX - minX,
                relY: c.gridY - minY
            };
        });

        // Save wires where both endpoints are in the selection
        const savedWires = wires
            .filter(w => compMap.has(w.fromComponent) && compMap.has(w.toComponent))
            .map(w => ({
                fromIdx: compMap.get(w.fromComponent),
                fromPin: w.fromPinIndex,
                toIdx: compMap.get(w.toComponent),
                toPin: w.toPinIndex
            }));

        const blueprint = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            name: name.trim().slice(0, 20) || 'Blueprint',
            components: savedComponents,
            wires: savedWires,
            gateCount,
            createdAt: Date.now()
        };

        this.blueprints.push(blueprint);
        this.persist();
        return blueprint;
    }

    rename(id, newName) {
        const bp = this.get(id);
        if (bp) {
            bp.name = newName.trim().slice(0, 20) || bp.name;
            this.persist();
        }
    }

    delete(id) {
        this.blueprints = this.blueprints.filter(bp => bp.id !== id);
        this.persist();
    }

    get(id) {
        return this.blueprints.find(bp => bp.id === id) || null;
    }

    getAll() {
        return this.blueprints;
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.blueprints = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load circuit blueprints:', e);
            this.blueprints = [];
        }
    }

    persist() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.blueprints));
        } catch (e) {
            console.warn('Failed to save circuit blueprints:', e);
        }
    }
}

window.CircuitBlueprintManager = CircuitBlueprintManager;
