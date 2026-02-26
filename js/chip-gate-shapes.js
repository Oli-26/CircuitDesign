// ANSI/MIL-standard gate shape rendering for the chip designer
// Draws distinctive silhouettes for each gate type with gradient fills and glow effects

class ChipGateShapes {

    // --- Color utilities ---

    static parseHex(hex) {
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16)
        };
    }

    static createGradient(ctx, y, h, hex) {
        const { r, g, b } = ChipGateShapes.parseHex(hex);
        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        // Top: 110% brightness, bottom: 60% brightness
        grad.addColorStop(0, `rgb(${Math.min(255, Math.floor(r * 1.1))},${Math.min(255, Math.floor(g * 1.1))},${Math.min(255, Math.floor(b * 1.1))})`);
        grad.addColorStop(1, `rgb(${Math.floor(r * 0.6)},${Math.floor(g * 0.6)},${Math.floor(b * 0.6)})`);
        return grad;
    }

    // --- Gate path builders (all draw into a 2px-inset bounding box) ---

    static pathAND(ctx, x, y, w, h) {
        // D-shape: flat left side, semicircle right
        const midY = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w / 2, y);
        ctx.arc(x + w / 2, midY, h / 2, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(x, y + h);
        ctx.closePath();
    }

    static pathOR(ctx, x, y, w, h) {
        // Concave left curve, two convex curves meeting at pointed right tip
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + w * 0.65, y, x + w, y + h / 2);
        ctx.quadraticCurveTo(x + w * 0.65, y + h, x, y + h);
        // Concave left curve
        ctx.quadraticCurveTo(x + w * 0.25, y + h / 2, x, y);
        ctx.closePath();
    }

    static pathNOT(ctx, x, y, w, h) {
        // Triangle pointing right (leave room for negation bubble)
        const triW = w * 0.75;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + triW, y + h / 2);
        ctx.lineTo(x, y + h);
        ctx.closePath();
    }

    static pathXOR(ctx, x, y, w, h) {
        // Same as OR shape
        ChipGateShapes.pathOR(ctx, x, y, w, h);
    }

    static pathInput(ctx, x, y, w, h) {
        // Pentagon arrow pointing right
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w * 0.7, y);
        ctx.lineTo(x + w, y + h / 2);
        ctx.lineTo(x + w * 0.7, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
    }

    static pathTHRESHOLD(ctx, x, y, w, h) {
        // Step function shape: flat low, step up at midpoint
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x, y + h * 0.65);
        ctx.lineTo(x + w * 0.45, y + h * 0.65);
        ctx.lineTo(x + w * 0.45, y + h * 0.35);
        ctx.lineTo(x + w, y + h * 0.35);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
    }

    static pathAVERAGE(ctx, x, y, w, h) {
        // Rounded box with flat top/bottom (sigma-like)
        const r = Math.min(w, h) * 0.15;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    static pathOutput(ctx, x, y, w, h) {
        // Inverted chevron — arrow indent on left, flat right
        const indent = w * 0.25;
        ctx.beginPath();
        ctx.moveTo(x + indent, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + indent, y + h);
        ctx.lineTo(x, y + h / 2);
        ctx.closePath();
    }

    // --- Negation bubble ---

    static drawNegationBubble(ctx, cx, cy, radius, fillColor, strokeColor) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    // --- Label drawing ---

    static drawLabel(ctx, type, label, x, y, w, h, cellSize) {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const cx = x + w / 2;
        const cy = y + h / 2;

        if (type === ChipComponentTypes.INPUT || type === ChipComponentTypes.OUTPUT) {
            // Show pin label prominently
            ctx.font = `bold ${Math.max(9, cellSize * 0.45)}px monospace`;
            const displayLabel = label || (type === ChipComponentTypes.INPUT ? 'IN' : 'OUT');
            ctx.fillText(displayLabel, cx, cy);
        } else {
            // Show gate type name small
            ctx.font = `bold ${Math.max(8, cellSize * 0.35)}px monospace`;
            const names = {
                [ChipComponentTypes.AND]: 'AND',
                [ChipComponentTypes.OR]: 'OR',
                [ChipComponentTypes.NOT]: 'NOT',
                [ChipComponentTypes.XOR]: 'XOR',
                [ChipComponentTypes.NAND]: 'NAND',
                [ChipComponentTypes.NOR]: 'NOR',
                [ChipComponentTypes.XNOR]: 'XNOR',
                [ChipComponentTypes.THRESHOLD]: 'THR',
                [ChipComponentTypes.AVERAGE]: 'AVG'
            };
            // Shift label left slightly for gates with negation bubbles
            const hasNeg = type === ChipComponentTypes.NAND || type === ChipComponentTypes.NOR || type === ChipComponentTypes.XNOR;
            const offsetX = hasNeg ? -w * 0.06 : 0;
            ctx.fillText(names[type] || '', cx + offsetX, cy);
        }
    }

    // --- Pin rendering with stubs ---

    static drawPins(ctx, component, grid, cellSize, isSimulating) {
        const pinRadius = cellSize * 0.2;
        const pos = grid.gridToScreen(component.gridX, component.gridY);
        const bodyW = component.width * cellSize;
        const bodyH = component.height * cellSize;
        // Inset matches the shape drawing inset
        const inset = 2;

        for (const pin of component.inputs) {
            const pinPos = grid.gridToScreen(component.gridX + pin.x, component.gridY + pin.y);
            const px = pinPos.x;
            const py = pinPos.y + cellSize / 2;

            const isActive = pin.value && isSimulating;
            const pinColor = isActive ? '#4ade80' : '#555';

            // Stub line from body edge to pin circle
            const bodyLeft = pos.x + inset;
            ctx.strokeStyle = pinColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bodyLeft, py);
            ctx.lineTo(px, py);
            ctx.stroke();

            // Active glow
            if (isActive) {
                ctx.shadowColor = '#4ade80';
                ctx.shadowBlur = 6;
            }

            ctx.fillStyle = pinColor;
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(px, py, pinRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }

        for (const pin of component.outputs) {
            const pinPos = grid.gridToScreen(component.gridX + pin.x, component.gridY + pin.y);
            const px = pinPos.x + cellSize;
            const py = pinPos.y + cellSize / 2;

            const isActive = pin.value && isSimulating;
            const pinColor = isActive ? '#4ade80' : '#555';

            // Stub line from body edge to pin circle
            const bodyRight = pos.x + bodyW - inset;
            ctx.strokeStyle = pinColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bodyRight, py);
            ctx.lineTo(px, py);
            ctx.stroke();

            if (isActive) {
                ctx.shadowColor = '#4ade80';
                ctx.shadowBlur = 6;
            }

            ctx.fillStyle = pinColor;
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(px, py, pinRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }
    }

    // --- Main entry point ---

    static drawGateShape(ctx, component, grid, isSelected, isSimulating, animTime) {
        const cellSize = grid.cellSize * grid.zoom;
        const pos = grid.gridToScreen(component.gridX, component.gridY);
        const w = component.width * cellSize;
        const h = component.height * cellSize;
        const type = component.type;
        const color = component.color;

        // 2px inset for stroke room
        const ix = pos.x + 2;
        const iy = pos.y + 2;
        const iw = w - 4;
        const ih = h - 4;

        // Check if output is HIGH for glow
        const outputHigh = component.outputs.length > 0 && component.outputs[0].value;
        const isActive = isSimulating && outputHigh;

        // Active glow behind shape
        if (isActive) {
            const glowAmount = 6 + Math.sin(animTime * 4) * 4;
            ctx.shadowColor = color;
            ctx.shadowBlur = glowAmount;
        }

        // Build the path
        switch (type) {
            case ChipComponentTypes.AND:   ChipGateShapes.pathAND(ctx, ix, iy, iw, ih); break;
            case ChipComponentTypes.OR:    ChipGateShapes.pathOR(ctx, ix, iy, iw, ih); break;
            case ChipComponentTypes.NOT:   ChipGateShapes.pathNOT(ctx, ix, iy, iw, ih); break;
            case ChipComponentTypes.XOR:   ChipGateShapes.pathXOR(ctx, ix, iy, iw, ih); break;
            case ChipComponentTypes.NAND:  ChipGateShapes.pathAND(ctx, ix, iy, iw, ih); break;
            case ChipComponentTypes.NOR:   ChipGateShapes.pathOR(ctx, ix, iy, iw, ih); break;
            case ChipComponentTypes.XNOR:  ChipGateShapes.pathXOR(ctx, ix, iy, iw, ih); break;
            case ChipComponentTypes.INPUT: ChipGateShapes.pathInput(ctx, ix, iy, iw, ih); break;
            case ChipComponentTypes.OUTPUT:ChipGateShapes.pathOutput(ctx, ix, iy, iw, ih); break;
            case ChipComponentTypes.THRESHOLD: ChipGateShapes.pathTHRESHOLD(ctx, ix, iy, iw, ih); break;
            case ChipComponentTypes.AVERAGE: ChipGateShapes.pathAVERAGE(ctx, ix, iy, iw, ih); break;
        }

        // Gradient fill
        ctx.fillStyle = isSelected
            ? ChipGateShapes.createGradient(ctx, iy, ih, color)
            : ChipGateShapes.createGradient(ctx, iy, ih, color);
        if (isSelected) {
            // Brighten the gradient for selection
            const { r, g, b } = ChipGateShapes.parseHex(color);
            const grad = ctx.createLinearGradient(0, iy, 0, iy + ih);
            grad.addColorStop(0, `rgb(${Math.min(255, Math.floor(r * 1.3))},${Math.min(255, Math.floor(g * 1.3))},${Math.min(255, Math.floor(b * 1.3))})`);
            grad.addColorStop(1, `rgb(${Math.min(255, Math.floor(r * 0.8))},${Math.min(255, Math.floor(g * 0.8))},${Math.min(255, Math.floor(b * 0.8))})`);
            ctx.fillStyle = grad;
        }
        ctx.fill();

        // Reset shadow before stroke
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Stroke outline
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // XOR/XNOR extra input curve
        if (type === ChipComponentTypes.XOR || type === ChipComponentTypes.XNOR) {
            const extraOffset = iw * 0.08;
            ctx.beginPath();
            ctx.moveTo(ix - extraOffset, iy);
            ctx.quadraticCurveTo(ix - extraOffset + iw * 0.25, iy + ih / 2, ix - extraOffset, iy + ih);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Negation bubbles for NAND, NOR, XNOR, NOT
        const bubbleRadius = Math.max(3, cellSize * 0.1);
        const { r, g, b } = ChipGateShapes.parseHex(color);
        const darkFill = `rgb(${Math.floor(r * 0.3)},${Math.floor(g * 0.3)},${Math.floor(b * 0.3)})`;

        if (type === ChipComponentTypes.NAND) {
            // Bubble at right edge of AND shape
            const bx = ix + iw / 2 + ih / 2 + bubbleRadius;
            ChipGateShapes.drawNegationBubble(ctx, bx, iy + ih / 2, bubbleRadius, darkFill, color);
        } else if (type === ChipComponentTypes.NOR) {
            const bx = ix + iw + bubbleRadius;
            ChipGateShapes.drawNegationBubble(ctx, bx, iy + ih / 2, bubbleRadius, darkFill, color);
        } else if (type === ChipComponentTypes.XNOR) {
            const bx = ix + iw + bubbleRadius;
            ChipGateShapes.drawNegationBubble(ctx, bx, iy + ih / 2, bubbleRadius, darkFill, color);
        } else if (type === ChipComponentTypes.NOT) {
            // Bubble after triangle tip
            const triW = iw * 0.75;
            const bx = ix + triW + bubbleRadius;
            ChipGateShapes.drawNegationBubble(ctx, bx, iy + ih / 2, bubbleRadius, darkFill, color);
        }

        // Label
        ChipGateShapes.drawLabel(ctx, type, component.label, ix, iy, iw, ih, cellSize);

        // Pins with stubs
        ChipGateShapes.drawPins(ctx, component, grid, cellSize, isSimulating);

        // Selection highlight
        if (isSelected) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(pos.x, pos.y, w, h);
            ctx.setLineDash([]);
        }
    }
}

window.ChipGateShapes = ChipGateShapes;
