// NAND-Only Challenges
// Classic logic puzzles that must be solved using only NAND gates
// NAND is a universal gate - any logic circuit can be built with just NAND gates
// Completing challenges grants stacking bonuses to production

// Bonus types that can be earned
window.NandBonusTypes = {
    CHIP_VALUE: 'chipValue',           // +X% to chip sell prices
    ETCHER_SPEED: 'etcherSpeed',       // +X% to etcher processing speed
    BONDER_SPEED: 'bonderSpeed',       // +X% to bonder processing speed
    PACKAGER_SPEED: 'packagerSpeed',   // +X% to packager processing speed
    INTEGRATOR_SPEED: 'integratorSpeed', // +X% to logic integrator speed
    JAM_RESISTANCE: 'jamResistance',   // -X% to jam chance
    ALL_SPEED: 'allSpeed',             // +X% to all machine speeds
    SOURCE_SPEED: 'sourceSpeed',       // +X% to source output speed
    DEFECT_RESISTANCE: 'defectResistance', // -X% to defect chance
    RESEARCH_SPEED: 'researchSpeed'    // +X% to research speed
};

// Friendly names for bonus types
window.NandBonusNames = {
    chipValue: 'Chip Value',
    etcherSpeed: 'Etcher Speed',
    bonderSpeed: 'Bonder Speed',
    packagerSpeed: 'Packager Speed',
    integratorSpeed: 'Integrator Speed',
    jamResistance: 'Jam Resistance',
    allSpeed: 'All Machine Speed',
    sourceSpeed: 'Source Speed',
    defectResistance: 'Defect Resistance',
    researchSpeed: 'Research Speed'
};

// Detailed descriptions explaining what each bonus does
window.NandBonusDescriptions = {
    chipValue: 'Increases the sell price of all finished chips',
    etcherSpeed: 'Etchers process wafers faster, adding layers more quickly',
    bonderSpeed: 'Wire Bonders attach connections faster',
    packagerSpeed: 'Packagers seal chips faster',
    integratorSpeed: 'Logic Integrators process designs faster',
    jamResistance: 'Increases resistance to machine jams on all machines',
    allSpeed: 'All production machines operate faster',
    sourceSpeed: 'Resource sources produce materials faster',
    defectResistance: 'Reduces defect chance on all machines that can produce defects',
    researchSpeed: 'Research centers complete cycles faster'
};

// Short effect text for compact displays
window.NandBonusEffects = {
    chipValue: 'sell price',
    etcherSpeed: 'etcher speed',
    bonderSpeed: 'bonder speed',
    packagerSpeed: 'packager speed',
    integratorSpeed: 'integrator speed',
    jamResistance: 'jam resistance',
    allSpeed: 'all machine speed',
    sourceSpeed: 'source output',
    defectResistance: 'defect resistance',
    researchSpeed: 'research speed'
};

window.NandChallenges = [
    // Beginner: Basic gates from NAND - Etcher only
    {
        id: 'nand_not',
        name: 'NOT from NAND',
        description: 'Build a NOT gate using only NAND gates. Hint: Connect both inputs of a NAND to the same signal.',
        difficulty: 'Beginner',
        bonus: { type: 'chipValue', value: 3 },
        inputs: ['A'],
        outputs: ['Q'],
        productionTier: 'etcher',
        productionDescription: 'Simple NAND circuit etched on wafer',
        testCases: [
            { inputs: { A: false }, outputs: { Q: true } },
            { inputs: { A: true }, outputs: { Q: false } }
        ]
    },
    {
        id: 'nand_and',
        name: 'AND from NAND',
        description: 'Build an AND gate using only NAND gates. Hint: NAND followed by NOT.',
        difficulty: 'Beginner',
        bonus: { type: 'etcherSpeed', value: 5 },
        inputs: ['A', 'B'],
        outputs: ['Q'],
        productionTier: 'etcher',
        productionDescription: 'Simple NAND circuit etched on wafer',
        testCases: [
            { inputs: { A: false, B: false }, outputs: { Q: false } },
            { inputs: { A: false, B: true }, outputs: { Q: false } },
            { inputs: { A: true, B: false }, outputs: { Q: false } },
            { inputs: { A: true, B: true }, outputs: { Q: true } }
        ]
    },
    {
        id: 'nand_or',
        name: 'OR from NAND',
        description: 'Build an OR gate using only NAND gates. Hint: NOT both inputs, then NAND them.',
        difficulty: 'Beginner',
        bonus: { type: 'chipValue', value: 3 },
        inputs: ['A', 'B'],
        outputs: ['Q'],
        productionTier: 'etcher',
        productionDescription: 'Simple NAND circuit etched on wafer',
        testCases: [
            { inputs: { A: false, B: false }, outputs: { Q: false } },
            { inputs: { A: false, B: true }, outputs: { Q: true } },
            { inputs: { A: true, B: false }, outputs: { Q: true } },
            { inputs: { A: true, B: true }, outputs: { Q: true } }
        ]
    },
    {
        id: 'nand_nor',
        name: 'NOR from NAND',
        description: 'Build a NOR gate using only NAND gates.',
        difficulty: 'Beginner',
        bonus: { type: 'sourceSpeed', value: 5 },
        inputs: ['A', 'B'],
        outputs: ['Q'],
        productionTier: 'etcher',
        productionDescription: 'Simple NAND circuit etched on wafer',
        testCases: [
            { inputs: { A: false, B: false }, outputs: { Q: true } },
            { inputs: { A: false, B: true }, outputs: { Q: false } },
            { inputs: { A: true, B: false }, outputs: { Q: false } },
            { inputs: { A: true, B: true }, outputs: { Q: false } }
        ]
    },

    // Intermediate: More complex gates - Wire Bonder required
    {
        id: 'nand_xor',
        name: 'XOR from NAND',
        description: 'Build an XOR gate using only NAND gates. This is a classic challenge!',
        difficulty: 'Intermediate',
        bonus: { type: 'bonderSpeed', value: 5 },
        inputs: ['A', 'B'],
        outputs: ['Q'],
        productionTier: 'bonder',
        productionDescription: 'Complex NAND network requires wire bonding',
        testCases: [
            { inputs: { A: false, B: false }, outputs: { Q: false } },
            { inputs: { A: false, B: true }, outputs: { Q: true } },
            { inputs: { A: true, B: false }, outputs: { Q: true } },
            { inputs: { A: true, B: true }, outputs: { Q: false } }
        ]
    },
    {
        id: 'nand_xnor',
        name: 'XNOR from NAND',
        description: 'Build an XNOR (equality) gate using only NAND gates.',
        difficulty: 'Intermediate',
        bonus: { type: 'chipValue', value: 4 },
        inputs: ['A', 'B'],
        outputs: ['Q'],
        productionTier: 'bonder',
        productionDescription: 'Complex NAND network requires wire bonding',
        testCases: [
            { inputs: { A: false, B: false }, outputs: { Q: true } },
            { inputs: { A: false, B: true }, outputs: { Q: false } },
            { inputs: { A: true, B: false }, outputs: { Q: false } },
            { inputs: { A: true, B: true }, outputs: { Q: true } }
        ]
    },
    {
        id: 'nand_implication',
        name: 'Implication from NAND',
        description: 'Build A implies B (A -> B = NOT A OR B) using only NAND gates.',
        difficulty: 'Intermediate',
        bonus: { type: 'jamResistance', value: 5 },
        inputs: ['A', 'B'],
        outputs: ['Q'],
        productionTier: 'bonder',
        productionDescription: 'Multi-gate NAND network requires wire bonding',
        testCases: [
            { inputs: { A: false, B: false }, outputs: { Q: true } },
            { inputs: { A: false, B: true }, outputs: { Q: true } },
            { inputs: { A: true, B: false }, outputs: { Q: false } },
            { inputs: { A: true, B: true }, outputs: { Q: true } }
        ]
    },
    {
        id: 'nand_3and',
        name: '3-Input AND',
        description: 'Build a 3-input AND gate using only NAND gates.',
        difficulty: 'Intermediate',
        bonus: { type: 'etcherSpeed', value: 5 },
        inputs: ['A', 'B', 'C'],
        outputs: ['Q'],
        productionTier: 'bonder',
        productionDescription: 'Multi-input NAND network requires wire bonding',
        testCases: [
            { inputs: { A: false, B: false, C: false }, outputs: { Q: false } },
            { inputs: { A: false, B: false, C: true }, outputs: { Q: false } },
            { inputs: { A: false, B: true, C: false }, outputs: { Q: false } },
            { inputs: { A: false, B: true, C: true }, outputs: { Q: false } },
            { inputs: { A: true, B: false, C: false }, outputs: { Q: false } },
            { inputs: { A: true, B: false, C: true }, outputs: { Q: false } },
            { inputs: { A: true, B: true, C: false }, outputs: { Q: false } },
            { inputs: { A: true, B: true, C: true }, outputs: { Q: true } }
        ]
    },
    {
        id: 'nand_3or',
        name: '3-Input OR',
        description: 'Build a 3-input OR gate using only NAND gates.',
        difficulty: 'Intermediate',
        bonus: { type: 'bonderSpeed', value: 5 },
        inputs: ['A', 'B', 'C'],
        outputs: ['Q'],
        productionTier: 'bonder',
        productionDescription: 'Multi-input NAND network requires wire bonding',
        testCases: [
            { inputs: { A: false, B: false, C: false }, outputs: { Q: false } },
            { inputs: { A: false, B: false, C: true }, outputs: { Q: true } },
            { inputs: { A: false, B: true, C: false }, outputs: { Q: true } },
            { inputs: { A: false, B: true, C: true }, outputs: { Q: true } },
            { inputs: { A: true, B: false, C: false }, outputs: { Q: true } },
            { inputs: { A: true, B: false, C: true }, outputs: { Q: true } },
            { inputs: { A: true, B: true, C: false }, outputs: { Q: true } },
            { inputs: { A: true, B: true, C: true }, outputs: { Q: true } }
        ]
    },

    // Advanced: Arithmetic circuits - Logic Integrator required
    {
        id: 'nand_half_adder',
        name: 'Half Adder',
        description: 'Build a half adder (S = A XOR B, C = A AND B) using only NAND gates.',
        difficulty: 'Advanced',
        bonus: { type: 'integratorSpeed', value: 8 },
        inputs: ['A', 'B'],
        outputs: ['S', 'C'],
        productionTier: 'integrator',
        productionDescription: 'Multi-output NAND circuit requires logic integration',
        testCases: [
            { inputs: { A: false, B: false }, outputs: { S: false, C: false } },
            { inputs: { A: false, B: true }, outputs: { S: true, C: false } },
            { inputs: { A: true, B: false }, outputs: { S: true, C: false } },
            { inputs: { A: true, B: true }, outputs: { S: false, C: true } }
        ]
    },
    {
        id: 'nand_mux',
        name: '2:1 Multiplexer',
        description: 'Build a 2:1 MUX (Q = A when S=0, Q = B when S=1) using only NAND gates.',
        difficulty: 'Advanced',
        bonus: { type: 'chipValue', value: 5 },
        inputs: ['A', 'B', 'S'],
        outputs: ['Q'],
        productionTier: 'integrator',
        productionDescription: 'Complex routing NAND circuit requires logic integration',
        testCases: [
            { inputs: { A: false, B: false, S: false }, outputs: { Q: false } },
            { inputs: { A: false, B: true, S: false }, outputs: { Q: false } },
            { inputs: { A: true, B: false, S: false }, outputs: { Q: true } },
            { inputs: { A: true, B: true, S: false }, outputs: { Q: true } },
            { inputs: { A: false, B: false, S: true }, outputs: { Q: false } },
            { inputs: { A: false, B: true, S: true }, outputs: { Q: true } },
            { inputs: { A: true, B: false, S: true }, outputs: { Q: false } },
            { inputs: { A: true, B: true, S: true }, outputs: { Q: true } }
        ]
    },
    {
        id: 'nand_demux',
        name: '1:2 Demultiplexer',
        description: 'Build a 1:2 DEMUX using only NAND gates. Y0 = D when S=0, Y1 = D when S=1.',
        difficulty: 'Advanced',
        bonus: { type: 'jamResistance', value: 8 },
        inputs: ['D', 'S'],
        outputs: ['Y0', 'Y1'],
        productionTier: 'integrator',
        productionDescription: 'Multi-output NAND demux requires logic integration',
        testCases: [
            { inputs: { D: false, S: false }, outputs: { Y0: false, Y1: false } },
            { inputs: { D: false, S: true }, outputs: { Y0: false, Y1: false } },
            { inputs: { D: true, S: false }, outputs: { Y0: true, Y1: false } },
            { inputs: { D: true, S: true }, outputs: { Y0: false, Y1: true } }
        ]
    },
    {
        id: 'nand_majority',
        name: 'Majority Gate',
        description: 'Build a majority gate (output HIGH if 2+ inputs are HIGH) using only NAND gates.',
        difficulty: 'Advanced',
        bonus: { type: 'allSpeed', value: 3 },
        inputs: ['A', 'B', 'C'],
        outputs: ['Q'],
        productionTier: 'integrator',
        productionDescription: 'Voting circuit NAND network requires logic integration',
        testCases: [
            { inputs: { A: false, B: false, C: false }, outputs: { Q: false } },
            { inputs: { A: false, B: false, C: true }, outputs: { Q: false } },
            { inputs: { A: false, B: true, C: false }, outputs: { Q: false } },
            { inputs: { A: false, B: true, C: true }, outputs: { Q: true } },
            { inputs: { A: true, B: false, C: false }, outputs: { Q: false } },
            { inputs: { A: true, B: false, C: true }, outputs: { Q: true } },
            { inputs: { A: true, B: true, C: false }, outputs: { Q: true } },
            { inputs: { A: true, B: true, C: true }, outputs: { Q: true } }
        ]
    },

    // Expert: Complex circuits - Full production line (Packager)
    {
        id: 'nand_full_adder',
        name: 'Full Adder',
        description: 'Build a full adder with carry-in using only NAND gates. The ultimate NAND challenge!',
        difficulty: 'Expert',
        bonus: { type: 'chipValue', value: 8 },
        inputs: ['A', 'B', 'Cin'],
        outputs: ['S', 'Cout'],
        productionTier: 'packager',
        productionDescription: 'Premium NAND circuit requires full packaging',
        testCases: [
            { inputs: { A: false, B: false, Cin: false }, outputs: { S: false, Cout: false } },
            { inputs: { A: false, B: false, Cin: true }, outputs: { S: true, Cout: false } },
            { inputs: { A: false, B: true, Cin: false }, outputs: { S: true, Cout: false } },
            { inputs: { A: false, B: true, Cin: true }, outputs: { S: false, Cout: true } },
            { inputs: { A: true, B: false, Cin: false }, outputs: { S: true, Cout: false } },
            { inputs: { A: true, B: false, Cin: true }, outputs: { S: false, Cout: true } },
            { inputs: { A: true, B: true, Cin: false }, outputs: { S: false, Cout: true } },
            { inputs: { A: true, B: true, Cin: true }, outputs: { S: true, Cout: true } }
        ]
    },
    {
        id: 'nand_comparator',
        name: '1-bit Comparator',
        description: 'Build a 1-bit comparator (GT, EQ, LT outputs) using only NAND gates.',
        difficulty: 'Expert',
        bonus: { type: 'packagerSpeed', value: 10 },
        inputs: ['A', 'B'],
        outputs: ['GT', 'EQ', 'LT'],
        productionTier: 'packager',
        productionDescription: 'Premium NAND circuit requires full packaging',
        testCases: [
            { inputs: { A: false, B: false }, outputs: { GT: false, EQ: true, LT: false } },
            { inputs: { A: false, B: true }, outputs: { GT: false, EQ: false, LT: true } },
            { inputs: { A: true, B: false }, outputs: { GT: true, EQ: false, LT: false } },
            { inputs: { A: true, B: true }, outputs: { GT: false, EQ: true, LT: false } }
        ]
    },
    {
        id: 'nand_decoder',
        name: '2:4 Decoder',
        description: 'Build a 2:4 decoder using only NAND gates. One-hot output based on 2-bit input.',
        difficulty: 'Expert',
        bonus: { type: 'allSpeed', value: 5 },
        inputs: ['A', 'B'],
        outputs: ['Y0', 'Y1', 'Y2', 'Y3'],
        productionTier: 'packager',
        productionDescription: 'Complex decoder requires full packaging',
        testCases: [
            { inputs: { A: false, B: false }, outputs: { Y0: true, Y1: false, Y2: false, Y3: false } },
            { inputs: { A: true, B: false }, outputs: { Y0: false, Y1: true, Y2: false, Y3: false } },
            { inputs: { A: false, B: true }, outputs: { Y0: false, Y1: false, Y2: true, Y3: false } },
            { inputs: { A: true, B: true }, outputs: { Y0: false, Y1: false, Y2: false, Y3: true } }
        ]
    },

    {
        id: 'nand_full_subtractor',
        name: 'Full Subtractor',
        description: 'Build a full subtractor using only NAND gates. Computes A - B - Bin = D with borrow output.',
        difficulty: 'Expert',
        bonus: { type: 'jamResistance', value: 10 },
        inputs: ['A', 'B', 'Bin'],
        outputs: ['D', 'Bout'],
        productionTier: 'packager',
        productionDescription: 'Arithmetic subtraction circuit requires full packaging',
        // D = A ⊕ B ⊕ Bin, Bout = (!A & B) | (!A & Bin) | (B & Bin)
        testCases: [
            { inputs: { A: false, B: false, Bin: false }, outputs: { D: false, Bout: false } }, // 0-0-0 = 0
            { inputs: { A: false, B: false, Bin: true },  outputs: { D: true,  Bout: true } },  // 0-0-1 = -1, borrow
            { inputs: { A: false, B: true,  Bin: false }, outputs: { D: true,  Bout: true } },  // 0-1-0 = -1, borrow
            { inputs: { A: false, B: true,  Bin: true },  outputs: { D: false, Bout: true } },  // 0-1-1 = -2, borrow
            { inputs: { A: true,  B: false, Bin: false }, outputs: { D: true,  Bout: false } }, // 1-0-0 = 1
            { inputs: { A: true,  B: false, Bin: true },  outputs: { D: false, Bout: false } }, // 1-0-1 = 0
            { inputs: { A: true,  B: true,  Bin: false }, outputs: { D: false, Bout: false } }, // 1-1-0 = 0
            { inputs: { A: true,  B: true,  Bin: true },  outputs: { D: true,  Bout: true } }   // 1-1-1 = -1, borrow
        ]
    },

    // Master: Prestige-only challenges with superior rewards
    // Requires 'advanced_nand_challenges' research (prestige 1+)
    {
        id: 'nand_2bit_adder',
        name: '2-Bit Adder',
        description: 'Build a 2-bit ripple carry adder using only NAND gates. Adds two 2-bit numbers (A1A0 + B1B0 = S2S1S0).',
        difficulty: 'Master',
        requiresResearch: 'advanced_nand_challenges',
        bonus: { type: 'chipValue', value: 15 },
        inputs: ['A0', 'A1', 'B0', 'B1'],
        outputs: ['S0', 'S1', 'S2'],
        productionTier: 'packager',
        productionDescription: 'Multi-bit arithmetic requires advanced packaging',
        testCases: [
            // All 16 combinations of 2-bit A (A1A0) + 2-bit B (B1B0) = 3-bit S (S2S1S0)
            { inputs: { A0: false, A1: false, B0: false, B1: false }, outputs: { S0: false, S1: false, S2: false } }, // 0+0=0
            { inputs: { A0: false, A1: false, B0: true, B1: false }, outputs: { S0: true, S1: false, S2: false } },  // 0+1=1
            { inputs: { A0: false, A1: false, B0: false, B1: true }, outputs: { S0: false, S1: true, S2: false } },  // 0+2=2
            { inputs: { A0: false, A1: false, B0: true, B1: true }, outputs: { S0: true, S1: true, S2: false } },    // 0+3=3
            { inputs: { A0: true, A1: false, B0: false, B1: false }, outputs: { S0: true, S1: false, S2: false } },  // 1+0=1
            { inputs: { A0: true, A1: false, B0: true, B1: false }, outputs: { S0: false, S1: true, S2: false } },   // 1+1=2
            { inputs: { A0: true, A1: false, B0: false, B1: true }, outputs: { S0: true, S1: true, S2: false } },    // 1+2=3
            { inputs: { A0: true, A1: false, B0: true, B1: true }, outputs: { S0: false, S1: false, S2: true } },    // 1+3=4
            { inputs: { A0: false, A1: true, B0: false, B1: false }, outputs: { S0: false, S1: true, S2: false } },  // 2+0=2
            { inputs: { A0: false, A1: true, B0: true, B1: false }, outputs: { S0: true, S1: true, S2: false } },    // 2+1=3
            { inputs: { A0: false, A1: true, B0: false, B1: true }, outputs: { S0: false, S1: false, S2: true } },   // 2+2=4
            { inputs: { A0: false, A1: true, B0: true, B1: true }, outputs: { S0: true, S1: false, S2: true } },     // 2+3=5
            { inputs: { A0: true, A1: true, B0: false, B1: false }, outputs: { S0: true, S1: true, S2: false } },    // 3+0=3
            { inputs: { A0: true, A1: true, B0: true, B1: false }, outputs: { S0: false, S1: false, S2: true } },    // 3+1=4
            { inputs: { A0: true, A1: true, B0: false, B1: true }, outputs: { S0: true, S1: false, S2: true } },     // 3+2=5
            { inputs: { A0: true, A1: true, B0: true, B1: true }, outputs: { S0: false, S1: true, S2: true } }       // 3+3=6
        ]
    },
    {
        id: 'nand_4to1_mux',
        name: '4:1 Multiplexer',
        description: 'Build a 4:1 MUX using only NAND gates. Select one of four inputs based on 2 select lines.',
        difficulty: 'Master',
        requiresResearch: 'advanced_nand_challenges',
        bonus: { type: 'allSpeed', value: 10 },
        inputs: ['D0', 'D1', 'D2', 'D3', 'S0', 'S1'],
        outputs: ['Q'],
        productionTier: 'packager',
        productionDescription: 'Complex routing NAND circuit requires advanced packaging',
        testCases: [
            // S=00: select D0
            { inputs: { D0: true, D1: false, D2: false, D3: false, S0: false, S1: false }, outputs: { Q: true } },
            { inputs: { D0: false, D1: true, D2: true, D3: true, S0: false, S1: false }, outputs: { Q: false } },
            // S=01: select D1
            { inputs: { D0: false, D1: true, D2: false, D3: false, S0: true, S1: false }, outputs: { Q: true } },
            { inputs: { D0: true, D1: false, D2: true, D3: true, S0: true, S1: false }, outputs: { Q: false } },
            // S=10: select D2
            { inputs: { D0: false, D1: false, D2: true, D3: false, S0: false, S1: true }, outputs: { Q: true } },
            { inputs: { D0: true, D1: true, D2: false, D3: true, S0: false, S1: true }, outputs: { Q: false } },
            // S=11: select D3
            { inputs: { D0: false, D1: false, D2: false, D3: true, S0: true, S1: true }, outputs: { Q: true } },
            { inputs: { D0: true, D1: true, D2: true, D3: false, S0: true, S1: true }, outputs: { Q: false } },
            // All inputs same
            { inputs: { D0: true, D1: true, D2: true, D3: true, S0: false, S1: false }, outputs: { Q: true } },
            { inputs: { D0: false, D1: false, D2: false, D3: false, S0: true, S1: true }, outputs: { Q: false } },
            // Ensure non-selected inputs don't leak
            { inputs: { D0: true, D1: false, D2: false, D3: false, S0: true, S1: false }, outputs: { Q: false } },
            { inputs: { D0: false, D1: true, D2: false, D3: false, S0: false, S1: true }, outputs: { Q: false } }
        ]
    },
    {
        id: 'nand_priority_encoder',
        name: 'Priority Encoder',
        description: 'Build a 4:2 priority encoder using only NAND gates. Output the index of the highest active input.',
        difficulty: 'Master',
        requiresResearch: 'advanced_nand_challenges',
        bonus: { type: 'etcherSpeed', value: 15 },
        inputs: ['D0', 'D1', 'D2', 'D3'],
        outputs: ['Y0', 'Y1', 'V'],  // V = valid (any input active)
        productionTier: 'packager',
        productionDescription: 'Priority logic requires advanced packaging',
        testCases: [
            // All 16 combinations - highest active input determines output
            { inputs: { D0: false, D1: false, D2: false, D3: false }, outputs: { Y0: false, Y1: false, V: false } }, // None active
            { inputs: { D0: true, D1: false, D2: false, D3: false }, outputs: { Y0: false, Y1: false, V: true } },  // Only D0 -> 00
            { inputs: { D0: false, D1: true, D2: false, D3: false }, outputs: { Y0: true, Y1: false, V: true } },   // Only D1 -> 01
            { inputs: { D0: true, D1: true, D2: false, D3: false }, outputs: { Y0: true, Y1: false, V: true } },    // D1 highest -> 01
            { inputs: { D0: false, D1: false, D2: true, D3: false }, outputs: { Y0: false, Y1: true, V: true } },   // Only D2 -> 10
            { inputs: { D0: true, D1: false, D2: true, D3: false }, outputs: { Y0: false, Y1: true, V: true } },    // D2 highest -> 10
            { inputs: { D0: false, D1: true, D2: true, D3: false }, outputs: { Y0: false, Y1: true, V: true } },    // D2 highest -> 10
            { inputs: { D0: true, D1: true, D2: true, D3: false }, outputs: { Y0: false, Y1: true, V: true } },     // D2 highest -> 10
            { inputs: { D0: false, D1: false, D2: false, D3: true }, outputs: { Y0: true, Y1: true, V: true } },    // Only D3 -> 11
            { inputs: { D0: true, D1: false, D2: false, D3: true }, outputs: { Y0: true, Y1: true, V: true } },     // D3 highest -> 11
            { inputs: { D0: false, D1: true, D2: false, D3: true }, outputs: { Y0: true, Y1: true, V: true } },     // D3 highest -> 11
            { inputs: { D0: true, D1: true, D2: false, D3: true }, outputs: { Y0: true, Y1: true, V: true } },      // D3 highest -> 11
            { inputs: { D0: false, D1: false, D2: true, D3: true }, outputs: { Y0: true, Y1: true, V: true } },     // D3 highest -> 11
            { inputs: { D0: true, D1: false, D2: true, D3: true }, outputs: { Y0: true, Y1: true, V: true } },      // D3 highest -> 11
            { inputs: { D0: false, D1: true, D2: true, D3: true }, outputs: { Y0: true, Y1: true, V: true } },      // D3 highest -> 11
            { inputs: { D0: true, D1: true, D2: true, D3: true }, outputs: { Y0: true, Y1: true, V: true } }        // D3 highest -> 11
        ]
    },
    {
        id: 'nand_alu_add_sub',
        name: 'ALU: Add/Subtract',
        description: 'Build a 1-bit ALU that can add or subtract based on a mode bit. When M=0, compute A+B+Cin with carry. When M=1, compute A-B-Cin with borrow.',
        difficulty: 'Master',
        requiresResearch: 'advanced_nand_challenges',
        bonus: { type: 'integratorSpeed', value: 20 },
        inputs: ['A', 'B', 'Cin', 'M'],  // M = mode (0=add, 1=subtract)
        outputs: ['S', 'Cout'],
        productionTier: 'packager',
        productionDescription: 'ALU operations require advanced packaging',
        // S = A ⊕ B ⊕ Cin (same for both modes)
        // When M=0 (add): Cout = carry = MAJ(A, B, Cin)
        // When M=1 (sub): Cout = borrow = MAJ(!A, B, Cin) — matches full subtractor
        // Elegant NAND solution: Cout = MAJ(A⊕M, B, Cin)
        testCases: [
            // ADD mode (M=0): S = A + B + Cin, Cout = carry
            { inputs: { A: false, B: false, Cin: false, M: false }, outputs: { S: false, Cout: false } }, // 0+0+0=0
            { inputs: { A: false, B: false, Cin: true, M: false }, outputs: { S: true, Cout: false } },  // 0+0+1=1
            { inputs: { A: false, B: true, Cin: false, M: false }, outputs: { S: true, Cout: false } },  // 0+1+0=1
            { inputs: { A: false, B: true, Cin: true, M: false }, outputs: { S: false, Cout: true } },   // 0+1+1=10
            { inputs: { A: true, B: false, Cin: false, M: false }, outputs: { S: true, Cout: false } },  // 1+0+0=1
            { inputs: { A: true, B: false, Cin: true, M: false }, outputs: { S: false, Cout: true } },   // 1+0+1=10
            { inputs: { A: true, B: true, Cin: false, M: false }, outputs: { S: false, Cout: true } },   // 1+1+0=10
            { inputs: { A: true, B: true, Cin: true, M: false }, outputs: { S: true, Cout: true } },     // 1+1+1=11
            // SUB mode (M=1): S = A - B - Cin, Cout = borrow
            { inputs: { A: false, B: false, Cin: false, M: true }, outputs: { S: false, Cout: false } }, // 0-0-0=0
            { inputs: { A: false, B: false, Cin: true, M: true }, outputs: { S: true, Cout: true } },    // 0-0-1=-1, borrow
            { inputs: { A: false, B: true, Cin: false, M: true }, outputs: { S: true, Cout: true } },    // 0-1-0=-1, borrow
            { inputs: { A: false, B: true, Cin: true, M: true }, outputs: { S: false, Cout: true } },    // 0-1-1=-2, borrow
            { inputs: { A: true, B: false, Cin: false, M: true }, outputs: { S: true, Cout: false } },   // 1-0-0=1
            { inputs: { A: true, B: false, Cin: true, M: true }, outputs: { S: false, Cout: false } },   // 1-0-1=0
            { inputs: { A: true, B: true, Cin: false, M: true }, outputs: { S: false, Cout: false } },   // 1-1-0=0
            { inputs: { A: true, B: true, Cin: true, M: true }, outputs: { S: true, Cout: true } }       // 1-1-1=-1, borrow
        ]
    },
    {
        id: 'nand_2bit_multiplier',
        name: '2-Bit Multiplier',
        description: 'Build a 2-bit multiplier using only NAND gates. Multiplies A1A0 × B1B0 = P3P2P1P0.',
        difficulty: 'Master',
        requiresResearch: 'advanced_nand_challenges',
        bonus: { type: 'integratorSpeed', value: 15 },
        inputs: ['A0', 'A1', 'B0', 'B1'],
        outputs: ['P0', 'P1', 'P2', 'P3'],
        productionTier: 'packager',
        productionDescription: 'Binary multiplier requires advanced packaging',
        // P = (A1*2+A0) × (B1*2+B0), all 16 input combinations
        testCases: [
            { inputs: { A0: false, A1: false, B0: false, B1: false }, outputs: { P0: false, P1: false, P2: false, P3: false } }, // 0×0=0
            { inputs: { A0: false, A1: false, B0: true,  B1: false }, outputs: { P0: false, P1: false, P2: false, P3: false } }, // 0×1=0
            { inputs: { A0: false, A1: false, B0: false, B1: true },  outputs: { P0: false, P1: false, P2: false, P3: false } }, // 0×2=0
            { inputs: { A0: false, A1: false, B0: true,  B1: true },  outputs: { P0: false, P1: false, P2: false, P3: false } }, // 0×3=0
            { inputs: { A0: true,  A1: false, B0: false, B1: false }, outputs: { P0: false, P1: false, P2: false, P3: false } }, // 1×0=0
            { inputs: { A0: true,  A1: false, B0: true,  B1: false }, outputs: { P0: true,  P1: false, P2: false, P3: false } }, // 1×1=1
            { inputs: { A0: true,  A1: false, B0: false, B1: true },  outputs: { P0: false, P1: true,  P2: false, P3: false } }, // 1×2=2
            { inputs: { A0: true,  A1: false, B0: true,  B1: true },  outputs: { P0: true,  P1: true,  P2: false, P3: false } }, // 1×3=3
            { inputs: { A0: false, A1: true,  B0: false, B1: false }, outputs: { P0: false, P1: false, P2: false, P3: false } }, // 2×0=0
            { inputs: { A0: false, A1: true,  B0: true,  B1: false }, outputs: { P0: false, P1: true,  P2: false, P3: false } }, // 2×1=2
            { inputs: { A0: false, A1: true,  B0: false, B1: true },  outputs: { P0: false, P1: false, P2: true,  P3: false } }, // 2×2=4
            { inputs: { A0: false, A1: true,  B0: true,  B1: true },  outputs: { P0: false, P1: true,  P2: true,  P3: false } }, // 2×3=6
            { inputs: { A0: true,  A1: true,  B0: false, B1: false }, outputs: { P0: false, P1: false, P2: false, P3: false } }, // 3×0=0
            { inputs: { A0: true,  A1: true,  B0: true,  B1: false }, outputs: { P0: true,  P1: true,  P2: false, P3: false } }, // 3×1=3
            { inputs: { A0: true,  A1: true,  B0: false, B1: true },  outputs: { P0: false, P1: true,  P2: true,  P3: false } }, // 3×2=6
            { inputs: { A0: true,  A1: true,  B0: true,  B1: true },  outputs: { P0: true,  P1: false, P2: false, P3: true } }  // 3×3=9
        ]
    },
    {
        id: 'nand_magnitude_comparator_2bit',
        name: '2-Bit Magnitude Comparator',
        description: 'Build a 2-bit magnitude comparator. Compare two 2-bit numbers and output GT, EQ, LT.',
        difficulty: 'Master',
        requiresResearch: 'advanced_nand_challenges',
        bonus: { type: 'bonderSpeed', value: 15 },
        inputs: ['A0', 'A1', 'B0', 'B1'],
        outputs: ['GT', 'EQ', 'LT'],
        productionTier: 'packager',
        productionDescription: 'Multi-bit comparison requires advanced packaging',
        testCases: [
            // All 16 combinations of 2-bit A vs 2-bit B
            { inputs: { A0: false, A1: false, B0: false, B1: false }, outputs: { GT: false, EQ: true, LT: false } },  // 0==0
            { inputs: { A0: false, A1: false, B0: true, B1: false }, outputs: { GT: false, EQ: false, LT: true } },   // 0<1
            { inputs: { A0: false, A1: false, B0: false, B1: true }, outputs: { GT: false, EQ: false, LT: true } },   // 0<2
            { inputs: { A0: false, A1: false, B0: true, B1: true }, outputs: { GT: false, EQ: false, LT: true } },    // 0<3
            { inputs: { A0: true, A1: false, B0: false, B1: false }, outputs: { GT: true, EQ: false, LT: false } },   // 1>0
            { inputs: { A0: true, A1: false, B0: true, B1: false }, outputs: { GT: false, EQ: true, LT: false } },    // 1==1
            { inputs: { A0: true, A1: false, B0: false, B1: true }, outputs: { GT: false, EQ: false, LT: true } },    // 1<2
            { inputs: { A0: true, A1: false, B0: true, B1: true }, outputs: { GT: false, EQ: false, LT: true } },     // 1<3
            { inputs: { A0: false, A1: true, B0: false, B1: false }, outputs: { GT: true, EQ: false, LT: false } },   // 2>0
            { inputs: { A0: false, A1: true, B0: true, B1: false }, outputs: { GT: true, EQ: false, LT: false } },    // 2>1
            { inputs: { A0: false, A1: true, B0: false, B1: true }, outputs: { GT: false, EQ: true, LT: false } },    // 2==2
            { inputs: { A0: false, A1: true, B0: true, B1: true }, outputs: { GT: false, EQ: false, LT: true } },     // 2<3
            { inputs: { A0: true, A1: true, B0: false, B1: false }, outputs: { GT: true, EQ: false, LT: false } },    // 3>0
            { inputs: { A0: true, A1: true, B0: true, B1: false }, outputs: { GT: true, EQ: false, LT: false } },     // 3>1
            { inputs: { A0: true, A1: true, B0: false, B1: true }, outputs: { GT: true, EQ: false, LT: false } },     // 3>2
            { inputs: { A0: true, A1: true, B0: true, B1: true }, outputs: { GT: false, EQ: true, LT: false } }       // 3==3
        ]
    },
    {
        id: 'nand_parity_generator',
        name: '4-Bit Parity Generator',
        description: 'Build a 4-bit even parity generator. P=1 if odd number of inputs are 1.',
        difficulty: 'Master',
        requiresResearch: 'advanced_nand_challenges',
        bonus: { type: 'packagerSpeed', value: 20 },
        inputs: ['D0', 'D1', 'D2', 'D3'],
        outputs: ['P'],
        productionTier: 'packager',
        productionDescription: 'Error detection circuit requires advanced packaging',
        testCases: [
            // All 16 combinations - P=1 if odd number of inputs are 1
            { inputs: { D0: false, D1: false, D2: false, D3: false }, outputs: { P: false } }, // 0 ones
            { inputs: { D0: true, D1: false, D2: false, D3: false }, outputs: { P: true } },   // 1 one
            { inputs: { D0: false, D1: true, D2: false, D3: false }, outputs: { P: true } },   // 1 one
            { inputs: { D0: true, D1: true, D2: false, D3: false }, outputs: { P: false } },   // 2 ones
            { inputs: { D0: false, D1: false, D2: true, D3: false }, outputs: { P: true } },   // 1 one
            { inputs: { D0: true, D1: false, D2: true, D3: false }, outputs: { P: false } },   // 2 ones
            { inputs: { D0: false, D1: true, D2: true, D3: false }, outputs: { P: false } },   // 2 ones
            { inputs: { D0: true, D1: true, D2: true, D3: false }, outputs: { P: true } },     // 3 ones
            { inputs: { D0: false, D1: false, D2: false, D3: true }, outputs: { P: true } },   // 1 one
            { inputs: { D0: true, D1: false, D2: false, D3: true }, outputs: { P: false } },   // 2 ones
            { inputs: { D0: false, D1: true, D2: false, D3: true }, outputs: { P: false } },   // 2 ones
            { inputs: { D0: true, D1: true, D2: false, D3: true }, outputs: { P: true } },     // 3 ones
            { inputs: { D0: false, D1: false, D2: true, D3: true }, outputs: { P: false } },   // 2 ones
            { inputs: { D0: true, D1: false, D2: true, D3: true }, outputs: { P: true } },     // 3 ones
            { inputs: { D0: false, D1: true, D2: true, D3: true }, outputs: { P: true } },     // 3 ones
            { inputs: { D0: true, D1: true, D2: true, D3: true }, outputs: { P: false } }      // 4 ones
        ]
    },
    {
        id: 'nand_barrel_shifter',
        name: '2-Bit Barrel Shifter',
        description: 'Build a 2-bit left barrel shifter. Shift D1D0 left by S positions (0-1), wrapping around.',
        difficulty: 'Master',
        requiresResearch: 'advanced_nand_challenges',
        bonus: { type: 'sourceSpeed', value: 15 },
        inputs: ['D0', 'D1', 'S'],
        outputs: ['Q0', 'Q1'],
        productionTier: 'packager',
        productionDescription: 'Bit manipulation requires advanced packaging',
        testCases: [
            // All 8 combinations - shift D1D0 left by S positions, wrapping
            { inputs: { D0: false, D1: false, S: false }, outputs: { Q0: false, Q1: false } }, // 00 << 0 = 00
            { inputs: { D0: false, D1: false, S: true }, outputs: { Q0: false, Q1: false } },  // 00 << 1 = 00
            { inputs: { D0: true, D1: false, S: false }, outputs: { Q0: true, Q1: false } },   // 01 << 0 = 01
            { inputs: { D0: true, D1: false, S: true }, outputs: { Q0: false, Q1: true } },    // 01 << 1 = 10
            { inputs: { D0: false, D1: true, S: false }, outputs: { Q0: false, Q1: true } },   // 10 << 0 = 10
            { inputs: { D0: false, D1: true, S: true }, outputs: { Q0: true, Q1: false } },    // 10 << 1 = 01 (wrap)
            { inputs: { D0: true, D1: true, S: false }, outputs: { Q0: true, Q1: true } },     // 11 << 0 = 11
            { inputs: { D0: true, D1: true, S: true }, outputs: { Q0: true, Q1: true } }       // 11 << 1 = 11 (wrap)
        ]
    },

    // ==================== Void Tier ====================
    // Unlocked by expert_firmware_challenges void upgrade (200 VP)
    // Weird, unconventional 4-bit logic problems

    {
        id: 'nand_prime_detector',
        name: 'Void Whisper',
        description: 'Output 1 if the 4-bit input is a prime number (2,3,5,7,11,13). An irregular truth table with no clean Boolean pattern.',
        difficulty: 'Void',
        requiresVoidUpgrade: 'expert_firmware_challenges',
        bonus: { type: 'defectResistance', value: 15 },
        inputs: ['B0', 'B1', 'B2', 'B3'],
        outputs: ['P'],
        productionTier: 'packager',
        productionDescription: 'Void-grade firmware requires advanced packaging',
        testCases: [
            { inputs: { B0: false, B1: false, B2: false, B3: false }, outputs: { P: false } }, // 0
            { inputs: { B0: true,  B1: false, B2: false, B3: false }, outputs: { P: false } }, // 1
            { inputs: { B0: false, B1: true,  B2: false, B3: false }, outputs: { P: true  } }, // 2
            { inputs: { B0: true,  B1: true,  B2: false, B3: false }, outputs: { P: true  } }, // 3
            { inputs: { B0: false, B1: false, B2: true,  B3: false }, outputs: { P: false } }, // 4
            { inputs: { B0: true,  B1: false, B2: true,  B3: false }, outputs: { P: true  } }, // 5
            { inputs: { B0: false, B1: true,  B2: true,  B3: false }, outputs: { P: false } }, // 6
            { inputs: { B0: true,  B1: true,  B2: true,  B3: false }, outputs: { P: true  } }, // 7
            { inputs: { B0: false, B1: false, B2: false, B3: true  }, outputs: { P: false } }, // 8
            { inputs: { B0: true,  B1: false, B2: false, B3: true  }, outputs: { P: false } }, // 9
            { inputs: { B0: false, B1: true,  B2: false, B3: true  }, outputs: { P: false } }, // 10
            { inputs: { B0: true,  B1: true,  B2: false, B3: true  }, outputs: { P: true  } }, // 11
            { inputs: { B0: false, B1: false, B2: true,  B3: true  }, outputs: { P: false } }, // 12
            { inputs: { B0: true,  B1: false, B2: true,  B3: true  }, outputs: { P: true  } }, // 13
            { inputs: { B0: false, B1: true,  B2: true,  B3: true  }, outputs: { P: false } }, // 14
            { inputs: { B0: true,  B1: true,  B2: true,  B3: true  }, outputs: { P: false } }  // 15
        ]
    },
    {
        id: 'nand_gray_code',
        name: 'Phase Collapse',
        description: 'Convert a 4-bit binary input to Gray code. G3=B3, G2=B3⊕B2, G1=B2⊕B1, G0=B1⊕B0. XOR-heavy — each output is a NAND decomposition of XOR.',
        difficulty: 'Void',
        requiresVoidUpgrade: 'expert_firmware_challenges',
        bonus: { type: 'etcherSpeed', value: 20 },
        inputs: ['B0', 'B1', 'B2', 'B3'],
        outputs: ['G0', 'G1', 'G2', 'G3'],
        productionTier: 'packager',
        productionDescription: 'Gray code converter requires advanced packaging',
        testCases: [
            { inputs: { B0: false, B1: false, B2: false, B3: false }, outputs: { G0: false, G1: false, G2: false, G3: false } }, // 0→0
            { inputs: { B0: true,  B1: false, B2: false, B3: false }, outputs: { G0: true,  G1: false, G2: false, G3: false } }, // 1→1
            { inputs: { B0: false, B1: true,  B2: false, B3: false }, outputs: { G0: true,  G1: true,  G2: false, G3: false } }, // 2→3
            { inputs: { B0: true,  B1: true,  B2: false, B3: false }, outputs: { G0: false, G1: true,  G2: false, G3: false } }, // 3→2
            { inputs: { B0: false, B1: false, B2: true,  B3: false }, outputs: { G0: false, G1: true,  G2: true,  G3: false } }, // 4→6
            { inputs: { B0: true,  B1: false, B2: true,  B3: false }, outputs: { G0: true,  G1: true,  G2: true,  G3: false } }, // 5→7
            { inputs: { B0: false, B1: true,  B2: true,  B3: false }, outputs: { G0: true,  G1: false, G2: true,  G3: false } }, // 6→5
            { inputs: { B0: true,  B1: true,  B2: true,  B3: false }, outputs: { G0: false, G1: false, G2: true,  G3: false } }, // 7→4
            { inputs: { B0: false, B1: false, B2: false, B3: true  }, outputs: { G0: false, G1: false, G2: true,  G3: true  } }, // 8→12
            { inputs: { B0: true,  B1: false, B2: false, B3: true  }, outputs: { G0: true,  G1: false, G2: true,  G3: true  } }, // 9→13
            { inputs: { B0: false, B1: true,  B2: false, B3: true  }, outputs: { G0: true,  G1: true,  G2: true,  G3: true  } }, // 10→15
            { inputs: { B0: true,  B1: true,  B2: false, B3: true  }, outputs: { G0: false, G1: true,  G2: true,  G3: true  } }, // 11→14
            { inputs: { B0: false, B1: false, B2: true,  B3: true  }, outputs: { G0: false, G1: true,  G2: false, G3: true  } }, // 12→10
            { inputs: { B0: true,  B1: false, B2: true,  B3: true  }, outputs: { G0: true,  G1: true,  G2: false, G3: true  } }, // 13→11
            { inputs: { B0: false, B1: true,  B2: true,  B3: true  }, outputs: { G0: true,  G1: false, G2: false, G3: true  } }, // 14→9
            { inputs: { B0: true,  B1: true,  B2: true,  B3: true  }, outputs: { G0: false, G1: false, G2: false, G3: true  } }  // 15→8
        ]
    },
    {
        id: 'nand_popcount',
        name: 'Entropy Count',
        description: 'Count the number of 1-bits in a 4-bit input, output as 3-bit binary (0-4). Requires a full adder tree — roughly 30 NAND gates.',
        difficulty: 'Void',
        requiresVoidUpgrade: 'expert_firmware_challenges',
        bonus: { type: 'researchSpeed', value: 15 },
        inputs: ['B0', 'B1', 'B2', 'B3'],
        outputs: ['C0', 'C1', 'C2'],
        productionTier: 'packager',
        productionDescription: 'Population count circuit requires advanced packaging',
        testCases: [
            { inputs: { B0: false, B1: false, B2: false, B3: false }, outputs: { C0: false, C1: false, C2: false } }, // 0 ones
            { inputs: { B0: true,  B1: false, B2: false, B3: false }, outputs: { C0: true,  C1: false, C2: false } }, // 1 one
            { inputs: { B0: false, B1: true,  B2: false, B3: false }, outputs: { C0: true,  C1: false, C2: false } }, // 1 one
            { inputs: { B0: true,  B1: true,  B2: false, B3: false }, outputs: { C0: false, C1: true,  C2: false } }, // 2 ones
            { inputs: { B0: false, B1: false, B2: true,  B3: false }, outputs: { C0: true,  C1: false, C2: false } }, // 1 one
            { inputs: { B0: true,  B1: false, B2: true,  B3: false }, outputs: { C0: false, C1: true,  C2: false } }, // 2 ones
            { inputs: { B0: false, B1: true,  B2: true,  B3: false }, outputs: { C0: false, C1: true,  C2: false } }, // 2 ones
            { inputs: { B0: true,  B1: true,  B2: true,  B3: false }, outputs: { C0: true,  C1: true,  C2: false } }, // 3 ones
            { inputs: { B0: false, B1: false, B2: false, B3: true  }, outputs: { C0: true,  C1: false, C2: false } }, // 1 one
            { inputs: { B0: true,  B1: false, B2: false, B3: true  }, outputs: { C0: false, C1: true,  C2: false } }, // 2 ones
            { inputs: { B0: false, B1: true,  B2: false, B3: true  }, outputs: { C0: false, C1: true,  C2: false } }, // 2 ones
            { inputs: { B0: true,  B1: true,  B2: false, B3: true  }, outputs: { C0: true,  C1: true,  C2: false } }, // 3 ones
            { inputs: { B0: false, B1: false, B2: true,  B3: true  }, outputs: { C0: false, C1: true,  C2: false } }, // 2 ones
            { inputs: { B0: true,  B1: false, B2: true,  B3: true  }, outputs: { C0: true,  C1: true,  C2: false } }, // 3 ones
            { inputs: { B0: false, B1: true,  B2: true,  B3: true  }, outputs: { C0: true,  C1: true,  C2: false } }, // 3 ones
            { inputs: { B0: true,  B1: true,  B2: true,  B3: true  }, outputs: { C0: false, C1: false, C2: true  } }  // 4 ones
        ]
    },
    {
        id: 'nand_fibonacci',
        name: 'Dimensional Rift',
        description: 'Output 1 if the 4-bit input is a Fibonacci number (0,1,2,3,5,8,13). Another irregular truth table that resists simplification.',
        difficulty: 'Void',
        requiresVoidUpgrade: 'expert_firmware_challenges',
        bonus: { type: 'jamResistance', value: 20 },
        inputs: ['B0', 'B1', 'B2', 'B3'],
        outputs: ['F'],
        productionTier: 'packager',
        productionDescription: 'Fibonacci detector requires advanced packaging',
        testCases: [
            { inputs: { B0: false, B1: false, B2: false, B3: false }, outputs: { F: true  } }, // 0 ✓
            { inputs: { B0: true,  B1: false, B2: false, B3: false }, outputs: { F: true  } }, // 1 ✓
            { inputs: { B0: false, B1: true,  B2: false, B3: false }, outputs: { F: true  } }, // 2 ✓
            { inputs: { B0: true,  B1: true,  B2: false, B3: false }, outputs: { F: true  } }, // 3 ✓
            { inputs: { B0: false, B1: false, B2: true,  B3: false }, outputs: { F: false } }, // 4
            { inputs: { B0: true,  B1: false, B2: true,  B3: false }, outputs: { F: true  } }, // 5 ✓
            { inputs: { B0: false, B1: true,  B2: true,  B3: false }, outputs: { F: false } }, // 6
            { inputs: { B0: true,  B1: true,  B2: true,  B3: false }, outputs: { F: false } }, // 7
            { inputs: { B0: false, B1: false, B2: false, B3: true  }, outputs: { F: true  } }, // 8 ✓
            { inputs: { B0: true,  B1: false, B2: false, B3: true  }, outputs: { F: false } }, // 9
            { inputs: { B0: false, B1: true,  B2: false, B3: true  }, outputs: { F: false } }, // 10
            { inputs: { B0: true,  B1: true,  B2: false, B3: true  }, outputs: { F: false } }, // 11
            { inputs: { B0: false, B1: false, B2: true,  B3: true  }, outputs: { F: false } }, // 12
            { inputs: { B0: true,  B1: false, B2: true,  B3: true  }, outputs: { F: true  } }, // 13 ✓
            { inputs: { B0: false, B1: true,  B2: true,  B3: true  }, outputs: { F: false } }, // 14
            { inputs: { B0: true,  B1: true,  B2: true,  B3: true  }, outputs: { F: false } }  // 15
        ]
    },
    {
        id: 'nand_mod3',
        name: 'Void Resonance',
        description: 'Compute N mod 3 for a 4-bit input, output as 2-bit result. No clean bit-manipulation shortcut exists — pure combinational logic.',
        difficulty: 'Void',
        requiresVoidUpgrade: 'expert_firmware_challenges',
        bonus: { type: 'allSpeed', value: 15 },
        inputs: ['B0', 'B1', 'B2', 'B3'],
        outputs: ['R0', 'R1'],
        productionTier: 'packager',
        productionDescription: 'Modular arithmetic circuit requires advanced packaging',
        testCases: [
            { inputs: { B0: false, B1: false, B2: false, B3: false }, outputs: { R0: false, R1: false } }, // 0 mod 3 = 0
            { inputs: { B0: true,  B1: false, B2: false, B3: false }, outputs: { R0: true,  R1: false } }, // 1 mod 3 = 1
            { inputs: { B0: false, B1: true,  B2: false, B3: false }, outputs: { R0: false, R1: true  } }, // 2 mod 3 = 2
            { inputs: { B0: true,  B1: true,  B2: false, B3: false }, outputs: { R0: false, R1: false } }, // 3 mod 3 = 0
            { inputs: { B0: false, B1: false, B2: true,  B3: false }, outputs: { R0: true,  R1: false } }, // 4 mod 3 = 1
            { inputs: { B0: true,  B1: false, B2: true,  B3: false }, outputs: { R0: false, R1: true  } }, // 5 mod 3 = 2
            { inputs: { B0: false, B1: true,  B2: true,  B3: false }, outputs: { R0: false, R1: false } }, // 6 mod 3 = 0
            { inputs: { B0: true,  B1: true,  B2: true,  B3: false }, outputs: { R0: true,  R1: false } }, // 7 mod 3 = 1
            { inputs: { B0: false, B1: false, B2: false, B3: true  }, outputs: { R0: false, R1: true  } }, // 8 mod 3 = 2
            { inputs: { B0: true,  B1: false, B2: false, B3: true  }, outputs: { R0: false, R1: false } }, // 9 mod 3 = 0
            { inputs: { B0: false, B1: true,  B2: false, B3: true  }, outputs: { R0: true,  R1: false } }, // 10 mod 3 = 1
            { inputs: { B0: true,  B1: true,  B2: false, B3: true  }, outputs: { R0: false, R1: true  } }, // 11 mod 3 = 2
            { inputs: { B0: false, B1: false, B2: true,  B3: true  }, outputs: { R0: false, R1: false } }, // 12 mod 3 = 0
            { inputs: { B0: true,  B1: false, B2: true,  B3: true  }, outputs: { R0: true,  R1: false } }, // 13 mod 3 = 1
            { inputs: { B0: false, B1: true,  B2: true,  B3: true  }, outputs: { R0: false, R1: true  } }, // 14 mod 3 = 2
            { inputs: { B0: true,  B1: true,  B2: true,  B3: true  }, outputs: { R0: false, R1: false } }  // 15 mod 3 = 0
        ]
    },
    {
        id: 'nand_clz',
        name: 'Singularity Gate',
        description: 'Count leading zeros of a 4-bit input (2-bit count) plus an all-zero flag. Priority encoder logic — MSB takes precedence.',
        difficulty: 'Void',
        requiresVoidUpgrade: 'expert_firmware_challenges',
        bonus: { type: 'sourceSpeed', value: 25 },
        inputs: ['B0', 'B1', 'B2', 'B3'],
        outputs: ['C0', 'C1', 'Z'],
        productionTier: 'packager',
        productionDescription: 'Priority encoder requires advanced packaging',
        testCases: [
            { inputs: { B0: false, B1: false, B2: false, B3: false }, outputs: { C0: false, C1: false, Z: true  } }, // 0: all zero
            { inputs: { B0: true,  B1: false, B2: false, B3: false }, outputs: { C0: true,  C1: true,  Z: false } }, // 1: CLZ=3
            { inputs: { B0: false, B1: true,  B2: false, B3: false }, outputs: { C0: false, C1: true,  Z: false } }, // 2: CLZ=2
            { inputs: { B0: true,  B1: true,  B2: false, B3: false }, outputs: { C0: false, C1: true,  Z: false } }, // 3: CLZ=2
            { inputs: { B0: false, B1: false, B2: true,  B3: false }, outputs: { C0: true,  C1: false, Z: false } }, // 4: CLZ=1
            { inputs: { B0: true,  B1: false, B2: true,  B3: false }, outputs: { C0: true,  C1: false, Z: false } }, // 5: CLZ=1
            { inputs: { B0: false, B1: true,  B2: true,  B3: false }, outputs: { C0: true,  C1: false, Z: false } }, // 6: CLZ=1
            { inputs: { B0: true,  B1: true,  B2: true,  B3: false }, outputs: { C0: true,  C1: false, Z: false } }, // 7: CLZ=1
            { inputs: { B0: false, B1: false, B2: false, B3: true  }, outputs: { C0: false, C1: false, Z: false } }, // 8: CLZ=0
            { inputs: { B0: true,  B1: false, B2: false, B3: true  }, outputs: { C0: false, C1: false, Z: false } }, // 9: CLZ=0
            { inputs: { B0: false, B1: true,  B2: false, B3: true  }, outputs: { C0: false, C1: false, Z: false } }, // 10: CLZ=0
            { inputs: { B0: true,  B1: true,  B2: false, B3: true  }, outputs: { C0: false, C1: false, Z: false } }, // 11: CLZ=0
            { inputs: { B0: false, B1: false, B2: true,  B3: true  }, outputs: { C0: false, C1: false, Z: false } }, // 12: CLZ=0
            { inputs: { B0: true,  B1: false, B2: true,  B3: true  }, outputs: { C0: false, C1: false, Z: false } }, // 13: CLZ=0
            { inputs: { B0: false, B1: true,  B2: true,  B3: true  }, outputs: { C0: false, C1: false, Z: false } }, // 14: CLZ=0
            { inputs: { B0: true,  B1: true,  B2: true,  B3: true  }, outputs: { C0: false, C1: false, Z: false } }  // 15: CLZ=0
        ]
    }
];
