// Chip Designer Core - Bundled version for main game integration
// Contains Grid, Component, Wire, and ChipDesigner classes

// Component type definitions
const ChipComponentTypes = {
    INPUT: 'input',
    OUTPUT: 'output',
    AND: 'and',
    OR: 'or',
    NOT: 'not',
    XOR: 'xor',
    NAND: 'nand',
    NOR: 'nor',
    XNOR: 'xnor',
    THRESHOLD: 'threshold',
    AVERAGE: 'average'
};

// Component configuration
const ChipComponentConfig = {
    [ChipComponentTypes.INPUT]: {
        name: 'Input', width: 3, height: 1,
        inputs: [],
        outputs: [{ x: 2, y: 0, side: 'right' }],
        color: '#4ade80'
    },
    [ChipComponentTypes.OUTPUT]: {
        name: 'Output', width: 3, height: 1,
        inputs: [{ x: 0, y: 0, side: 'left' }],
        outputs: [],
        color: '#f472b6'
    },
    [ChipComponentTypes.AND]: {
        name: 'AND', width: 3, height: 2,
        inputs: [{ x: 0, y: 0, side: 'left' }, { x: 0, y: 1, side: 'left' }],
        outputs: [{ x: 2, y: 0.5, side: 'right' }],
        color: '#60a5fa'
    },
    [ChipComponentTypes.OR]: {
        name: 'OR', width: 3, height: 2,
        inputs: [{ x: 0, y: 0, side: 'left' }, { x: 0, y: 1, side: 'left' }],
        outputs: [{ x: 2, y: 0.5, side: 'right' }],
        color: '#fbbf24'
    },
    [ChipComponentTypes.NOT]: {
        name: 'NOT', width: 2, height: 1,
        inputs: [{ x: 0, y: 0, side: 'left' }],
        outputs: [{ x: 1, y: 0, side: 'right' }],
        color: '#a78bfa'
    },
    [ChipComponentTypes.XOR]: {
        name: 'XOR', width: 3, height: 2,
        inputs: [{ x: 0, y: 0, side: 'left' }, { x: 0, y: 1, side: 'left' }],
        outputs: [{ x: 2, y: 0.5, side: 'right' }],
        color: '#2dd4bf'
    },
    [ChipComponentTypes.NAND]: {
        name: 'NAND', width: 3, height: 2,
        inputs: [{ x: 0, y: 0, side: 'left' }, { x: 0, y: 1, side: 'left' }],
        outputs: [{ x: 2, y: 0.5, side: 'right' }],
        color: '#f87171'
    },
    [ChipComponentTypes.NOR]: {
        name: 'NOR', width: 3, height: 2,
        inputs: [{ x: 0, y: 0, side: 'left' }, { x: 0, y: 1, side: 'left' }],
        outputs: [{ x: 2, y: 0.5, side: 'right' }],
        color: '#fb923c'
    },
    [ChipComponentTypes.XNOR]: {
        name: 'XNOR', width: 3, height: 2,
        inputs: [{ x: 0, y: 0, side: 'left' }, { x: 0, y: 1, side: 'left' }],
        outputs: [{ x: 2, y: 0.5, side: 'right' }],
        color: '#34d399'
    },
    [ChipComponentTypes.THRESHOLD]: {
        name: 'THR', width: 2, height: 1,
        inputs: [{ x: 0, y: 0, side: 'left' }],
        outputs: [{ x: 1, y: 0, side: 'right' }],
        color: '#f59e0b'
    },
    [ChipComponentTypes.AVERAGE]: {
        name: 'AVG', width: 3, height: 2,
        inputs: [{ x: 0, y: 0, side: 'left' }, { x: 0, y: 1, side: 'left' }],
        outputs: [{ x: 2, y: 0.5, side: 'right' }],
        color: '#8b5cf6'
    }
};

// Grid system
class ChipGrid {
    constructor(canvas, cellSize = 20) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = cellSize;
        this.offsetX = 0;
        this.offsetY = 0;
        this.zoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 2.0;
        this.baseWidth = 1000;
        this.baseHeight = 1000;
        this.expandedWidth = 1000;
        this.expandedHeight = 1000;
        this.transcendentWidth = 1000;
        this.transcendentHeight = 1000;
        this.width = 1000;
        this.height = 1000;
        this.backgroundColor = '#1a1a2e';
        this.gridColor = '#2a2a4e';
        this.gridMajorColor = '#3a3a5e';
        this.borderColor = '#4a9eff';

        // Pan state
        this.panOffsetX = 0;
        this.panOffsetY = 0;

        // Grid cache for performance
        this.gridCache = null;
        this.lastCacheZoom = null;
        this.lastCacheWidth = null;
        this.lastCacheHeight = null;
    }

    // Check if expanded firmware research is unlocked
    checkExpandedResearch() {
        const researchManager = window.game?.researchManager;
        const voidShop = window.voidShop;

        // Check void upgrade first (highest tier)
        if (voidShop && voidShop.hasTranscendentWorkboard()) {
            this.width = this.transcendentWidth;
            this.height = this.transcendentHeight;
        } else if (researchManager && researchManager.isUnlocked('expanded_firmware')) {
            this.width = this.expandedWidth;
            this.height = this.expandedHeight;
        } else {
            this.width = this.baseWidth;
            this.height = this.baseHeight;
        }
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.checkExpandedResearch();
        this.recenterGrid();
    }

    recenterGrid() {
        const gridPixelWidth = this.width * this.cellSize * this.zoom;
        const gridPixelHeight = this.height * this.cellSize * this.zoom;
        this.offsetX = (this.canvas.width - gridPixelWidth) / 2 + this.panOffsetX;
        this.offsetY = (this.canvas.height - gridPixelHeight) / 2 + this.panOffsetY;
    }

    setZoom(newZoom, pivotX, pivotY) {
        const oldZoom = this.zoom;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));

        // Adjust pan to zoom toward pivot point
        if (pivotX !== undefined && pivotY !== undefined) {
            const zoomRatio = this.zoom / oldZoom;
            const dx = pivotX - this.canvas.width / 2;
            const dy = pivotY - this.canvas.height / 2;
            this.panOffsetX = this.panOffsetX * zoomRatio - dx * (zoomRatio - 1);
            this.panOffsetY = this.panOffsetY * zoomRatio - dy * (zoomRatio - 1);
        }

        this.recenterGrid();
    }

    pan(deltaX, deltaY) {
        this.panOffsetX += deltaX;
        this.panOffsetY += deltaY;
        this.recenterGrid();
    }

    resetView() {
        this.zoom = 1;
        this.panOffsetX = 0;
        this.panOffsetY = 0;
        this.recenterGrid();
    }

    screenToGrid(screenX, screenY) {
        const gridX = Math.floor((screenX - this.offsetX) / (this.cellSize * this.zoom));
        const gridY = Math.floor((screenY - this.offsetY) / (this.cellSize * this.zoom));
        return { x: gridX, y: gridY };
    }

    // Get precise grid position (not floored) for accurate pin detection
    screenToGridPrecise(screenX, screenY) {
        const gridX = (screenX - this.offsetX) / (this.cellSize * this.zoom);
        const gridY = (screenY - this.offsetY) / (this.cellSize * this.zoom);
        return { x: gridX, y: gridY };
    }

    gridToScreen(gridX, gridY) {
        return {
            x: this.offsetX + gridX * this.cellSize * this.zoom,
            y: this.offsetY + gridY * this.cellSize * this.zoom
        };
    }

    isValidPosition(gridX, gridY) {
        return true; // Infinite grid - no bounds
    }

    render() {
        const ctx = this.ctx;
        const cellSize = this.cellSize * this.zoom;

        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const gridStartX = this.offsetX;
        const gridStartY = this.offsetY;
        const gridPixelWidth = this.width * cellSize;
        const gridPixelHeight = this.height * cellSize;

        // Check if we need to regenerate grid cache
        const needsCache = !this.gridCache ||
                          this.lastCacheZoom !== this.zoom ||
                          this.lastCacheWidth !== this.width ||
                          this.lastCacheHeight !== this.height;

        if (needsCache) {
            // Create offscreen canvas for grid (draw once, reuse many times)
            this.gridCache = document.createElement('canvas');
            this.gridCache.width = gridPixelWidth;
            this.gridCache.height = gridPixelHeight;
            const cacheCtx = this.gridCache.getContext('2d');

            // Draw grid background
            cacheCtx.fillStyle = '#1e1e38';
            cacheCtx.fillRect(0, 0, gridPixelWidth, gridPixelHeight);

            // Draw minor grid lines (batched)
            cacheCtx.beginPath();
            cacheCtx.strokeStyle = this.gridColor;
            cacheCtx.lineWidth = 0.5;
            for (let x = 0; x <= this.width; x++) {
                if (x % 5 !== 0) {
                    const screenX = x * cellSize;
                    cacheCtx.moveTo(screenX, 0);
                    cacheCtx.lineTo(screenX, gridPixelHeight);
                }
            }
            for (let y = 0; y <= this.height; y++) {
                if (y % 5 !== 0) {
                    const screenY = y * cellSize;
                    cacheCtx.moveTo(0, screenY);
                    cacheCtx.lineTo(gridPixelWidth, screenY);
                }
            }
            cacheCtx.stroke();

            // Draw major grid lines to cache (batched)
            cacheCtx.beginPath();
            cacheCtx.strokeStyle = this.gridMajorColor;
            cacheCtx.lineWidth = 1;
            for (let x = 0; x <= this.width; x += 5) {
                const screenX = x * cellSize;
                cacheCtx.moveTo(screenX, 0);
                cacheCtx.lineTo(screenX, gridPixelHeight);
            }
            for (let y = 0; y <= this.height; y += 5) {
                const screenY = y * cellSize;
                cacheCtx.moveTo(0, screenY);
                cacheCtx.lineTo(gridPixelWidth, screenY);
            }
            cacheCtx.stroke();

            // Draw border to cache
            cacheCtx.strokeStyle = this.borderColor;
            cacheCtx.lineWidth = 2;
            cacheCtx.strokeRect(0, 0, gridPixelWidth, gridPixelHeight);

            // Save cache state
            this.lastCacheZoom = this.zoom;
            this.lastCacheWidth = this.width;
            this.lastCacheHeight = this.height;
        }

        // Draw cached grid (single drawImage call instead of hundreds of line draws)
        ctx.drawImage(this.gridCache, gridStartX, gridStartY);
    }

    highlightCell(gridX, gridY, color = 'rgba(74, 158, 255, 0.3)') {
        if (!this.isValidPosition(gridX, gridY)) return;
        const pos = this.gridToScreen(gridX, gridY);
        const cellSize = this.cellSize * this.zoom;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pos.x, pos.y, cellSize, cellSize);
    }
}

// Component class
class ChipComponent {
    constructor(type, gridX, gridY) {
        this.id = ChipComponent.nextId++;
        this.type = type;
        this.gridX = gridX;
        this.gridY = gridY;

        const config = ChipComponentConfig[type];
        this.width = config.width;
        this.height = config.height;
        this.color = config.color;
        this.name = config.name;

        this.inputs = config.inputs.map((pin, i) => ({
            ...pin, index: i, value: false, connected: false
        }));
        this.outputs = config.outputs.map((pin, i) => ({
            ...pin, index: i, value: false, connected: false
        }));

        this.manualValue = false;
        this.label = null;
    }

    static nextId = 1;

    occupiesCell(gridX, gridY) {
        return gridX >= this.gridX && gridX < this.gridX + this.width &&
               gridY >= this.gridY && gridY < this.gridY + this.height;
    }

    getPinPosition(isOutput, pinIndex) {
        const pins = isOutput ? this.outputs : this.inputs;
        const pin = pins[pinIndex];
        if (!pin) return null;
        return { x: this.gridX + pin.x, y: this.gridY + pin.y };
    }

    evaluate() {
        switch (this.type) {
            case ChipComponentTypes.INPUT:
                this.outputs[0].value = this.manualValue;
                break;
            case ChipComponentTypes.OUTPUT:
                break;
            case ChipComponentTypes.AND:
                this.outputs[0].value = this.inputs[0].value && this.inputs[1].value;
                break;
            case ChipComponentTypes.OR:
                this.outputs[0].value = this.inputs[0].value || this.inputs[1].value;
                break;
            case ChipComponentTypes.NOT:
                this.outputs[0].value = !this.inputs[0].value;
                break;
            case ChipComponentTypes.XOR:
                this.outputs[0].value = this.inputs[0].value !== this.inputs[1].value;
                break;
            case ChipComponentTypes.NAND:
                this.outputs[0].value = !(this.inputs[0].value && this.inputs[1].value);
                break;
            case ChipComponentTypes.NOR:
                this.outputs[0].value = !(this.inputs[0].value || this.inputs[1].value);
                break;
            case ChipComponentTypes.XNOR:
                this.outputs[0].value = this.inputs[0].value === this.inputs[1].value;
                break;
            case ChipComponentTypes.THRESHOLD:
                this.outputs[0].value = this.inputs[0].value; // passthrough in boolean mode
                break;
            case ChipComponentTypes.AVERAGE:
                this.outputs[0].value = this.inputs[0].value && this.inputs[1].value; // AND in boolean mode
                break;
        }
    }

    render(ctx, grid, isSelected = false, isSimulating = false, animTime = 0) {
        ChipGateShapes.drawGateShape(ctx, this, grid, isSelected, isSimulating, animTime);
    }

    darkenColor(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.floor(r * 0.3)}, ${Math.floor(g * 0.3)}, ${Math.floor(b * 0.3)})`;
    }

    lightenColor(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.5)}, ${Math.floor(b * 0.5)})`;
    }
}

// Wire class
class ChipWire {
    constructor(fromComponent, fromPinIndex, toComponent, toPinIndex) {
        this.id = ChipWire.nextId++;
        this.fromComponent = fromComponent;
        this.fromPinIndex = fromPinIndex;
        this.toComponent = toComponent;
        this.toPinIndex = toPinIndex;
        this.path = [];
        this.value = false;
        this.analogValue = 0; // Continuous 0-1 value set by analog simulation
        this.pulsePhase = Math.random() * Math.PI * 2; // Random start phase for visual variety
        this.pathLength = 0; // Total path length for pulse animation
    }

    static nextId = 1;

    // Get the start/end points for this wire's pins
    getEndpoints() {
        const fromPin = this.fromComponent.outputs[this.fromPinIndex];
        const toPin = this.toComponent.inputs[this.toPinIndex];
        if (!fromPin || !toPin) return null;
        return {
            startX: this.fromComponent.gridX + fromPin.x + 1,
            startY: this.fromComponent.gridY + fromPin.y + 0.5,
            endX: this.toComponent.gridX + toPin.x,
            endY: this.toComponent.gridY + toPin.y + 0.5
        };
    }

    // Build path using a given vertical channel X position
    buildPath(channelX) {
        const ep = this.getEndpoints();
        if (!ep) return;
        const { startX, startY, endX, endY } = ep;

        // If start and end share same Y, use a direct 2-point path
        if (Math.abs(startY - endY) < 0.01) {
            this.path = [{ x: startX, y: startY }, { x: endX, y: endY }];
        } else {
            this.path = [
                { x: startX, y: startY },
                { x: channelX, y: startY },
                { x: channelX, y: endY },
                { x: endX, y: endY }
            ];
        }

        this._updatePathLength();
    }

    // Fallback: simple midpoint routing (used when no wire manager context)
    calculatePath() {
        const ep = this.getEndpoints();
        if (!ep) return;
        this.buildPath((ep.startX + ep.endX) / 2);
    }

    _updatePathLength() {
        this.pathLength = 0;
        for (let i = 0; i < this.path.length - 1; i++) {
            const dx = this.path[i + 1].x - this.path[i].x;
            const dy = this.path[i + 1].y - this.path[i].y;
            this.pathLength += Math.sqrt(dx * dx + dy * dy);
        }
    }

    updateValue() {
        const fromPin = this.fromComponent.outputs[this.fromPinIndex];
        if (fromPin) {
            this.value = fromPin.value;
            const toPin = this.toComponent.inputs[this.toPinIndex];
            if (toPin) {
                toPin.value = this.value;
            }
        }
    }

    render(ctx, grid, isSelected = false, animTime = 0, analogRenderMode = false) {
        if (analogRenderMode) return this.renderAnalog(ctx, grid, isSelected, animTime);
        if (this.path.length < 2) return;
        const cellSize = grid.cellSize * grid.zoom;

        // Base wire color
        ctx.strokeStyle = this.value ? '#4ade80' : '#555';
        ctx.lineWidth = isSelected ? 4 : 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw base wire
        ctx.beginPath();
        for (let i = 0; i < this.path.length; i++) {
            const point = this.path[i];
            const screenPos = {
                x: grid.offsetX + point.x * cellSize,
                y: grid.offsetY + point.y * cellSize
            };
            if (i === 0) {
                ctx.moveTo(screenPos.x, screenPos.y);
            } else {
                ctx.lineTo(screenPos.x, screenPos.y);
            }
        }
        ctx.stroke();

        // Draw glow for active wires
        if (this.value) {
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.25)';
            ctx.lineWidth = 8;
            ctx.stroke();
        }

        // Draw animated pulse dots for active wires (optimized - no gradients)
        if (this.value && this.pathLength > 0) {
            const pulseSpeed = 3; // Grid units per second
            const pulseSpacing = 2.5; // Grid units between pulses
            const numPulses = Math.max(2, Math.ceil(this.pathLength / pulseSpacing));

            // Batch all pulse outer circles
            ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
            ctx.beginPath();
            for (let p = 0; p < numPulses; p++) {
                const pulseOffset = (animTime * pulseSpeed + this.pulsePhase + p * pulseSpacing) % this.pathLength;
                const pulsePos = this.getPointAlongPath(pulseOffset, cellSize, grid);
                if (pulsePos) {
                    ctx.moveTo(pulsePos.x + 6, pulsePos.y);
                    ctx.arc(pulsePos.x, pulsePos.y, 6, 0, Math.PI * 2);
                }
            }
            ctx.fill();

            // Batch all pulse inner circles
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            for (let p = 0; p < numPulses; p++) {
                const pulseOffset = (animTime * pulseSpeed + this.pulsePhase + p * pulseSpacing) % this.pathLength;
                const pulsePos = this.getPointAlongPath(pulseOffset, cellSize, grid);
                if (pulsePos) {
                    ctx.moveTo(pulsePos.x + 3, pulsePos.y);
                    ctx.arc(pulsePos.x, pulsePos.y, 3, 0, Math.PI * 2);
                }
            }
            ctx.fill();
        }

        if (isSelected) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            for (let i = 0; i < this.path.length; i++) {
                const point = this.path[i];
                const screenPos = {
                    x: grid.offsetX + point.x * cellSize,
                    y: grid.offsetY + point.y * cellSize
                };
                if (i === 0) {
                    ctx.moveTo(screenPos.x, screenPos.y);
                } else {
                    ctx.lineTo(screenPos.x, screenPos.y);
                }
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    // Analog mode: draw a sine wave traveling along the wire path
    // Color shifts grey (0) -> cyan (1) and amplitude scales with analogValue
    renderAnalog(ctx, grid, isSelected, animTime) {
        if (this.path.length < 2) return;
        const cellSize = grid.cellSize * grid.zoom;
        const v = this.analogValue ?? 0;

        // Color: #555 (grey) -> #22d3ee (cyan)
        const r = Math.round(85 + (34 - 85) * v);
        const g = Math.round(85 + (211 - 85) * v);
        const b = Math.round(85 + (238 - 85) * v);

        // Thin centerline guide
        ctx.strokeStyle = `rgba(${r},${g},${b},0.3)`;
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i < this.path.length; i++) {
            const p = this.path[i];
            const sx = grid.offsetX + p.x * cellSize;
            const sy = grid.offsetY + p.y * cellSize;
            if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Sine wave params
        const amplitudePx = v * 5; // 0 at v=0, 5px at v=1
        const freqPerUnit = 0.5;   // wave cycles per grid unit
        const waveSpeed = 2.5;     // grid units per second travel speed
        const phase = animTime * waveSpeed * freqPerUnit * Math.PI * 2;

        if (amplitudePx > 0.3) {
            // Soft glow pass
            ctx.strokeStyle = `rgba(34,211,238,${v * 0.2})`;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            this._drawWavePath(ctx, grid, cellSize, freqPerUnit, amplitudePx * 1.3, phase);

            // Main wave stroke
            ctx.strokeStyle = `rgb(${r},${g},${b})`;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            this._drawWavePath(ctx, grid, cellSize, freqPerUnit, amplitudePx, phase);
        }

        if (isSelected) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            for (let i = 0; i < this.path.length; i++) {
                const p = this.path[i];
                const sx = grid.offsetX + p.x * cellSize;
                const sy = grid.offsetY + p.y * cellSize;
                if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    // Trace the wire path as a sine wave, sampling every ~4 screen pixels
    _drawWavePath(ctx, grid, cellSize, freqPerUnit, amplitudePx, phaseOffset) {
        ctx.beginPath();
        let totalDist = 0;
        let started = false;
        const STEP_PX = 4;

        for (let i = 0; i < this.path.length - 1; i++) {
            const p1 = this.path[i];
            const p2 = this.path[i + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const segWorld = Math.sqrt(dx * dx + dy * dy);
            if (segWorld < 0.001) continue;

            const segPx = segWorld * cellSize;
            const ux = dx / segWorld; // unit along segment
            const uy = dy / segWorld;
            const perpX = -uy; // perpendicular (for wave offset)
            const perpY = ux;

            const steps = Math.max(2, Math.ceil(segPx / STEP_PX));
            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                const dist = totalDist + t * segWorld;
                const wave = Math.sin(dist * freqPerUnit * Math.PI * 2 - phaseOffset) * amplitudePx;
                const cx = grid.offsetX + (p1.x + ux * t * segWorld) * cellSize + perpX * wave;
                const cy = grid.offsetY + (p1.y + uy * t * segWorld) * cellSize + perpY * wave;
                if (!started) { ctx.moveTo(cx, cy); started = true; }
                else ctx.lineTo(cx, cy);
            }
            totalDist += segWorld;
        }
        ctx.stroke();
    }

    // Get screen position at a distance along the wire path
    getPointAlongPath(distance, cellSize, grid) {
        let traveled = 0;
        for (let i = 0; i < this.path.length - 1; i++) {
            const p1 = this.path[i];
            const p2 = this.path[i + 1];
            const segmentLength = Math.sqrt(
                Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
            );

            if (traveled + segmentLength >= distance) {
                const t = (distance - traveled) / segmentLength;
                const x = p1.x + (p2.x - p1.x) * t;
                const y = p1.y + (p2.y - p1.y) * t;
                return {
                    x: grid.offsetX + x * cellSize,
                    y: grid.offsetY + y * cellSize
                };
            }
            traveled += segmentLength;
        }
        return null;
    }
}

// Wire Manager
class ChipWireManager {
    constructor() {
        this.wires = [];
    }

    addWire(fromComponent, fromPinIndex, toComponent, toPinIndex) {
        const existing = this.wires.find(w =>
            w.fromComponent === fromComponent && w.fromPinIndex === fromPinIndex &&
            w.toComponent === toComponent && w.toPinIndex === toPinIndex
        );
        if (existing) return null;

        const inputConnected = this.wires.find(w =>
            w.toComponent === toComponent && w.toPinIndex === toPinIndex
        );
        if (inputConnected) {
            this.removeWire(inputConnected);
        }

        const wire = new ChipWire(fromComponent, fromPinIndex, toComponent, toPinIndex);

        fromComponent.outputs[fromPinIndex].connected = true;
        toComponent.inputs[toPinIndex].connected = true;

        this.wires.push(wire);
        this.routeAllWires(); // re-route all to avoid overlaps
        return wire;
    }

    removeWire(wire) {
        const index = this.wires.indexOf(wire);
        if (index >= 0) {
            wire.fromComponent.outputs[wire.fromPinIndex].connected = false;
            wire.toComponent.inputs[wire.toPinIndex].connected = false;
            this.wires.splice(index, 1);
        }
    }

    removeWiresForComponent(component) {
        const toRemove = this.wires.filter(w =>
            w.fromComponent === component || w.toComponent === component
        );
        for (const wire of toRemove) {
            this.removeWire(wire);
        }
    }

    findWireAt(screenX, screenY, grid) {
        const cellSize = grid.cellSize * grid.zoom;
        for (const wire of this.wires) {
            for (let i = 0; i < wire.path.length - 1; i++) {
                const p1 = wire.path[i];
                const p2 = wire.path[i + 1];
                const x1 = grid.offsetX + p1.x * cellSize;
                const y1 = grid.offsetY + p1.y * cellSize;
                const x2 = grid.offsetX + p2.x * cellSize;
                const y2 = grid.offsetY + p2.y * cellSize;
                const dist = this.pointToSegmentDistance(screenX, screenY, x1, y1, x2, y2);
                if (dist < 10) return wire;
            }
        }
        return null;
    }

    pointToSegmentDistance(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const nearX = x1 + t * dx;
        const nearY = y1 + t * dy;
        return Math.hypot(px - nearX, py - nearY);
    }

    // Route all wires with overlap avoidance on vertical channels.
    // Each wire gets a unique vertical channel X so parallel wires don't stack.
    routeAllWires() {
        const CHANNEL_SPACING = 0.5; // grid units between parallel channels
        const usedChannels = []; // { x, minY, maxY } segments already claimed

        for (const wire of this.wires) {
            const ep = wire.getEndpoints();
            if (!ep) { wire.calculatePath(); continue; }

            const { startX, startY, endX, endY } = ep;
            const naturalMid = (startX + endX) / 2;
            const minY = Math.min(startY, endY);
            const maxY = Math.max(startY, endY);

            // Straight horizontal wire — no vertical channel needed
            if (Math.abs(startY - endY) < 0.01) {
                wire.buildPath(naturalMid);
                continue;
            }

            // Find a channel X that doesn't overlap vertically with existing ones
            let channelX = naturalMid;
            let offset = 0;
            let settled = false;
            for (let attempt = 0; attempt < 20; attempt++) {
                const candidate = naturalMid + offset;
                const overlaps = usedChannels.some(ch =>
                    Math.abs(ch.x - candidate) < CHANNEL_SPACING &&
                    ch.minY < maxY && ch.maxY > minY
                );
                if (!overlaps) {
                    channelX = candidate;
                    settled = true;
                    break;
                }
                // Alternate positive/negative offsets: +0.5, -0.5, +1.0, -1.0, ...
                if (offset <= 0) {
                    offset = -offset + CHANNEL_SPACING;
                } else {
                    offset = -offset;
                }
            }
            if (!settled) channelX = naturalMid + offset;

            // Clamp channel between start and end (with small margin) to avoid backtracking
            const lo = Math.min(startX, endX) + 0.5;
            const hi = Math.max(startX, endX) - 0.5;
            if (hi > lo) {
                channelX = Math.max(lo, Math.min(hi, channelX));
            }

            usedChannels.push({ x: channelX, minY, maxY });
            wire.buildPath(channelX);
        }
    }

    propagateSignals() {
        for (const wire of this.wires) {
            wire.updateValue();
        }
    }

    render(ctx, grid, selectedWire = null, animTime = 0, analogRenderMode = false) {
        for (const wire of this.wires) {
            wire.render(ctx, grid, wire === selectedWire, animTime, analogRenderMode);
        }
    }

    clear() {
        this.wires = [];
    }
}

// Main ChipDesigner controller
class ChipDesignerCore {
    constructor(canvas) {
        this.canvas = canvas;
        this.grid = new ChipGrid(canvas);
        this.wireManager = new ChipWireManager();
        this.components = [];
        this.selectedComponent = null;
        this.selectedWire = null;
        this.currentTool = 'select';
        this.componentToPlace = null;
        this.wireStartComponent = null;
        this.wireStartPinIndex = null;
        this.wireStartIsOutput = false;
        this.wirePreviewEnd = null;
        this.mouseGridPos = { x: 0, y: 0 };
        this.mouseScreenPos = { x: 0, y: 0 };
        this.isSimulating = false;
        this.simulationInterval = null;
        this.activeRequirement = null;

        // Animation state
        this.animTime = 0;
        this.lastFrameTime = 0;
        this.animationRunning = false;
        this.hoveredPin = null; // Track which pin is being hovered

        // Pan state
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;

        // Move tool state
        this.componentBeingMoved = null;
        this.moveOriginalPos = null;

        // Multi-select state (Shift+drag box select)
        this.selectedComponents = new Set();
        this.isBoxSelecting = false;
        this.boxSelectStart = null;
        this.boxSelectEnd = null;

        // Blueprint stamp placement
        this.blueprintToPlace = null;

        // Selection change callback (used by modal for blueprint save button)
        this.onSelectionChange = null;

        // Callback for view changes (zoom/pan)
        this.onViewChange = null;

        this.setupEventListeners();
    }

    // Reset to initial state (for new game)
    reset() {
        this.components = [];
        this.wireManager = new ChipWireManager();
        this.selectedComponent = null;
        this.selectedWire = null;
        this.currentTool = 'select';
        this.componentToPlace = null;
        this.wireStartComponent = null;
        this.wireStartPinIndex = null;
        this.wireStartIsOutput = false;
        this.wirePreviewEnd = null;
        this.isSimulating = false;
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        this.activeRequirement = null;
        this.selectedComponents.clear();
        this.blueprintToPlace = null;
        this.isBoxSelecting = false;
        this.render();
    }

    setActiveRequirement(requirement) {
        this.activeRequirement = requirement;
        // Reset all labels when requirement changes
        this.resetComponentLabels();
    }

    // Reset all labels and reassign based on position (used when requirement changes)
    resetComponentLabels() {
        // Clear all existing labels
        this.components.forEach(comp => {
            if (comp.type === ChipComponentTypes.INPUT || comp.type === ChipComponentTypes.OUTPUT) {
                comp.label = null;
            }
        });
        // Now assign new labels
        this.updateComponentLabels();
    }

    // Assign labels only to components that don't have one yet (preserves existing labels)
    updateComponentLabels() {
        const req = this.activeRequirement;
        if (!req) {
            // No requirement - clear labels
            this.components.forEach(comp => {
                if (comp.type === ChipComponentTypes.INPUT || comp.type === ChipComponentTypes.OUTPUT) {
                    comp.label = null;
                }
            });
            return;
        }

        // Get components sorted by placement order (id), not position
        const inputComponents = this.components
            .filter(c => c.type === ChipComponentTypes.INPUT)
            .sort((a, b) => a.id - b.id);
        const outputComponents = this.components
            .filter(c => c.type === ChipComponentTypes.OUTPUT)
            .sort((a, b) => a.id - b.id);

        // Collect already-used labels
        const usedInputLabels = new Set(inputComponents.map(c => c.label).filter(l => l));
        const usedOutputLabels = new Set(outputComponents.map(c => c.label).filter(l => l));

        // Get available labels (from requirement that aren't already used)
        const availableInputLabels = req.inputs.filter(l => !usedInputLabels.has(l));
        const availableOutputLabels = req.outputs.filter(l => !usedOutputLabels.has(l));

        // Assign labels only to components that don't have one
        let inputLabelIdx = 0;
        inputComponents.forEach(comp => {
            if (!comp.label && inputLabelIdx < availableInputLabels.length) {
                comp.label = availableInputLabels[inputLabelIdx++];
            }
        });

        let outputLabelIdx = 0;
        outputComponents.forEach(comp => {
            if (!comp.label && outputLabelIdx < availableOutputLabels.length) {
                comp.label = availableOutputLabels[outputLabelIdx++];
            }
        });
    }

    setupEventListeners() {
        // Store bound handlers so they can be removed in cleanup()
        this._boundMouseMove = (e) => this.onMouseMove(e);
        this._boundMouseDown = (e) => this.onMouseDown(e);
        this._boundMouseUp = (e) => this.onMouseUp(e);
        this._boundContextMenu = (e) => e.preventDefault();
        this._boundWheel = (e) => this.onWheel(e);
        this._boundMouseLeave = () => { this.isPanning = false; };

        this.canvas.addEventListener('mousemove', this._boundMouseMove);
        this.canvas.addEventListener('mousedown', this._boundMouseDown);
        this.canvas.addEventListener('mouseup', this._boundMouseUp);
        this.canvas.addEventListener('contextmenu', this._boundContextMenu);

        // Zoom with mouse wheel
        this.canvas.addEventListener('wheel', this._boundWheel, { passive: false });

        // Track mouse leave to stop panning
        this.canvas.addEventListener('mouseleave', this._boundMouseLeave);
    }

    // Remove all canvas event listeners to prevent accumulation on re-init
    cleanup() {
        if (this._boundMouseMove) {
            this.canvas.removeEventListener('mousemove', this._boundMouseMove);
            this.canvas.removeEventListener('mousedown', this._boundMouseDown);
            this.canvas.removeEventListener('mouseup', this._boundMouseUp);
            this.canvas.removeEventListener('contextmenu', this._boundContextMenu);
            this.canvas.removeEventListener('wheel', this._boundWheel);
            this.canvas.removeEventListener('mouseleave', this._boundMouseLeave);
        }
        this.stopAnimation();
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }

    onWheel(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = this.grid.zoom * zoomDelta;
        this.grid.setZoom(newZoom, mouseX, mouseY);
        this.render();

        // Notify listener of view change
        if (this.onViewChange) {
            this.onViewChange();
        }
    }

    resetView() {
        this.grid.resetView();
        this.render();
    }

    resize(width, height) {
        this.grid.resize(width, height);
        this.render();
    }

    setTool(tool, componentType = null) {
        this.currentTool = tool;
        this.componentToPlace = componentType;
        this.wireStartComponent = null;
        // Don't clear selectedComponent when switching to move tool
        if (tool !== 'move') {
            this.selectedComponent = null;
        }
        this.selectedWire = null;

        // Clear move state when switching away from move tool
        if (tool !== 'move') {
            this.componentBeingMoved = null;
            this.moveOriginalPos = null;
        }

        // Clear blueprint stamp when switching away
        if (tool !== 'blueprint') {
            this.blueprintToPlace = null;
        }

        // Start animation for wire mode pin hover highlight
        if (tool === 'wire' && !this.isSimulating) {
            this.startAnimation();
        } else if (tool !== 'wire' && !this.isSimulating) {
            this.stopAnimation();
        }

        this.render();
    }

    // Enter move mode for a selected component
    startMoveComponent(component) {
        if (!component) return false;
        this.componentBeingMoved = component;
        this.moveOriginalPos = { x: component.gridX, y: component.gridY };
        this.selectedComponent = component;
        this.currentTool = 'move';
        this.render();
        return true;
    }

    // Cancel move and restore original position
    cancelMove() {
        if (this.componentBeingMoved && this.moveOriginalPos) {
            this.componentBeingMoved.gridX = this.moveOriginalPos.x;
            this.componentBeingMoved.gridY = this.moveOriginalPos.y;
            this.wireManager.routeAllWires();
        }
        this.componentBeingMoved = null;
        this.moveOriginalPos = null;
        this.currentTool = 'select';
        this.render();
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const newMouseX = e.clientX - rect.left;
        const newMouseY = e.clientY - rect.top;

        // Handle panning (middle mouse or ctrl+left mouse)
        if (this.isPanning) {
            const deltaX = newMouseX - this.panStartX;
            const deltaY = newMouseY - this.panStartY;
            this.grid.pan(deltaX, deltaY);
            this.panStartX = newMouseX;
            this.panStartY = newMouseY;
            this.render();
            if (this.onViewChange) this.onViewChange();
            return;
        }

        this.mouseScreenPos = { x: newMouseX, y: newMouseY };
        this.mouseGridPos = this.grid.screenToGrid(this.mouseScreenPos.x, this.mouseScreenPos.y);
        if (this.wireStartComponent) {
            this.wirePreviewEnd = this.mouseScreenPos;
        }
        // Update box select end position during drag
        if (this.isBoxSelecting) {
            this.boxSelectEnd = { x: this.mouseGridPos.x, y: this.mouseGridPos.y };
        }
        // Track hovered pin for visual feedback (in wire mode)
        if (this.currentTool === 'wire') {
            this.hoveredPin = this.findPinAt(this.mouseGridPos.x, this.mouseGridPos.y);
        } else {
            this.hoveredPin = null;
        }
        this.render();
    }

    // Start animation loop for wire pulses
    startAnimation() {
        if (this.animationRunning) return;
        this.animationRunning = true;
        this.lastFrameTime = performance.now();
        this.animationLoop();
    }

    // Stop animation loop
    stopAnimation() {
        this.animationRunning = false;
    }

    // Animation frame loop (throttled to 30fps for performance)
    animationLoop() {
        if (!this.animationRunning) return;

        const now = performance.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;

        // Throttle to ~30fps (33ms per frame) to reduce CPU usage
        const targetFrameTime = 33;
        if (now - this.lastFrameTime < targetFrameTime) {
            requestAnimationFrame(() => this.animationLoop());
            return;
        }

        this.lastFrameTime = now;
        this.animTime += deltaTime;

        this.render();
        requestAnimationFrame(() => this.animationLoop());
    }

    onMouseDown(e) {
        // Middle mouse button for panning
        if (e.button === 1) {
            e.preventDefault();
            this.isPanning = true;
            const rect = this.canvas.getBoundingClientRect();
            this.panStartX = e.clientX - rect.left;
            this.panStartY = e.clientY - rect.top;
            return;
        }

        // Ctrl+left click for panning
        if (e.button === 0 && e.ctrlKey) {
            e.preventDefault();
            this.isPanning = true;
            const rect = this.canvas.getBoundingClientRect();
            this.panStartX = e.clientX - rect.left;
            this.panStartY = e.clientY - rect.top;
            return;
        }

        if (e.button === 2) {
            this.handleRightClick();
            return;
        }

        const gridPos = this.mouseGridPos;

        // Blueprint stamp placement
        if (this.currentTool === 'blueprint' && this.blueprintToPlace) {
            this.handleBlueprintPlace(gridPos);
            this.render();
            return;
        }

        // Shift+click in select mode: start box select or toggle individual component
        if (e.shiftKey && this.currentTool === 'select') {
            const comp = this.findComponentAt(gridPos.x, gridPos.y);
            if (comp) {
                // Toggle individual component in selection
                if (this.selectedComponents.has(comp)) {
                    this.selectedComponents.delete(comp);
                } else {
                    this.selectedComponents.add(comp);
                }
                this._notifySelectionChange();
            } else {
                // Start box select drag
                this.isBoxSelecting = true;
                this.boxSelectStart = { x: gridPos.x, y: gridPos.y };
                this.boxSelectEnd = { x: gridPos.x, y: gridPos.y };
            }
            this.render();
            return;
        }

        switch (this.currentTool) {
            case 'select': this.handleSelectClick(gridPos); break;
            case 'component': this.handleComponentPlace(gridPos); break;
            case 'wire': this.handleWireClick(gridPos); break;
            case 'delete': this.handleDeleteClick(gridPos); break;
            case 'move': this.handleMoveClick(gridPos); break;
        }
        this.render();
    }

    onMouseUp(e) {
        // Stop panning on middle mouse or left mouse release
        if (e.button === 1 || (e.button === 0 && this.isPanning)) {
            this.isPanning = false;
        }

        // Finalize box selection
        if (this.isBoxSelecting && e.button === 0) {
            this._finalizeBoxSelect();
            this.isBoxSelecting = false;
            this.render();
        }
    }

    handleRightClick() {
        // Cancel blueprint stamp mode
        if (this.currentTool === 'blueprint') {
            this.blueprintToPlace = null;
            this.currentTool = 'select';
            this.render();
            return;
        }

        const gridPos = this.mouseGridPos;

        // Cancel wire drawing mode
        if (this.wireStartComponent) {
            this.wireStartComponent = null;
            this.wirePreviewEnd = null;
            this.render();
            return;
        }

        const component = this.findComponentAt(gridPos.x, gridPos.y);
        if (component) {
            this.deleteComponent(component);
            if (this.selectedComponent === component) this.selectedComponent = null;
            this.render();
            return;
        }

        const wire = this.wireManager.findWireAt(this.mouseScreenPos.x, this.mouseScreenPos.y, this.grid);
        if (wire) {
            this.wireManager.removeWire(wire);
            if (this.selectedWire === wire) this.selectedWire = null;
            this.render();
            return;
        }

        // RMB on empty space deselects
        if (this.selectedComponent || this.selectedWire) {
            this.selectedComponent = null;
            this.selectedWire = null;
            this.render();
        }
    }

    handleSelectClick(gridPos) {
        // Non-shift click clears multi-selection
        this.clearSelection();

        const component = this.findComponentAt(gridPos.x, gridPos.y);
        if (component) {
            this.selectedComponent = component;
            this.selectedWire = null;
            if (component.type === ChipComponentTypes.INPUT) {
                component.manualValue = !component.manualValue;
                this.runSimulationStep();
            }
        } else {
            const wire = this.wireManager.findWireAt(this.mouseScreenPos.x, this.mouseScreenPos.y, this.grid);
            if (wire) {
                this.selectedWire = wire;
                this.selectedComponent = null;
            } else {
                this.selectedComponent = null;
                this.selectedWire = null;
            }
        }
    }

    handleComponentPlace(gridPos) {
        if (!this.componentToPlace) return;
        if (!this.grid.isValidPosition(gridPos.x, gridPos.y)) return;

        const config = ChipComponentConfig[this.componentToPlace];
        if (!this.canPlaceComponent(gridPos.x, gridPos.y, config.width, config.height)) return;

        const component = new ChipComponent(this.componentToPlace, gridPos.x, gridPos.y);
        this.components.push(component);
        this.updateComponentLabels();
    }

    canPlaceComponent(gridX, gridY, width, height) {
        // No bounds check - infinite grid. Only check overlaps.
        for (const comp of this.components) {
            if (!(gridX + width <= comp.gridX || gridX >= comp.gridX + comp.width ||
                  gridY + height <= comp.gridY || gridY >= comp.gridY + comp.height)) {
                return false;
            }
        }
        return true;
    }

    handleWireClick(gridPos) {
        const pinInfo = this.findPinAt(gridPos.x, gridPos.y);
        if (!pinInfo) {
            this.wireStartComponent = null;
            return;
        }

        if (!this.wireStartComponent) {
            // Allow starting from either output OR input pin
            this.wireStartComponent = pinInfo.component;
            this.wireStartPinIndex = pinInfo.pinIndex;
            this.wireStartIsOutput = pinInfo.isOutput;
        } else {
            // Complete the wire - determine direction based on pin types
            const startIsOutput = this.wireStartIsOutput;
            const endIsOutput = pinInfo.isOutput;

            // Valid connections: output->input (normal) or input->output (reverse draw)
            // Don't allow output->output or input->input
            if (startIsOutput !== endIsOutput && pinInfo.component !== this.wireStartComponent) {
                let fromComp, fromPin, toComp, toPin;

                if (startIsOutput) {
                    // Normal direction: started from output, ending on input
                    fromComp = this.wireStartComponent;
                    fromPin = this.wireStartPinIndex;
                    toComp = pinInfo.component;
                    toPin = pinInfo.pinIndex;
                } else {
                    // Reverse direction: started from input, ending on output
                    fromComp = pinInfo.component;
                    fromPin = pinInfo.pinIndex;
                    toComp = this.wireStartComponent;
                    toPin = this.wireStartPinIndex;
                }

                this.wireManager.addWire(fromComp, fromPin, toComp, toPin);
            }
            this.wireStartComponent = null;
            this.wirePreviewEnd = null;
        }
    }

    findPinAt(gridX, gridY) {
        // Use precise screen coordinates for accurate pin detection
        const precisePos = this.grid.screenToGridPrecise(this.mouseScreenPos.x, this.mouseScreenPos.y);
        const hitRadius = 0.8;
        let closestPin = null;
        let closestDistance = Infinity;

        for (const comp of this.components) {
            // Check outputs
            for (let i = 0; i < comp.outputs.length; i++) {
                const pin = comp.outputs[i];
                const pinX = comp.gridX + pin.x + 1;
                const pinY = comp.gridY + pin.y + 0.5;
                const dist = Math.hypot(precisePos.x - pinX, precisePos.y - pinY);
                if (dist <= hitRadius && dist < closestDistance) {
                    closestDistance = dist;
                    closestPin = { component: comp, pinIndex: i, isOutput: true };
                }
            }
            // Check inputs
            for (let i = 0; i < comp.inputs.length; i++) {
                const pin = comp.inputs[i];
                const pinX = comp.gridX + pin.x;
                const pinY = comp.gridY + pin.y + 0.5;
                const dist = Math.hypot(precisePos.x - pinX, precisePos.y - pinY);
                if (dist <= hitRadius && dist < closestDistance) {
                    closestDistance = dist;
                    closestPin = { component: comp, pinIndex: i, isOutput: false };
                }
            }
        }
        return closestPin;
    }

    handleDeleteClick(gridPos) {
        // Delete all multi-selected components if clicking on one of them
        if (this.selectedComponents.size > 0) {
            const comp = this.findComponentAt(gridPos.x, gridPos.y);
            if (comp && this.selectedComponents.has(comp)) {
                for (const c of this.selectedComponents) {
                    this.deleteComponent(c);
                }
                this.clearSelection();
                return;
            }
        }

        const component = this.findComponentAt(gridPos.x, gridPos.y);
        if (component) {
            this.deleteComponent(component);
        } else {
            const wire = this.wireManager.findWireAt(this.mouseScreenPos.x, this.mouseScreenPos.y, this.grid);
            if (wire) this.wireManager.removeWire(wire);
        }
    }

    handleMoveClick(gridPos) {
        // If we have a component being moved, try to place it
        if (this.componentBeingMoved) {
            // Check if position is valid (not overlapping other components)
            const canPlace = this.canPlaceComponentExcluding(
                gridPos.x, gridPos.y,
                this.componentBeingMoved.width,
                this.componentBeingMoved.height,
                this.componentBeingMoved
            );

            if (canPlace) {
                // Move the component
                this.componentBeingMoved.gridX = gridPos.x;
                this.componentBeingMoved.gridY = gridPos.y;

                this.wireManager.routeAllWires();

                // Update labels after move
                this.updateComponentLabels();

                // Clear moved component but stay in move mode for additional moves
                this.componentBeingMoved = null;
                this.moveOriginalPos = null;
                // Keep currentTool = 'move' so user can move another component
            }
            // If can't place, component stays in move mode
        } else {
            // Select a component to move
            const component = this.findComponentAt(gridPos.x, gridPos.y);
            if (component) {
                this.startMoveComponent(component);
            }
        }
    }

    // Check if component can be placed excluding a specific component (for move)
    canPlaceComponentExcluding(gridX, gridY, width, height, excludeComponent) {
        // No bounds check - infinite grid. Only check overlaps.
        for (const comp of this.components) {
            if (comp === excludeComponent) continue;
            if (!(gridX + width <= comp.gridX || gridX >= comp.gridX + comp.width ||
                  gridY + height <= comp.gridY || gridY >= comp.gridY + comp.height)) {
                return false;
            }
        }
        return true;
    }

    deleteComponent(component) {
        this.wireManager.removeWiresForComponent(component);
        const index = this.components.indexOf(component);
        if (index >= 0) this.components.splice(index, 1);
        this.selectedComponents.delete(component);
        this.updateComponentLabels();
    }

    // --- Multi-select helpers ---

    getSelectedGateCount() {
        const ComponentTypes = window.ChipComponentTypes;
        let count = 0;
        for (const c of this.selectedComponents) {
            if (c.type !== ComponentTypes.INPUT && c.type !== ComponentTypes.OUTPUT) count++;
        }
        return count;
    }

    // Get wires where both endpoints are in selectedComponents
    getSelectedWires() {
        return this.wireManager.wires.filter(w =>
            this.selectedComponents.has(w.fromComponent) && this.selectedComponents.has(w.toComponent)
        );
    }

    clearSelection() {
        if (this.selectedComponents.size > 0) {
            this.selectedComponents.clear();
            this._notifySelectionChange();
        }
    }

    _notifySelectionChange() {
        if (this.onSelectionChange) this.onSelectionChange();
    }

    _finalizeBoxSelect() {
        if (!this.boxSelectStart || !this.boxSelectEnd) return;
        const x1 = Math.min(this.boxSelectStart.x, this.boxSelectEnd.x);
        const y1 = Math.min(this.boxSelectStart.y, this.boxSelectEnd.y);
        const x2 = Math.max(this.boxSelectStart.x, this.boxSelectEnd.x) + 1;
        const y2 = Math.max(this.boxSelectStart.y, this.boxSelectEnd.y) + 1;

        for (const comp of this.components) {
            // Check if component bounding box intersects selection rect
            if (!(comp.gridX + comp.width <= x1 || comp.gridX >= x2 ||
                  comp.gridY + comp.height <= y1 || comp.gridY >= y2)) {
                this.selectedComponents.add(comp);
            }
        }
        this.boxSelectStart = null;
        this.boxSelectEnd = null;
        this._notifySelectionChange();
    }

    // --- Blueprint stamp placement ---

    handleBlueprintPlace(gridPos) {
        const bp = this.blueprintToPlace;
        if (!bp) return;

        // Validate all component positions
        const allValid = bp.components.every(c => {
            const config = ChipComponentConfig[c.type];
            const gx = gridPos.x + c.relX;
            const gy = gridPos.y + c.relY;
            return this.canPlaceComponent(gx, gy, config.width, config.height);
        });
        if (!allValid) return;

        // Place all components
        const newComponents = [];
        for (const c of bp.components) {
            const comp = new ChipComponent(c.type, gridPos.x + c.relX, gridPos.y + c.relY);
            this.components.push(comp);
            newComponents.push(comp);
        }

        // Wire them using the saved index mapping
        for (const w of bp.wires) {
            if (w.fromIdx < newComponents.length && w.toIdx < newComponents.length) {
                this.wireManager.addWire(newComponents[w.fromIdx], w.fromPin, newComponents[w.toIdx], w.toPin);
            }
        }

        this.updateComponentLabels();

        // Return to select tool after placement
        this.blueprintToPlace = null;
        this.currentTool = 'select';
    }

    findComponentAt(gridX, gridY) {
        for (const comp of this.components) {
            if (comp.occupiesCell(gridX, gridY)) return comp;
        }
        return null;
    }

    startSimulation() {
        this.isSimulating = true;
        this.runSimulationStep();
        this.startAnimation(); // Start animation loop for wire pulses
        this.simulationInterval = setInterval(() => {
            this.runSimulationStep();
        }, 100);
    }

    stopSimulation() {
        this.isSimulating = false;
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        this.stopAnimation(); // Stop animation loop
        this.render(); // One final render
    }

    toggleSimulation() {
        if (this.isSimulating) {
            this.stopSimulation();
        } else {
            this.startSimulation();
        }
        return this.isSimulating;
    }

    runSimulationStep() {
        for (const comp of this.components) {
            for (const input of comp.inputs) {
                input.value = false;
            }
        }
        for (let pass = 0; pass < 10; pass++) {
            for (const comp of this.components) {
                comp.evaluate();
            }
            this.wireManager.propagateSignals();
        }
    }

    clear() {
        this.components = [];
        this.wireManager.clear();
        this.selectedComponent = null;
        this.selectedWire = null;
        this.wireStartComponent = null;
        this.selectedComponents.clear();
        this.blueprintToPlace = null;
        this.stopSimulation();
        this.render();
    }

    render() {
        this.grid.render();
        const ctx = this.grid.ctx;
        const cellSize = this.grid.cellSize * this.grid.zoom;

        if (this.grid.isValidPosition(this.mouseGridPos.x, this.mouseGridPos.y)) {
            if (this.currentTool === 'blueprint' && this.blueprintToPlace) {
                // Blueprint stamp preview
                const bp = this.blueprintToPlace;
                const allValid = bp.components.every(c => {
                    const config = ChipComponentConfig[c.type];
                    const gx = this.mouseGridPos.x + c.relX;
                    const gy = this.mouseGridPos.y + c.relY;
                    return this.canPlaceComponent(gx, gy, config.width, config.height);
                });
                const color = allValid ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)';
                for (const c of bp.components) {
                    const config = ChipComponentConfig[c.type];
                    for (let dx = 0; dx < config.width; dx++) {
                        for (let dy = 0; dy < config.height; dy++) {
                            this.grid.highlightCell(this.mouseGridPos.x + c.relX + dx, this.mouseGridPos.y + c.relY + dy, color);
                        }
                    }
                }
            } else if (this.currentTool === 'component' && this.componentToPlace) {
                const config = ChipComponentConfig[this.componentToPlace];
                const canPlace = this.canPlaceComponent(this.mouseGridPos.x, this.mouseGridPos.y, config.width, config.height);
                const color = canPlace ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)';
                for (let dx = 0; dx < config.width; dx++) {
                    for (let dy = 0; dy < config.height; dy++) {
                        this.grid.highlightCell(this.mouseGridPos.x + dx, this.mouseGridPos.y + dy, color);
                    }
                }
            } else if (this.currentTool === 'move' && this.componentBeingMoved) {
                // Show move preview
                const comp = this.componentBeingMoved;
                const canPlace = this.canPlaceComponentExcluding(
                    this.mouseGridPos.x, this.mouseGridPos.y,
                    comp.width, comp.height, comp
                );
                const color = canPlace ? 'rgba(74, 158, 255, 0.3)' : 'rgba(239, 68, 68, 0.3)';
                for (let dx = 0; dx < comp.width; dx++) {
                    for (let dy = 0; dy < comp.height; dy++) {
                        this.grid.highlightCell(this.mouseGridPos.x + dx, this.mouseGridPos.y + dy, color);
                    }
                }
            } else if (this.currentTool !== 'wire') {
                this.grid.highlightCell(this.mouseGridPos.x, this.mouseGridPos.y);
            }
        }

        // Render wires with animation time for pulses (analog mode uses wave visuals)
        this.wireManager.render(ctx, this.grid, this.selectedWire, this.animTime, this.analogRenderMode || false);

        // Draw wire preview when creating a wire
        if (this.wireStartComponent && this.wirePreviewEnd) {
            let startPos;
            if (this.wireStartIsOutput) {
                // Started from output pin
                const startPin = this.wireStartComponent.outputs[this.wireStartPinIndex];
                startPos = this.grid.gridToScreen(
                    this.wireStartComponent.gridX + startPin.x + 1,
                    this.wireStartComponent.gridY + startPin.y
                );
            } else {
                // Started from input pin
                const startPin = this.wireStartComponent.inputs[this.wireStartPinIndex];
                startPos = this.grid.gridToScreen(
                    this.wireStartComponent.gridX + startPin.x,
                    this.wireStartComponent.gridY + startPin.y
                );
            }

            ctx.strokeStyle = '#4a9eff';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y + cellSize / 2);
            ctx.lineTo(this.wirePreviewEnd.x, this.wirePreviewEnd.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Render components
        for (const comp of this.components) {
            comp.render(ctx, this.grid, comp === this.selectedComponent, this.isSimulating, this.animTime);
        }

        // Draw multi-select highlights (cyan border around selected components)
        if (this.selectedComponents.size > 0) {
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            for (const comp of this.selectedComponents) {
                const sx = this.grid.offsetX + comp.gridX * cellSize;
                const sy = this.grid.offsetY + comp.gridY * cellSize;
                ctx.strokeRect(sx - 1, sy - 1, comp.width * cellSize + 2, comp.height * cellSize + 2);
            }
            ctx.setLineDash([]);
        }

        // Draw box selection rectangle
        if (this.isBoxSelecting && this.boxSelectStart && this.boxSelectEnd) {
            const sx1 = this.grid.offsetX + Math.min(this.boxSelectStart.x, this.boxSelectEnd.x) * cellSize;
            const sy1 = this.grid.offsetY + Math.min(this.boxSelectStart.y, this.boxSelectEnd.y) * cellSize;
            const sx2 = this.grid.offsetX + (Math.max(this.boxSelectStart.x, this.boxSelectEnd.x) + 1) * cellSize;
            const sy2 = this.grid.offsetY + (Math.max(this.boxSelectStart.y, this.boxSelectEnd.y) + 1) * cellSize;
            ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
            ctx.fillRect(sx1, sy1, sx2 - sx1, sy2 - sy1);
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
            ctx.lineWidth = 1;
            ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);
        }

        // Draw pin hover highlight in wire mode (optimized - no gradients)
        if (this.hoveredPin && this.currentTool === 'wire') {
            const comp = this.hoveredPin.component;
            const pinIndex = this.hoveredPin.pinIndex;
            const isOutput = this.hoveredPin.isOutput;

            let pinX, pinY;
            if (isOutput) {
                const pin = comp.outputs[pinIndex];
                pinX = comp.gridX + pin.x + 1;
                pinY = comp.gridY + pin.y + 0.5;
            } else {
                const pin = comp.inputs[pinIndex];
                pinX = comp.gridX + pin.x;
                pinY = comp.gridY + pin.y + 0.5;
            }

            const screenPos = {
                x: this.grid.offsetX + pinX * cellSize,
                y: this.grid.offsetY + pinY * cellSize
            };

            // Draw animated highlight ring (simple circles, no gradient)
            const pulseSize = 12 + Math.sin(this.animTime * 5) * 3;

            // Outer glow
            ctx.fillStyle = isOutput ? 'rgba(74, 158, 255, 0.2)' : 'rgba(74, 222, 128, 0.2)';
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, pulseSize, 0, Math.PI * 2);
            ctx.fill();

            // Middle ring
            ctx.fillStyle = isOutput ? 'rgba(74, 158, 255, 0.4)' : 'rgba(74, 222, 128, 0.4)';
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, pulseSize * 0.6, 0, Math.PI * 2);
            ctx.fill();

            // Bright center
            ctx.fillStyle = isOutput ? '#4a9eff' : '#4ade80';
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Export to window
window.ChipComponentTypes = ChipComponentTypes;
window.ChipComponentConfig = ChipComponentConfig;
window.ChipGrid = ChipGrid;
window.ChipComponent = ChipComponent;
window.ChipWire = ChipWire;
window.ChipWireManager = ChipWireManager;
window.ChipDesignerCore = ChipDesignerCore;
