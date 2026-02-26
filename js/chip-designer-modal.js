// Chip Designer Modal - Integrates chip designer into main game
// Wraps the ChipDesigner interface as a fullscreen modal
// Vastly improved UI with better information display

class ChipDesignerModal {
    constructor() {
        this.modal = null;
        this.designer = null;
        this.isVisible = false;
        this.completedRequirements = new Set();
        this.completedChallenges = new Set();
        this.activeRequirement = null;
        this.activeTab = 'requirements'; // 'requirements', 'challenges', or 'advanced'
        this.isChallengeMode = false;
        this.isAdvancedMode = false;
        this.advancedCategory = null; // 'pictionary', 'analog', 'metamorphic', 'roulette'

        // Blueprint manager for circuit blueprints prestige feature
        this.blueprintManager = window.CircuitBlueprintManager ? new window.CircuitBlueprintManager() : null;

        // Global storage key for firmware unlocks (persists across all saves)
        this.globalStorageKey = 'circuitDesigner_unlocks';

        // Storage key for saved solutions
        this.solutionsStorageKey = 'circuitDesigner_solutions';

        // Load global unlocks immediately
        this.loadGlobalUnlocks();

        this.createModal();
        this.setupStyles();
    }

    // Save completed challenges and requirements to global localStorage (persists across all saves and prestige)
    saveGlobalUnlocks() {
        try {
            const data = {
                completedChallenges: Array.from(this.completedChallenges),
                completedRequirements: Array.from(this.completedRequirements)
            };
            localStorage.setItem(this.globalStorageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save global firmware unlocks:', e);
        }
    }

    // Load completed challenges and requirements from global localStorage
    loadGlobalUnlocks() {
        try {
            const saved = localStorage.getItem(this.globalStorageKey);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.completedChallenges && Array.isArray(data.completedChallenges)) {
                    this.completedChallenges = new Set(data.completedChallenges);
                }
                // Merge global requirements into current set (union preserves per-save + global)
                if (data.completedRequirements && Array.isArray(data.completedRequirements)) {
                    for (const id of data.completedRequirements) {
                        this.completedRequirements.add(id);
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to load global firmware unlocks:', e);
        }
    }

    // Get circuit stats (gate counts by type, wire count, total gates)
    getCircuitStats() {
        if (!this.designer) return null;
        const ComponentTypes = window.ChipComponentTypes;
        const gateCounts = {};
        let totalGates = 0;
        for (const comp of this.designer.components) {
            if (comp.type === ComponentTypes.INPUT || comp.type === ComponentTypes.OUTPUT) continue;
            gateCounts[comp.type] = (gateCounts[comp.type] || 0) + 1;
            totalGates++;
        }
        return {
            gateCounts,
            totalGates,
            wireCount: this.designer.wireManager.wires.length
        };
    }

    // Determine medal based on gate count vs budget thresholds
    getMedalForGateCount(gateCount, gateBudget) {
        if (!gateBudget) return null;
        if (gateCount <= gateBudget.gold) return 'gold';
        if (gateCount <= gateBudget.silver) return 'silver';
        if (gateCount <= gateBudget.bronze) return 'bronze';
        return null; // no medal, but still passes
    }

    getMedalIcon(medal) {
        const icons = { gold: '\u{1F947}', silver: '\u{1F948}', bronze: '\u{1F949}' };
        return icons[medal] || '';
    }

    getMedalColor(medal) {
        const colors = { gold: '#fbbf24', silver: '#94a3b8', bronze: '#cd7f32' };
        return colors[medal] || '#888';
    }

    // Save a solution for a requirement/challenge
    saveSolution(requirementId, isChallenge = false, gateCount = null, medal = null) {
        if (!this.designer) return;

        try {
            // Serialize current circuit state
            const solution = {
                components: this.designer.components.map(c => ({
                    type: c.type,
                    gridX: c.gridX,
                    gridY: c.gridY,
                    label: c.label,
                    manualValue: c.manualValue
                })),
                wires: this.designer.wireManager.wires.map(w => ({
                    fromComponentIndex: this.designer.components.indexOf(w.fromComponent),
                    fromPinIndex: w.fromPinIndex,
                    toComponentIndex: this.designer.components.indexOf(w.toComponent),
                    toPinIndex: w.toPinIndex
                })),
                savedAt: Date.now(),
                isChallenge: isChallenge,
                gateCount: gateCount,
                medal: medal
            };

            // Load existing solutions
            const allSolutions = this.loadAllSolutions();

            // Only overwrite if this is a better solution (fewer gates / better medal)
            const existing = allSolutions[requirementId];
            if (existing && existing.gateCount != null && gateCount != null) {
                if (gateCount > existing.gateCount) {
                    // Keep existing better solution's stats but update circuit
                    solution.gateCount = existing.gateCount;
                    solution.medal = existing.medal;
                }
            }

            allSolutions[requirementId] = solution;
            localStorage.setItem(this.solutionsStorageKey, JSON.stringify(allSolutions));
        } catch (e) {
            console.warn('Failed to save solution:', e);
        }
    }

    // Load all saved solutions
    loadAllSolutions() {
        try {
            const saved = localStorage.getItem(this.solutionsStorageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load solutions:', e);
        }
        return {};
    }

    // Load a specific solution
    loadSolution(requirementId) {
        const solutions = this.loadAllSolutions();
        return solutions[requirementId] || null;
    }

    // Check if a solution exists for a requirement
    hasSavedSolution(requirementId) {
        const solutions = this.loadAllSolutions();
        return !!solutions[requirementId];
    }

    // Get the medal achieved for a firmware design (used for calibration drift reduction)
    getMedalForFirmware(firmwareId) {
        const solution = this.loadSolution(firmwareId);
        return solution?.medal || null; // Returns 'gold', 'silver', 'bronze', or null
    }

    // Restore a saved solution to the canvas
    restoreSolution(requirementId) {
        const solution = this.loadSolution(requirementId);
        if (!solution || !this.designer) return false;

        // Clear current canvas
        this.designer.clear();

        // Recreate components
        const ComponentTypes = window.ChipComponentTypes;
        for (const compData of solution.components) {
            const component = new window.ChipComponent(compData.type, compData.gridX, compData.gridY);
            component.label = compData.label;
            component.manualValue = compData.manualValue || false;
            this.designer.components.push(component);
        }

        // Recreate wires
        for (const wireData of solution.wires) {
            const fromComp = this.designer.components[wireData.fromComponentIndex];
            const toComp = this.designer.components[wireData.toComponentIndex];
            if (fromComp && toComp) {
                this.designer.wireManager.addWire(
                    fromComp, wireData.fromPinIndex,
                    toComp, wireData.toPinIndex
                );
            }
        }

        this.designer.updateComponentLabels();
        this.designer.render();
        return true;
    }

    // Reset to initial state (for new game / prestige)
    reset() {
        this.completedRequirements = new Set();
        // Don't reset completedChallenges or completedRequirements - they persist globally
        // Reload from global storage to restore both
        this.loadGlobalUnlocks();

        this.activeRequirement = null;
        this.activeTab = 'requirements';
        this.isChallengeMode = false;
        this.isVisible = false;

        // Reset designer if it exists
        if (this.designer) {
            this.designer.reset();
        }

        // Hide modal if visible
        if (this.modal) {
            this.modal.classList.remove('visible');
        }
    }

    // Check if all required machines for a production tier are unlocked
    isTierUnlocked(productionTier) {
        if (!productionTier) return true;

        const tierInfo = window.ChipProductionTiers?.[productionTier];
        if (!tierInfo) return true;

        const researchManager = window.game?.researchManager;
        if (!researchManager) return true;

        for (const machine of tierInfo.machines) {
            const requiredResearch = window.MACHINE_RESEARCH_MAP?.[machine];
            if (requiredResearch && !researchManager.isUnlocked(requiredResearch)) {
                return false;
            }
        }
        return true;
    }

    // Get missing machines for a production tier
    getMissingMachines(productionTier) {
        if (!productionTier) return [];

        const tierInfo = window.ChipProductionTiers?.[productionTier];
        if (!tierInfo) return [];

        const researchManager = window.game?.researchManager;
        if (!researchManager) return [];

        const missing = [];
        for (const machine of tierInfo.machines) {
            const requiredResearch = window.MACHINE_RESEARCH_MAP?.[machine];
            if (requiredResearch && !researchManager.isUnlocked(requiredResearch)) {
                const research = window.RESEARCH_DATA?.[requiredResearch];
                missing.push(research?.name || machine);
            }
        }
        return missing;
    }

    // Check if all prerequisite designs are completed for a given requirement
    arePrerequisitesMet(req) {
        if (!req.requires || req.requires.length === 0) return true;
        return req.requires.every(prereqId => this.completedRequirements.has(prereqId));
    }

    // Get names of missing prerequisite designs
    getMissingPrerequisites(req) {
        if (!req.requires || req.requires.length === 0) return [];
        return req.requires
            .filter(prereqId => !this.completedRequirements.has(prereqId))
            .map(prereqId => {
                const prereq = window.getChipRequirementById?.(prereqId);
                return prereq?.name || prereqId;
            });
    }

    // Get difficulty info for a tier
    getDifficultyInfo(tier) {
        const difficulties = {
            1: { label: t('context.chipDesigner.modal.diffBeginner'), color: '#4ade80', stars: 1, hint: '2 gates' },
            2: { label: t('context.chipDesigner.modal.diffBeginner'), color: '#4ade80', stars: 1, hint: '2-4 gates' },
            3: { label: t('context.chipDesigner.modal.diffEasy'), color: '#22d3ee', stars: 2, hint: '2-4 gates' },
            4: { label: t('context.chipDesigner.modal.diffEasy'), color: '#22d3ee', stars: 2, hint: '3-5 gates' },
            5: { label: t('context.chipDesigner.modal.diffMedium'), color: '#fbbf24', stars: 3, hint: '2-5 gates' },
            6: { label: t('context.chipDesigner.modal.diffMedium'), color: '#fbbf24', stars: 3, hint: '3-9 gates' },
            7: { label: t('context.chipDesigner.modal.diffHard'), color: '#f97316', stars: 4, hint: '9-12 gates' },
            8: { label: t('context.chipDesigner.modal.diffHard'), color: '#f97316', stars: 4, hint: '4-12 gates' },
            9: { label: t('context.chipDesigner.modal.diffExpert'), color: '#ef4444', stars: 5, hint: '10-15 gates' },
            10: { label: t('context.chipDesigner.modal.diffMaster'), color: '#dc2626', stars: 5, hint: '16-24 gates' },
            11: { label: t('context.chipDesigner.modal.diffElite'), color: '#9333ea', stars: 5, hint: '4-18 gates' },
            12: { label: t('context.chipDesigner.modal.diffLegendary'), color: '#eab308', stars: 5, hint: '30-50 gates' }
        };
        return difficulties[tier] || { label: t('context.chipDesigner.modal.diffUnknown'), color: '#888', stars: 0, hint: '' };
    }

    // Get production chain icons
    getProductionChainHTML(productionTier) {
        const chains = {
            etcher: [
                { icon: window.Icons?.get('power', 14, '#4ade80') || '', name: t('context.chipDesigner.modal.chainEtcher'), color: '#4ade80' }
            ],
            bonder: [
                { icon: window.Icons?.get('power', 14, '#4ade80') || '', name: t('context.chipDesigner.modal.chainEtcher'), color: '#4ade80' },
                { icon: window.Icons?.get('link', 14, '#fbbf24') || '', name: t('context.chipDesigner.modal.chainBonder'), color: '#fbbf24' }
            ],
            integrator: [
                { icon: window.Icons?.get('power', 14, '#4ade80') || '', name: t('context.chipDesigner.modal.chainEtcher'), color: '#4ade80' },
                { icon: window.Icons?.get('link', 14, '#fbbf24') || '', name: t('context.chipDesigner.modal.chainBonder'), color: '#fbbf24' },
                { icon: window.Icons?.get('brain', 14, '#a78bfa') || '', name: t('context.chipDesigner.modal.chainIntegrator'), color: '#a78bfa' }
            ],
            packager: [
                { icon: window.Icons?.get('power', 14, '#4ade80') || '', name: t('context.chipDesigner.modal.chainEtcher'), color: '#4ade80' },
                { icon: window.Icons?.get('link', 14, '#fbbf24') || '', name: t('context.chipDesigner.modal.chainBonder'), color: '#fbbf24' },
                { icon: window.Icons?.get('brain', 14, '#a78bfa') || '', name: t('context.chipDesigner.modal.chainIntegrator'), color: '#a78bfa' },
                { icon: window.Icons?.get('package', 14, '#60a5fa') || '', name: t('context.chipDesigner.modal.chainPackager'), color: '#60a5fa' }
            ]
        };
        const chain = chains[productionTier] || chains.etcher;
        return chain.map((m, i) =>
            `<span class="cd-chain-item" style="color:${m.color}" title="${m.name}">${m.icon}</span>${i < chain.length - 1 ? `<span class="cd-chain-arrow">${window.Icons?.get('arrowRight', 12) || ''}</span>` : ''}`
        ).join('');
    }

    setupStyles() {
        if (document.getElementById('chip-designer-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'chip-designer-modal-styles';
        style.textContent = `
            .chip-designer-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #0d0d18;
                z-index: 10000;
                display: none;
                flex-direction: column;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }

            .chip-designer-modal.visible {
                display: flex;
                animation: cdFadeIn 0.2s ease-out;
            }

            @keyframes cdFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            /* Top Header Bar */
            .chip-designer-header {
                display: flex;
                align-items: center;
                padding: 8px 16px;
                background: #111122;
                border-bottom: 1px solid #1e1e3a;
                gap: 16px;
            }

            .chip-designer-logo {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 600;
                color: #8888aa;
                letter-spacing: 0.5px;
            }

            .chip-designer-logo-icon {
                width: 28px;
                height: 28px;
                background: #4f46e5;
                border-radius: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
            }

            .chip-designer-header-title {
                flex: 1;
                text-align: center;
            }

            .chip-designer-header-title h1 {
                font-size: 11px;
                color: #556;
                margin: 0;
                font-weight: 400;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .chip-designer-header-title h2 {
                font-size: 15px;
                color: #dde;
                margin: 2px 0 0 0;
                font-weight: 600;
            }

            .chip-designer-close-btn {
                padding: 6px 14px;
                background: transparent;
                border: 1px solid #2a2a44;
                border-radius: 0;
                color: #667;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.15s;
            }

            .chip-designer-close-btn:hover {
                border-color: #ef4444;
                color: #ef4444;
                background: rgba(239, 68, 68, 0.08);
            }

            .chip-designer-help-btn {
                padding: 6px 12px;
                background: transparent;
                border: 1px solid #33335a;
                border-radius: 0;
                color: #7778aa;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
                margin-right: 6px;
            }

            .chip-designer-help-btn:hover {
                border-color: #6366f1;
                color: #818cf8;
                background: rgba(99, 102, 241, 0.1);
            }

            /* Tutorial Overlay */
            .chip-designer-tutorial {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .chip-designer-tutorial.visible {
                display: flex;
                animation: cdFadeIn 0.2s ease-out;
            }

            .chip-designer-tutorial-content {
                background: #1a1d24;
                border: 1px solid #6366f1;
                border-radius: 0;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 0 40px rgba(99, 102, 241, 0.2);
            }

            .chip-designer-tutorial-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid #2a3a5a;
                background: rgba(0, 0, 0, 0.3);
            }

            .chip-designer-tutorial-signal {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .chip-designer-tutorial-signal .signal-dot {
                width: 10px;
                height: 10px;
                background: #4a9eff;
                border-radius: 50%;
            }

            .chip-designer-tutorial-signal .signal-text {
                font-size: 12px;
                font-weight: 600;
                color: #4a9eff;
                letter-spacing: 1px;
            }

            .chip-designer-tutorial-close {
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 0;
                background: rgba(255, 255, 255, 0.1);
                color: #888;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .chip-designer-tutorial-close:hover {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
            }

            .chip-designer-tutorial-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }

            .chip-designer-tutorial-step {
                color: #ccc;
            }

            .tutorial-step-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }

            .tutorial-step-icon {
                font-size: 28px;
            }

            .tutorial-step-header h3 {
                margin: 0;
                font-size: 20px;
                color: #fff;
            }

            .tutorial-step-content {
                font-size: 14px;
                line-height: 1.6;
            }

            .tutorial-step-content p {
                margin: 0 0 12px 0;
            }

            .tutorial-step-content ul, .tutorial-step-content ol {
                margin: 0 0 12px 0;
                padding-left: 24px;
            }

            .tutorial-step-content li {
                margin-bottom: 6px;
            }

            .tutorial-step-content strong {
                color: #4a9eff;
            }

            .tutorial-highlight {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 12px 16px;
                background: rgba(74, 158, 255, 0.1);
                border-left: 3px solid #4a9eff;
                border-radius: 0;
                margin: 12px 0;
            }

            .tutorial-highlight.success {
                background: rgba(34, 197, 94, 0.1);
                border-left-color: #22c55e;
            }

            .tutorial-highlight-icon {
                font-size: 20px;
                flex-shrink: 0;
            }

            .tutorial-highlight-text {
                font-size: 13px;
                color: #aaa;
            }

            .tutorial-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin: 12px 0;
            }

            .tutorial-control {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 0;
            }

            .control-key {
                padding: 4px 8px;
                background: #2a3a5a;
                border-radius: 0;
                font-size: 11px;
                font-weight: 600;
                color: #fff;
            }

            .control-desc {
                font-size: 12px;
                color: #888;
            }

            .tutorial-gates {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin: 12px 0;
            }

            .tutorial-gate {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 14px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 0;
                border-left: 3px solid #4ade80;
            }

            .tutorial-gate.nand {
                border-left-color: #f59e0b;
                background: rgba(245, 158, 11, 0.1);
            }

            .gate-symbol {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #1a1a2e;
                border: 2px solid #4ade80;
                border-radius: 0;
                font-size: 14px;
                font-weight: bold;
                color: #4ade80;
            }

            .tutorial-gate.nand .gate-symbol {
                border-color: #f59e0b;
                color: #f59e0b;
            }

            .gate-name {
                font-weight: 600;
                color: #fff;
                width: 50px;
            }

            .gate-desc {
                font-size: 12px;
                color: #888;
            }

            .tutorial-bonuses {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin: 12px 0;
            }

            .tutorial-bonus {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 14px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 0;
            }

            .bonus-icon {
                font-size: 20px;
            }

            .bonus-name {
                font-weight: 600;
                color: #4ade80;
                width: 120px;
            }

            .bonus-desc {
                font-size: 12px;
                color: #888;
            }

            .chip-designer-tutorial-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-top: 1px solid #2a3a5a;
                background: rgba(0, 0, 0, 0.3);
            }

            .chip-designer-tutorial-progress {
                font-size: 13px;
                color: #666;
            }

            .chip-designer-tutorial-progress span {
                color: #4a9eff;
                font-weight: 600;
            }

            .chip-designer-tutorial-nav {
                display: flex;
                gap: 10px;
            }

            .chip-designer-tutorial-btn {
                padding: 10px 20px;
                border: 2px solid #3a3a5a;
                border-radius: 0;
                background: transparent;
                color: #888;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .chip-designer-tutorial-btn:hover:not(:disabled) {
                border-color: #4a9eff;
                color: #4a9eff;
            }

            .chip-designer-tutorial-btn.primary {
                background: #4a9eff;
                border-color: #4a9eff;
                color: #000;
            }

            .chip-designer-tutorial-btn.primary:hover {
                background: #5aafff;
                border-color: #5aafff;
            }

            /* Toolbar sections (used inside floating toolbar) */
            .chip-designer-toolbar-section {
                display: flex;
                align-items: center;
                gap: 3px;
                padding: 0 6px;
                border-right: 1px solid #1e1e3a;
            }

            .chip-designer-toolbar-section:last-child {
                border-right: none;
            }

            .chip-designer-tool-btn {
                width: 34px;
                height: 34px;
                border: 1px solid transparent;
                border-radius: 0;
                background: #16162a;
                color: #667;
                cursor: pointer;
                transition: all 0.12s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
                position: relative;
            }

            .chip-designer-tool-btn:hover {
                background: #1e1e36;
                color: #ccd;
                border-color: #33335a;
            }

            .chip-designer-tool-btn.active {
                background: #4f46e5;
                border-color: #6366f1;
                color: #fff;
                box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
            }

            .chip-designer-tool-btn.disabled {
                opacity: 0.3;
                cursor: not-allowed;
                pointer-events: none;
            }

            .chip-designer-tool-btn[data-component="input"] { color: #4ade80; }
            .chip-designer-tool-btn[data-component="output"] { color: #f472b6; }
            .chip-designer-tool-btn[data-component="and"] { color: #60a5fa; }
            .chip-designer-tool-btn[data-component="or"] { color: #fbbf24; }
            .chip-designer-tool-btn[data-component="not"] { color: #a78bfa; }
            .chip-designer-tool-btn[data-component="xor"] { color: #2dd4bf; }
            .chip-designer-tool-btn[data-component="nand"] { color: #f87171; }

            .chip-designer-tool-btn[data-component]:hover,
            .chip-designer-tool-btn[data-component].active {
                color: #fff;
            }

            .chip-designer-tool-btn .tooltip {
                position: absolute;
                bottom: -28px;
                left: 50%;
                transform: translateX(-50%);
                background: #1a1a2e;
                border: 1px solid #3e3e52;
                padding: 4px 8px;
                border-radius: 0;
                font-size: 10px;
                color: #aaa;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.15s;
                z-index: 100;
            }

            .chip-designer-tool-btn:hover .tooltip {
                opacity: 1;
            }

            .chip-designer-action-btn {
                padding: 6px 14px;
                border: 1px solid #2a2a44;
                border-radius: 0;
                background: #16162a;
                color: #889;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.12s ease;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .chip-designer-action-btn:hover {
                background: #1e1e36;
                border-color: #4a9eff;
                color: #dde;
            }

            .chip-designer-action-btn.simulate {
                border-color: #1a6b3a;
                color: #4ade80;
            }

            .chip-designer-action-btn.simulate:hover {
                background: rgba(34, 197, 94, 0.1);
            }

            .chip-designer-action-btn.clear {
                border-color: #5c2222;
                color: #f87171;
            }

            .chip-designer-action-btn.clear:hover {
                background: rgba(239, 68, 68, 0.1);
            }

            /* Main Layout */
            .chip-designer-main {
                display: flex;
                flex: 1;
                overflow: hidden;
            }

            /* Sidebar */
            .chip-designer-sidebar {
                width: 320px;
                background: #0f0f1c;
                border-right: 1px solid #1e1e3a;
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
            }

            .chip-designer-tabs {
                display: flex;
                background: #0c0c16;
                border-bottom: 1px solid #1e1e3a;
            }

            .chip-designer-tab {
                flex: 1;
                padding: 10px 14px;
                background: transparent;
                border: none;
                color: #556;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
                border-bottom: 2px solid transparent;
            }

            .chip-designer-tab:hover {
                color: #889;
                background: rgba(255, 255, 255, 0.02);
            }

            .chip-designer-tab.active {
                color: #7aa8e8;
                border-bottom-color: #4a8ed8;
                background: rgba(74, 142, 216, 0.04);
            }

            .chip-designer-tab.challenges {
                color: #556;
            }

            .chip-designer-tab.challenges.active {
                color: #e87171;
                border-bottom-color: #d85555;
                background: rgba(216, 85, 85, 0.04);
            }

            .chip-designer-tab.advanced {
                color: #556;
            }

            .chip-designer-tab.advanced.active {
                color: #c084fc;
                border-bottom-color: #a855f7;
                background: rgba(168, 85, 247, 0.04);
            }

            /* Advanced tab sub-category nav */
            .cd-advanced-nav {
                display: flex;
                gap: 4px;
                margin-bottom: 12px;
            }

            .cd-advanced-cat-btn {
                flex: 1;
                padding: 6px 4px;
                background: #1a1a2e;
                border: 1px solid #2a2a4e;
                color: #667;
                font-size: 10px;
                cursor: pointer;
                transition: all 0.15s;
                border-radius: 0;
            }

            .cd-advanced-cat-btn:hover {
                color: #aab;
                background: #22223a;
            }

            .cd-advanced-cat-btn.active {
                color: #c084fc;
                border-color: #a855f7;
                background: rgba(168, 85, 247, 0.1);
            }

            .cd-advanced-cat-btn.locked {
                opacity: 0.4;
                cursor: not-allowed;
                color: #445;
            }

            .cd-advanced-cat-btn.locked:hover {
                color: #556;
                background: #1a1a2e;
            }

            .cd-cat-icon {
                display: block;
                font-size: 14px;
                margin-bottom: 2px;
            }

            /* Roulette panel styles */
            .cd-roulette-info {
                padding: 8px;
                background: #1a1a2e;
                border-radius: 4px;
                margin-bottom: 8px;
            }

            .cd-roulette-wins {
                color: #f59e0b;
                font-size: 12px;
                text-align: center;
            }

            .cd-roulette-badge {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 11px;
                transition: all 0.2s;
            }

            .chip-designer-tab-content {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
            }

            .chip-designer-tab-content::-webkit-scrollbar {
                width: 4px;
            }

            .chip-designer-tab-content::-webkit-scrollbar-track {
                background: transparent;
            }

            .chip-designer-tab-content::-webkit-scrollbar-thumb {
                background: #2a2a44;
                border-radius: 0;
            }

            .chip-designer-tab-panel {
                display: none;
            }

            .chip-designer-tab-panel.active {
                display: block;
            }

            /* Requirement List */
            .chip-designer-req-list {
                display: flex;
                flex-direction: column;
                gap: 2px;
                margin-bottom: 12px;
            }

            .chip-designer-tier-header {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 0 4px 0;
                margin-top: 6px;
            }

            .chip-designer-tier-header:first-child {
                margin-top: 0;
            }

            .chip-designer-tier-badge {
                font-size: 9px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .chip-designer-tier-stars {
                display: flex;
                gap: 1px;
            }

            .chip-designer-tier-star {
                font-size: 9px;
            }

            .chip-designer-tier-count {
                font-size: 10px;
                color: #445;
                margin-left: auto;
            }

            .chip-designer-req-item {
                padding: 7px 10px;
                background: rgba(255, 255, 255, 0.015);
                border: 1px solid #1e1e3a;
                border-radius: 0;
                cursor: pointer;
                transition: all 0.12s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .chip-designer-req-item:hover {
                border-color: #3a5a8a;
                background: rgba(74, 158, 255, 0.04);
            }

            .chip-designer-req-item.active {
                border-color: #4a8ed8;
                background: rgba(74, 142, 216, 0.08);
                box-shadow: inset 2px 0 0 #4a8ed8;
            }

            .chip-designer-req-item.challenge:hover {
                border-color: #8a3a3a;
                background: rgba(248, 113, 113, 0.04);
            }

            .chip-designer-req-item.challenge.active {
                border-color: #d85555;
                background: rgba(216, 85, 85, 0.08);
                box-shadow: inset 2px 0 0 #d85555;
            }

            .chip-designer-req-item.completed {
                border-color: #1a6b3a;
                background: rgba(34, 197, 94, 0.04);
            }

            .chip-designer-req-item.completed::before {
                content: '';
                display: inline-block;
                width: 12px;
                height: 12px;
                margin-right: 2px;
                flex-shrink: 0;
                background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2322c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>');
                background-size: contain;
                background-repeat: no-repeat;
            }

            .chip-designer-req-item.locked {
                opacity: 0.35;
                border-style: dashed;
            }

            .chip-designer-req-item.locked:hover {
                border-color: #333;
                background: rgba(255, 255, 255, 0.015);
            }

            .chip-designer-req-info {
                flex: 1;
                min-width: 0;
            }

            .chip-designer-req-name {
                font-size: 12px;
                font-weight: 500;
                color: #ccd;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .chip-designer-req-meta {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 2px;
            }

            .chip-designer-req-ios {
                font-size: 9px;
                color: #556;
            }

            .chip-designer-req-ios .in { color: #4ade80; }
            .chip-designer-req-ios .out { color: #f472b6; }

            .chip-designer-view-solution-btn {
                background: rgba(74, 142, 216, 0.15);
                border: 1px solid rgba(74, 142, 216, 0.3);
                border-radius: 0;
                color: #7aa8e8;
                font-size: 9px;
                padding: 1px 5px;
                cursor: pointer;
                transition: all 0.12s ease;
            }

            .chip-designer-view-solution-btn:hover {
                background: rgba(74, 142, 216, 0.25);
                border-color: rgba(74, 142, 216, 0.5);
            }

            .chip-designer-req-value {
                font-size: 11px;
                font-weight: 600;
                color: #d4a520;
                margin-left: auto;
                flex-shrink: 0;
            }

            /* Active Requirement Panel */
            .chip-designer-active-req {
                padding-top: 12px;
                border-top: 1px solid #1e1e3a;
                animation: cdSlideIn 0.15s ease-out;
            }

            @keyframes cdSlideIn {
                from { opacity: 0; transform: translateY(-6px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .chip-designer-active-req.hidden {
                display: none;
            }

            /* Firmware Slots UI */
            .cd-firmware-slots {
                border-top: 1px solid #1e1e3a;
                padding: 8px 0;
                margin-top: 8px;
            }
            .cd-slots-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 6px;
            }
            .cd-slots-title {
                font-size: 11px;
                font-weight: 600;
                color: #889;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .cd-slots-count {
                font-size: 12px;
                font-weight: 700;
            }
            .cd-slot-item {
                display: flex;
                align-items: center;
                padding: 4px 6px;
                margin-bottom: 2px;
                font-size: 11px;
                border-radius: 0;
                gap: 6px;
            }
            .cd-slot-item.equipped {
                background: #4ade8012;
                border-left: 2px solid #4ade80;
            }
            .cd-slot-item.available {
                background: #ffffff06;
                border-left: 2px solid #333;
            }
            .cd-slot-item.full {
                opacity: 0.4;
            }
            .cd-slot-name {
                color: #aab;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .cd-slot-value {
                color: #d4a520;
                font-weight: 600;
                flex-shrink: 0;
            }
            .cd-slot-btn {
                width: 18px;
                height: 18px;
                border: 1px solid #333;
                background: transparent;
                color: #888;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                padding: 0;
                line-height: 1;
            }
            .cd-slot-btn.equip:hover:not(:disabled) {
                border-color: #4ade80;
                color: #4ade80;
                background: #4ade8015;
            }
            .cd-slot-btn.unequip:hover {
                border-color: #ef4444;
                color: #ef4444;
                background: #ef444415;
            }
            .cd-slot-btn:disabled {
                cursor: not-allowed;
                opacity: 0.3;
            }
            .cd-medal-badge {
                margin-right: 4px;
                font-size: 12px;
            }

            .chip-designer-active-header {
                margin-bottom: 12px;
            }

            .chip-designer-active-header h3 {
                font-size: 14px;
                color: #dde;
                margin: 0 0 4px 0;
                font-weight: 600;
            }

            .chip-designer-active-header p {
                font-size: 11px;
                color: #667;
                margin: 0;
                font-style: italic;
            }

            /* Info Cards */
            .chip-designer-info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 12px;
            }

            .chip-designer-info-card {
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid #1e1e3a;
                border-radius: 0;
                padding: 10px;
            }

            .chip-designer-info-card.full {
                grid-column: span 2;
            }

            .chip-designer-info-card-label {
                font-size: 9px;
                color: #556;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }

            .chip-designer-info-card-value {
                font-size: 18px;
                font-weight: 700;
                color: #d4a520;
            }

            .chip-designer-info-card-value.challenge {
                color: #e87171;
            }

            .chip-designer-info-card-sub {
                font-size: 10px;
                color: #556;
                margin-top: 2px;
            }

            /* Difficulty Badge */
            .chip-designer-difficulty {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .chip-designer-difficulty-label {
                font-size: 11px;
                font-weight: 600;
            }

            .chip-designer-difficulty-hint {
                font-size: 10px;
                color: #556;
            }

            /* Production Chain */
            .chip-designer-production-chain {
                display: flex;
                align-items: center;
                gap: 3px;
                font-size: 14px;
            }

            .cd-chain-item {
                transition: transform 0.12s;
            }

            .cd-chain-item:hover {
                transform: scale(1.15);
            }

            .cd-chain-arrow {
                color: #334;
                font-size: 11px;
            }

            /* I/O Display */
            .chip-designer-io-display {
                display: flex;
                gap: 12px;
            }

            .chip-designer-io-group {
                flex: 1;
            }

            .chip-designer-io-label {
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }

            .chip-designer-io-label.inputs { color: #4ade80; }
            .chip-designer-io-label.outputs { color: #f472b6; }

            .chip-designer-io-pins {
                display: flex;
                flex-wrap: wrap;
                gap: 3px;
            }

            .chip-designer-io-pin {
                padding: 2px 6px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 0;
                font-size: 10px;
                font-family: 'Consolas', 'Monaco', monospace;
                color: #889;
            }

            .chip-designer-io-pin.input { border-left: 2px solid #4ade80; }
            .chip-designer-io-pin.output { border-left: 2px solid #f472b6; }

            /* Truth Table */
            .chip-designer-truth-table {
                margin-bottom: 12px;
            }

            .chip-designer-truth-table-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 6px;
            }

            .chip-designer-truth-table-title {
                font-size: 10px;
                color: #556;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .chip-designer-truth-table-count {
                font-size: 9px;
                color: #445;
            }

            .chip-designer-truth-table-grid {
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid #1e1e3a;
                border-radius: 0;
                overflow: hidden;
                max-height: 200px;
                overflow-y: auto;
            }

            .chip-designer-truth-table-row {
                display: flex;
                border-bottom: 1px solid #181830;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 10px;
            }

            .chip-designer-truth-table-row:last-child {
                border-bottom: none;
            }

            .chip-designer-truth-table-row.header {
                background: rgba(255, 255, 255, 0.02);
                font-weight: 600;
                color: #778;
                position: sticky;
                top: 0;
            }

            .chip-designer-truth-table-cell {
                flex: 1;
                padding: 4px 6px;
                text-align: center;
                min-width: 26px;
            }

            .chip-designer-truth-table-cell.input {
                color: #4ade80;
                background: rgba(74, 222, 128, 0.02);
            }

            .chip-designer-truth-table-cell.output {
                color: #f472b6;
                background: rgba(244, 114, 182, 0.02);
            }

            .chip-designer-truth-table-cell.separator {
                flex: 0 0 1px;
                padding: 0;
                background: #1e1e3a;
            }

            .chip-designer-truth-table-row.pass {
                background: rgba(34, 197, 94, 0.08);
            }

            .chip-designer-truth-table-row.fail {
                background: rgba(239, 68, 68, 0.08);
            }

            .chip-designer-truth-table-row .status-icon {
                flex: 0 0 22px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .chip-designer-truth-table-row.pass .status-icon { color: #22c55e; }
            .chip-designer-truth-table-row.fail .status-icon { color: #ef4444; }

            /* Validate Button */
            .chip-designer-validate-btn {
                width: 100%;
                padding: 10px;
                border: none;
                border-radius: 0;
                background: #4f46e5;
                color: #fff;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: all 0.15s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .chip-designer-validate-btn:hover {
                background: #5b52f0;
                box-shadow: 0 2px 12px rgba(99, 102, 241, 0.3);
            }

            .chip-designer-validate-btn.challenge {
                background: #c22525;
            }

            .chip-designer-validate-btn.challenge:hover {
                background: #dc3030;
                box-shadow: 0 2px 12px rgba(220, 48, 48, 0.3);
            }

            .chip-designer-load-btn {
                width: 100%;
                padding: 8px;
                border: 1px solid #334155;
                border-radius: 0;
                background: #1e293b;
                color: #94a3b8;
                cursor: pointer;
                font-size: 11px;
                font-weight: 500;
                transition: all 0.15s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .chip-designer-load-btn:hover {
                background: #334155;
                color: #e2e8f0;
                border-color: #475569;
            }

            .chip-designer-validation-result {
                margin-top: 8px;
                padding: 8px 10px;
                border-radius: 0;
                font-size: 11px;
                text-align: center;
                font-weight: 500;
                animation: cdSlideIn 0.15s ease-out;
            }

            .chip-designer-validation-result.success {
                background: rgba(34, 197, 94, 0.1);
                border: 1px solid #1a6b3a;
                color: #4ade80;
            }

            .chip-designer-validation-result.failure {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid #7a2222;
                color: #f8a0a0;
            }

            .chip-designer-validation-result:empty {
                display: none;
            }

            /* Locked Notice */
            .chip-designer-locked-notice {
                background: rgba(239, 68, 68, 0.06);
                border: 1px solid #3a1e1e;
                border-radius: 0;
                padding: 10px;
                margin-bottom: 10px;
            }

            .chip-designer-locked-notice-header {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                font-weight: 600;
                color: #e87171;
                margin-bottom: 4px;
            }

            .chip-designer-locked-notice-text {
                font-size: 10px;
                color: #667;
            }

            /* Constraint Box */
            .chip-designer-constraint {
                background: rgba(248, 113, 113, 0.06);
                border: 1px solid #3a1e1e;
                border-radius: 0;
                padding: 10px;
                margin-bottom: 10px;
            }

            .chip-designer-constraint-header {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                font-weight: 600;
                color: #e87171;
                margin-bottom: 3px;
            }

            .chip-designer-constraint-text {
                font-size: 10px;
                color: #667;
            }

            /* Bonuses Panel */
            .chip-designer-bonuses {
                background: rgba(34, 197, 94, 0.05);
                border: 1px solid #143a24;
                border-radius: 0;
                padding: 10px;
                margin-bottom: 10px;
            }

            .chip-designer-bonuses-header {
                font-size: 10px;
                color: #22c55e;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .chip-designer-bonuses-list {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }

            .chip-designer-bonus-item {
                font-size: 11px;
                color: #4ade80;
                padding: 5px 7px;
                background: rgba(74, 222, 128, 0.03);
                border-radius: 0;
                margin-bottom: 2px;
            }

            .chip-designer-bonus-item:last-child {
                margin-bottom: 0;
            }

            .chip-designer-bonus-item-value {
                font-weight: 600;
            }

            .chip-designer-bonus-item-desc {
                font-size: 9px;
                color: #556;
                margin-top: 1px;
            }

            /* Canvas Container */
            .chip-designer-canvas-container {
                flex: 1;
                overflow: hidden;
                position: relative;
                background: #08080f;
            }

            .chip-designer-canvas {
                display: block;
                cursor: crosshair;
            }

            /* Draggable floating windows */
            .cd-float-window {
                position: absolute;
                background: rgba(12, 12, 22, 0.96);
                border: 1px solid #1e1e3a;
                z-index: 100;
                box-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
                display: none;
            }

            .cd-float-window.visible {
                display: flex;
                flex-direction: column;
                animation: cdFloatIn 0.15s ease-out;
            }

            .cd-float-window-titlebar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 4px 8px;
                background: rgba(255, 255, 255, 0.03);
                border-bottom: 1px solid #1e1e3a;
                cursor: grab;
                user-select: none;
            }

            .cd-float-window-titlebar:active {
                cursor: grabbing;
            }

            .cd-float-window-title {
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #556;
                font-weight: 600;
            }

            .cd-float-window-body {
                padding: 6px;
            }

            /* Floating toolbar */
            .cd-float-toolbar {
                top: 8px;
                left: 8px;
            }

            .cd-float-toolbar .cd-float-window-body {
                display: flex;
                flex-direction: column;
                gap: 0;
                padding: 4px;
            }

            .cd-float-toolbar .chip-designer-toolbar-section {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 3px;
                padding: 4px 6px;
                border-bottom: 1px solid #1e1e3a;
            }

            .cd-float-toolbar .chip-designer-toolbar-section:last-child {
                border-bottom: none;
            }


            /* Floating truth table */
            .cd-float-truth {
                bottom: 8px;
                right: 8px;
                max-height: 300px;
            }

            .cd-float-truth .cd-float-window-body {
                overflow: auto;
                max-height: 250px;
                padding: 0;
            }

            .cd-float-truth .cd-float-window-body::-webkit-scrollbar {
                width: 3px;
                height: 3px;
            }

            .cd-float-truth .cd-float-window-body::-webkit-scrollbar-track {
                background: transparent;
            }

            .cd-float-truth .cd-float-window-body::-webkit-scrollbar-thumb {
                background: #2a2a44;
            }

            /* Right Info Panel */
            .chip-designer-floating-panel {
                position: absolute;
                top: 8px;
                right: 8px;
                bottom: 8px;
                width: 260px;
                background: rgba(12, 12, 22, 0.96);
                border: 1px solid #1e1e3a;
                border-radius: 0;
                padding: 12px;
                z-index: 100;
                display: none;
                box-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
                overflow-y: auto;
            }

            .chip-designer-floating-panel.visible {
                display: flex;
                flex-direction: column;
                animation: cdFloatIn 0.15s ease-out;
            }

            @keyframes cdFloatIn {
                from { opacity: 0; transform: translateX(6px); }
                to { opacity: 1; transform: translateX(0); }
            }

            .chip-designer-floating-panel::-webkit-scrollbar {
                width: 3px;
            }

            .chip-designer-floating-panel::-webkit-scrollbar-track {
                background: transparent;
            }

            .chip-designer-floating-panel::-webkit-scrollbar-thumb {
                background: #2a2a44;
                border-radius: 0;
            }

            .chip-designer-floating-header {
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #1e1e3a;
            }

            .chip-designer-floating-title {
                font-size: 13px;
                font-weight: 600;
                color: #dde;
                margin: 0 0 3px 0;
            }

            .chip-designer-floating-subtitle {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .chip-designer-floating-value {
                font-size: 12px;
                font-weight: 700;
                color: #d4a520;
            }

            .chip-designer-floating-difficulty {
                font-size: 10px;
                font-weight: 600;
                padding: 1px 6px;
                border-radius: 0;
            }

            .chip-designer-floating-desc {
                font-size: 10px;
                color: #667;
                font-style: italic;
                margin-bottom: 10px;
                line-height: 1.4;
            }

            .chip-designer-floating-section {
                margin-bottom: 10px;
            }

            .chip-designer-floating-section-title {
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #556;
                margin-bottom: 6px;
                font-weight: 600;
            }

            .chip-designer-floating-io {
                display: flex;
                gap: 12px;
            }

            .chip-designer-floating-io-group {
                flex: 1;
            }

            .chip-designer-floating-io-label {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
                margin-bottom: 6px;
                display: block;
            }

            .chip-designer-floating-io-label.inputs { color: #4ade80; }
            .chip-designer-floating-io-label.outputs { color: #f472b6; }

            .chip-designer-floating-io-pins {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .chip-designer-floating-io-pin {
                padding: 3px 6px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 0;
                font-size: 10px;
                font-family: 'Consolas', 'Monaco', monospace;
                font-weight: 600;
                color: #aab;
            }

            .chip-designer-floating-io-pin.input {
                border-left: 2px solid #4ade80;
                color: #4ade80;
            }

            .chip-designer-floating-io-pin.output {
                border-left: 2px solid #f472b6;
                color: #f472b6;
            }

            .chip-designer-floating-chain {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 13px;
                padding: 6px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 0;
            }

            .chip-designer-floating-hint {
                font-size: 10px;
                color: #556;
                padding: 6px;
                background: rgba(74, 142, 216, 0.06);
                border: 1px solid rgba(74, 142, 216, 0.15);
                border-radius: 0;
                text-align: center;
            }

            .chip-designer-floating-hint strong {
                color: #7aa8e8;
            }

            .cd-truth-table {
                border-collapse: collapse;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 10px;
                width: 100%;
            }

            .cd-truth-table th,
            .cd-truth-table td {
                padding: 3px 5px;
                text-align: center;
                white-space: nowrap;
            }

            .cd-truth-table thead th {
                background: rgba(255, 255, 255, 0.03);
                font-weight: 600;
                color: #778;
                position: sticky;
                top: 0;
                border-bottom: 1px solid #1e1e3a;
            }

            .cd-truth-table tbody tr {
                border-bottom: 1px solid #181830;
            }

            .cd-truth-table tbody tr:last-child {
                border-bottom: none;
            }

            .cd-truth-table .tt-in {
                color: #4ade80;
            }

            .cd-truth-table .tt-out {
                color: #f472b6;
            }

            .cd-truth-table .tt-sep {
                width: 1px;
                padding: 0;
                background: #1e1e3a;
            }

            .cd-truth-table tbody tr.tt-active {
                outline: 1px solid #4a8ed8;
                outline-offset: -1px;
            }

            .cd-truth-table tbody tr.tt-pass {
                background: rgba(34, 197, 94, 0.12);
            }

            .cd-truth-table tbody tr.tt-fail {
                background: rgba(239, 68, 68, 0.12);
            }

            .chip-designer-floating-constraint {
                margin-top: auto;
                padding: 8px;
                background: rgba(248, 113, 113, 0.06);
                border: 1px solid rgba(248, 113, 113, 0.2);
                border-radius: 0;
                font-size: 10px;
                color: #e87171;
                text-align: center;
                font-weight: 600;
            }

            .chip-designer-floating-bonus-box {
                padding: 8px;
                background: rgba(74, 222, 128, 0.06);
                border: 1px solid rgba(74, 222, 128, 0.2);
                border-radius: 0;
            }

            .chip-designer-floating-bonus-value {
                font-size: 12px;
                font-weight: 700;
                color: #4ade80;
                margin-bottom: 3px;
            }

            .chip-designer-floating-bonus-desc {
                font-size: 10px;
                color: #667;
                line-height: 1.4;
            }

            /* Firmware Effects */
            .chip-designer-floating-effects {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .chip-designer-floating-effect {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 5px 8px;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid #1e1e3a;
            }

            .chip-designer-floating-effect-icon {
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
            }

            .chip-designer-floating-effect-text {
                flex: 1;
                font-size: 10px;
                color: #aab;
            }

            .chip-designer-floating-effect-value {
                font-size: 11px;
                font-weight: 600;
            }

            .chip-designer-floating-effect.research .chip-designer-floating-effect-icon { color: #60a5fa; }
            .chip-designer-floating-effect.research .chip-designer-floating-effect-value { color: #60a5fa; }

            .chip-designer-floating-effect.blackmarket .chip-designer-floating-effect-icon { color: #a855f7; }
            .chip-designer-floating-effect.blackmarket .chip-designer-floating-effect-value { color: #a855f7; }

            .chip-designer-floating-effect.prestige .chip-designer-floating-effect-icon { color: #fbbf24; }
            .chip-designer-floating-effect.prestige .chip-designer-floating-effect-value { color: #fbbf24; }

            .chip-designer-floating-effect.production .chip-designer-floating-effect-icon { color: #4ade80; }
            .chip-designer-floating-effect.production .chip-designer-floating-effect-value { color: #4ade80; }

            /* Hint overlay */
            .chip-designer-hint {
                position: absolute;
                bottom: 14px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(8, 8, 15, 0.9);
                border: 1px solid #1e1e3a;
                border-radius: 0;
                padding: 6px 14px;
                font-size: 10px;
                color: #667;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.25s;
            }

            .chip-designer-hint.visible {
                opacity: 1;
            }

            .chip-designer-hint kbd {
                background: #1a1a30;
                padding: 1px 5px;
                border-radius: 0;
                font-family: monospace;
                margin: 0 2px;
                color: #889;
            }

            /* Status Bar */
            .chip-designer-status-bar {
                display: flex;
                gap: 20px;
                padding: 5px 16px;
                background: #0a0a14;
                border-top: 1px solid #1e1e3a;
                font-size: 10px;
                color: #445;
            }

            .chip-designer-status-bar span {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .chip-designer-status-bar .value {
                color: #778;
                font-family: 'Consolas', 'Monaco', monospace;
            }

            .chip-designer-status-bar .challenge-mode {
                color: #e87171;
                font-weight: 600;
                margin-left: auto;
            }

            /* Component count badge */
            .chip-designer-component-count {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .chip-designer-count-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .chip-designer-count-item .icon {
                font-size: 14px;
            }

            /* Custom confirmation dialog */
            .chip-designer-confirm-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10002;
                animation: cdFadeIn 0.12s ease-out;
            }

            .chip-designer-confirm {
                background: #13132a;
                border: 1px solid #ef4444;
                border-radius: 0;
                padding: 20px;
                max-width: 360px;
                text-align: center;
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
            }

            .chip-designer-confirm-icon {
                font-size: 36px;
                margin-bottom: 12px;
            }

            .chip-designer-confirm-title {
                font-size: 15px;
                font-weight: 600;
                color: #dde;
                margin-bottom: 6px;
            }

            .chip-designer-confirm-message {
                font-size: 12px;
                color: #667;
                margin-bottom: 18px;
                line-height: 1.5;
            }

            .chip-designer-confirm-buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
            }

            .chip-designer-confirm-btn {
                padding: 8px 20px;
                border-radius: 0;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
                border: 1px solid;
            }

            .chip-designer-confirm-btn.cancel {
                background: transparent;
                border-color: #2a2a44;
                color: #778;
            }

            .chip-designer-confirm-btn.cancel:hover {
                border-color: #4a8ed8;
                color: #7aa8e8;
            }

            .chip-designer-confirm-btn.confirm {
                background: #c22525;
                border-color: #ef4444;
                color: #fff;
            }

            .chip-designer-confirm-btn.confirm:hover {
                background: #dc3030;
                box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
            }

            /* Blueprint panel (floating window) */
            .cd-float-blueprints {
                position: absolute;
                bottom: 40px;
                left: 10px;
                width: 240px;
            }
            .cd-float-blueprints .cd-float-window-body {
                padding: 6px;
                max-height: 260px;
                overflow-y: auto;
            }
            .cd-blueprint-count {
                font-size: 10px;
                color: #888;
                margin-left: auto;
            }
            .cd-blueprint-save-row {
                display: flex;
                gap: 4px;
                margin-bottom: 6px;
            }
            .cd-blueprint-save-row input {
                flex: 1;
                background: #1a1a2e;
                border: 1px solid #2a2a44;
                color: #dde;
                padding: 4px 6px;
                font-size: 11px;
                outline: none;
                font-family: inherit;
            }
            .cd-blueprint-save-row input:focus {
                border-color: #4a9eff;
            }
            .cd-blueprint-save-btn {
                padding: 4px 10px;
                background: #1e3a5f;
                border: 1px solid #2563eb;
                color: #93c5fd;
                font-size: 11px;
                cursor: pointer;
                white-space: nowrap;
                font-family: inherit;
            }
            .cd-blueprint-save-btn:hover:not(:disabled) {
                background: #2563eb;
                color: #fff;
            }
            .cd-blueprint-save-btn:disabled {
                opacity: 0.4;
                cursor: default;
            }
            .cd-blueprint-list-empty {
                color: #556;
                font-size: 11px;
                text-align: center;
                padding: 8px;
            }
            .cd-blueprint-entry {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 6px;
                background: #151528;
                border: 1px solid #1e1e3a;
                margin-bottom: 3px;
            }
            .cd-blueprint-entry:hover {
                border-color: #2a2a55;
            }
            .cd-blueprint-entry-name {
                flex: 1;
                font-size: 11px;
                color: #ccd;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .cd-blueprint-entry-gates {
                font-size: 10px;
                color: #60a5fa;
                padding: 1px 4px;
                background: rgba(96,165,250,0.1);
            }
            .cd-blueprint-entry-btn {
                padding: 2px 6px;
                background: transparent;
                border: 1px solid #2a2a44;
                color: #889;
                font-size: 10px;
                cursor: pointer;
                font-family: inherit;
            }
            .cd-blueprint-entry-btn:hover {
                border-color: #4a9eff;
                color: #4a9eff;
            }
            .cd-blueprint-entry-btn.delete:hover {
                border-color: #ef4444;
                color: #ef4444;
            }
            .cd-blueprint-error {
                color: #ef4444;
                font-size: 10px;
                padding: 2px 0;
                display: none;
            }
        `;
        document.head.appendChild(style);
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'chip-designer-modal';
        // ARIA attributes for accessibility
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.setAttribute('aria-labelledby', 'chip-designer-title');
        this.modal.innerHTML = `
            <div class="chip-designer-header">
                <div class="chip-designer-logo" aria-hidden="true">
                    <div class="chip-designer-logo-icon">${window.Icons?.get('power', 24) || ''}</div>
                    <span>${t('context.chipDesigner.modal.logoCad')}</span>
                </div>
                <div class="chip-designer-header-title">
                    <h1 id="chip-designer-title">${t('context.chipDesigner.modal.circuitDesignMode')}</h1>
                    <h2 id="cd-header-challenge">${t('context.chipDesigner.modal.selectDesignPrompt')}</h2>
                </div>
                <button class="chip-designer-help-btn" id="cd-help-btn" aria-label="Show tutorial help">${t('context.chipDesigner.modal.help')}</button>
            </div>

            <!-- Tutorial Overlay -->
            <div class="chip-designer-tutorial" id="cd-tutorial">
                <div class="chip-designer-tutorial-content">
                    <div class="chip-designer-tutorial-header">
                        <div class="chip-designer-tutorial-signal">
                            <span class="signal-dot"></span>
                            <span class="signal-text">${t('context.chipDesigner.modal.tutorialSignal')}</span>
                        </div>
                        <button class="chip-designer-tutorial-close" id="cd-tutorial-close">✕</button>
                    </div>
                    <div class="chip-designer-tutorial-body" id="cd-tutorial-body">
                        <!-- Tutorial content will be inserted here -->
                    </div>
                    <div class="chip-designer-tutorial-footer">
                        <div class="chip-designer-tutorial-progress">
                            <span id="cd-tutorial-step">1</span> / <span id="cd-tutorial-total">6</span>
                        </div>
                        <div class="chip-designer-tutorial-nav">
                            <button class="chip-designer-tutorial-btn" id="cd-tutorial-prev">${window.Icons?.get('arrowLeft', 12) || ''} ${t('context.chipDesigner.modal.tutorialPrev')}</button>
                            <button class="chip-designer-tutorial-btn primary" id="cd-tutorial-next">${t('context.chipDesigner.modal.tutorialNext')} ${window.Icons?.get('arrowRight', 12) || ''}</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="chip-designer-main">
                <div class="chip-designer-sidebar" role="region" aria-label="Design selection">
                    <div class="chip-designer-tabs" role="tablist" aria-label="Design categories">
                        <button class="chip-designer-tab active" data-tab="requirements" role="tab" aria-selected="true" aria-controls="cd-panel-requirements">${window.Icons ? window.Icons.get('clipboard', 14) : ''} ${t('context.chipDesigner.modal.tabDesigns')}</button>
                        <button class="chip-designer-tab challenges" data-tab="challenges" role="tab" aria-selected="false" aria-controls="cd-panel-challenges">${window.Icons ? window.Icons.get('trophy', 14) : ''} ${t('context.chipDesigner.modal.tabNandChallenges')}</button>
                        <button class="chip-designer-tab advanced" data-tab="advanced" role="tab" aria-selected="false" aria-controls="cd-panel-advanced" style="display: ${window.AdvancedTab && window.AdvancedTab.isAnyUnlocked() ? 'flex' : 'none'};">${window.Icons ? window.Icons.get('star', 14) : ''} Advanced</button>
                    </div>
                    <div class="chip-designer-tab-content">
                        <div class="chip-designer-tab-panel active" id="cd-panel-requirements">
                            <div class="chip-designer-req-list" id="cd-req-list"></div>
                            <div class="chip-designer-active-req hidden" id="cd-active-req"></div>
                        </div>
                        <div class="chip-designer-tab-panel" id="cd-panel-challenges">
                            <div class="chip-designer-req-list" id="cd-challenge-list"></div>
                            <div class="chip-designer-active-req hidden" id="cd-active-challenge"></div>
                        </div>
                        <div class="chip-designer-tab-panel" id="cd-panel-advanced"></div>
                    </div>
                </div>

                <div class="chip-designer-canvas-container">
                    <canvas class="chip-designer-canvas" id="cd-canvas"></canvas>

                    <!-- Floating toolbar -->
                    <div class="cd-float-window cd-float-toolbar visible" id="cd-float-toolbar">
                        <div class="cd-float-window-titlebar">
                            <span class="cd-float-window-title">${t('context.chipDesigner.modal.toolbarTools')}</span>
                        </div>
                        <div class="cd-float-window-body">
                            <div class="chip-designer-toolbar-section" role="group" aria-label="Selection tools">
                                <button class="chip-designer-tool-btn active" data-tool="select" title="Select (V)" aria-label="Select tool" aria-pressed="true">
                                    <span aria-hidden="true">⎋</span>
                                    <span class="tooltip">${t('context.chipDesigner.modal.toolSelect')}</span>
                                </button>
                                <button class="chip-designer-tool-btn" data-tool="wire" title="Wire (W)" aria-label="Wire tool" aria-pressed="false">
                                    <span aria-hidden="true">${window.Icons?.get('power', 14) || ''}</span>
                                    <span class="tooltip">${t('context.chipDesigner.modal.toolWire')}</span>
                                </button>
                                <button class="chip-designer-tool-btn" data-tool="delete" title="Delete (X)" aria-label="Delete tool" aria-pressed="false">
                                    <span aria-hidden="true">✕</span>
                                    <span class="tooltip">${t('context.chipDesigner.modal.toolDelete')}</span>
                                </button>
                                <button class="chip-designer-tool-btn" data-tool="move" title="Move (M)" aria-label="Move tool" aria-pressed="false">
                                    <span aria-hidden="true">${window.Icons?.get('move', 14) || ''}</span>
                                    <span class="tooltip">${t('context.chipDesigner.modal.toolMove')}</span>
                                </button>
                            </div>
                            <div class="chip-designer-toolbar-section" id="cd-components-section" role="group" aria-label="Component placement">
                                <button class="chip-designer-tool-btn" data-tool="component" data-component="input" title="Input Pin" aria-label="Place input pin" aria-pressed="false">
                                    <span aria-hidden="true">${window.Icons?.get('arrowRight', 14) || ''}</span>
                                    <span class="tooltip">${t('context.chipDesigner.modal.componentInput')}</span>
                                </button>
                                <button class="chip-designer-tool-btn" data-tool="component" data-component="output" title="Output Pin" aria-label="Place output pin" aria-pressed="false">
                                    <span aria-hidden="true">${window.Icons?.get('arrowLeft', 14) || ''}</span>
                                    <span class="tooltip">${t('context.chipDesigner.modal.componentOutput')}</span>
                                </button>
                                <button class="chip-designer-tool-btn component-gate" data-tool="component" data-component="and" title="AND Gate" aria-label="Place AND gate" aria-pressed="false">
                                    <span aria-hidden="true">&amp;</span>
                                    <span class="tooltip">AND</span>
                                </button>
                                <button class="chip-designer-tool-btn component-nand" data-tool="component" data-component="nand" title="NAND Gate" aria-label="Place NAND gate" aria-pressed="false">
                                    <span aria-hidden="true">⊼</span>
                                    <span class="tooltip">NAND</span>
                                </button>
                                <button class="chip-designer-tool-btn component-gate" data-tool="component" data-component="or" title="OR Gate" aria-label="Place OR gate" aria-pressed="false">
                                    <span aria-hidden="true">≥1</span>
                                    <span class="tooltip">OR</span>
                                </button>
                                <button class="chip-designer-tool-btn component-nor" data-tool="component" data-component="nor" title="NOR Gate" aria-label="Place NOR gate" aria-pressed="false" style="display:none;">
                                    <span aria-hidden="true">⊽</span>
                                    <span class="tooltip">NOR</span>
                                </button>
                                <button class="chip-designer-tool-btn component-gate" data-tool="component" data-component="not" title="NOT Gate" aria-label="Place NOT gate" aria-pressed="false">
                                    <span aria-hidden="true">¬</span>
                                    <span class="tooltip">NOT</span>
                                </button>
                                <button class="chip-designer-tool-btn component-gate" data-tool="component" data-component="xor" title="XOR Gate" aria-label="Place XOR gate" aria-pressed="false">
                                    <span aria-hidden="true">=1</span>
                                    <span class="tooltip">XOR</span>
                                </button>
                                <button class="chip-designer-tool-btn component-xnor" data-tool="component" data-component="xnor" title="XNOR Gate" aria-label="Place XNOR gate" aria-pressed="false" style="display:none;">
                                    <span aria-hidden="true">⊙</span>
                                    <span class="tooltip">XNOR</span>
                                </button>
                                <button class="chip-designer-tool-btn component-threshold" data-tool="component" data-component="threshold" title="Threshold Gate" aria-label="Place Threshold gate" aria-pressed="false" style="display:none;">
                                    <span aria-hidden="true">⌐</span>
                                    <span class="tooltip">THR</span>
                                </button>
                                <button class="chip-designer-tool-btn component-average" data-tool="component" data-component="average" title="Average Gate" aria-label="Place Average gate" aria-pressed="false" style="display:none;">
                                    <span aria-hidden="true">Σ</span>
                                    <span class="tooltip">AVG</span>
                                </button>
                            </div>
                            <div class="chip-designer-toolbar-section" role="group" aria-label="Circuit actions">
                                <button class="chip-designer-action-btn clear" id="cd-clear-btn" aria-label="Clear all components">${t('context.chipDesigner.modal.actionClear')}</button>
                                <button class="chip-designer-action-btn simulate" id="cd-simulate-btn" aria-label="Start circuit simulation">${window.Icons?.get('play', 14) || ''} ${t('context.chipDesigner.modal.actionSimulate')}</button>
                            </div>
                            <div class="chip-designer-toolbar-section" role="group" aria-label="View controls">
                                <button class="chip-designer-action-btn" id="cd-reset-view-btn" title="Reset View (Home)" aria-label="Reset view">⌂ ${t('context.chipDesigner.modal.actionReset')}</button>
                                <span id="cd-zoom-indicator" style="color:#888;font-size:11px;padding:4px 8px;">100%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Floating blueprint panel -->
                    <div class="cd-float-window cd-float-blueprints" id="cd-float-blueprints" style="display:none">
                        <div class="cd-float-window-titlebar">
                            <span class="cd-float-window-title">${t('context.chipDesigner.modal.blueprints')}</span>
                            <span class="cd-blueprint-count" id="cd-blueprint-count">0/0</span>
                        </div>
                        <div class="cd-float-window-body">
                            <div class="cd-blueprint-save-row">
                                <input id="cd-blueprint-name" type="text" placeholder="${t('context.chipDesigner.modal.blueprintNamePlaceholder')}" maxlength="20">
                                <button class="cd-blueprint-save-btn" id="cd-blueprint-save-btn" disabled>${t('context.chipDesigner.modal.blueprintSave')}</button>
                            </div>
                            <div class="cd-blueprint-error" id="cd-blueprint-error"></div>
                            <div id="cd-blueprint-list">
                                <div class="cd-blueprint-list-empty">${t('context.chipDesigner.modal.blueprintEmpty')}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Floating info panel -->
                    <div class="chip-designer-floating-panel" id="cd-floating-panel">
                        <div class="chip-designer-floating-header">
                            <h3 class="chip-designer-floating-title" id="cd-floating-title">${t('context.chipDesigner.modal.selectDesign')}</h3>
                            <div class="chip-designer-floating-subtitle">
                                <span class="chip-designer-floating-value" id="cd-floating-value"></span>
                                <span class="chip-designer-floating-difficulty" id="cd-floating-difficulty"></span>
                            </div>
                        </div>
                        <div class="chip-designer-floating-desc" id="cd-floating-desc"></div>

                        <div class="chip-designer-floating-section">
                            <div class="chip-designer-floating-section-title">${t('context.chipDesigner.modal.inputsOutputs')}</div>
                            <div class="chip-designer-floating-io">
                                <div class="chip-designer-floating-io-group">
                                    <span class="chip-designer-floating-io-label inputs">${t('context.chipDesigner.modal.inputs')}</span>
                                    <div class="chip-designer-floating-io-pins" id="cd-floating-inputs"></div>
                                </div>
                                <div class="chip-designer-floating-io-group">
                                    <span class="chip-designer-floating-io-label outputs">${t('context.chipDesigner.modal.outputs')}</span>
                                    <div class="chip-designer-floating-io-pins" id="cd-floating-outputs"></div>
                                </div>
                            </div>
                        </div>

                        <div class="chip-designer-floating-section" id="cd-floating-bonus-section" style="display:none;">
                            <div class="chip-designer-floating-section-title">${t('context.chipDesigner.modal.reward')}</div>
                            <div class="chip-designer-floating-bonus-box" id="cd-floating-bonus"></div>
                        </div>

                        <div class="chip-designer-floating-section" id="cd-floating-hint-section">
                            <div class="chip-designer-floating-hint" id="cd-floating-hint"></div>
                        </div>

                        <div class="chip-designer-floating-constraint" id="cd-floating-constraint" style="display:none;"></div>

                        <div class="chip-designer-floating-section" id="cd-floating-load-section" style="display:none;">
                            <button class="chip-designer-load-btn" id="cd-floating-load-btn">${window.Icons?.get('download', 14) || ''} Load Solution</button>
                        </div>
                        <div class="chip-designer-floating-section" id="cd-floating-validate-section">
                            <button class="chip-designer-validate-btn" id="cd-floating-validate-btn">${window.Icons?.get('power', 14) || ''} ${t('context.chipDesigner.modal.validateCircuit')}</button>
                            <div class="chip-designer-validation-result" id="cd-floating-validation-result"></div>
                        </div>
                    </div>

                    <!-- Floating truth table -->
                    <div class="cd-float-window cd-float-truth" id="cd-float-truth">
                        <div class="cd-float-window-titlebar">
                            <span class="cd-float-window-title">${t('context.chipDesigner.modal.truthTable')}</span>
                        </div>
                        <div class="cd-float-window-body" id="cd-floating-truth"></div>
                    </div>

                    <div class="chip-designer-hint" id="cd-hint">
                        <kbd>${t('context.chipDesigner.modal.hintRightClick')}</kbd> ${t('context.chipDesigner.modal.hintDelete')} • <kbd>${t('context.chipDesigner.modal.hintClick')}</kbd> ${t('context.chipDesigner.modal.hintToggle')} • <kbd>ESC</kbd> ${t('context.chipDesigner.modal.hintEsc')}
                    </div>
                </div>
            </div>

            <div class="chip-designer-status-bar">
                <span>${t('context.chipDesigner.modal.statusTool')} <span class="value" id="cd-status-tool">${t('context.chipDesigner.modal.statusToolSelect')}</span></span>
                <span>${t('context.chipDesigner.modal.statusPosition')} <span class="value" id="cd-status-pos">0, 0</span></span>
                <span class="chip-designer-component-count">
                    <span class="chip-designer-count-item"><span class="icon" style="color:#4ade80">●</span> <span class="value" id="cd-count-inputs">0</span></span>
                    <span class="chip-designer-count-item"><span class="icon" style="color:#f472b6">●</span> <span class="value" id="cd-count-outputs">0</span></span>
                    <span class="chip-designer-count-item"><span class="icon" style="color:#60a5fa">◆</span> <span class="value" id="cd-count-gates">0</span></span>
                    <span class="chip-designer-count-item"><span class="icon" style="color:#fbbf24">―</span> <span class="value" id="cd-count-wires">0</span></span>
                </span>
                <span id="cd-status-mode"></span>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tab buttons
        const tabBtns = this.modal.querySelectorAll('.chip-designer-tab');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Tool buttons
        const toolButtons = this.modal.querySelectorAll('.chip-designer-tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('disabled')) return;

                toolButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');

                const tool = btn.dataset.tool;
                const component = btn.dataset.component;
                if (this.designer) {
                    this.designer.setTool(tool, component);
                    this.updateStatusBar();
                }
            });
        });

        // View Solution buttons (using event delegation)
        this.modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('chip-designer-view-solution-btn')) {
                e.stopPropagation();
                const reqId = e.target.dataset.reqId;
                const challengeId = e.target.dataset.challengeId;
                const id = reqId || challengeId;
                if (id) {
                    // Find and select the requirement/challenge first
                    if (reqId && window.ChipRequirements) {
                        const req = window.ChipRequirements.find(r => r.id === reqId);
                        if (req) {
                            this.selectRequirement(req);
                            this.restoreSolution(reqId);
                        }
                    } else if (challengeId && window.NandChallenges) {
                        const challenge = window.NandChallenges.find(c => c.id === challengeId);
                        if (challenge) {
                            this.selectChallenge(challenge);
                            this.restoreSolution(challengeId);
                        }
                    }
                }
            }
        });

        // Clear button - uses custom confirmation dialog instead of browser confirm()
        const clearBtn = this.modal.querySelector('#cd-clear-btn');
        clearBtn.addEventListener('click', () => {
            this.showClearConfirmation();
        });

        // Simulate button
        const simBtn = this.modal.querySelector('#cd-simulate-btn');
        simBtn.addEventListener('click', () => {
            if (this.designer) {
                const isRunning = this.designer.toggleSimulation();
                simBtn.innerHTML = isRunning ? (window.Icons?.get('stop', 14) || '') + ' ' + t('context.chipDesigner.modal.actionStop') : (window.Icons?.get('play', 14) || '') + ' ' + t('context.chipDesigner.modal.actionSimulate');
                simBtn.style.borderColor = isRunning ? '#ef4444' : '#22c55e';
                simBtn.style.color = isRunning ? '#ef4444' : '#22c55e';
            }
        });

        // Load Solution button (in floating panel)
        const floatingLoadBtn = this.modal.querySelector('#cd-floating-load-btn');
        floatingLoadBtn.addEventListener('click', () => {
            if (this.activeRequirement) {
                const id = this.activeRequirement.id;
                if (this.hasSavedSolution(id)) {
                    this.restoreSolution(id);
                }
            }
        });

        // Floating validate button (in right panel next to truth table)
        const floatingValidateBtn = this.modal.querySelector('#cd-floating-validate-btn');
        floatingValidateBtn.addEventListener('click', () => {
            if (this.isAdvancedMode && window.AdvancedTab) {
                window.AdvancedTab.validate();
            } else if (this.isChallengeMode) {
                this.validateChallenge();
            } else {
                this.validateCircuit();
            }
        });

        // Reset view button
        const resetViewBtn = this.modal.querySelector('#cd-reset-view-btn');
        resetViewBtn.addEventListener('click', () => {
            if (this.designer) {
                this.designer.resetView();
                this.updateZoomIndicator();
            }
        });

        this.registerKeyHandler();

        // Setup draggable floating windows
        this.setupFloatWindowDrag(this.modal.querySelector('#cd-float-toolbar'));
        this.setupFloatWindowDrag(this.modal.querySelector('#cd-float-truth'));

        // Tutorial button and navigation
        this.tutorialStep = 0;
        this.setupTutorial();

        // Show hint briefly
        setTimeout(() => {
            const hint = this.modal.querySelector('#cd-hint');
            hint.classList.add('visible');
            setTimeout(() => hint.classList.remove('visible'), 5000);
        }, 1000);
    }

    // Register the full keyboard shortcut handler (ESC, tool shortcuts, Delete/Backspace)
    registerKeyHandler() {
        // Remove old handler if any
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        this.keyHandler = (e) => {
            if (!this.isVisible) return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'Escape') {
                // Cancel blueprint stamp mode
                if (this.designer && this.designer.currentTool === 'blueprint') {
                    this.designer.blueprintToPlace = null;
                    this.designer.currentTool = 'select';
                    this.designer.render();
                    this.updateToolButtonState('select');
                    return;
                }
                if (this.designer && this.designer.componentBeingMoved) {
                    this.designer.cancelMove();
                    this.updateToolButtonState('select');
                    return;
                }
                const tutorial = this.modal.querySelector('#cd-tutorial');
                if (tutorial.classList.contains('visible')) {
                    this.hideTutorial();
                } else {
                    this.hide();
                }
            }

            if (e.key === 'Home' && this.designer) {
                this.designer.resetView();
                this.updateZoomIndicator();
            }

            if (this.designer) {
                const key = e.key.toLowerCase();
                if (key === 'v' && !e.ctrlKey && !e.metaKey) {
                    this.designer.setTool('select');
                    this.updateToolButtonState('select');
                } else if (key === 'w') {
                    this.designer.setTool('wire');
                    this.updateToolButtonState('wire');
                } else if (key === 'x') {
                    this.designer.setTool('delete');
                    this.updateToolButtonState('delete');
                } else if (key === 'm') {
                    if (this.designer.selectedComponent) {
                        this.designer.startMoveComponent(this.designer.selectedComponent);
                        this.updateToolButtonState('move');
                    } else {
                        this.designer.setTool('move');
                        this.updateToolButtonState('move');
                    }
                } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    if (this.designer.selectedComponents.size > 0) {
                        for (const c of this.designer.selectedComponents) {
                            this.designer.deleteComponent(c);
                        }
                        this.designer.clearSelection();
                        this.designer.render();
                    } else if (this.designer.selectedComponent) {
                        this.designer.deleteComponent(this.designer.selectedComponent);
                        this.designer.selectedComponent = null;
                        this.designer.render();
                    } else if (this.designer.selectedWire) {
                        this.designer.wireManager.removeWire(this.designer.selectedWire);
                        this.designer.selectedWire = null;
                        this.designer.render();
                    }
                }
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    // Make a floating window draggable by its titlebar
    setupFloatWindowDrag(windowEl) {
        if (!windowEl) return;
        const titlebar = windowEl.querySelector('.cd-float-window-titlebar');
        if (!titlebar) return;

        let isDragging = false;
        let startX, startY, startLeft, startTop;

        const onMouseDown = (e) => {
            if (e.target.closest('button')) return; // Don't drag when clicking buttons
            isDragging = true;
            const rect = windowEl.getBoundingClientRect();
            const containerRect = windowEl.parentElement.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left - containerRect.left;
            startTop = rect.top - containerRect.top;
            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            // Clamp within container
            const container = windowEl.parentElement;
            const maxX = container.clientWidth - windowEl.offsetWidth;
            const maxY = container.clientHeight - windowEl.offsetHeight;
            windowEl.style.left = Math.max(0, Math.min(maxX, startLeft + dx)) + 'px';
            windowEl.style.top = Math.max(0, Math.min(maxY, startTop + dy)) + 'px';
            // Clear any right/bottom positioning once dragged
            windowEl.style.right = 'auto';
            windowEl.style.bottom = 'auto';
        };

        const onMouseUp = () => {
            isDragging = false;
        };

        titlebar.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Store cleanup refs
        if (!this._floatDragCleanups) this._floatDragCleanups = [];
        this._floatDragCleanups.push(() => {
            titlebar.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        });
    }

    // Update tool button UI state
    updateToolButtonState(toolName) {
        const toolButtons = this.modal.querySelectorAll('.chip-designer-tool-btn');
        toolButtons.forEach(btn => {
            const isTool = btn.dataset.tool === toolName;
            btn.classList.toggle('active', isTool);
            btn.setAttribute('aria-pressed', isTool ? 'true' : 'false');
        });
        this.updateStatusBar();
    }

    // Tutorial system
    setupTutorial() {
        this.tutorialSteps = [
            {
                title: 'Welcome to Circuit Designer',
                icon: window.Icons?.get('wrench', 18) || '',
                content: `
                    <p>Design logic circuits using gates, wires, and I/O pins.</p>
                    <p>There are two modes to explore:</p>
                    <ul>
                        <li><strong>Firmware Designs</strong> — build circuits that match specific truth tables</li>
                        <li><strong>NAND Challenges</strong> — solve puzzles using only NAND gates</li>
                    </ul>
                    <div class="tutorial-highlight">
                        <div class="tutorial-highlight-icon">${window.Icons?.get('lightbulb', 18) || ''}</div>
                        <div class="tutorial-highlight-text">Select a design from the left panel to get started!</div>
                    </div>
                `
            },
            {
                title: 'Canvas Controls',
                icon: window.Icons?.get('brush', 18) || '',
                content: `
                    <p>The canvas is your workspace for building circuits.</p>
                    <div class="tutorial-controls">
                        <div class="tutorial-control">
                            <span class="control-key">Click + Drag</span>
                            <span class="control-desc">Pan the canvas</span>
                        </div>
                        <div class="tutorial-control">
                            <span class="control-key">Mouse Wheel</span>
                            <span class="control-desc">Zoom in/out</span>
                        </div>
                        <div class="tutorial-control">
                            <span class="control-key">Right Click</span>
                            <span class="control-desc">Delete component under cursor</span>
                        </div>
                        <div class="tutorial-control">
                            <span class="control-key">Del / Backspace</span>
                            <span class="control-desc">Delete selected component</span>
                        </div>
                        <div class="tutorial-control">
                            <span class="control-key">V / W / X / M</span>
                            <span class="control-desc">Select / Wire / Delete / Move tool</span>
                        </div>
                    </div>
                    <p>Use the toolbar buttons or keyboard shortcuts to switch tools.</p>
                `
            },
            {
                title: 'Placing Components',
                icon: window.Icons?.get('power', 18) || '',
                content: `
                    <p>Click a gate button in the toolbar, then click the canvas to place it.</p>
                    <div class="tutorial-gates">
                        <div class="tutorial-gate"><span class="gate-symbol">&amp;</span><span class="gate-name">AND</span><span class="gate-desc">Output is 1 only when all inputs are 1</span></div>
                        <div class="tutorial-gate"><span class="gate-symbol">≥1</span><span class="gate-name">OR</span><span class="gate-desc">Output is 1 when any input is 1</span></div>
                        <div class="tutorial-gate"><span class="gate-symbol">¬</span><span class="gate-name">NOT</span><span class="gate-desc">Inverts the input signal</span></div>
                        <div class="tutorial-gate"><span class="gate-symbol">=1</span><span class="gate-name">XOR</span><span class="gate-desc">Output is 1 when inputs differ</span></div>
                        <div class="tutorial-gate nand"><span class="gate-symbol">⊼</span><span class="gate-name">NAND</span><span class="gate-desc">Universal gate — can build any logic circuit</span></div>
                    </div>
                    <p>You'll also need <strong>Input</strong> and <strong>Output</strong> pins to connect your circuit to the outside world.</p>
                `
            },
            {
                title: 'Wiring Components',
                icon: window.Icons?.get('link', 18) || '',
                content: `
                    <p>Use the Wire tool (W) to connect components together.</p>
                    <ol>
                        <li>Click on an output pin (right side of a gate)</li>
                        <li>Click on an input pin (left side of a gate)</li>
                        <li>The wire will be created automatically</li>
                    </ol>
                    <div class="tutorial-highlight">
                        <div class="tutorial-highlight-icon">${window.Icons?.get('power', 18) || ''}</div>
                        <div class="tutorial-highlight-text">Wires carry signals from outputs to inputs. Each input can only have one wire.</div>
                    </div>
                    <p>Right-click a wire to delete it.</p>
                `
            },
            {
                title: 'Testing & Validation',
                icon: window.Icons?.get('play', 18) || '',
                content: `
                    <p>Use the Simulate button to test your circuit interactively.</p>
                    <ul>
                        <li><strong>Green</strong> signals represent logic HIGH (1)</li>
                        <li><strong>Dark</strong> signals represent logic LOW (0)</li>
                    </ul>
                    <p>Click input pins during simulation to toggle their values and see how the circuit responds.</p>
                    <p>Check the truth table panel to see the expected outputs for each input combination.</p>
                    <div class="tutorial-highlight success">
                        <div class="tutorial-highlight-icon">${window.Icons?.get('check', 18) || ''}</div>
                        <div class="tutorial-highlight-text">Click "Validate Circuit" to check if your design matches all required test cases.</div>
                    </div>
                `
            }
        ];

        // Help button
        const helpBtn = this.modal.querySelector('#cd-help-btn');
        helpBtn.addEventListener('click', () => this.showTutorial());

        // Tutorial close button
        const tutorialClose = this.modal.querySelector('#cd-tutorial-close');
        tutorialClose.addEventListener('click', () => this.hideTutorial());

        // Tutorial navigation
        const prevBtn = this.modal.querySelector('#cd-tutorial-prev');
        const nextBtn = this.modal.querySelector('#cd-tutorial-next');
        prevBtn.addEventListener('click', () => this.prevTutorialStep());
        nextBtn.addEventListener('click', () => this.nextTutorialStep());

        // Click outside to close
        const tutorial = this.modal.querySelector('#cd-tutorial');
        tutorial.addEventListener('click', (e) => {
            if (e.target === tutorial) this.hideTutorial();
        });

        // Update total steps display
        this.modal.querySelector('#cd-tutorial-total').textContent = this.tutorialSteps.length;
    }

    showTutorial() {
        this.tutorialStep = 0;
        this.updateTutorialContent();
        this.modal.querySelector('#cd-tutorial').classList.add('visible');
    }

    hideTutorial() {
        this.modal.querySelector('#cd-tutorial').classList.remove('visible');
    }

    prevTutorialStep() {
        if (this.tutorialStep > 0) {
            this.tutorialStep--;
            this.updateTutorialContent();
        }
    }

    nextTutorialStep() {
        if (this.tutorialStep < this.tutorialSteps.length - 1) {
            this.tutorialStep++;
            this.updateTutorialContent();
        } else {
            this.hideTutorial();
        }
    }

    updateTutorialContent() {
        const step = this.tutorialSteps[this.tutorialStep];
        const body = this.modal.querySelector('#cd-tutorial-body');

        body.innerHTML = `
            <div class="chip-designer-tutorial-step">
                <div class="tutorial-step-header">
                    <span class="tutorial-step-icon">${step.icon}</span>
                    <h3>${step.title}</h3>
                </div>
                <div class="tutorial-step-content">
                    ${step.content}
                </div>
            </div>
        `;

        // Update step counter
        this.modal.querySelector('#cd-tutorial-step').textContent = this.tutorialStep + 1;

        // Update button states
        const prevBtn = this.modal.querySelector('#cd-tutorial-prev');
        const nextBtn = this.modal.querySelector('#cd-tutorial-next');

        prevBtn.disabled = this.tutorialStep === 0;
        prevBtn.style.opacity = this.tutorialStep === 0 ? '0.5' : '1';

        if (this.tutorialStep === this.tutorialSteps.length - 1) {
            nextBtn.textContent = 'Done';
        } else {
            nextBtn.innerHTML = `Next ${window.Icons?.get('arrowRight', 12) || ''}`;
        }
    }

    switchTab(tab) {
        // Clean up previous advanced tab state if leaving it
        if (this.activeTab === 'advanced' && tab !== 'advanced' && window.AdvancedTab) {
            window.AdvancedTab.cleanup();
        }

        this.activeTab = tab;
        this.isChallengeMode = (tab === 'challenges');
        this.isAdvancedMode = (tab === 'advanced');

        // Update tab buttons and ARIA attributes
        this.modal.querySelectorAll('.chip-designer-tab').forEach(btn => {
            const isActive = btn.dataset.tab === tab;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Update panels
        this.modal.querySelectorAll('.chip-designer-tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `cd-panel-${tab}`);
        });

        // Clear any existing validation result when switching tabs
        this.clearValidationResult();

        // Build advanced tab content if switching to it
        if (tab === 'advanced' && window.AdvancedTab) {
            const advPanel = this.modal.querySelector('#cd-panel-advanced');
            if (advPanel) window.AdvancedTab.build(advPanel, this);
        }

        // Update component availability
        this.updateComponentAvailability();

        // Update status bar
        const modeEl = this.modal.querySelector('#cd-status-mode');
        if (this.isChallengeMode) {
            modeEl.textContent = t('context.chipDesigner.modal.nandOnlyMode');
            modeEl.className = 'challenge-mode';
        } else if (this.isAdvancedMode) {
            modeEl.textContent = 'Advanced';
            modeEl.className = 'challenge-mode';
        } else {
            modeEl.textContent = '';
            modeEl.className = '';
        }

        // Update header and floating panel
        this.updateHeaderTitle();
        if (!this.isAdvancedMode) {
            this.updateFloatingPanel();
        }

        // Clear the canvas when switching modes
        if (this.designer) {
            this.designer.clear();
        }
    }

    updateHeaderTitle() {
        const headerEl = this.modal.querySelector('#cd-header-challenge');
        if (this.activeRequirement) {
            headerEl.textContent = this.activeRequirement.name;
        } else {
            headerEl.textContent = t('context.chipDesigner.modal.selectDesignPrompt');
        }
    }

    updateComponentAvailability() {
        const gateButtons = this.modal.querySelectorAll('.component-gate');
        const nandButton = this.modal.querySelector('.component-nand');
        const norButton = this.modal.querySelector('.component-nor');
        const xnorButton = this.modal.querySelector('.component-xnor');
        const thresholdButton = this.modal.querySelector('.component-threshold');
        const averageButton = this.modal.querySelector('.component-average');

        // Check if expanded gate library is unlocked via void shop
        const hasExpandedGates = window.voidShop?.hasExpandedGateLibrary() || false;

        // Analog gates: only visible in analog advanced mode
        const isAnalogMode = this.isAdvancedMode && this.advancedCategory === 'analog';
        if (thresholdButton) thresholdButton.style.display = isAnalogMode ? '' : 'none';
        if (averageButton) averageButton.style.display = isAnalogMode ? '' : 'none';

        if (this.isChallengeMode) {
            gateButtons.forEach(btn => btn.classList.add('disabled'));
            nandButton.classList.remove('disabled');
            nandButton.style.display = '';
            // Show NOR/XNOR in challenge mode if researched
            if (norButton && hasExpandedGates) {
                norButton.classList.remove('disabled');
                norButton.style.display = '';
            }
            if (xnorButton && hasExpandedGates) {
                xnorButton.classList.remove('disabled');
                xnorButton.style.display = '';
            }
        } else {
            gateButtons.forEach(btn => btn.classList.remove('disabled'));
            // Show NAND/NOR/XNOR in normal mode if researched
            if (nandButton) {
                if (hasExpandedGates) {
                    nandButton.classList.remove('disabled');
                    nandButton.style.display = '';
                } else {
                    nandButton.classList.add('disabled');
                    nandButton.style.display = 'none';
                }
            }
            if (norButton) {
                if (hasExpandedGates) {
                    norButton.classList.remove('disabled');
                    norButton.style.display = '';
                } else {
                    norButton.style.display = 'none';
                }
            }
            if (xnorButton) {
                if (hasExpandedGates) {
                    xnorButton.classList.remove('disabled');
                    xnorButton.style.display = '';
                } else {
                    xnorButton.style.display = 'none';
                }
            }
        }
    }

    updateStatusBar() {
        const toolNames = {
            'select': t('context.chipDesigner.modal.statusToolSelect'),
            'wire': t('context.chipDesigner.modal.statusToolWire'),
            'delete': t('context.chipDesigner.modal.statusToolDelete'),
            'component': t('context.chipDesigner.modal.statusToolPlace'),
            'move': t('context.chipDesigner.modal.toolMove'),
            'blueprint': t('context.chipDesigner.modal.blueprints')
        };
        const toolEl = this.modal.querySelector('#cd-status-tool');
        if (this.designer) {
            toolEl.textContent = toolNames[this.designer.currentTool] || t('context.chipDesigner.modal.statusToolSelect');
        }
    }

    updateZoomIndicator() {
        const indicator = this.modal.querySelector('#cd-zoom-indicator');
        if (indicator && this.designer) {
            const zoom = Math.round(this.designer.grid.zoom * 100);
            indicator.textContent = `${zoom}%`;
        }
    }

    updateComponentCounts() {
        if (!this.designer) return;

        const ComponentTypes = window.ChipComponentTypes;
        const inputs = this.designer.components.filter(c => c.type === ComponentTypes.INPUT).length;
        const outputs = this.designer.components.filter(c => c.type === ComponentTypes.OUTPUT).length;
        const gates = this.designer.components.filter(c =>
            c.type !== ComponentTypes.INPUT && c.type !== ComponentTypes.OUTPUT
        ).length;
        const wires = this.designer.wireManager.wires.length;

        this.modal.querySelector('#cd-count-inputs').textContent = inputs;
        this.modal.querySelector('#cd-count-outputs').textContent = outputs;
        this.modal.querySelector('#cd-count-gates').textContent = gates;
        this.modal.querySelector('#cd-count-wires').textContent = wires;
    }

    updateFloatingPanel() {
        const panel = this.modal.querySelector('#cd-floating-panel');
        const titleEl = this.modal.querySelector('#cd-floating-title');
        const valueEl = this.modal.querySelector('#cd-floating-value');
        const difficultyEl = this.modal.querySelector('#cd-floating-difficulty');
        const descEl = this.modal.querySelector('#cd-floating-desc');
        const inputsEl = this.modal.querySelector('#cd-floating-inputs');
        const outputsEl = this.modal.querySelector('#cd-floating-outputs');
        const chainEl = this.modal.querySelector('#cd-floating-chain');
        const hintSection = this.modal.querySelector('#cd-floating-hint-section');
        const hintEl = this.modal.querySelector('#cd-floating-hint');
        const truthEl = this.modal.querySelector('#cd-floating-truth');
        const constraintEl = this.modal.querySelector('#cd-floating-constraint');

        const truthWindow = this.modal.querySelector('#cd-float-truth');

        if (!this.activeRequirement) {
            panel.classList.remove('visible');
            if (truthWindow) truthWindow.classList.remove('visible');
            return;
        }

        const req = this.activeRequirement;
        panel.classList.add('visible');
        if (truthWindow) truthWindow.classList.add('visible');

        // Title
        titleEl.textContent = req.name;
        valueEl.textContent = '';

        // Difficulty
        if (this.isChallengeMode) {
            const diffColors = {
                'Beginner': '#4ade80',
                'Intermediate': '#22d3ee',
                'Advanced': '#fbbf24',
                'Expert': '#ef4444',
                'Master': '#a855f7',
                'Void': '#06b6d4'
            };
            const color = diffColors[req.difficulty] || '#888';
            difficultyEl.textContent = t('context.chipDesigner.modal.challengeDiff.' + req.difficulty) || req.difficulty;
            difficultyEl.style.background = `${color}22`;
            difficultyEl.style.color = color;
            difficultyEl.style.border = `1px solid ${color}44`;
        } else {
            const diffInfo = this.getDifficultyInfo(req.tier);
            difficultyEl.textContent = diffInfo.label;
            difficultyEl.style.background = `${diffInfo.color}22`;
            difficultyEl.style.color = diffInfo.color;
            difficultyEl.style.border = `1px solid ${diffInfo.color}44`;
        }

        // Description
        descEl.textContent = req.description || '';

        // Inputs
        inputsEl.innerHTML = req.inputs.map(i =>
            `<span class="chip-designer-floating-io-pin input">${i}</span>`
        ).join('');

        // Outputs
        outputsEl.innerHTML = req.outputs.map(o =>
            `<span class="chip-designer-floating-io-pin output">${o}</span>`
        ).join('');

        // Production Chain
        // Production chain removed for standalone mode

        // Bonus section for challenges
        const bonusSection = this.modal.querySelector('#cd-floating-bonus-section');
        bonusSection.style.display = 'none';

        // Hint (expected gates)
        if (!this.isChallengeMode) {
            const diffInfo = this.getDifficultyInfo(req.tier);
            hintSection.style.display = 'block';
            hintEl.innerHTML = `${t('context.chipDesigner.modal.expected')} <strong>${diffInfo.hint}</strong>`;
        } else {
            hintSection.style.display = 'none';
        }

        // Truth Table
        this.buildFloatingTruthTable(req, truthEl);

        // Constraint for challenges
        if (this.isChallengeMode) {
            constraintEl.style.display = 'block';
            constraintEl.innerHTML = (window.Icons?.get('warning', 16) || '') + ' ' + t('context.chipDesigner.modal.nandGatesOnly');
        } else {
            constraintEl.style.display = 'none';
        }

        // Update floating validate button
        const validateBtn = this.modal.querySelector('#cd-floating-validate-btn');
        if (validateBtn) {
            if (this.isChallengeMode) {
                validateBtn.classList.add('challenge');
            } else {
                validateBtn.classList.remove('challenge');
            }
            // Standalone: always enabled
            validateBtn.disabled = false;
            validateBtn.style.opacity = '1';
            validateBtn.style.cursor = 'pointer';
        }

        // Show/hide Load Solution button based on saved solution
        const loadSection = this.modal.querySelector('#cd-floating-load-section');
        if (loadSection) {
            loadSection.style.display = this.hasSavedSolution(req.id) ? 'block' : 'none';
        }
    }

    buildFloatingTruthTable(req, container) {
        const inputs = req.inputs;
        const outputs = req.outputs;
        const testCases = req.testCases;

        let html = `<table class="cd-truth-table"><thead><tr>`;
        html += inputs.map(i => `<th class="tt-in">${i}</th>`).join('');
        html += `<th class="tt-sep"></th>`;
        html += outputs.map(o => `<th class="tt-out">${o}</th>`).join('');
        html += `</tr></thead><tbody>`;

        for (const tc of testCases) {
            html += `<tr>`;
            html += inputs.map(i => `<td class="tt-in">${tc.inputs[i] ? '1' : '0'}</td>`).join('');
            html += `<td class="tt-sep"></td>`;
            html += outputs.map(o => `<td class="tt-out">${tc.outputs[o] ? '1' : '0'}</td>`).join('');
            html += `</tr>`;
        }

        html += `</tbody></table>`;
        container.innerHTML = html;
    }

    // Highlight the truth table row matching current simulation input state
    updateTruthTableHighlight() {
        if (!this.activeRequirement || !this.designer) return;
        // Skip for advanced challenges that don't use standard boolean truth tables
        if (this.isAdvancedMode) return;

        const req = this.activeRequirement;
        const ComponentTypes = window.ChipComponentTypes;
        const table = this.modal.querySelector('#cd-floating-truth .cd-truth-table');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        if (!rows.length) return;

        // Get current input component values by label
        const inputComponents = this.designer.components.filter(c => c.type === ComponentTypes.INPUT);
        const outputComponents = this.designer.components.filter(c => c.type === ComponentTypes.OUTPUT);
        const inputValues = {};
        const outputValues = {};
        for (const comp of inputComponents) {
            if (comp.label) inputValues[comp.label] = !!comp.manualValue;
        }
        for (const comp of outputComponents) {
            if (comp.label) outputValues[comp.label] = !!(comp.inputs[0]?.value);
        }

        for (let i = 0; i < rows.length && i < req.testCases.length; i++) {
            const tc = req.testCases[i];
            const row = rows[i];

            // Check if all inputs match this test case
            let inputsMatch = true;
            for (const inputName of req.inputs) {
                if (inputValues[inputName] !== !!tc.inputs[inputName]) {
                    inputsMatch = false;
                    break;
                }
            }

            // Remove all highlight classes
            row.classList.remove('tt-active', 'tt-pass', 'tt-fail');

            if (inputsMatch) {
                row.classList.add('tt-active');
                // Check if outputs also match
                let outputsMatch = true;
                for (const outputName of req.outputs) {
                    if (outputValues[outputName] !== !!tc.outputs[outputName]) {
                        outputsMatch = false;
                        break;
                    }
                }
                row.classList.add(outputsMatch ? 'tt-pass' : 'tt-fail');
                // Scroll matching row into view
                row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }

    initDesigner() {
        // Clean up previous designer's event listeners before creating a new one
        if (this.designer) {
            this.designer.cleanup();
        }

        const canvas = this.modal.querySelector('#cd-canvas');
        const container = this.modal.querySelector('.chip-designer-canvas-container');

        if (!window.ChipDesignerCore) {
            console.error('ChipDesigner classes not loaded');
            return;
        }

        this.designer = new window.ChipDesignerCore(canvas);

        // Hook into view changes (zoom/pan)
        this.designer.onViewChange = () => {
            this.updateZoomIndicator();
        };

        // Hook into designer updates
        const originalRender = this.designer.render.bind(this.designer);
        this.designer.render = () => {
            originalRender();
            this.updateComponentCounts();
            const posEl = this.modal.querySelector('#cd-status-pos');
            posEl.textContent = `${this.designer.mouseGridPos.x}, ${this.designer.mouseGridPos.y}`;
            this.updateTruthTableHighlight();
        };

        const resize = () => {
            this.designer.resize(container.clientWidth, container.clientHeight);
        };
        resize();
        // Store resize handler for cleanup in hide()
        this._resizeHandler = () => {
            if (this.isVisible) resize();
        };
        window.addEventListener('resize', this._resizeHandler);

        // Wire up multi-select callback for blueprint save button
        this.designer.onSelectionChange = () => this.updateBlueprintSaveButton();

        this.buildRequirementsList();
        this.buildChallengesList();

        if (window.ChipRequirements && window.ChipRequirements.length > 0) {
            this.selectRequirement(window.ChipRequirements[0]);
        }

        this.setupBlueprintEvents();
        this.designer.render();
    }

    buildRequirementsList() {
        const listEl = this.modal.querySelector('#cd-req-list');
        if (!listEl || !window.ChipRequirements) return;

        listEl.innerHTML = '';
        const tiers = window.getChipTiers ? window.getChipTiers() : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        for (const tier of tiers) {
            const tierReqs = window.ChipRequirements.filter(r => r.tier === tier);
            if (tierReqs.length === 0) continue;

            const diffInfo = this.getDifficultyInfo(tier);
            const completedCount = tierReqs.filter(r => this.completedRequirements.has(r.id)).length;

            const header = document.createElement('div');
            header.className = 'chip-designer-tier-header';

            const unlockBadge = `<span class="chip-designer-tier-count">${completedCount}/${tierReqs.length}</span>`;

            header.innerHTML = `
                <span class="chip-designer-tier-badge" style="background:${diffInfo.color}22;color:${diffInfo.color};border:1px solid ${diffInfo.color}44;">
                    ${t('context.chipDesigner.modal.tier', { tier })}
                </span>
                <span class="chip-designer-tier-stars">
                    ${'★'.repeat(diffInfo.stars).split('').map(() => `<span class="chip-designer-tier-star" style="color:${diffInfo.color}">★</span>`).join('')}
                </span>
                ${unlockBadge}
            `;
            listEl.appendChild(header);

            for (const req of tierReqs) {
                const item = document.createElement('div');
                item.className = 'chip-designer-req-item';
                item.dataset.reqId = req.id;

                // Mark as completed if puzzle is solved
                const isPuzzleSolved = this.completedRequirements.has(req.id);
                if (isPuzzleSolved) {
                    item.classList.add('completed');
                }

                const hasSolution = this.hasSavedSolution(req.id);
                const savedSolution = hasSolution ? this.loadSolution(req.id) : null;
                const savedMedal = savedSolution?.medal;

                // Medal icon for completed designs
                let medalBadge = '';
                if (isPuzzleSolved && savedMedal) {
                    medalBadge = `<span class="cd-medal-badge" style="color:${this.getMedalColor(savedMedal)}">${this.getMedalIcon(savedMedal)}</span>`;
                }

                const lockTooltip = '';

                item.innerHTML = `
                    <div class="chip-designer-req-info">
                        <div class="chip-designer-req-name">${medalBadge}${req.name}${lockTooltip}</div>
                        <div class="chip-designer-req-meta">
                            <span class="chip-designer-req-ios">
                                <span class="in">${req.inputs.length}in</span> ${window.Icons?.get('arrowRight', 12) || ''} <span class="out">${req.outputs.length}out</span>
                            </span>
                            ${hasSolution ? `<button class="chip-designer-view-solution-btn" data-req-id="${req.id}" title="${t('context.chipDesigner.modal.viewSolution')}">${t('context.chipDesigner.modal.viewSolution')}</button>` : ''}
                        </div>
                    </div>
                    <span class="chip-designer-req-value"></span>
                `;

                item.addEventListener('click', (e) => {
                    // Don't trigger requirement selection if clicking the view button
                    if (e.target.classList.contains('chip-designer-view-solution-btn')) return;
                    this.selectRequirement(req);
                });
                listEl.appendChild(item);
            }
        }

    }

    updateBonusesDisplay() {
        const bonusPanel = this.modal.querySelector('#cd-bonuses-panel');
        const bonusList = this.modal.querySelector('#cd-bonuses-list');
        if (!bonusPanel || !bonusList) return;

        const bonuses = this.getActiveBonuses();
        const bonusEntries = Object.entries(bonuses).filter(([_, value]) => value > 0);

        if (bonusEntries.length === 0) {
            bonusPanel.style.display = 'none';
            return;
        }

        bonusPanel.style.display = 'block';
        const names = window.NandBonusNames || {};
        const descriptions = window.NandBonusDescriptions || {};

        bonusList.innerHTML = bonusEntries.map(([type, value]) => {
            const prefix = '+';
            const name = names[type] || type;
            const desc = descriptions[type] || '';
            return `
                <div class="chip-designer-bonus-item">
                    <div class="chip-designer-bonus-item-value">${prefix}${value}% ${name}</div>
                    <div class="chip-designer-bonus-item-desc">${desc}</div>
                </div>
            `;
        }).join('');
    }

    buildChallengesList() {
        const listEl = this.modal.querySelector('#cd-challenge-list');
        if (!listEl || !window.NandChallenges) return;

        listEl.innerHTML = '';
        this.updateBonusesDisplay();

        // Check if Master challenges are unlocked via research
        const hasMasterResearch = window.game?.researchManager?.isUnlocked('advanced_nand_challenges') || false;

        const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
        // Add Master tier if research is unlocked
        if (hasMasterResearch) {
            difficulties.push('Master');
        }

        // Add Void tier if void upgrade is purchased
        const hasVoidChallenges = window.voidShop?.upgrades['expert_firmware_challenges']?.currentLevel > 0 || false;
        if (hasVoidChallenges) {
            difficulties.push('Void');
        }

        const diffColors = {
            'Beginner': '#4ade80',
            'Intermediate': '#22d3ee',
            'Advanced': '#fbbf24',
            'Expert': '#ef4444',
            'Master': '#a855f7',  // Purple for prestige content
            'Void': '#06b6d4'    // Teal for void content
        };

        for (const diff of difficulties) {
            // Filter challenges by difficulty, and also filter out challenges requiring unowned research/void upgrades
            const challenges = window.NandChallenges.filter(c => {
                if (c.difficulty !== diff) return false;
                // Check if challenge requires research we don't have
                if (c.requiresResearch) {
                    const hasResearch = window.game?.researchManager?.isUnlocked(c.requiresResearch) || false;
                    if (!hasResearch) return false;
                }
                // Check if challenge requires void upgrade we don't have
                if (c.requiresVoidUpgrade) {
                    const hasVoidUpgrade = window.voidShop?.upgrades[c.requiresVoidUpgrade]?.currentLevel > 0 || false;
                    if (!hasVoidUpgrade) return false;
                }
                return true;
            });
            if (challenges.length === 0) continue;

            const completedCount = challenges.filter(c => this.completedChallenges.has(c.id)).length;

            const header = document.createElement('div');
            header.className = 'chip-designer-tier-header';
            header.innerHTML = `
                <span class="chip-designer-tier-badge" style="background:${diffColors[diff]}22;color:${diffColors[diff]};border:1px solid ${diffColors[diff]}44;">
                    ${diff}
                </span>
                <span class="chip-designer-tier-count">${completedCount}/${challenges.length}</span>
            `;
            listEl.appendChild(header);

            for (const challenge of challenges) {
                const item = document.createElement('div');
                item.className = 'chip-designer-req-item challenge';
                item.dataset.challengeId = challenge.id;

                if (this.completedChallenges.has(challenge.id)) {
                    item.classList.add('completed');
                }

                // Standalone mode: all challenges accessible

                const hasSolution = this.hasSavedSolution(challenge.id);
                item.innerHTML = `
                    <div class="chip-designer-req-info">
                        <div class="chip-designer-req-name">${challenge.name}</div>
                        <div class="chip-designer-req-meta">
                            <span class="chip-designer-req-ios">
                                <span class="in">${challenge.inputs.length}in</span> ${window.Icons?.get('arrowRight', 12) || ''} <span class="out">${challenge.outputs.length}out</span>
                            </span>
                            ${hasSolution ? `<button class="chip-designer-view-solution-btn" data-challenge-id="${challenge.id}" title="${t('context.chipDesigner.modal.viewSolution')}">${t('context.chipDesigner.modal.viewSolution')}</button>` : ''}
                        </div>
                    </div>
                `;

                item.addEventListener('click', (e) => {
                    if (e.target.classList.contains('chip-designer-view-solution-btn')) return;
                    this.selectChallenge(challenge);
                });
                listEl.appendChild(item);
            }
        }
    }

    selectRequirement(req) {
        this.activeRequirement = req;
        this.updateHeaderTitle();
        this.updateFloatingPanel();

        if (this.designer) {
            this.designer.setActiveRequirement(req);
            this.designer.render();
        }

        this.modal.querySelectorAll('#cd-req-list .chip-designer-req-item').forEach(item => {
            item.classList.toggle('active', item.dataset.reqId === req.id);
        });

        const detailsEl = this.modal.querySelector('#cd-active-req');
        detailsEl.classList.remove('hidden');

        const isPuzzleSolved = this.completedRequirements.has(req.id);

        let html = '';

        // Gate budget display
        if (req.gateBudget) {
            const savedSolution = this.loadSolution(req.id);
            const bestGates = savedSolution?.gateCount;
            const bestMedal = savedSolution?.medal;
            html += `
                <div style="background:#1a1a2e;padding:8px 12px;margin-bottom:8px;font-size:11px;">
                    <div style="color:#889;margin-bottom:4px;">Gate Budget</div>
                    <div style="display:flex;gap:12px;align-items:center;">
                        <span style="color:${this.getMedalColor('gold')}">${this.getMedalIcon('gold')} ${req.gateBudget.gold}</span>
                        <span style="color:${this.getMedalColor('silver')}">${this.getMedalIcon('silver')} ${req.gateBudget.silver}</span>
                        <span style="color:${this.getMedalColor('bronze')}">${this.getMedalIcon('bronze')} ${req.gateBudget.bronze}</span>
                        ${bestGates != null ? `<span style="color:#aab;margin-left:auto;">Best: ${bestGates} gates ${bestMedal ? this.getMedalIcon(bestMedal) : ''}</span>` : ''}
                    </div>
                </div>
            `;
        }

        // Show solved status
        if (isPuzzleSolved) {
            html += `
                <div class="chip-designer-unlocked-notice" style="background:#4ade8022;color:#4ade80;padding:12px;border-radius:0;text-align:center;margin-bottom:12px;">
                    ${window.Icons?.get('check', 14) || ''} Puzzle Solved
                </div>
            `;
        }

        detailsEl.innerHTML = html;

        this.clearValidationResult();
    }

    selectChallenge(challenge) {
        this.activeRequirement = challenge;
        this.updateHeaderTitle();
        this.updateFloatingPanel();

        if (this.designer) {
            this.designer.setActiveRequirement(challenge);
            this.designer.render();
        }

        this.modal.querySelectorAll('#cd-challenge-list .chip-designer-req-item').forEach(item => {
            item.classList.toggle('active', item.dataset.challengeId === challenge.id);
        });

        const detailsEl = this.modal.querySelector('#cd-active-challenge');
        detailsEl.classList.remove('hidden');

        detailsEl.innerHTML = '';

        this.clearValidationResult();
    }

    clearValidationResult() {
        const floatingResultEl = this.modal.querySelector('#cd-floating-validation-result');
        if (floatingResultEl) {
            floatingResultEl.textContent = '';
            floatingResultEl.className = 'chip-designer-validation-result';
        }
    }

    // Custom confirmation dialog for clearing the circuit (replaces browser confirm())
    showClearConfirmation() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'chip-designer-confirm-overlay';
        overlay.setAttribute('role', 'alertdialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'cd-confirm-title');
        overlay.setAttribute('aria-describedby', 'cd-confirm-message');

        overlay.innerHTML = `
            <div class="chip-designer-confirm">
                <div class="chip-designer-confirm-icon" aria-hidden="true">${window.Icons?.get('cross', 24) || ''}</div>
                <div class="chip-designer-confirm-title" id="cd-confirm-title">${t('context.chipDesigner.modal.clearCircuitTitle')}</div>
                <div class="chip-designer-confirm-message" id="cd-confirm-message">
                    ${t('context.chipDesigner.modal.clearCircuitMessage')}
                </div>
                <div class="chip-designer-confirm-buttons">
                    <button class="chip-designer-confirm-btn cancel" aria-label="Cancel and keep circuit">${t('context.chipDesigner.modal.clearCancel')}</button>
                    <button class="chip-designer-confirm-btn confirm" aria-label="Confirm clear circuit">${t('context.chipDesigner.modal.clearConfirm')}</button>
                </div>
            </div>
        `;

        // Add to modal
        this.modal.appendChild(overlay);

        // Focus the cancel button by default (safer option)
        const cancelBtn = overlay.querySelector('.chip-designer-confirm-btn.cancel');
        const confirmBtn = overlay.querySelector('.chip-designer-confirm-btn.confirm');
        cancelBtn.focus();

        // Handle cancel
        const closeDialog = () => {
            overlay.remove();
        };

        cancelBtn.addEventListener('click', closeDialog);

        // Handle confirm
        confirmBtn.addEventListener('click', () => {
            if (this.designer) {
                this.designer.clear();
                this.clearValidationResult();
                this.updateComponentCounts();
            }
            closeDialog();
        });

        // Close on clicking outside
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDialog();
            }
        });

        // Close on Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeDialog();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    validateCircuit() {
        if (!this.activeRequirement || !this.designer) return;

        const req = this.activeRequirement;
        const ComponentTypes = window.ChipComponentTypes;

        const inputComponents = this.designer.components.filter(c => c.type === ComponentTypes.INPUT);
        const outputComponents = this.designer.components.filter(c => c.type === ComponentTypes.OUTPUT);

        if (inputComponents.length !== req.inputs.length) {
            this.showValidationResult(false, t('context.chipDesigner.modal.needInputs', { expected: req.inputs.length, found: inputComponents.length }));
            return;
        }

        if (outputComponents.length !== req.outputs.length) {
            this.showValidationResult(false, t('context.chipDesigner.modal.needOutputs', { expected: req.outputs.length, found: outputComponents.length }));
            return;
        }

        // Match components by label to requirements (placement order doesn't matter)
        let allPassed = true;
        let failedCount = 0;

        for (let i = 0; i < req.testCases.length; i++) {
            const tc = req.testCases[i];

            req.inputs.forEach((inputName) => {
                const inputComp = inputComponents.find(c => c.label === inputName);
                if (inputComp) inputComp.manualValue = tc.inputs[inputName];
            });

            this.designer.runSimulationStep();

            let casePassed = true;
            req.outputs.forEach((outputName) => {
                const outputComp = outputComponents.find(c => c.label === outputName);
                const expectedValue = tc.outputs[outputName];
                const actualValue = outputComp?.inputs[0]?.value || false;

                if (actualValue !== expectedValue) {
                    casePassed = false;
                }
            });

            if (!casePassed) {
                allPassed = false;
                failedCount++;
            }
        }

        if (allPassed) {
            // Calculate circuit stats and medal
            const stats = this.getCircuitStats();
            const medal = this.getMedalForGateCount(stats.totalGates, req.gateBudget);

            // Build stats message
            let statsMsg = t('context.chipDesigner.modal.allTestsPassed', { count: req.testCases.length });
            statsMsg += ` | ${stats.totalGates} gates, ${stats.wireCount} wires`;
            if (medal) {
                statsMsg += ` ${this.getMedalIcon(medal)}`;
            }

            this.showValidationResult(true, statsMsg);

            // Show detailed stats in the floating panel
            this.showCircuitStats(stats, req.gateBudget, medal);

            // Save the solution with gate count and medal
            this.saveSolution(req.id, false, stats.totalGates, medal);

            // Only record for achievements if this is the first time completing this requirement
            const wasAlreadyCompleted = this.completedRequirements.has(req.id);
            this.completedRequirements.add(req.id);
            this.saveGlobalUnlocks(); // Persist requirement unlock globally (survives prestige)
            this.modal.querySelector(`#cd-req-list .chip-designer-req-item[data-req-id="${req.id}"]`)?.classList.add('completed');
            this.buildRequirementsList();

            // Track firmware completion for achievements (only if first completion)
            if (!wasAlreadyCompleted && window.game && req.tier) {
                window.game.recordFirmwareChallengeComplete(req.tier);
            }
        } else {
            this.showValidationResult(false, t('context.chipDesigner.modal.testsFailed', { failed: failedCount, total: req.testCases.length }));
            // Hide stats on failure
            this.hideCircuitStats();
        }

        this.designer.render();
    }

    validateChallenge() {
        if (!this.activeRequirement || !this.designer) return;

        const challenge = this.activeRequirement;
        const ComponentTypes = window.ChipComponentTypes;

        // Check constraint: only NAND gates allowed (plus input/output)
        const invalidComponents = this.designer.components.filter(c =>
            c.type !== ComponentTypes.INPUT &&
            c.type !== ComponentTypes.OUTPUT &&
            c.type !== 'nand'
        );

        if (invalidComponents.length > 0) {
            this.showChallengeValidationResult(false, t('context.chipDesigner.modal.invalidComponents', { types: invalidComponents.map(c => c.type).join(', ') }));
            return;
        }

        const inputComponents = this.designer.components.filter(c => c.type === ComponentTypes.INPUT);
        const outputComponents = this.designer.components.filter(c => c.type === ComponentTypes.OUTPUT);

        if (inputComponents.length !== challenge.inputs.length) {
            this.showChallengeValidationResult(false, t('context.chipDesigner.modal.needInputs', { expected: challenge.inputs.length, found: inputComponents.length }));
            return;
        }

        if (outputComponents.length !== challenge.outputs.length) {
            this.showChallengeValidationResult(false, t('context.chipDesigner.modal.needOutputs', { expected: challenge.outputs.length, found: outputComponents.length }));
            return;
        }

        // Sort by placement order (id), not position
        inputComponents.sort((a, b) => a.id - b.id);
        outputComponents.sort((a, b) => a.id - b.id);

        let allPassed = true;
        let failedCount = 0;

        for (let i = 0; i < challenge.testCases.length; i++) {
            const tc = challenge.testCases[i];

            challenge.inputs.forEach((inputName, idx) => {
                inputComponents[idx].manualValue = tc.inputs[inputName];
            });

            this.designer.runSimulationStep();

            let casePassed = true;
            challenge.outputs.forEach((outputName, idx) => {
                const outputComp = outputComponents[idx];
                const expectedValue = tc.outputs[outputName];
                const actualValue = outputComp.inputs[0]?.value || false;

                if (actualValue !== expectedValue) {
                    casePassed = false;
                }
            });

            if (!casePassed) {
                allPassed = false;
                failedCount++;
            }
        }

        if (allPassed) {
            const nandCount = this.designer.components.filter(c => c.type === 'nand').length;
            this.showChallengeValidationResult(true, t('context.chipDesigner.modal.challengeComplete', { count: nandCount, bonus: '' }));

            // Save the solution
            this.saveSolution(challenge.id, true);

            // Only record for achievements if this is the first time completing this challenge
            const wasAlreadyCompleted = this.completedChallenges.has(challenge.id);
            this.completedChallenges.add(challenge.id);
            this.modal.querySelector(`#cd-challenge-list .chip-designer-req-item[data-challenge-id="${challenge.id}"]`)?.classList.add('completed');

            // Save to global storage (persists across all saves)
            this.saveGlobalUnlocks();

            // Record for achievements (only if first completion)
            if (!wasAlreadyCompleted && window.game && window.game.recordNandChallengeComplete) {
                window.game.recordNandChallengeComplete();
            }

            // Update bonus display and notify game
            this.updateBonusesDisplay();
            this.buildChallengesList();
            if (window.updateNandBonuses) {
                window.updateNandBonuses();
            }
        } else {
            this.showChallengeValidationResult(false, t('context.chipDesigner.modal.testsFailed', { failed: failedCount, total: challenge.testCases.length }));
        }

        this.designer.render();
    }

    showValidationResult(success, message) {
        const resultEl = this.modal.querySelector('#cd-floating-validation-result');
        if (resultEl) {
            resultEl.textContent = message;
            resultEl.className = 'chip-designer-validation-result ' + (success ? 'success' : 'failure');
        }
    }

    showChallengeValidationResult(success, message) {
        const resultEl = this.modal.querySelector('#cd-floating-validation-result');
        if (resultEl) {
            resultEl.textContent = message;
            resultEl.className = 'chip-designer-validation-result ' + (success ? 'success' : 'failure');
        }
    }

    // Show circuit stats and medal after successful validation
    showCircuitStats(stats, gateBudget, medal) {
        let statsSection = this.modal.querySelector('#cd-floating-stats-section');
        if (!statsSection) {
            // Create the stats section dynamically after the validate section
            const validateSection = this.modal.querySelector('#cd-floating-validate-section');
            if (!validateSection) return;
            statsSection = document.createElement('div');
            statsSection.className = 'chip-designer-floating-section';
            statsSection.id = 'cd-floating-stats-section';
            validateSection.parentNode.insertBefore(statsSection, validateSection.nextSibling);
        }

        // Gate type labels
        const gateNames = { and: 'AND', or: 'OR', not: 'NOT', xor: 'XOR', nand: 'NAND', nor: 'NOR', xnor: 'XNOR' };

        let gateBreakdown = Object.entries(stats.gateCounts)
            .map(([type, count]) => `<span style="color:${window.ChipComponentConfig?.[type]?.color || '#888'}">${gateNames[type] || type}: ${count}</span>`)
            .join(' &middot; ');

        let medalHTML = '';
        if (gateBudget) {
            const medals = ['gold', 'silver', 'bronze'];
            medalHTML = `<div class="cd-stats-budget" style="margin-top:6px;font-size:11px;color:#888;">
                ${medals.map(m => {
                    const active = medal === m;
                    const icon = this.getMedalIcon(m);
                    const color = active ? this.getMedalColor(m) : '#444';
                    return `<span style="color:${color};${active ? 'font-weight:600;' : 'opacity:0.5;'}">${icon} ${gateBudget[m]}</span>`;
                }).join(' &middot; ')}
            </div>`;
        }

        statsSection.style.display = 'block';
        statsSection.innerHTML = `
            <div class="chip-designer-floating-section-title">Circuit Stats</div>
            <div style="font-size:12px;color:#aab;">
                <div style="margin-bottom:4px;">
                    <span style="color:#60a5fa;font-weight:600;">${stats.totalGates}</span> gates &middot;
                    <span style="color:#fbbf24;font-weight:600;">${stats.wireCount}</span> wires
                </div>
                <div style="font-size:11px;color:#889;">${gateBreakdown}</div>
                ${medalHTML}
            </div>
        `;
    }

    hideCircuitStats() {
        const statsSection = this.modal.querySelector('#cd-floating-stats-section');
        if (statsSection) {
            statsSection.style.display = 'none';
        }
    }

    show() {
        // Store currently focused element for restoration on close
        this.previouslyFocused = document.activeElement;

        this.isVisible = true;
        this.modal.classList.add('visible');

        // Re-register full key handler if it was cleaned up by hide()
        if (!this.keyHandler) {
            this.registerKeyHandler();
        }

        if (window.game) {
            window.game.pauseGameForUI();
        }

        if (!this.designer) {
            this.initDesigner();
        } else {
            const container = this.modal.querySelector('.chip-designer-canvas-container');
            this.designer.resize(container.clientWidth, container.clientHeight);
            this.designer.render();
        }

        this.updateComponentAvailability();
        this.updateBlueprintPanelVisibility();
        this.updateAdvancedTabVisibility();

        // Show tutorial on first open
        if (!this.hasSeenTutorial()) {
            // Delay slightly to let the modal render first
            setTimeout(() => {
                this.showTutorial();
                this.markTutorialSeen();
            }, 300);
        }
    }

    // Check if user has seen the tutorial
    hasSeenTutorial() {
        try {
            return localStorage.getItem('circuitDesigner_tutorialSeen') === 'true';
        } catch (e) {
            return false;
        }
    }

    // Mark tutorial as seen
    markTutorialSeen() {
        try {
            localStorage.setItem('circuitDesigner_tutorialSeen', 'true');
        } catch (e) {
            // Ignore storage errors
        }
    }

    hide() {
        this.isVisible = false;
        this.modal.classList.remove('visible');

        // Stop designer animations while hidden to save CPU
        if (this.designer) {
            this.designer.stopAnimation();
        }

        // Clean up key handler to prevent memory leak
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }

        // Clean up resize handler to prevent memory leak
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
        }

        // Restore focus to previously focused element
        if (this.previouslyFocused) {
            this.previouslyFocused.focus();
            this.previouslyFocused = null;
        }

        if (window.game) {
            window.game.resumeGameFromUI();
        }
    }

    // Get all completed firmware designs (puzzle solved = design unlocked)
    // Only returns requirement puzzles - NAND challenges are a separate mechanic
    getAllCompletedDesigns() {
        const designs = [];
        for (const reqId of this.completedRequirements) {
            const req = window.getChipRequirementById?.(reqId);
            if (req) {
                const bonusPercent = Math.round(req.value * 100);
                designs.push({
                    id: req.id,
                    name: req.name,
                    bonus: { type: 'chipValue', value: bonusPercent },
                    productionTier: req.productionTier,
                    tier: req.tier,
                    type: 'requirement'
                });
            }
        }
        return designs;
    }

    // All completed firmware designs are always available (no equip slots)
    getUnlockedDesigns() {
        return this.getAllCompletedDesigns();
    }

    getDesignsForProductionTier(productionTier) {
        return this.getUnlockedDesigns().filter(d => d.productionTier === productionTier);
    }

    getActiveBonuses() {
        const bonuses = {};

        for (const challengeId of this.completedChallenges) {
            // Check NAND challenges
            let challenge = window.NandChallenges?.find(c => c.id === challengeId);

            // Check advanced challenges if not found in NAND
            if (!challenge && window.AdvancedChallenges) {
                challenge = window.AdvancedChallenges.getAll().find(c => c.id === challengeId);
            }

            if (challenge?.bonus) {
                const type = challenge.bonus.type;
                if (!bonuses[type]) {
                    bonuses[type] = 0;
                }
                bonuses[type] += challenge.bonus.value;
            }
        }

        // Add roulette stacking bonus
        if (window.RouletteEngine) {
            const rouletteBonus = window.RouletteEngine.getRouletteBonus();
            if (rouletteBonus > 0) {
                bonuses.allSpeed = (bonuses.allSpeed || 0) + rouletteBonus;
            }
        }

        return bonuses;
    }

    getBonusMultiplier(bonusType) {
        const bonuses = this.getActiveBonuses();
        return (bonuses[bonusType] || 0) / 100;
    }

    serialize() {
        // Only save requirements per-save; challenges are stored globally
        return {
            completedRequirements: Array.from(this.completedRequirements)
            // Note: completedChallenges are now stored globally via localStorage
        };
    }

    deserialize(data) {
        if (!data) return;

        if (data.completedRequirements && Array.isArray(data.completedRequirements)) {
            this.completedRequirements = new Set(data.completedRequirements);
        }

        // Load global challenges (always load from global storage)
        this.loadGlobalUnlocks();

        // Migrate any old per-save challenges to global storage
        if (data.completedChallenges && Array.isArray(data.completedChallenges)) {
            let migrated = false;
            for (const challengeId of data.completedChallenges) {
                if (!this.completedChallenges.has(challengeId)) {
                    this.completedChallenges.add(challengeId);
                    migrated = true;
                }
            }
            if (migrated) {
                this.saveGlobalUnlocks();
            }
        }

        // Migrate per-save requirements to global storage (for saves before global persistence)
        if (data.completedRequirements && Array.isArray(data.completedRequirements) && data.completedRequirements.length > 0) {
            this.saveGlobalUnlocks();
        }

        if (this.modal) {
            this.buildRequirementsList();
            this.buildChallengesList();
        }

        if (window.updateNandBonuses) {
            window.updateNandBonuses();
        }
    }

    // --- Blueprint panel methods ---

    setupBlueprintEvents() {
        const saveBtn = this.modal.querySelector('#cd-blueprint-save-btn');
        const nameInput = this.modal.querySelector('#cd-blueprint-name');
        if (!saveBtn || !nameInput) return;

        saveBtn.addEventListener('click', () => this.saveBlueprint());
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.saveBlueprint();
            e.stopPropagation(); // Prevent tool shortcuts while typing
        });

        // Make blueprint panel draggable
        const panel = this.modal.querySelector('#cd-float-blueprints');
        if (panel) this.setupFloatWindowDrag(panel);
    }

    updateBlueprintPanelVisibility() {
        const panel = this.modal.querySelector('#cd-float-blueprints');
        if (!panel) return;
        if (!this.blueprintManager) {
            this.blueprintManager = window.CircuitBlueprintManager ? new window.CircuitBlueprintManager() : null;
        }
        if (this.blueprintManager && this.blueprintManager.isUnlocked()) {
            panel.style.display = '';
            panel.classList.add('visible');
            this.refreshBlueprintList();
        } else {
            panel.style.display = 'none';
        }
    }

    updateAdvancedTabVisibility() {
        const advancedTabBtn = this.modal.querySelector('.chip-designer-tab.advanced');
        if (!advancedTabBtn) return;

        // Show advanced tab only if at least one category is unlocked
        if (window.AdvancedTab && window.AdvancedTab.isAnyUnlocked()) {
            advancedTabBtn.style.display = 'flex';
        } else {
            advancedTabBtn.style.display = 'none';
            // If currently on advanced tab and it becomes locked, switch to requirements
            if (this.activeTab === 'advanced') {
                this.switchTab('requirements');
            }
        }
    }

    updateBlueprintSaveButton() {
        const saveBtn = this.modal.querySelector('#cd-blueprint-save-btn');
        const errorEl = this.modal.querySelector('#cd-blueprint-error');
        if (!saveBtn || !this.designer || !this.blueprintManager) return;

        const selCount = this.designer.selectedComponents.size;
        const gateCount = this.designer.getSelectedGateCount();
        const maxGates = this.blueprintManager.getMaxGatesPerBlueprint();
        const maxBp = this.blueprintManager.getMaxBlueprints();
        const currentBp = this.blueprintManager.getAll().length;

        if (selCount === 0) {
            saveBtn.disabled = true;
            if (errorEl) { errorEl.style.display = 'none'; }
            return;
        }

        if (currentBp >= maxBp) {
            saveBtn.disabled = true;
            if (errorEl) {
                errorEl.textContent = t('context.chipDesigner.modal.blueprintLimitReached');
                errorEl.style.display = 'block';
            }
            return;
        }

        if (gateCount > maxGates) {
            saveBtn.disabled = true;
            if (errorEl) {
                errorEl.textContent = t('context.chipDesigner.modal.blueprintTooManyGates').replace('{max}', maxGates);
                errorEl.style.display = 'block';
            }
            return;
        }

        saveBtn.disabled = false;
        if (errorEl) { errorEl.style.display = 'none'; }
    }

    saveBlueprint() {
        if (!this.designer || !this.blueprintManager) return;
        const nameInput = this.modal.querySelector('#cd-blueprint-name');
        const name = nameInput ? nameInput.value.trim() : 'Blueprint';
        const components = Array.from(this.designer.selectedComponents);
        const wires = this.designer.getSelectedWires();

        const bp = this.blueprintManager.save(name, components, wires);
        if (bp) {
            if (nameInput) nameInput.value = '';
            this.designer.clearSelection();
            this.refreshBlueprintList();
        }
    }

    refreshBlueprintList() {
        const listEl = this.modal.querySelector('#cd-blueprint-list');
        const countEl = this.modal.querySelector('#cd-blueprint-count');
        if (!listEl || !this.blueprintManager) return;

        const blueprints = this.blueprintManager.getAll();
        const max = this.blueprintManager.getMaxBlueprints();
        if (countEl) countEl.textContent = `${blueprints.length}/${max}`;

        if (blueprints.length === 0) {
            listEl.innerHTML = `<div class="cd-blueprint-list-empty">${t('context.chipDesigner.modal.blueprintEmpty')}</div>`;
            return;
        }

        listEl.innerHTML = blueprints.map(bp => `
            <div class="cd-blueprint-entry" data-bp-id="${bp.id}">
                <span class="cd-blueprint-entry-name" title="${bp.name}">${bp.name}</span>
                <span class="cd-blueprint-entry-gates">${bp.gateCount}g</span>
                <button class="cd-blueprint-entry-btn place" title="${t('context.chipDesigner.modal.blueprintPlace')}">${t('context.chipDesigner.modal.blueprintPlace')}</button>
                <button class="cd-blueprint-entry-btn delete" title="${t('context.chipDesigner.modal.blueprintDelete')}">✕</button>
            </div>
        `).join('');

        // Attach click handlers
        listEl.querySelectorAll('.cd-blueprint-entry-btn.place').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.cd-blueprint-entry').dataset.bpId;
                this.startBlueprintPlace(id);
            });
        });
        listEl.querySelectorAll('.cd-blueprint-entry-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.cd-blueprint-entry').dataset.bpId;
                this.blueprintManager.delete(id);
                this.refreshBlueprintList();
                this.updateBlueprintSaveButton();
            });
        });
    }

    startBlueprintPlace(blueprintId) {
        if (!this.designer || !this.blueprintManager) return;
        const bp = this.blueprintManager.get(blueprintId);
        if (!bp) return;

        this.designer.blueprintToPlace = bp;
        this.designer.currentTool = 'blueprint';
        this.designer.clearSelection();
        this.designer.render();
        this.updateToolButtonState('select'); // Visually deselect tools
    }
}

window.ChipDesignerModal = ChipDesignerModal;
