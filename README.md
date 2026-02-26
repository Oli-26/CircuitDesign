# Circuit Designer

A standalone logic gate simulator and puzzle game. Design digital circuits using logic gates, wires, and I/O pins, then validate your solutions against truth tables.

Extracted from the firmware designer in [MicroFab](https://store.steampowered.com/app/2921400/MicroFab/), a chip fabrication tycoon game.

## How It Works

Open `index.html` in a browser — no build step or server required.

The designer has two modes:

- **Firmware Designs** — Build circuits matching specific truth tables across 12 tiers of increasing difficulty. Each puzzle defines required inputs, outputs, and the expected logic.
- **NAND Challenges** — Solve the same style of puzzles using only NAND gates. NAND is a universal gate, meaning any logic circuit can be constructed from NAND gates alone.

### Building Circuits

1. Select a puzzle from the left panel
2. Place **Input** and **Output** pins, then add logic gates (AND, OR, NOT, XOR, NAND, NOR, XNOR)
3. Connect components using the **Wire** tool
4. Use **Simulate** to test interactively — click inputs to toggle them and watch signals propagate
5. Click **Validate Circuit** to check your solution against all test cases

### Gate Budget & Medals

Each puzzle has a gate budget with gold, silver, and bronze thresholds. Solve puzzles with fewer gates to earn better medals.

### Saving

Solutions and progress are saved to your browser's localStorage automatically. Your completed puzzles persist across sessions.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| V | Select tool |
| W | Wire tool |
| X | Delete tool |
| M | Move tool |
| Del / Backspace | Delete selected component |
| Mouse wheel | Zoom |
| Click + drag | Pan canvas |
| Right click | Delete component |
| Home | Reset view |

## License

Educational and non-commercial use permitted with attribution. See [LICENSE](LICENSE) for details.
