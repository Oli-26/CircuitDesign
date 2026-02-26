// Chip Designer Requirements - Non-module version for main game
// Defines logic challenges with increasing complexity and value
// Each requirement specifies required machines for production

// Firmware tier unlock requirements - maps firmware tier to chip tier needed
// Produce at least 1 chip of the required tier to unlock firmware
window.FIRMWARE_TIER_REQUIREMENTS = {
    1: { chipTier: 'x1000', displayName: 'X1000', count: 1 },
    2: { chipTier: 'x1000t', displayName: 'X1000T', count: 1 },
    3: { chipTier: 'x1500', displayName: 'X1500', count: 1 },
    4: { chipTier: 'x1500t', displayName: 'X1500T', count: 1 },
    5: { chipTier: 'x2000', displayName: 'X2000', count: 1 },
    6: { chipTier: 'x2000t', displayName: 'X2000T', count: 1 },
    7: { chipTier: 'x2500', displayName: 'X2500', count: 1 },
    8: { chipTier: 'x2500t', displayName: 'X2500T', count: 1 },
    9: { chipTier: 'x3000', displayName: 'X3000', count: 1 },
    10: { chipTier: 'x3500', displayName: 'X3500', count: 1 },
    11: { chipTier: 'x3000', displayName: 'X3000', count: 10 },
    12: { chipTier: 'x3500', displayName: 'X3500', count: 10 }
};

// Production tier definitions
window.ChipProductionTiers = {
    etcher: {
        machines: ['etcher'],
        output: 'etched_wafer',
        description: 'Etched Wafer: Etcher only'
    },
    bonder: {
        machines: ['etcher', 'bonder'],
        output: 'bonded_chip',
        description: 'Bonded Chip: Etcher → Wire Bonder'
    },
    integrator: {
        machines: ['etcher', 'bonder', 'logic_integrator'],
        output: 'programmed_chip',
        description: 'Programmed Chip: Etcher → Bonder → Logic Integrator'
    },
    packager: {
        machines: ['etcher', 'bonder', 'logic_integrator', 'packager'],
        output: 'packaged_chip',
        description: 'Packaged Chip: Full Production Line'
    }
};

window.ChipRequirements = [
    // Tier 1: Basic combined gates (2 gates needed) - Etcher only
    // Firmware multiplier: 2-3%
    // Research bonuses: processing, power, research, logistics
    // Special bonuses: blackMarketBonus (2x value), prestigeRevenueBonus (2x prestige contribution), productionCountBonus (2x chip sold count)
    {
        id: 'nand_gate',
        name: 'NAND Gate',
        description: 'Q = NOT(A AND B)',
        tier: 1,
        value: 0.02, // 2% multiplier
        inputs: ['A', 'B'],
        outputs: ['Q'],
        productionTier: 'etcher',
        productionDescription: 'Simple etched pattern on wafer',
        researchBonus: { tree: 'logistics', multiplier: 1.5 }, // Basic routing circuit
        productionCountBonus: 2, // Counts as 2 chips for production milestones
        gateBudget: { gold: 1, silver: 2, bronze: 3 }, // NAND gate is optimal at 1
        testCases: [
            { inputs: { A: false, B: false }, outputs: { Q: true } },
            { inputs: { A: false, B: true }, outputs: { Q: true } },
            { inputs: { A: true, B: false }, outputs: { Q: true } },
            { inputs: { A: true, B: true }, outputs: { Q: false } }
        ]
    },
    {
        id: 'nor_gate',
        name: 'NOR Gate',
        description: 'Q = NOT(A OR B)',
        tier: 1,
        value: 0.03, // 3% multiplier
        inputs: ['A', 'B'],
        outputs: ['Q'],
        productionTier: 'etcher',
        productionDescription: 'Simple etched pattern on wafer',
        researchBonus: { tree: 'power', multiplier: 1.5 }, // Power control circuit
        productionCountBonus: 2,
        gateBudget: { gold: 4, silver: 5, bronze: 6 }, // NOR from NAND requires 4 gates minimum
        testCases: [
            { inputs: { A: false, B: false }, outputs: { Q: true } },
            { inputs: { A: false, B: true }, outputs: { Q: false } },
            { inputs: { A: true, B: false }, outputs: { Q: false } },
            { inputs: { A: true, B: true }, outputs: { Q: false } }
        ]
    },

    // Tier 2: Equality/comparison (3+ gates) - Etcher only
    // Firmware multiplier: 3-4%
    {
        id: 'xnor_gate',
        name: 'XNOR Gate',
        description: 'Q = 1 when A equals B',
        tier: 2,
        value: 0.03, // 3% multiplier
        inputs: ['A', 'B'],
        outputs: ['Q'],
        productionTier: 'etcher',
        productionDescription: 'Multi-layer etched pattern',
        researchBonus: { tree: 'processing', multiplier: 1.5 }, // Comparison circuit
        productionCountBonus: 2,
        gateBudget: { gold: 5, silver: 6, bronze: 7 }, // XNOR from NAND requires 5 gates minimum
        requires: ['nand_gate'],
        testCases: [
            { inputs: { A: false, B: false }, outputs: { Q: true } },
            { inputs: { A: false, B: true }, outputs: { Q: false } },
            { inputs: { A: true, B: false }, outputs: { Q: false } },
            { inputs: { A: true, B: true }, outputs: { Q: true } }
        ]
    },
    {
        id: 'implication',
        name: 'Implication',
        description: 'Q = A implies B (NOT A OR B)',
        tier: 2,
        value: 0.04, // 4% multiplier
        inputs: ['A', 'B'],
        outputs: ['Q'],
        productionTier: 'etcher',
        productionDescription: 'Multi-layer etched pattern',
        researchBonus: { tree: 'research', multiplier: 1.5 }, // Logic gate
        productionCountBonus: 2,
        gateBudget: { gold: 2, silver: 3, bronze: 4 }, // Implication is optimal at 2 NANDs
        requires: ['nor_gate'],
        testCases: [
            { inputs: { A: false, B: false }, outputs: { Q: true } },
            { inputs: { A: false, B: true }, outputs: { Q: true } },
            { inputs: { A: true, B: false }, outputs: { Q: false } },
            { inputs: { A: true, B: true }, outputs: { Q: true } }
        ]
    },

    // Tier 3: Multi-output basics - Wire Bonder required
    // Firmware multiplier: 4-6%
    {
        id: 'half_adder',
        name: 'Half Adder',
        description: 'S = A XOR B, C = A AND B',
        tier: 3,
        value: 0.04, // 4% multiplier
        inputs: ['A', 'B'],
        outputs: ['S', 'C'],
        productionTier: 'bonder',
        productionDescription: 'Requires wire bonding for multi-output routing',
        researchBonus: { tree: 'processing', multiplier: 1.75 }, // Arithmetic circuit
        prestigeRevenueBonus: 1.5, // 50% more prestige revenue contribution
        gateBudget: { gold: 5, silver: 7, bronze: 9 }, // XOR (4-5) + AND (2) with sharing = 5 minimum
        requires: ['xnor_gate'],
        testCases: [
            { inputs: { A: false, B: false }, outputs: { S: false, C: false } },
            { inputs: { A: false, B: true }, outputs: { S: true, C: false } },
            { inputs: { A: true, B: false }, outputs: { S: true, C: false } },
            { inputs: { A: true, B: true }, outputs: { S: false, C: true } }
        ]
    },
    {
        id: 'half_subtractor',
        name: 'Half Subtractor',
        description: 'D = A XOR B, Bout = (NOT A) AND B',
        tier: 3,
        value: 0.05, // 5% multiplier
        inputs: ['A', 'B'],
        outputs: ['D', 'Bout'],
        productionTier: 'bonder',
        productionDescription: 'Requires wire bonding for multi-output routing',
        researchBonus: { tree: 'processing', multiplier: 1.75 },
        prestigeRevenueBonus: 1.5,
        gateBudget: { gold: 5, silver: 7, bronze: 9 }, // Similar to half adder
        requires: ['xnor_gate'],
        testCases: [
            { inputs: { A: false, B: false }, outputs: { D: false, Bout: false } },
            { inputs: { A: false, B: true }, outputs: { D: true, Bout: true } },
            { inputs: { A: true, B: false }, outputs: { D: true, Bout: false } },
            { inputs: { A: true, B: true }, outputs: { D: false, Bout: false } }
        ]
    },
    {
        id: 'comparator_1bit',
        name: '1-bit Comparator',
        description: 'GT = A>B, EQ = A==B, LT = A<B',
        tier: 3,
        value: 0.06, // 6% multiplier
        inputs: ['A', 'B'],
        outputs: ['GT', 'EQ', 'LT'],
        productionTier: 'bonder',
        productionDescription: 'Complex routing requires wire bonding',
        researchBonus: { tree: 'logistics', multiplier: 1.75 }, // Sorting/routing control
        blackMarketBonus: 1.5, // 50% more value on black market
        gateBudget: { gold: 7, silver: 9, bronze: 11 }, // GT, EQ (XNOR=5), LT need separate logic
        testCases: [
            { inputs: { A: false, B: false }, outputs: { GT: false, EQ: true, LT: false } },
            { inputs: { A: false, B: true }, outputs: { GT: false, EQ: false, LT: true } },
            { inputs: { A: true, B: false }, outputs: { GT: true, EQ: false, LT: false } },
            { inputs: { A: true, B: true }, outputs: { GT: false, EQ: true, LT: false } }
        ]
    },

    // Tier 4: 3-input circuits - Wire Bonder required
    // Firmware multiplier: 7-9%
    {
        id: 'majority_3',
        name: 'Majority Gate',
        description: 'Q = 1 if 2 or more inputs are HIGH',
        tier: 4,
        value: 0.07, // 7% multiplier
        inputs: ['A', 'B', 'C'],
        outputs: ['Q'],
        productionTier: 'bonder',
        productionDescription: 'Multiple inputs require wire bonding',
        researchBonus: { tree: 'power', multiplier: 2.0 }, // Power voting circuits
        blackMarketBonus: 1.5,
        gateBudget: { gold: 6, silver: 8, bronze: 10 }, // (AB)|(BC)|(AC) optimized with NAND
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
    {
        id: 'mux_2to1',
        name: '2:1 Multiplexer',
        description: 'Q = A when S=0, Q = B when S=1',
        tier: 4,
        value: 0.08, // 8% multiplier
        inputs: ['A', 'B', 'S'],
        outputs: ['Q'],
        productionTier: 'bonder',
        productionDescription: 'Signal routing requires wire bonding',
        researchBonus: { tree: 'logistics', multiplier: 2.0 }, // Routing circuit
        prestigeRevenueBonus: 1.75,
        gateBudget: { gold: 4, silver: 6, bronze: 8 }, // Standard MUX from NAND construction
        requires: ['half_adder'],
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
        id: 'demux_1to2',
        name: '1:2 Demultiplexer',
        description: 'Route D to Y0 when S=0, to Y1 when S=1',
        tier: 4,
        value: 0.09, // 9% multiplier
        inputs: ['D', 'S'],
        outputs: ['Y0', 'Y1'],
        productionTier: 'bonder',
        productionDescription: 'Demux routing requires wire bonding',
        researchBonus: { tree: 'logistics', multiplier: 2.0 },
        prestigeRevenueBonus: 1.75,
        gateBudget: { gold: 5, silver: 7, bronze: 9 }, // DEMUX routing requires 5-7 NANDs
        requires: ['half_adder'],
        testCases: [
            { inputs: { D: false, S: false }, outputs: { Y0: false, Y1: false } },
            { inputs: { D: false, S: true }, outputs: { Y0: false, Y1: false } },
            { inputs: { D: true, S: false }, outputs: { Y0: true, Y1: false } },
            { inputs: { D: true, S: true }, outputs: { Y0: false, Y1: true } }
        ]
    },

    // Tier 5: Complex multi-input/output - Logic Integrator required
    // Firmware multiplier: 10-12%
    {
        id: 'full_adder',
        name: 'Full Adder',
        description: 'S = A XOR B XOR Cin, Cout = majority',
        tier: 5,
        value: 0.10, // 10% multiplier
        inputs: ['A', 'B', 'Cin'],
        outputs: ['S', 'Cout'],
        productionTier: 'integrator',
        productionDescription: 'Carry chain logic requires integration',
        researchBonus: { tree: 'processing', multiplier: 2.0 }, // Core arithmetic
        blackMarketBonus: 2.0, // 2x black market value!
        gateBudget: { gold: 9, silver: 11, bronze: 13 }, // Two half adders + OR = 9 NANDs standard
        requires: ['half_adder'],
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
        id: 'full_subtractor',
        name: 'Full Subtractor',
        description: 'D = A XOR B XOR Bin, Bout = borrow out',
        tier: 5,
        value: 0.11, // 11% multiplier
        inputs: ['A', 'B', 'Bin'],
        outputs: ['D', 'Bout'],
        productionTier: 'integrator',
        productionDescription: 'Borrow chain logic requires integration',
        researchBonus: { tree: 'processing', multiplier: 2.0 },
        blackMarketBonus: 2.0,
        gateBudget: { gold: 9, silver: 11, bronze: 13 }, // Similar complexity to full adder
        requires: ['half_subtractor'],
        testCases: [
            { inputs: { A: false, B: false, Bin: false }, outputs: { D: false, Bout: false } },
            { inputs: { A: false, B: false, Bin: true }, outputs: { D: true, Bout: true } },
            { inputs: { A: false, B: true, Bin: false }, outputs: { D: true, Bout: true } },
            { inputs: { A: false, B: true, Bin: true }, outputs: { D: false, Bout: true } },
            { inputs: { A: true, B: false, Bin: false }, outputs: { D: true, Bout: false } },
            { inputs: { A: true, B: false, Bin: true }, outputs: { D: false, Bout: false } },
            { inputs: { A: true, B: true, Bin: false }, outputs: { D: false, Bout: false } },
            { inputs: { A: true, B: true, Bin: true }, outputs: { D: true, Bout: true } }
        ]
    },
    {
        id: 'parity_3',
        name: '3-bit Parity',
        description: 'P = 1 if odd number of inputs are HIGH',
        tier: 5,
        value: 0.12, // 12% multiplier
        inputs: ['A', 'B', 'C'],
        outputs: ['P'],
        productionTier: 'integrator',
        productionDescription: 'XOR chain logic requires integration',
        researchBonus: { tree: 'research', multiplier: 2.0 }, // Error detection circuit
        prestigeRevenueBonus: 2.0, // 2x prestige revenue!
        gateBudget: { gold: 8, silver: 10, bronze: 12 }, // XOR chain: 2 XORs = 8-10 NANDs
        testCases: [
            { inputs: { A: false, B: false, C: false }, outputs: { P: false } },
            { inputs: { A: false, B: false, C: true }, outputs: { P: true } },
            { inputs: { A: false, B: true, C: false }, outputs: { P: true } },
            { inputs: { A: false, B: true, C: true }, outputs: { P: false } },
            { inputs: { A: true, B: false, C: false }, outputs: { P: true } },
            { inputs: { A: true, B: false, C: true }, outputs: { P: false } },
            { inputs: { A: true, B: true, C: false }, outputs: { P: false } },
            { inputs: { A: true, B: true, C: true }, outputs: { P: true } }
        ]
    },

    // Tier 6: 4-input challenges - Logic Integrator required
    // Firmware multiplier: 13-17%
    {
        id: 'mux_4to1',
        name: '4:1 Multiplexer',
        description: 'Select one of 4 inputs using 2 select lines',
        tier: 6,
        value: 0.14, // 14% multiplier
        inputs: ['D0', 'D1', 'D2', 'D3', 'S0', 'S1'],
        outputs: ['Q'],
        productionTier: 'integrator',
        productionDescription: 'Complex routing requires logic integration',
        researchBonus: { tree: 'logistics', multiplier: 2.5 }, // Advanced routing
        blackMarketBonus: 1.75,
        gateBudget: { gold: 10, silver: 14, bronze: 18 }, // Tree of 2:1 MUXes or direct construction
        requires: ['mux_2to1'],
        testCases: [
            // S0=0, S1=0 -> select D0
            { inputs: { D0: true, D1: false, D2: false, D3: false, S0: false, S1: false }, outputs: { Q: true } },
            { inputs: { D0: false, D1: true, D2: true, D3: true, S0: false, S1: false }, outputs: { Q: false } },
            // S0=1, S1=0 -> select D1
            { inputs: { D0: false, D1: true, D2: false, D3: false, S0: true, S1: false }, outputs: { Q: true } },
            { inputs: { D0: true, D1: false, D2: true, D3: true, S0: true, S1: false }, outputs: { Q: false } },
            // S0=0, S1=1 -> select D2
            { inputs: { D0: false, D1: false, D2: true, D3: false, S0: false, S1: true }, outputs: { Q: true } },
            { inputs: { D0: true, D1: true, D2: false, D3: true, S0: false, S1: true }, outputs: { Q: false } },
            // S0=1, S1=1 -> select D3
            { inputs: { D0: false, D1: false, D2: false, D3: true, S0: true, S1: true }, outputs: { Q: true } },
            { inputs: { D0: true, D1: true, D2: true, D3: false, S0: true, S1: true }, outputs: { Q: false } },
            // Additional edge cases - all inputs same value
            { inputs: { D0: true, D1: true, D2: true, D3: true, S0: false, S1: false }, outputs: { Q: true } },
            { inputs: { D0: false, D1: false, D2: false, D3: false, S0: true, S1: true }, outputs: { Q: false } },
            // Ensure non-selected inputs don't leak through
            { inputs: { D0: true, D1: true, D2: true, D3: false, S0: false, S1: false }, outputs: { Q: true } },
            { inputs: { D0: false, D1: true, D2: true, D3: true, S0: true, S1: true }, outputs: { Q: true } }
        ]
    },
    {
        id: 'parity_4',
        name: '4-bit Parity',
        description: 'P = 1 if odd number of inputs are HIGH',
        tier: 6,
        value: 0.15, // 15% multiplier
        inputs: ['A', 'B', 'C', 'D'],
        outputs: ['P'],
        productionTier: 'integrator',
        productionDescription: 'Extended XOR chain requires logic integration',
        researchBonus: { tree: 'research', multiplier: 2.5 }, // Error detection
        prestigeRevenueBonus: 2.0,
        gateBudget: { gold: 12, silver: 15, bronze: 18 }, // 3 XOR gates chained = 12-15 NANDs
        requires: ['parity_3'],
        testCases: [
            // All 16 combinations - P=1 if odd number of inputs are HIGH
            // 0 ones = even
            { inputs: { A: false, B: false, C: false, D: false }, outputs: { P: false } },
            // 1 one = odd
            { inputs: { A: true, B: false, C: false, D: false }, outputs: { P: true } },
            { inputs: { A: false, B: true, C: false, D: false }, outputs: { P: true } },
            { inputs: { A: false, B: false, C: true, D: false }, outputs: { P: true } },
            { inputs: { A: false, B: false, C: false, D: true }, outputs: { P: true } },
            // 2 ones = even
            { inputs: { A: true, B: true, C: false, D: false }, outputs: { P: false } },
            { inputs: { A: true, B: false, C: true, D: false }, outputs: { P: false } },
            { inputs: { A: true, B: false, C: false, D: true }, outputs: { P: false } },
            { inputs: { A: false, B: true, C: true, D: false }, outputs: { P: false } },
            { inputs: { A: false, B: true, C: false, D: true }, outputs: { P: false } },
            { inputs: { A: false, B: false, C: true, D: true }, outputs: { P: false } },
            // 3 ones = odd
            { inputs: { A: true, B: true, C: true, D: false }, outputs: { P: true } },
            { inputs: { A: true, B: true, C: false, D: true }, outputs: { P: true } },
            { inputs: { A: true, B: false, C: true, D: true }, outputs: { P: true } },
            { inputs: { A: false, B: true, C: true, D: true }, outputs: { P: true } },
            // 4 ones = even
            { inputs: { A: true, B: true, C: true, D: true }, outputs: { P: false } }
        ]
    },
    {
        id: 'majority_4',
        name: '4-input Majority',
        description: 'Q = 1 if 3 or more inputs are HIGH',
        tier: 6,
        value: 0.17, // 17% multiplier
        inputs: ['A', 'B', 'C', 'D'],
        outputs: ['Q'],
        productionTier: 'integrator',
        productionDescription: 'Multi-input voting requires logic integration',
        researchBonus: { tree: 'power', multiplier: 2.5 }, // Power voting
        blackMarketBonus: 1.75,
        gateBudget: { gold: 15, silver: 20, bronze: 25 }, // Complex voting logic for 4 inputs
        requires: ['majority_3'],
        testCases: [
            // All 16 combinations - Q=1 if 3 or more inputs are HIGH
            // 0 ones
            { inputs: { A: false, B: false, C: false, D: false }, outputs: { Q: false } },
            // 1 one
            { inputs: { A: true, B: false, C: false, D: false }, outputs: { Q: false } },
            { inputs: { A: false, B: true, C: false, D: false }, outputs: { Q: false } },
            { inputs: { A: false, B: false, C: true, D: false }, outputs: { Q: false } },
            { inputs: { A: false, B: false, C: false, D: true }, outputs: { Q: false } },
            // 2 ones
            { inputs: { A: true, B: true, C: false, D: false }, outputs: { Q: false } },
            { inputs: { A: true, B: false, C: true, D: false }, outputs: { Q: false } },
            { inputs: { A: true, B: false, C: false, D: true }, outputs: { Q: false } },
            { inputs: { A: false, B: true, C: true, D: false }, outputs: { Q: false } },
            { inputs: { A: false, B: true, C: false, D: true }, outputs: { Q: false } },
            { inputs: { A: false, B: false, C: true, D: true }, outputs: { Q: false } },
            // 3 ones
            { inputs: { A: true, B: true, C: true, D: false }, outputs: { Q: true } },
            { inputs: { A: true, B: true, C: false, D: true }, outputs: { Q: true } },
            { inputs: { A: true, B: false, C: true, D: true }, outputs: { Q: true } },
            { inputs: { A: false, B: true, C: true, D: true }, outputs: { Q: true } },
            // 4 ones
            { inputs: { A: true, B: true, C: true, D: true }, outputs: { Q: true } }
        ]
    },

    // Tier 7: 2-bit operations - Logic Integrator required
    // Firmware multiplier: 19-22%
    {
        id: 'adder_2bit',
        name: '2-bit Adder',
        description: 'Add two 2-bit numbers (A1A0 + B1B0 = S2S1S0)',
        tier: 7,
        value: 0.19, // 19% multiplier
        inputs: ['A0', 'A1', 'B0', 'B1'],
        outputs: ['S0', 'S1', 'S2'],
        productionTier: 'integrator',
        productionDescription: 'Cascaded adders require logic integration',
        researchBonus: { tree: 'processing', multiplier: 3.0 }, // Arithmetic unit
        blackMarketBonus: 2.0,
        prestigeRevenueBonus: 1.5,
        gateBudget: { gold: 18, silver: 22, bronze: 26 }, // 2 full adders cascaded = 18-20 NANDs
        requires: ['full_adder'],
        testCases: [
            // 0 + 0 = 0
            { inputs: { A0: false, A1: false, B0: false, B1: false }, outputs: { S0: false, S1: false, S2: false } },
            // 1 + 1 = 2
            { inputs: { A0: true, A1: false, B0: true, B1: false }, outputs: { S0: false, S1: true, S2: false } },
            // 2 + 1 = 3
            { inputs: { A0: false, A1: true, B0: true, B1: false }, outputs: { S0: true, S1: true, S2: false } },
            // 3 + 1 = 4
            { inputs: { A0: true, A1: true, B0: true, B1: false }, outputs: { S0: false, S1: false, S2: true } },
            // 2 + 2 = 4
            { inputs: { A0: false, A1: true, B0: false, B1: true }, outputs: { S0: false, S1: false, S2: true } },
            // 3 + 3 = 6
            { inputs: { A0: true, A1: true, B0: true, B1: true }, outputs: { S0: false, S1: true, S2: true } },
            // 1 + 2 = 3
            { inputs: { A0: true, A1: false, B0: false, B1: true }, outputs: { S0: true, S1: true, S2: false } },
            // 3 + 2 = 5
            { inputs: { A0: true, A1: true, B0: false, B1: true }, outputs: { S0: true, S1: false, S2: true } },
            // 0 + 3 = 3
            { inputs: { A0: false, A1: false, B0: true, B1: true }, outputs: { S0: true, S1: true, S2: false } },
            // 2 + 3 = 5
            { inputs: { A0: false, A1: true, B0: true, B1: true }, outputs: { S0: true, S1: false, S2: true } }
        ]
    },
    {
        id: 'comparator_2bit',
        name: '2-bit Comparator',
        description: 'Compare two 2-bit numbers',
        tier: 7,
        value: 0.22, // 22% multiplier
        inputs: ['A0', 'A1', 'B0', 'B1'],
        outputs: ['GT', 'EQ', 'LT'],
        productionTier: 'integrator',
        productionDescription: 'Multi-bit comparison requires logic integration',
        researchBonus: { tree: 'logistics', multiplier: 3.0 }, // Sorting/comparison
        prestigeRevenueBonus: 2.0,
        gateBudget: { gold: 16, silver: 20, bronze: 24 }, // Multi-bit comparison with cascading
        requires: ['comparator_1bit'],
        testCases: [
            // Equal cases
            { inputs: { A0: false, A1: false, B0: false, B1: false }, outputs: { GT: false, EQ: true, LT: false } }, // 0 == 0
            { inputs: { A0: true, A1: false, B0: true, B1: false }, outputs: { GT: false, EQ: true, LT: false } },   // 1 == 1
            { inputs: { A0: false, A1: true, B0: false, B1: true }, outputs: { GT: false, EQ: true, LT: false } },   // 2 == 2
            { inputs: { A0: true, A1: true, B0: true, B1: true }, outputs: { GT: false, EQ: true, LT: false } },     // 3 == 3
            // Greater than cases
            { inputs: { A0: true, A1: false, B0: false, B1: false }, outputs: { GT: true, EQ: false, LT: false } },  // 1 > 0
            { inputs: { A0: false, A1: true, B0: true, B1: false }, outputs: { GT: true, EQ: false, LT: false } },   // 2 > 1
            { inputs: { A0: true, A1: true, B0: false, B1: true }, outputs: { GT: true, EQ: false, LT: false } },    // 3 > 2
            { inputs: { A0: true, A1: true, B0: false, B1: false }, outputs: { GT: true, EQ: false, LT: false } },   // 3 > 0
            // Less than cases
            { inputs: { A0: false, A1: false, B0: true, B1: false }, outputs: { GT: false, EQ: false, LT: true } },  // 0 < 1
            { inputs: { A0: true, A1: false, B0: false, B1: true }, outputs: { GT: false, EQ: false, LT: true } },   // 1 < 2
            { inputs: { A0: false, A1: true, B0: true, B1: true }, outputs: { GT: false, EQ: false, LT: true } },    // 2 < 3
            { inputs: { A0: false, A1: false, B0: true, B1: true }, outputs: { GT: false, EQ: false, LT: true } }    // 0 < 3
        ]
    },

    // Tier 8: Decoders and encoders - Logic Integrator required
    // Firmware multiplier: 23-27%
    {
        id: 'decoder_2to4',
        name: '2:4 Decoder',
        description: 'Decode 2-bit input to 4 output lines (one-hot)',
        tier: 8,
        value: 0.23, // 23% multiplier
        inputs: ['A', 'B'],
        outputs: ['Y0', 'Y1', 'Y2', 'Y3'],
        productionTier: 'integrator',
        productionDescription: 'Decoder logic requires integration',
        researchBonus: { tree: 'logistics', multiplier: 3.0 }, // Demultiplexing
        blackMarketBonus: 2.0,
        gateBudget: { gold: 8, silver: 10, bronze: 12 }, // 4 AND gates with inverted inputs
        requires: ['demux_1to2'],
        testCases: [
            { inputs: { A: false, B: false }, outputs: { Y0: true, Y1: false, Y2: false, Y3: false } },
            { inputs: { A: true, B: false }, outputs: { Y0: false, Y1: true, Y2: false, Y3: false } },
            { inputs: { A: false, B: true }, outputs: { Y0: false, Y1: false, Y2: true, Y3: false } },
            { inputs: { A: true, B: true }, outputs: { Y0: false, Y1: false, Y2: false, Y3: true } }
        ]
    },
    {
        id: 'priority_encoder',
        name: 'Priority Encoder',
        description: '4 inputs to 2-bit output + valid flag (highest priority)',
        tier: 8,
        value: 0.25, // 25% multiplier
        inputs: ['I0', 'I1', 'I2', 'I3'],
        outputs: ['A', 'B', 'V'],
        productionTier: 'integrator',
        productionDescription: 'Priority logic requires integration',
        researchBonus: { tree: 'research', multiplier: 3.0 }, // Interrupt handling
        prestigeRevenueBonus: 2.0,
        gateBudget: { gold: 12, silver: 16, bronze: 20 }, // Priority logic requires 12-18 NANDs
        testCases: [
            // No inputs active
            { inputs: { I0: false, I1: false, I2: false, I3: false }, outputs: { A: false, B: false, V: false } },
            // Only I0 active -> output 0 (00)
            { inputs: { I0: true, I1: false, I2: false, I3: false }, outputs: { A: false, B: false, V: true } },
            // Only I1 active -> output 1 (01)
            { inputs: { I0: false, I1: true, I2: false, I3: false }, outputs: { A: true, B: false, V: true } },
            // Only I2 active -> output 2 (10)
            { inputs: { I0: false, I1: false, I2: true, I3: false }, outputs: { A: false, B: true, V: true } },
            // Only I3 active -> output 3 (11)
            { inputs: { I0: false, I1: false, I2: false, I3: true }, outputs: { A: true, B: true, V: true } },
            // I3 highest priority (ignores lower)
            { inputs: { I0: true, I1: true, I2: true, I3: true }, outputs: { A: true, B: true, V: true } },
            { inputs: { I0: false, I1: true, I2: false, I3: true }, outputs: { A: true, B: true, V: true } },
            // I2 highest when I3=0
            { inputs: { I0: true, I1: true, I2: true, I3: false }, outputs: { A: false, B: true, V: true } },
            { inputs: { I0: false, I1: false, I2: true, I3: false }, outputs: { A: false, B: true, V: true } },
            // I1 highest when I2=I3=0
            { inputs: { I0: true, I1: true, I2: false, I3: false }, outputs: { A: true, B: false, V: true } },
            { inputs: { I0: false, I1: true, I2: false, I3: false }, outputs: { A: true, B: false, V: true } }
        ]
    },
    {
        id: 'alu_1bit',
        name: '1-bit ALU',
        description: 'Op=00:AND, Op=01:OR, Op=10:XOR, Op=11:ADD',
        tier: 8,
        value: 0.27, // 27% multiplier
        inputs: ['A', 'B', 'Op0', 'Op1'],
        outputs: ['R', 'C'],
        productionTier: 'integrator',
        productionDescription: 'ALU operations require logic integration',
        researchBonus: { tree: 'processing', multiplier: 3.5 }, // Core ALU
        blackMarketBonus: 2.0,
        prestigeRevenueBonus: 1.75,
        gateBudget: { gold: 20, silver: 25, bronze: 30 }, // 4 operations with MUX selection
        requires: ['mux_2to1', 'full_adder'],
        testCases: [
            // AND operation (Op=00)
            { inputs: { A: false, B: false, Op0: false, Op1: false }, outputs: { R: false, C: false } },
            { inputs: { A: false, B: true, Op0: false, Op1: false }, outputs: { R: false, C: false } },
            { inputs: { A: true, B: false, Op0: false, Op1: false }, outputs: { R: false, C: false } },
            { inputs: { A: true, B: true, Op0: false, Op1: false }, outputs: { R: true, C: false } },
            // OR operation (Op=01)
            { inputs: { A: false, B: false, Op0: true, Op1: false }, outputs: { R: false, C: false } },
            { inputs: { A: false, B: true, Op0: true, Op1: false }, outputs: { R: true, C: false } },
            { inputs: { A: true, B: false, Op0: true, Op1: false }, outputs: { R: true, C: false } },
            { inputs: { A: true, B: true, Op0: true, Op1: false }, outputs: { R: true, C: false } },
            // XOR operation (Op=10)
            { inputs: { A: false, B: false, Op0: false, Op1: true }, outputs: { R: false, C: false } },
            { inputs: { A: false, B: true, Op0: false, Op1: true }, outputs: { R: true, C: false } },
            { inputs: { A: true, B: false, Op0: false, Op1: true }, outputs: { R: true, C: false } },
            { inputs: { A: true, B: true, Op0: false, Op1: true }, outputs: { R: false, C: false } },
            // ADD operation (Op=11)
            { inputs: { A: false, B: false, Op0: true, Op1: true }, outputs: { R: false, C: false } },
            { inputs: { A: false, B: true, Op0: true, Op1: true }, outputs: { R: true, C: false } },
            { inputs: { A: true, B: false, Op0: true, Op1: true }, outputs: { R: true, C: false } },
            { inputs: { A: true, B: true, Op0: true, Op1: true }, outputs: { R: false, C: true } }
        ]
    },

    // Tier 9: Complex arithmetic - Full production line (Packager)
    // Firmware multiplier: 30-33%
    {
        id: 'multiplier_2x2',
        name: '2x2 Multiplier',
        description: 'Multiply two 2-bit numbers (4-bit result)',
        tier: 9,
        value: 0.30, // 30% multiplier
        inputs: ['A0', 'A1', 'B0', 'B1'],
        outputs: ['P0', 'P1', 'P2', 'P3'],
        productionTier: 'packager',
        productionDescription: 'High-value chip requires full packaging',
        researchBonus: { tree: 'processing', multiplier: 4.0 }, // Multiplier unit
        blackMarketBonus: 2.0,
        prestigeRevenueBonus: 2.0,
        gateBudget: { gold: 30, silver: 40, bronze: 50 }, // Array multiplier with half/full adders
        requires: ['adder_2bit'],
        testCases: [
            // 0 * 0 = 0
            { inputs: { A0: false, A1: false, B0: false, B1: false }, outputs: { P0: false, P1: false, P2: false, P3: false } },
            // 1 * 1 = 1
            { inputs: { A0: true, A1: false, B0: true, B1: false }, outputs: { P0: true, P1: false, P2: false, P3: false } },
            // 1 * 2 = 2
            { inputs: { A0: true, A1: false, B0: false, B1: true }, outputs: { P0: false, P1: true, P2: false, P3: false } },
            // 2 * 2 = 4
            { inputs: { A0: false, A1: true, B0: false, B1: true }, outputs: { P0: false, P1: false, P2: true, P3: false } },
            // 2 * 3 = 6
            { inputs: { A0: false, A1: true, B0: true, B1: true }, outputs: { P0: false, P1: true, P2: true, P3: false } },
            // 3 * 1 = 3
            { inputs: { A0: true, A1: true, B0: true, B1: false }, outputs: { P0: true, P1: true, P2: false, P3: false } },
            // 3 * 2 = 6
            { inputs: { A0: true, A1: true, B0: false, B1: true }, outputs: { P0: false, P1: true, P2: true, P3: false } },
            // 3 * 3 = 9
            { inputs: { A0: true, A1: true, B0: true, B1: true }, outputs: { P0: true, P1: false, P2: false, P3: true } },
            // 1 * 3 = 3
            { inputs: { A0: true, A1: false, B0: true, B1: true }, outputs: { P0: true, P1: true, P2: false, P3: false } },
            // 0 * 3 = 0
            { inputs: { A0: false, A1: false, B0: true, B1: true }, outputs: { P0: false, P1: false, P2: false, P3: false } }
        ]
    },
    {
        id: 'subtractor_2bit',
        name: '2-bit Subtractor',
        description: 'Subtract B from A with borrow (A-B)',
        tier: 9,
        value: 0.33, // 33% multiplier
        inputs: ['A0', 'A1', 'B0', 'B1'],
        outputs: ['D0', 'D1', 'Bout'],
        productionTier: 'packager',
        productionDescription: 'High-value chip requires full packaging',
        researchBonus: { tree: 'processing', multiplier: 4.0 },
        blackMarketBonus: 2.0,
        prestigeRevenueBonus: 2.0,
        gateBudget: { gold: 20, silver: 25, bronze: 30 }, // 2 full subtractors cascaded
        requires: ['adder_2bit'],
        testCases: [
            // 0 - 0 = 0
            { inputs: { A0: false, A1: false, B0: false, B1: false }, outputs: { D0: false, D1: false, Bout: false } },
            // 1 - 1 = 0
            { inputs: { A0: true, A1: false, B0: true, B1: false }, outputs: { D0: false, D1: false, Bout: false } },
            // 2 - 1 = 1
            { inputs: { A0: false, A1: true, B0: true, B1: false }, outputs: { D0: true, D1: false, Bout: false } },
            // 3 - 1 = 2
            { inputs: { A0: true, A1: true, B0: true, B1: false }, outputs: { D0: false, D1: true, Bout: false } },
            // 3 - 2 = 1
            { inputs: { A0: true, A1: true, B0: false, B1: true }, outputs: { D0: true, D1: false, Bout: false } },
            // 3 - 3 = 0
            { inputs: { A0: true, A1: true, B0: true, B1: true }, outputs: { D0: false, D1: false, Bout: false } },
            // 2 - 2 = 0
            { inputs: { A0: false, A1: true, B0: false, B1: true }, outputs: { D0: false, D1: false, Bout: false } },
            // Borrow cases
            // 0 - 1 = -1 (borrow)
            { inputs: { A0: false, A1: false, B0: true, B1: false }, outputs: { D0: true, D1: true, Bout: true } },
            // 1 - 2 = -1 (borrow)
            { inputs: { A0: true, A1: false, B0: false, B1: true }, outputs: { D0: true, D1: true, Bout: true } },
            // 2 - 3 = -1 (borrow)
            { inputs: { A0: false, A1: true, B0: true, B1: true }, outputs: { D0: true, D1: true, Bout: true } },
            // 0 - 3 = -3 (borrow)
            { inputs: { A0: false, A1: false, B0: true, B1: true }, outputs: { D0: true, D1: false, Bout: true } },
            // 1 - 3 = -2 (borrow)
            { inputs: { A0: true, A1: false, B0: true, B1: true }, outputs: { D0: false, D1: true, Bout: true } }
        ]
    },

    // Tier 10: Extreme challenges - Full production line (Packager)
    // Firmware multiplier: 35-40%
    {
        id: 'barrel_shifter',
        name: 'Barrel Shifter',
        description: '4-bit barrel shifter - rotate left by S (0-3 positions)',
        tier: 10,
        value: 0.35, // 35% multiplier
        inputs: ['D0', 'D1', 'D2', 'D3', 'S0', 'S1'],
        outputs: ['Q0', 'Q1', 'Q2', 'Q3'],
        productionTier: 'packager',
        productionDescription: 'Premium chip requires full production line',
        researchBonus: { tree: 'power', multiplier: 4.0 }, // Shift register
        blackMarketBonus: 2.0,
        prestigeRevenueBonus: 2.5,
        gateBudget: { gold: 40, silver: 55, bronze: 70 }, // 4 outputs × MUX trees for shift amounts
        requires: ['mux_4to1'],
        testCases: [
            // Shift 0 (S=00) - no change
            { inputs: { D0: true, D1: false, D2: true, D3: false, S0: false, S1: false }, outputs: { Q0: true, Q1: false, Q2: true, Q3: false } },
            { inputs: { D0: false, D1: true, D2: false, D3: true, S0: false, S1: false }, outputs: { Q0: false, Q1: true, Q2: false, Q3: true } },
            // Shift 1 (S=01)
            { inputs: { D0: true, D1: false, D2: true, D3: false, S0: true, S1: false }, outputs: { Q0: false, Q1: true, Q2: false, Q3: true } },
            { inputs: { D0: true, D1: true, D2: false, D3: false, S0: true, S1: false }, outputs: { Q0: false, Q1: true, Q2: true, Q3: false } },
            // Shift 2 (S=10)
            { inputs: { D0: true, D1: true, D2: false, D3: false, S0: false, S1: true }, outputs: { Q0: false, Q1: false, Q2: true, Q3: true } },
            { inputs: { D0: true, D1: false, D2: false, D3: true, S0: false, S1: true }, outputs: { Q0: false, Q1: false, Q2: true, Q3: false } },
            { inputs: { D0: false, D1: true, D2: true, D3: false, S0: false, S1: true }, outputs: { Q0: false, Q1: false, Q2: false, Q3: true } },
            // Shift 3 (S=11)
            { inputs: { D0: true, D1: false, D2: false, D3: false, S0: true, S1: true }, outputs: { Q0: false, Q1: false, Q2: false, Q3: true } },
            { inputs: { D0: false, D1: true, D2: false, D3: false, S0: true, S1: true }, outputs: { Q0: false, Q1: false, Q2: false, Q3: false } },
            { inputs: { D0: true, D1: true, D2: true, D3: true, S0: true, S1: true }, outputs: { Q0: false, Q1: false, Q2: false, Q3: true } },
            // All ones with different shifts
            { inputs: { D0: true, D1: true, D2: true, D3: true, S0: false, S1: false }, outputs: { Q0: true, Q1: true, Q2: true, Q3: true } },
            { inputs: { D0: true, D1: true, D2: true, D3: true, S0: true, S1: false }, outputs: { Q0: false, Q1: true, Q2: true, Q3: true } }
        ]
    },
    {
        id: 'adder_4bit',
        name: '4-bit Adder',
        description: 'Add two 4-bit numbers with carry out',
        tier: 10,
        value: 0.38, // 38% multiplier
        inputs: ['A0', 'A1', 'A2', 'A3', 'B0', 'B1', 'B2', 'B3'],
        outputs: ['S0', 'S1', 'S2', 'S3', 'C'],
        productionTier: 'packager',
        productionDescription: 'Premium chip requires full production line',
        researchBonus: { tree: 'processing', multiplier: 4.5 }, // Full adder
        blackMarketBonus: 2.0,
        prestigeRevenueBonus: 2.5,
        gateBudget: { gold: 36, silver: 42, bronze: 48 }, // 4 full adders cascaded
        requires: ['adder_2bit'],
        testCases: [
            // 0 + 0 = 0
            { inputs: { A0: false, A1: false, A2: false, A3: false, B0: false, B1: false, B2: false, B3: false }, outputs: { S0: false, S1: false, S2: false, S3: false, C: false } },
            // 1 + 1 = 2
            { inputs: { A0: true, A1: false, A2: false, A3: false, B0: true, B1: false, B2: false, B3: false }, outputs: { S0: false, S1: true, S2: false, S3: false, C: false } },
            // 15 + 1 = 16 (overflow)
            { inputs: { A0: true, A1: true, A2: true, A3: true, B0: true, B1: false, B2: false, B3: false }, outputs: { S0: false, S1: false, S2: false, S3: false, C: true } },
            // 7 + 8 = 15
            { inputs: { A0: true, A1: true, A2: true, A3: false, B0: false, B1: false, B2: false, B3: true }, outputs: { S0: true, S1: true, S2: true, S3: true, C: false } },
            // 5 + 3 = 8
            { inputs: { A0: true, A1: false, A2: true, A3: false, B0: true, B1: true, B2: false, B3: false }, outputs: { S0: false, S1: false, S2: false, S3: true, C: false } },
            // 15 + 15 = 30 (overflow, result 14)
            { inputs: { A0: true, A1: true, A2: true, A3: true, B0: true, B1: true, B2: true, B3: true }, outputs: { S0: false, S1: true, S2: true, S3: true, C: true } },
            // 3 + 5 = 8
            { inputs: { A0: true, A1: true, A2: false, A3: false, B0: true, B1: false, B2: true, B3: false }, outputs: { S0: false, S1: false, S2: false, S3: true, C: false } },
            // 10 + 5 = 15
            { inputs: { A0: false, A1: true, A2: false, A3: true, B0: true, B1: false, B2: true, B3: false }, outputs: { S0: true, S1: true, S2: true, S3: true, C: false } },
            // 8 + 8 = 16 (overflow)
            { inputs: { A0: false, A1: false, A2: false, A3: true, B0: false, B1: false, B2: false, B3: true }, outputs: { S0: false, S1: false, S2: false, S3: false, C: true } },
            // 6 + 7 = 13
            { inputs: { A0: false, A1: true, A2: true, A3: false, B0: true, B1: true, B2: true, B3: false }, outputs: { S0: true, S1: false, S2: true, S3: true, C: false } }
        ]
    },
    {
        id: 'alu_2bit',
        name: '2-bit ALU',
        description: 'Full 2-bit ALU: AND/OR/ADD/SUB with flags',
        tier: 10,
        value: 0.40, // 40% multiplier
        inputs: ['A0', 'A1', 'B0', 'B1', 'Op0', 'Op1'],
        outputs: ['R0', 'R1', 'C', 'Z'],
        productionTier: 'packager',
        productionDescription: 'Premium chip requires full production line',
        researchBonus: { tree: 'research', multiplier: 4.5 }, // ALU unit
        blackMarketBonus: 2.0,
        prestigeRevenueBonus: 2.5,
        productionCountBonus: 1.5,
        gateBudget: { gold: 50, silver: 65, bronze: 80 }, // 2-bit ALU with full operation set
        requires: ['alu_1bit'],
        testCases: [
            // AND operation (Op=00)
            { inputs: { A0: true, A1: true, B0: true, B1: false, Op0: false, Op1: false }, outputs: { R0: true, R1: false, C: false, Z: false } },  // 3 & 1 = 1
            { inputs: { A0: false, A1: true, B0: true, B1: false, Op0: false, Op1: false }, outputs: { R0: false, R1: false, C: false, Z: true } }, // 2 & 1 = 0
            { inputs: { A0: true, A1: true, B0: true, B1: true, Op0: false, Op1: false }, outputs: { R0: true, R1: true, C: false, Z: false } },    // 3 & 3 = 3
            // OR operation (Op=01)
            { inputs: { A0: false, A1: true, B0: true, B1: false, Op0: true, Op1: false }, outputs: { R0: true, R1: true, C: false, Z: false } },  // 2 | 1 = 3
            { inputs: { A0: false, A1: false, B0: false, B1: false, Op0: true, Op1: false }, outputs: { R0: false, R1: false, C: false, Z: true } }, // 0 | 0 = 0
            { inputs: { A0: true, A1: false, B0: false, B1: true, Op0: true, Op1: false }, outputs: { R0: true, R1: true, C: false, Z: false } },   // 1 | 2 = 3
            // ADD operation (Op=10)
            { inputs: { A0: true, A1: false, B0: true, B1: false, Op0: false, Op1: true }, outputs: { R0: false, R1: true, C: false, Z: false } }, // 1 + 1 = 2
            { inputs: { A0: true, A1: true, B0: true, B1: false, Op0: false, Op1: true }, outputs: { R0: false, R1: false, C: true, Z: true } },   // 3 + 1 = 4 (overflow, Z=1)
            { inputs: { A0: false, A1: true, B0: false, B1: true, Op0: false, Op1: true }, outputs: { R0: false, R1: false, C: true, Z: true } },  // 2 + 2 = 4 (overflow)
            // SUB operation (Op=11)
            { inputs: { A0: true, A1: true, B0: true, B1: false, Op0: true, Op1: true }, outputs: { R0: false, R1: true, C: false, Z: false } },   // 3 - 1 = 2
            { inputs: { A0: true, A1: false, B0: true, B1: false, Op0: true, Op1: true }, outputs: { R0: false, R1: false, C: false, Z: true } },  // 1 - 1 = 0
            { inputs: { A0: false, A1: true, B0: true, B1: false, Op0: true, Op1: true }, outputs: { R0: true, R1: false, C: false, Z: false } }   // 2 - 1 = 1
        ]
    },

    // Tier 11: Elite circuits (X3000 mastery) - 44-50% multiplier
    {
        id: 'comparator_4bit',
        name: '4-bit Comparator',
        description: 'Compare two 4-bit numbers (GT, EQ, LT)',
        tier: 11,
        value: 0.44, // 44% multiplier
        inputs: ['A0', 'A1', 'A2', 'A3', 'B0', 'B1', 'B2', 'B3'],
        outputs: ['GT', 'EQ', 'LT'],
        productionTier: 'packager',
        productionDescription: 'Elite chip requires full production line',
        researchBonus: { tree: 'logistics', multiplier: 5.0 }, // Advanced comparison
        blackMarketBonus: 2.0,
        prestigeRevenueBonus: 3.0,
        gateBudget: { gold: 30, silver: 40, bronze: 50 }, // 4-bit magnitude comparison
        requires: ['comparator_2bit'],
        testCases: [
            // Equal cases
            { inputs: { A0: false, A1: false, A2: false, A3: false, B0: false, B1: false, B2: false, B3: false }, outputs: { GT: false, EQ: true, LT: false } },  // 0 == 0
            { inputs: { A0: true, A1: true, A2: true, A3: true, B0: true, B1: true, B2: true, B3: true }, outputs: { GT: false, EQ: true, LT: false } },          // 15 == 15
            { inputs: { A0: true, A1: false, A2: true, A3: false, B0: true, B1: false, B2: true, B3: false }, outputs: { GT: false, EQ: true, LT: false } },      // 5 == 5
            // Greater than cases
            { inputs: { A0: true, A1: false, A2: false, A3: false, B0: false, B1: false, B2: false, B3: false }, outputs: { GT: true, EQ: false, LT: false } },  // 1 > 0
            { inputs: { A0: false, A1: false, A2: false, A3: true, B0: true, B1: true, B2: true, B3: false }, outputs: { GT: true, EQ: false, LT: false } },     // 8 > 7
            { inputs: { A0: true, A1: true, A2: true, A3: true, B0: false, B1: true, B2: true, B3: true }, outputs: { GT: true, EQ: false, LT: false } },        // 15 > 14
            { inputs: { A0: false, A1: true, A2: false, A3: false, B0: true, B1: false, B2: false, B3: false }, outputs: { GT: true, EQ: false, LT: false } },   // 2 > 1
            // Less than cases
            { inputs: { A0: false, A1: false, A2: false, A3: false, B0: true, B1: false, B2: false, B3: false }, outputs: { GT: false, EQ: false, LT: true } },  // 0 < 1
            { inputs: { A0: true, A1: true, A2: true, A3: false, B0: false, B1: false, B2: false, B3: true }, outputs: { GT: false, EQ: false, LT: true } },     // 7 < 8
            { inputs: { A0: false, A1: true, A2: true, A3: true, B0: true, B1: true, B2: true, B3: true }, outputs: { GT: false, EQ: false, LT: true } },        // 14 < 15
            { inputs: { A0: true, A1: false, A2: false, A3: false, B0: false, B1: true, B2: false, B3: false }, outputs: { GT: false, EQ: false, LT: true } }    // 1 < 2
        ]
    },
    {
        id: 'bitwise_negator',
        name: '4-bit Negator',
        description: 'Output NOT of all 4 input bits',
        tier: 11,
        value: 0.47, // 47% multiplier
        inputs: ['A0', 'A1', 'A2', 'A3'],
        outputs: ['Q0', 'Q1', 'Q2', 'Q3'],
        productionTier: 'packager',
        productionDescription: 'Elite chip requires full production line',
        researchBonus: { tree: 'power', multiplier: 5.0 }, // Inverter array
        prestigeRevenueBonus: 3.0,
        productionCountBonus: 2.0,
        gateBudget: { gold: 4, silver: 6, bronze: 8 }, // Optimal: 4 NOT gates = 4 NANDs
        testCases: [
            // All zeros -> all ones
            { inputs: { A0: false, A1: false, A2: false, A3: false }, outputs: { Q0: true, Q1: true, Q2: true, Q3: true } },
            // All ones -> all zeros
            { inputs: { A0: true, A1: true, A2: true, A3: true }, outputs: { Q0: false, Q1: false, Q2: false, Q3: false } },
            // Alternating patterns
            { inputs: { A0: true, A1: false, A2: true, A3: false }, outputs: { Q0: false, Q1: true, Q2: false, Q3: true } },
            { inputs: { A0: false, A1: true, A2: false, A3: true }, outputs: { Q0: true, Q1: false, Q2: true, Q3: false } },
            // Half patterns
            { inputs: { A0: true, A1: true, A2: false, A3: false }, outputs: { Q0: false, Q1: false, Q2: true, Q3: true } },
            { inputs: { A0: false, A1: false, A2: true, A3: true }, outputs: { Q0: true, Q1: true, Q2: false, Q3: false } },
            // Single bit patterns
            { inputs: { A0: true, A1: false, A2: false, A3: false }, outputs: { Q0: false, Q1: true, Q2: true, Q3: true } },
            { inputs: { A0: false, A1: true, A2: false, A3: false }, outputs: { Q0: true, Q1: false, Q2: true, Q3: true } },
            { inputs: { A0: false, A1: false, A2: true, A3: false }, outputs: { Q0: true, Q1: true, Q2: false, Q3: true } },
            { inputs: { A0: false, A1: false, A2: false, A3: true }, outputs: { Q0: true, Q1: true, Q2: true, Q3: false } }
        ]
    },
    {
        id: 'decoder_3to8',
        name: '3:8 Decoder',
        description: 'Decode 3-bit input to 8 one-hot outputs',
        tier: 11,
        value: 0.50, // 50% multiplier
        inputs: ['A', 'B', 'C'],
        outputs: ['Y0', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7'],
        productionTier: 'packager',
        productionDescription: 'Elite chip requires full production line',
        researchBonus: { tree: 'logistics', multiplier: 5.0 }, // Large decoder
        blackMarketBonus: 2.0,
        prestigeRevenueBonus: 3.0,
        gateBudget: { gold: 20, silver: 26, bronze: 32 }, // 8 minterms from 3 inputs
        requires: ['decoder_2to4'],
        testCases: [
            // All 8 input combinations -> one-hot outputs
            { inputs: { A: false, B: false, C: false }, outputs: { Y0: true, Y1: false, Y2: false, Y3: false, Y4: false, Y5: false, Y6: false, Y7: false } },  // 0 -> Y0
            { inputs: { A: true, B: false, C: false }, outputs: { Y0: false, Y1: true, Y2: false, Y3: false, Y4: false, Y5: false, Y6: false, Y7: false } },   // 1 -> Y1
            { inputs: { A: false, B: true, C: false }, outputs: { Y0: false, Y1: false, Y2: true, Y3: false, Y4: false, Y5: false, Y6: false, Y7: false } },   // 2 -> Y2
            { inputs: { A: true, B: true, C: false }, outputs: { Y0: false, Y1: false, Y2: false, Y3: true, Y4: false, Y5: false, Y6: false, Y7: false } },    // 3 -> Y3
            { inputs: { A: false, B: false, C: true }, outputs: { Y0: false, Y1: false, Y2: false, Y3: false, Y4: true, Y5: false, Y6: false, Y7: false } },   // 4 -> Y4
            { inputs: { A: true, B: false, C: true }, outputs: { Y0: false, Y1: false, Y2: false, Y3: false, Y4: false, Y5: true, Y6: false, Y7: false } },    // 5 -> Y5
            { inputs: { A: false, B: true, C: true }, outputs: { Y0: false, Y1: false, Y2: false, Y3: false, Y4: false, Y5: false, Y6: true, Y7: false } },    // 6 -> Y6
            { inputs: { A: true, B: true, C: true }, outputs: { Y0: false, Y1: false, Y2: false, Y3: false, Y4: false, Y5: false, Y6: false, Y7: true } }      // 7 -> Y7
        ]
    },

    // Tier 12: Legendary circuits (X3500 mastery) - 55-60% multiplier
    {
        id: 'alu_4bit',
        name: '4-bit ALU',
        description: '4-bit ALU: AND/OR/ADD/SUB with carry and zero flags',
        tier: 12,
        value: 0.55, // 55% multiplier
        inputs: ['A0', 'A1', 'A2', 'A3', 'B0', 'B1', 'B2', 'B3', 'Op0', 'Op1'],
        outputs: ['R0', 'R1', 'R2', 'R3', 'C', 'Z'],
        productionTier: 'packager',
        productionDescription: 'Legendary chip requires full production line',
        researchBonus: { tree: 'processing', multiplier: 6.0 }, // Full ALU
        blackMarketBonus: 2.0,
        prestigeRevenueBonus: 3.5,
        productionCountBonus: 2.0,
        gateBudget: { gold: 100, silver: 130, bronze: 160 }, // 4-bit ALU with carry and zero flags
        requires: ['alu_2bit'],
        testCases: [
            // AND operation (Op=00)
            { inputs: { A0: true, A1: true, A2: true, A3: true, B0: true, B1: false, B2: true, B3: false, Op0: false, Op1: false }, outputs: { R0: true, R1: false, R2: true, R3: false, C: false, Z: false } }, // 15 & 5 = 5
            { inputs: { A0: false, A1: false, A2: false, A3: false, B0: false, B1: false, B2: false, B3: false, Op0: false, Op1: false }, outputs: { R0: false, R1: false, R2: false, R3: false, C: false, Z: true } }, // 0 & 0 = 0
            { inputs: { A0: true, A1: true, A2: false, A3: false, B0: false, B1: false, B2: true, B3: true, Op0: false, Op1: false }, outputs: { R0: false, R1: false, R2: false, R3: false, C: false, Z: true } }, // 3 & 12 = 0
            // OR operation (Op=01)
            { inputs: { A0: true, A1: false, A2: false, A3: false, B0: false, B1: true, B2: false, B3: false, Op0: true, Op1: false }, outputs: { R0: true, R1: true, R2: false, R3: false, C: false, Z: false } }, // 1 | 2 = 3
            { inputs: { A0: true, A1: false, A2: true, A3: false, B0: false, B1: true, B2: false, B3: true, Op0: true, Op1: false }, outputs: { R0: true, R1: true, R2: true, R3: true, C: false, Z: false } }, // 5 | 10 = 15
            // ADD operation (Op=10)
            { inputs: { A0: true, A1: false, A2: true, A3: false, B0: true, B1: true, B2: false, B3: false, Op0: false, Op1: true }, outputs: { R0: false, R1: false, R2: false, R3: true, C: false, Z: false } }, // 5 + 3 = 8
            { inputs: { A0: true, A1: true, A2: true, A3: true, B0: true, B1: false, B2: false, B3: false, Op0: false, Op1: true }, outputs: { R0: false, R1: false, R2: false, R3: false, C: true, Z: true } }, // 15 + 1 = 16 (overflow)
            { inputs: { A0: false, A1: false, A2: true, A3: true, B0: false, B1: false, B2: true, B3: true, Op0: false, Op1: true }, outputs: { R0: false, R1: false, R2: false, R3: true, C: true, Z: false } }, // 12 + 12 = 24 (overflow, result 8)
            // SUB operation (Op=11)
            { inputs: { A0: true, A1: true, A2: true, A3: false, B0: true, B1: true, B2: false, B3: false, Op0: true, Op1: true }, outputs: { R0: false, R1: false, R2: true, R3: false, C: false, Z: false } }, // 7 - 3 = 4
            { inputs: { A0: true, A1: false, A2: true, A3: false, B0: true, B1: false, B2: true, B3: false, Op0: true, Op1: true }, outputs: { R0: false, R1: false, R2: false, R3: false, C: false, Z: true } }, // 5 - 5 = 0
            { inputs: { A0: false, A1: false, A2: false, A3: true, B0: true, B1: false, B2: false, B3: false, Op0: true, Op1: true }, outputs: { R0: true, R1: true, R2: true, R3: false, C: false, Z: false } } // 8 - 1 = 7
        ]
    },
    {
        id: 'multiplier_4x4',
        name: '4x4 Multiplier',
        description: 'Multiply two 4-bit numbers (8-bit result)',
        tier: 12,
        value: 0.58, // 58% multiplier
        inputs: ['A0', 'A1', 'A2', 'A3', 'B0', 'B1', 'B2', 'B3'],
        outputs: ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
        productionTier: 'packager',
        productionDescription: 'Legendary chip requires full production line',
        researchBonus: { tree: 'research', multiplier: 6.0 }, // Full multiplier
        blackMarketBonus: 2.0,
        prestigeRevenueBonus: 3.5,
        productionCountBonus: 2.0,
        gateBudget: { gold: 120, silver: 160, bronze: 200 }, // 4x4 array multiplier
        requires: ['multiplier_2x2'],
        testCases: [
            // 0 * 0 = 0
            { inputs: { A0: false, A1: false, A2: false, A3: false, B0: false, B1: false, B2: false, B3: false }, outputs: { P0: false, P1: false, P2: false, P3: false, P4: false, P5: false, P6: false, P7: false } },
            // 1 * 1 = 1
            { inputs: { A0: true, A1: false, A2: false, A3: false, B0: true, B1: false, B2: false, B3: false }, outputs: { P0: true, P1: false, P2: false, P3: false, P4: false, P5: false, P6: false, P7: false } },
            // 2 * 3 = 6
            { inputs: { A0: false, A1: true, A2: false, A3: false, B0: true, B1: true, B2: false, B3: false }, outputs: { P0: false, P1: true, P2: true, P3: false, P4: false, P5: false, P6: false, P7: false } },
            // 3 * 3 = 9
            { inputs: { A0: true, A1: true, A2: false, A3: false, B0: true, B1: true, B2: false, B3: false }, outputs: { P0: true, P1: false, P2: false, P3: true, P4: false, P5: false, P6: false, P7: false } },
            // 4 * 4 = 16
            { inputs: { A0: false, A1: false, A2: true, A3: false, B0: false, B1: false, B2: true, B3: false }, outputs: { P0: false, P1: false, P2: false, P3: false, P4: true, P5: false, P6: false, P7: false } },
            // 5 * 5 = 25
            { inputs: { A0: true, A1: false, A2: true, A3: false, B0: true, B1: false, B2: true, B3: false }, outputs: { P0: true, P1: false, P2: false, P3: true, P4: true, P5: false, P6: false, P7: false } },
            // 7 * 7 = 49
            { inputs: { A0: true, A1: true, A2: true, A3: false, B0: true, B1: true, B2: true, B3: false }, outputs: { P0: true, P1: false, P2: false, P3: false, P4: true, P5: true, P6: false, P7: false } },
            // 8 * 2 = 16
            { inputs: { A0: false, A1: false, A2: false, A3: true, B0: false, B1: true, B2: false, B3: false }, outputs: { P0: false, P1: false, P2: false, P3: false, P4: true, P5: false, P6: false, P7: false } },
            // 10 * 10 = 100
            { inputs: { A0: false, A1: true, A2: false, A3: true, B0: false, B1: true, B2: false, B3: true }, outputs: { P0: false, P1: false, P2: true, P3: false, P4: false, P5: true, P6: true, P7: false } },
            // 15 * 15 = 225
            { inputs: { A0: true, A1: true, A2: true, A3: true, B0: true, B1: true, B2: true, B3: true }, outputs: { P0: true, P1: false, P2: false, P3: false, P4: false, P5: true, P6: true, P7: true } }
        ]
    },
    {
        id: 'carry_lookahead',
        name: 'Carry Lookahead Unit',
        description: '4-bit carry lookahead: generate G,P and carry outputs',
        tier: 12,
        value: 0.60, // 60% multiplier
        inputs: ['G0', 'P0', 'G1', 'P1', 'G2', 'P2', 'G3', 'P3', 'Cin'],
        outputs: ['C1', 'C2', 'C3', 'Cout'],
        productionTier: 'packager',
        productionDescription: 'Legendary chip requires full production line',
        researchBonus: { tree: 'power', multiplier: 6.0 }, // Speed optimization
        blackMarketBonus: 2.0,
        prestigeRevenueBonus: 4.0,
        productionCountBonus: 2.5,
        gateBudget: { gold: 40, silver: 55, bronze: 70 }, // Complex carry propagation logic
        requires: ['adder_4bit'],
        testCases: [
            // All zeros - no carries
            { inputs: { G0: false, P0: false, G1: false, P1: false, G2: false, P2: false, G3: false, P3: false, Cin: false }, outputs: { C1: false, C2: false, C3: false, Cout: false } },
            // Carry in propagates through all P's
            { inputs: { G0: false, P0: true, G1: false, P1: true, G2: false, P2: true, G3: false, P3: true, Cin: true }, outputs: { C1: true, C2: true, C3: true, Cout: true } },
            // Carry in stops at first non-propagate
            { inputs: { G0: false, P0: true, G1: false, P1: false, G2: false, P2: true, G3: false, P3: true, Cin: true }, outputs: { C1: true, C2: false, C3: false, Cout: false } },
            // Generate at position 0 only
            { inputs: { G0: true, P0: false, G1: false, P1: false, G2: false, P2: false, G3: false, P3: false, Cin: false }, outputs: { C1: true, C2: false, C3: false, Cout: false } },
            // Generate at position 1
            { inputs: { G0: false, P0: false, G1: true, P1: false, G2: false, P2: false, G3: false, P3: false, Cin: false }, outputs: { C1: false, C2: true, C3: false, Cout: false } },
            // Generate at position 2, propagate through 3
            { inputs: { G0: false, P0: false, G1: false, P1: false, G2: true, P2: false, G3: false, P3: true, Cin: false }, outputs: { C1: false, C2: false, C3: true, Cout: true } },
            // Generate at position 3 only
            { inputs: { G0: false, P0: false, G1: false, P1: false, G2: false, P2: false, G3: true, P3: false, Cin: false }, outputs: { C1: false, C2: false, C3: false, Cout: true } },
            // G0 propagates through P1
            { inputs: { G0: true, P0: false, G1: false, P1: true, G2: false, P2: false, G3: false, P3: false, Cin: false }, outputs: { C1: true, C2: true, C3: false, Cout: false } },
            // Complex: G0, P1, G2
            { inputs: { G0: true, P0: false, G1: false, P1: true, G2: true, P2: false, G3: false, P3: false, Cin: false }, outputs: { C1: true, C2: true, C3: true, Cout: false } },
            // All generate
            { inputs: { G0: true, P0: false, G1: true, P1: false, G2: true, P2: false, G3: true, P3: false, Cin: false }, outputs: { C1: true, C2: true, C3: true, Cout: true } },
            // Cin with G1
            { inputs: { G0: false, P0: false, G1: true, P1: false, G2: false, P2: true, G3: false, P3: true, Cin: true }, outputs: { C1: false, C2: true, C3: true, Cout: true } }
        ]
    },

    // Tier 13: Void Circuits (Expert Firmware Challenges required) - 65-100% multiplier
    // These challenges emerged from the void itself - circuits with strange, reality-bending properties
    {
        id: 'quantum_superposition_detector',
        name: 'Quantum Superposition Detector',
        description: 'Detects when 4 quantum signals achieve perfect coherence (all in same state). The void reveals truth only when all realities align.',
        tier: 13,
        value: 0.65, // 65% multiplier
        inputs: ['Q0', 'Q1', 'Q2', 'Q3'],
        outputs: ['COHERENT', 'STATE'],
        productionTier: 'packager',
        productionDescription: 'Quantum coherence detection - Package requires void shielding',
        researchBonus: { tree: 'processing', multiplier: 8.0 },
        blackMarketBonus: 2.5,
        prestigeRevenueBonus: 4.0,
        productionCountBonus: 3.0,
        defectCleanse: 0.3, // 30% chance to remove a defect on firmware application
        gateBudget: { gold: 12, silver: 16, bronze: 20 }, // All XNOR + OR + AND
        requiresVoidUpgrade: 'expert_firmware_challenges',
        requires: ['comparator_4bit'],
        testCases: [
            // All zero - coherent, state=0
            { inputs: { Q0:false, Q1:false, Q2:false, Q3:false }, outputs: { COHERENT:true, STATE:false } },
            // All one - coherent, state=1
            { inputs: { Q0:true, Q1:true, Q2:true, Q3:true }, outputs: { COHERENT:true, STATE:true } },
            // Mixed - not coherent, state undefined (0)
            { inputs: { Q0:true, Q1:false, Q2:true, Q3:false }, outputs: { COHERENT:false, STATE:false } },
            { inputs: { Q0:false, Q1:true, Q2:false, Q3:true }, outputs: { COHERENT:false, STATE:false } },
            { inputs: { Q0:true, Q1:true, Q2:false, Q3:false }, outputs: { COHERENT:false, STATE:false } },
            { inputs: { Q0:false, Q1:false, Q2:true, Q3:true }, outputs: { COHERENT:false, STATE:false } },
            { inputs: { Q0:true, Q1:false, Q2:false, Q3:false }, outputs: { COHERENT:false, STATE:false } },
            { inputs: { Q0:false, Q1:true, Q2:true, Q3:true }, outputs: { COHERENT:false, STATE:false } }
        ]
    },
    {
        id: 'void_echo_mirror',
        name: 'Void Error Shield',
        description: 'The void corrupts all signals passing through it. Encode 4 data bits into a 7-bit Hamming code with 3 parity bits at positions 1, 2, and 4. Only error-shielded data survives the void intact.',
        tier: 13,
        value: 0.70, // 70% multiplier
        inputs: ['D0', 'D1', 'D2', 'D3'],
        outputs: ['H0', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
        productionTier: 'packager',
        productionDescription: 'Void error shield - Hamming-encoded protection',
        researchBonus: { tree: 'power', multiplier: 8.0 },
        blackMarketBonus: 2.5,
        prestigeRevenueBonus: 4.0,
        productionCountBonus: 3.0,
        voidDecayImmunity: true, // Chips don't decay on void floors
        gateBudget: { gold: 24, silver: 32, bronze: 40 }, // 3 XOR-of-3 parity computations
        requiresVoidUpgrade: 'expert_firmware_challenges',
        requires: ['bitwise_negator'],
        // Hamming(7,4): H0=P1=D0⊕D1⊕D3, H1=P2=D0⊕D2⊕D3, H2=D0, H3=P4=D1⊕D2⊕D3, H4=D1, H5=D2, H6=D3
        testCases: [
            // All zero data
            { inputs: { D0:false, D1:false, D2:false, D3:false }, outputs: { H0:false, H1:false, H2:false, H3:false, H4:false, H5:false, H6:false } },
            // Single data bits
            { inputs: { D0:true, D1:false, D2:false, D3:false }, outputs: { H0:true, H1:true, H2:true, H3:false, H4:false, H5:false, H6:false } },
            { inputs: { D0:false, D1:true, D2:false, D3:false }, outputs: { H0:true, H1:false, H2:false, H3:true, H4:true, H5:false, H6:false } },
            { inputs: { D0:false, D1:false, D2:true, D3:false }, outputs: { H0:false, H1:true, H2:false, H3:true, H4:false, H5:true, H6:false } },
            { inputs: { D0:false, D1:false, D2:false, D3:true }, outputs: { H0:true, H1:true, H2:false, H3:true, H4:false, H5:false, H6:true } },
            // Multi-bit patterns
            { inputs: { D0:true, D1:true, D2:false, D3:false }, outputs: { H0:false, H1:true, H2:true, H3:true, H4:true, H5:false, H6:false } },
            { inputs: { D0:true, D1:false, D2:true, D3:false }, outputs: { H0:true, H1:false, H2:true, H3:true, H4:false, H5:true, H6:false } },
            // All ones
            { inputs: { D0:true, D1:true, D2:true, D3:true }, outputs: { H0:true, H1:true, H2:true, H3:true, H4:true, H5:true, H6:true } }
        ]
    },
    {
        id: 'entropy_counter',
        name: 'Entropy Counter',
        description: 'Measure void corruption by counting active signals (population count). The void hungers - more active signals mean higher entropy.',
        tier: 13,
        value: 0.75, // 75% multiplier
        inputs: ['D0', 'D1', 'D2', 'D3'],
        outputs: ['C0', 'C1', 'C2'],
        productionTier: 'packager',
        productionDescription: 'Entropy measurement - Counts disorder in the signal',
        researchBonus: { tree: 'research', multiplier: 8.0 },
        blackMarketBonus: 2.5,
        prestigeRevenueBonus: 4.5,
        saturationResistance: 0.3, // 30% reduction in market saturation penalty
        gateBudget: { gold: 20, silver: 26, bronze: 32 }, // Population count circuit
        requiresVoidUpgrade: 'expert_firmware_challenges',
        requires: ['adder_2bit'],
        testCases: [
            // Zero entropy (000)
            { inputs: { D0:false, D1:false, D2:false, D3:false }, outputs: { C0:false, C1:false, C2:false } },
            // Entropy = 1 (001)
            { inputs: { D0:true, D1:false, D2:false, D3:false }, outputs: { C0:true, C1:false, C2:false } },
            { inputs: { D0:false, D1:true, D2:false, D3:false }, outputs: { C0:true, C1:false, C2:false } },
            // Entropy = 2 (010)
            { inputs: { D0:true, D1:true, D2:false, D3:false }, outputs: { C0:false, C1:true, C2:false } },
            { inputs: { D0:true, D1:false, D2:true, D3:false }, outputs: { C0:false, C1:true, C2:false } },
            // Entropy = 3 (011)
            { inputs: { D0:true, D1:true, D2:true, D3:false }, outputs: { C0:true, C1:true, C2:false } },
            { inputs: { D0:false, D1:true, D2:true, D3:true }, outputs: { C0:true, C1:true, C2:false } },
            // Entropy = 4 (100)
            { inputs: { D0:true, D1:true, D2:true, D3:true }, outputs: { C0:false, C1:false, C2:true } }
        ]
    },
    {
        id: 'temporal_reverser',
        name: 'Temporal Negation Engine',
        description: 'The void inverts the flow of time itself. Compute the absolute value of a 4-bit signed two\'s complement number. Output the magnitude and an overflow flag V (true only for -8, whose positive form cannot be represented).',
        tier: 13,
        value: 0.80, // 80% multiplier
        inputs: ['A0', 'A1', 'A2', 'A3'],
        outputs: ['R0', 'R1', 'R2', 'R3', 'V'],
        productionTier: 'packager',
        productionDescription: 'Temporal negation - Absolute value engine',
        researchBonus: { tree: 'logistics', multiplier: 8.0 },
        blackMarketBonus: 2.5,
        prestigeRevenueBonus: 4.5,
        voidDecayImmunity: true,
        defectCleanse: 0.4, // 40% chance to remove a defect
        gateBudget: { gold: 30, silver: 40, bronze: 50 }, // Conditional negation: XOR + ripple increment + overflow detect
        requiresVoidUpgrade: 'expert_firmware_challenges',
        requires: ['decoder_2to4'],
        // |A| in two's complement: if A3=0 pass through, if A3=1 negate (NOT+1). V=1 only for input 1000 (-8)
        testCases: [
            // Zero
            { inputs: { A0:false, A1:false, A2:false, A3:false }, outputs: { R0:false, R1:false, R2:false, R3:false, V:false } },
            // Positive values pass through
            { inputs: { A0:true, A1:false, A2:false, A3:false }, outputs: { R0:true, R1:false, R2:false, R3:false, V:false } },
            { inputs: { A0:true, A1:true, A2:false, A3:false }, outputs: { R0:true, R1:true, R2:false, R3:false, V:false } },
            { inputs: { A0:true, A1:true, A2:true, A3:false }, outputs: { R0:true, R1:true, R2:true, R3:false, V:false } },
            // |-1| = 1 (1111 → 0001)
            { inputs: { A0:true, A1:true, A2:true, A3:true }, outputs: { R0:true, R1:false, R2:false, R3:false, V:false } },
            // |-2| = 2 (1110 → 0010)
            { inputs: { A0:false, A1:true, A2:true, A3:true }, outputs: { R0:false, R1:true, R2:false, R3:false, V:false } },
            // |-5| = 5 (1011 → 0101)
            { inputs: { A0:true, A1:true, A2:false, A3:true }, outputs: { R0:true, R1:false, R2:true, R3:false, V:false } },
            // |-7| = 7 (1001 → 0111)
            { inputs: { A0:true, A1:false, A2:false, A3:true }, outputs: { R0:true, R1:true, R2:true, R3:false, V:false } },
            // |-8| = overflow (1000 → 1000, V=1)
            { inputs: { A0:false, A1:false, A2:false, A3:true }, outputs: { R0:false, R1:false, R2:false, R3:true, V:true } }
        ]
    },
    {
        id: 'dimensional_phase_shifter',
        name: 'Dimensional Phase Shifter',
        description: 'Shift signals across dimensional boundaries. A 4-bit pattern rotates left by the shift amount. Bridges parallel realities.',
        tier: 13,
        value: 0.85, // 85% multiplier
        inputs: ['D0', 'D1', 'D2', 'D3', 'S0', 'S1'],
        outputs: ['Q0', 'Q1', 'Q2', 'Q3'],
        productionTier: 'packager',
        productionDescription: 'Phase manipulation - Rotates signals through dimensions',
        researchBonus: { tree: 'power', multiplier: 8.0 },
        blackMarketBonus: 2.5,
        prestigeRevenueBonus: 5.0,
        productionCountBonus: 3.5,
        saturationResistance: 0.5, // 50% reduction in market saturation penalty
        dimensionalEcho: true, // Generates 0.5 VP per sale (max 1 VP per sale)
        gateBudget: { gold: 32, silver: 44, bronze: 56 }, // 4 × 4:1 MUX
        requiresVoidUpgrade: 'expert_firmware_challenges',
        requires: ['mux_4to1'],
        testCases: [
            // No shift (S=00)
            { inputs: { D0:true, D1:false, D2:true, D3:false, S0:false, S1:false }, outputs: { Q0:true, Q1:false, Q2:true, Q3:false } },
            // Shift 1 (S=01)
            { inputs: { D0:true, D1:false, D2:true, D3:false, S0:true, S1:false }, outputs: { Q0:false, Q1:true, Q2:false, Q3:true } },
            { inputs: { D0:true, D1:true, D2:false, D3:false, S0:true, S1:false }, outputs: { Q0:false, Q1:true, Q2:true, Q3:false } },
            // Shift 2 (S=10)
            { inputs: { D0:true, D1:false, D2:true, D3:false, S0:false, S1:true }, outputs: { Q0:true, Q1:false, Q2:true, Q3:false } },
            { inputs: { D0:true, D1:true, D2:false, D3:false, S0:false, S1:true }, outputs: { Q0:false, Q1:false, Q2:true, Q3:true } },
            // Shift 3 (S=11)
            { inputs: { D0:true, D1:false, D2:false, D3:false, S0:true, S1:true }, outputs: { Q0:false, Q1:false, Q2:false, Q3:true } },
            { inputs: { D0:true, D1:true, D2:true, D3:false, S0:true, S1:true }, outputs: { Q0:true, Q1:true, Q2:false, Q3:true } },
            { inputs: { D0:true, D1:true, D2:true, D3:true, S0:false, S1:false }, outputs: { Q0:true, Q1:true, Q2:true, Q3:true } }
        ]
    },
    {
        id: 'quantum_entanglement_pair',
        name: 'Quantum Entanglement Matrix',
        description: 'Two quantum states collide in the void and their magnitudes become entangled. Multiply two 4-bit signed numbers (two\'s complement, -8 to +7) and produce the full 8-bit signed product. The ultimate void challenge.',
        tier: 13,
        value: 1.00, // 100% multiplier - The ultimate void challenge!
        inputs: ['A0', 'A1', 'A2', 'A3', 'B0', 'B1', 'B2', 'B3'],
        outputs: ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
        productionTier: 'packager',
        productionDescription: 'Legendary quantum entanglement - Signed multiplication matrix',
        researchBonus: { tree: 'processing', multiplier: 10.0 }, // Legendary bonus
        blackMarketBonus: 3.0,
        prestigeRevenueBonus: 5.0,
        productionCountBonus: 5.0,
        voidDecayImmunity: true,
        defectCleanse: 0.5, // 50% chance to remove a defect
        saturationResistance: 0.5,
        dimensionalEcho: true,
        gateBudget: { gold: 150, silver: 195, bronze: 240 }, // Signed 4x4 multiplier (Baugh-Wooley or negate-multiply-negate)
        requiresVoidUpgrade: 'expert_firmware_challenges',
        requires: ['multiplier_4x4', 'bitwise_negator'],
        // 4-bit signed two's complement multiplication → 8-bit signed product
        testCases: [
            // 0 × 0 = 0
            { inputs: { A0:false, A1:false, A2:false, A3:false, B0:false, B1:false, B2:false, B3:false }, outputs: { P0:false, P1:false, P2:false, P3:false, P4:false, P5:false, P6:false, P7:false } },
            // 1 × 1 = 1
            { inputs: { A0:true, A1:false, A2:false, A3:false, B0:true, B1:false, B2:false, B3:false }, outputs: { P0:true, P1:false, P2:false, P3:false, P4:false, P5:false, P6:false, P7:false } },
            // 2 × 3 = 6 (0110)
            { inputs: { A0:false, A1:true, A2:false, A3:false, B0:true, B1:true, B2:false, B3:false }, outputs: { P0:false, P1:true, P2:true, P3:false, P4:false, P5:false, P6:false, P7:false } },
            // 7 × 7 = 49 (00110001)
            { inputs: { A0:true, A1:true, A2:true, A3:false, B0:true, B1:true, B2:true, B3:false }, outputs: { P0:true, P1:false, P2:false, P3:false, P4:true, P5:true, P6:false, P7:false } },
            // -1 × -1 = 1 (A=1111, B=1111)
            { inputs: { A0:true, A1:true, A2:true, A3:true, B0:true, B1:true, B2:true, B3:true }, outputs: { P0:true, P1:false, P2:false, P3:false, P4:false, P5:false, P6:false, P7:false } },
            // 3 × -2 = -6 (A=0011, B=1110, P=11111010)
            { inputs: { A0:true, A1:true, A2:false, A3:false, B0:false, B1:true, B2:true, B3:true }, outputs: { P0:false, P1:true, P2:false, P3:true, P4:true, P5:true, P6:true, P7:true } },
            // -8 × 7 = -56 (A=1000, B=0111, P=11001000)
            { inputs: { A0:false, A1:false, A2:false, A3:true, B0:true, B1:true, B2:true, B3:false }, outputs: { P0:false, P1:false, P2:false, P3:true, P4:false, P5:false, P6:true, P7:true } },
            // -8 × -8 = 64 (A=1000, B=1000, P=01000000)
            { inputs: { A0:false, A1:false, A2:false, A3:true, B0:false, B1:false, B2:false, B3:true }, outputs: { P0:false, P1:false, P2:false, P3:false, P4:false, P5:false, P6:true, P7:false } },
            // 4 × -3 = -12 (A=0100, B=1101, P=11110100)
            { inputs: { A0:false, A1:false, A2:true, A3:false, B0:true, B1:false, B2:true, B3:true }, outputs: { P0:false, P1:false, P2:true, P3:false, P4:true, P5:true, P6:true, P7:true } },
            // -2 × -3 = 6 (A=1110, B=1101, P=00000110)
            { inputs: { A0:false, A1:true, A2:true, A3:true, B0:true, B1:false, B2:true, B3:true }, outputs: { P0:false, P1:true, P2:true, P3:false, P4:false, P5:false, P6:false, P7:false } }
        ]
    },
    // === TIER 14: TRANSCENDENT CHALLENGES ===
    {
        id: 'divider_8bit',
        name: '8-Bit Integer Divider',
        description: 'Divide two 8-bit unsigned integers. Output quotient, remainder, and divide-by-zero flag.',
        tier: 14,
        value: 1.00, // 100% multiplier
        inputs: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'],
        outputs: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'DIV0'],
        productionTier: 'packager',
        productionDescription: 'Legendary arithmetic - Division with remainder',
        researchBonus: { tree: 'research', multiplier: 10.0 },
        blackMarketBonus: 3.0,
        prestigeRevenueBonus: 10.0,
        productionCountBonus: 6.0,
        saturationResistance: 0.75,
        dimensionalResonance: 2.0,
        transcendent: true,
        gateBudget: { gold: 300, silver: 400, bronze: 500 },
        requiresVoidUpgrade: 'transcendent_firmware',
        requires: ['multiplier_4x4'],
        testCases: [
            // Divide by zero cases
            { inputs: { A0:true, A1:false, A2:false, A3:false, A4:false, A5:false, A6:false, A7:false, B0:false, B1:false, B2:false, B3:false, B4:false, B5:false, B6:false, B7:false }, outputs: { Q0:false, Q1:false, Q2:false, Q3:false, Q4:false, Q5:false, Q6:false, Q7:false, R0:false, R1:false, R2:false, R3:false, R4:false, R5:false, R6:false, R7:false, DIV0:true } }, // 1÷0
            { inputs: { A0:true, A1:true, A2:true, A3:true, A4:true, A5:true, A6:true, A7:true, B0:false, B1:false, B2:false, B3:false, B4:false, B5:false, B6:false, B7:false }, outputs: { Q0:false, Q1:false, Q2:false, Q3:false, Q4:false, Q5:false, Q6:false, Q7:false, R0:false, R1:false, R2:false, R3:false, R4:false, R5:false, R6:false, R7:false, DIV0:true } }, // 255÷0
            // Simple cases
            { inputs: { A0:false, A1:false, A2:false, A3:false, A4:false, A5:false, A6:false, A7:false, B0:true, B1:false, B2:false, B3:false, B4:false, B5:false, B6:false, B7:false }, outputs: { Q0:false, Q1:false, Q2:false, Q3:false, Q4:false, Q5:false, Q6:false, Q7:false, R0:false, R1:false, R2:false, R3:false, R4:false, R5:false, R6:false, R7:false, DIV0:false } }, // 0÷1=0 R0
            { inputs: { A0:true, A1:false, A2:false, A3:false, A4:false, A5:false, A6:false, A7:false, B0:true, B1:false, B2:false, B3:false, B4:false, B5:false, B6:false, B7:false }, outputs: { Q0:true, Q1:false, Q2:false, Q3:false, Q4:false, Q5:false, Q6:false, Q7:false, R0:false, R1:false, R2:false, R3:false, R4:false, R5:false, R6:false, R7:false, DIV0:false } }, // 1÷1=1 R0
            { inputs: { A0:false, A1:true, A2:false, A3:false, A4:false, A5:false, A6:false, A7:false, B0:true, B1:false, B2:false, B3:false, B4:false, B5:false, B6:false, B7:false }, outputs: { Q0:false, Q1:true, Q2:false, Q3:false, Q4:false, Q5:false, Q6:false, Q7:false, R0:false, R1:false, R2:false, R3:false, R4:false, R5:false, R6:false, R7:false, DIV0:false } }, // 2÷1=2 R0
            { inputs: { A0:false, A1:false, A2:true, A3:false, A4:false, A5:false, A6:false, A7:false, B0:false, A1:true, B2:false, B3:false, B4:false, B5:false, B6:false, B7:false }, outputs: { Q0:false, Q1:true, Q2:false, Q3:false, Q4:false, Q5:false, Q6:false, Q7:false, R0:false, R1:false, R2:false, R3:false, R4:false, R5:false, R6:false, R7:false, DIV0:false } }, // 4÷2=2 R0
            { inputs: { A0:true, A1:false, A2:true, A3:false, A4:false, A5:false, A6:false, A7:false, B0:false, B1:true, B2:false, B3:false, B4:false, B5:false, B6:false, B7:false }, outputs: { Q0:false, Q1:true, Q2:false, Q3:false, Q4:false, Q5:false, Q6:false, Q7:false, R0:true, R1:false, R2:false, R3:false, R4:false, R5:false, R6:false, R7:false, DIV0:false } }, // 5÷2=2 R1
            { inputs: { A0:false, A1:false, A2:false, A3:true, A4:false, A5:false, A6:false, A7:false, B0:true, B1:true, B2:false, B3:false, B4:false, B5:false, B6:false, B7:false }, outputs: { Q0:false, Q1:true, Q2:false, Q3:false, Q4:false, Q5:false, Q6:false, Q7:false, R0:false, R1:true, R2:false, R3:false, R4:false, R5:false, R6:false, R7:false, DIV0:false } }, // 8÷3=2 R2
            { inputs: { A0:false, A1:true, A2:true, A3:true, A4:false, A5:false, A6:false, A7:false, B0:true, B1:false, B2:true, B3:false, B4:false, B5:false, B6:false, B7:false }, outputs: { Q0:false, Q1:true, Q2:false, Q3:false, Q4:false, Q5:false, Q6:false, Q7:false, R0:false, R1:true, R2:false, R3:false, R4:false, R5:false, R6:false, R7:false, DIV0:false } }, // 14÷5=2 R4
            { inputs: { A0:true, A1:true, A2:true, A3:true, A4:true, A5:true, A6:true, A7:true, B0:true, B1:true, B2:true, B3:true, B4:true, B5:true, B6:true, B7:true }, outputs: { Q0:true, Q1:false, Q2:false, Q3:false, Q4:false, Q5:false, Q6:false, Q7:false, R0:false, R1:false, R2:false, R3:false, R4:false, R5:false, R6:false, R7:false, DIV0:false } } // 255÷255=1 R0
        ]
    },
    {
        id: 'sqrt_4bit',
        name: '4-Bit Integer Square Root',
        description: 'Calculate integer square root of 8-bit input. Output 4-bit result and exact flag.',
        tier: 14,
        value: 1.20, // 120% multiplier
        inputs: ['X0', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7'],
        outputs: ['S0', 'S1', 'S2', 'S3', 'EXACT'],
        productionTier: 'packager',
        productionDescription: 'Transcendent mathematics - Square root extraction',
        researchBonus: { tree: 'power', multiplier: 12.0 },
        blackMarketBonus: 3.5,
        prestigeRevenueBonus: 11.0,
        productionCountBonus: 7.0,
        saturationResistance: 0.80,
        dimensionalResonance: 2.5,
        transcendent: true,
        gateBudget: { gold: 200, silver: 280, bronze: 350 },
        requiresVoidUpgrade: 'transcendent_firmware',
        requires: ['comparator_4bit'],
        testCases: [
            // Perfect squares
            { inputs: { X0:false, X1:false, X2:false, X3:false, X4:false, X5:false, X6:false, X7:false }, outputs: { S0:false, S1:false, S2:false, S3:false, EXACT:true } }, // √0 = 0
            { inputs: { X0:true, X1:false, X2:false, X3:false, X4:false, X5:false, X6:false, X7:false }, outputs: { S0:true, S1:false, S2:false, S3:false, EXACT:true } }, // √1 = 1
            { inputs: { X0:false, X1:false, X2:true, X3:false, X4:false, X5:false, X6:false, X7:false }, outputs: { S0:false, S1:true, S2:false, S3:false, EXACT:true } }, // √4 = 2
            { inputs: { X0:true, X1:false, X2:false, X3:true, X4:false, X5:false, X6:false, X7:false }, outputs: { S0:true, S1:true, S2:false, S3:false, EXACT:true } }, // √9 = 3
            { inputs: { X0:false, X1:false, X2:false, X3:false, X4:true, X5:false, X6:false, X7:false }, outputs: { S0:false, S1:false, S2:true, S3:false, EXACT:true } }, // √16 = 4
            { inputs: { X0:true, X1:false, X2:false, X3:true, X4:true, X5:false, X6:false, X7:false }, outputs: { S0:true, S1:false, S2:true, S3:false, EXACT:true } }, // √25 = 5
            { inputs: { X0:false, X1:false, X2:true, X3:false, X4:false, X5:true, X6:false, X7:false }, outputs: { S0:false, S1:true, S2:true, S3:false, EXACT:true } }, // √36 = 6
            { inputs: { X0:true, X1:false, X2:false, X3:false, X4:true, X5:true, X6:false, X7:false }, outputs: { S0:true, S1:true, S2:true, S3:false, EXACT:true } }, // √49 = 7
            { inputs: { X0:false, X1:false, X2:false, X3:false, X4:false, X5:false, X6:true, X7:false }, outputs: { S0:false, S1:false, S2:false, S3:true, EXACT:true } }, // √64 = 8
            { inputs: { X0:true, X1:false, X2:false, X3:false, X4:true, X5:false, X6:true, X7:false }, outputs: { S0:true, S1:false, S2:false, S3:true, EXACT:true } }, // √81 = 9
            { inputs: { X0:false, X1:false, X2:true, X3:false, X4:true, X5:false, X6:true, X7:false }, outputs: { S0:false, S1:true, S2:false, S3:true, EXACT:true } }, // √100 = 10
            { inputs: { X0:true, X1:false, X2:false, X3:false, X4:true, X5:true, X6:true, X7:false }, outputs: { S0:true, S1:true, S2:false, S3:true, EXACT:true } }, // √121 = 11
            { inputs: { X0:false, X1:false, X2:false, X3:true, X4:false, X5:false, X6:false, X7:true }, outputs: { S0:false, S1:false, S2:true, S3:true, EXACT:true } }, // √144 = 12
            { inputs: { X0:true, X1:false, X2:false, X3:true, X4:true, X5:false, X6:false, X7:true }, outputs: { S0:true, S1:false, S2:true, S3:true, EXACT:true } }, // √169 = 13
            { inputs: { X0:false, X1:true, X2:false, X3:false, X4:false, X5:true, X6:false, X7:true }, outputs: { S0:false, S1:true, S2:true, S3:true, EXACT:true } }, // √196 = 14
            { inputs: { X0:true, X1:false, X2:false, X3:false, X4:true, X5:true, X6:false, X7:true }, outputs: { S0:true, S1:true, S2:true, S3:true, EXACT:true } }, // √225 = 15
            // Non-perfect squares (floor)
            { inputs: { X0:false, X1:true, X2:false, X3:false, X4:false, X5:false, X6:false, X7:false }, outputs: { S0:true, S1:false, S2:false, S3:false, EXACT:false } }, // √2 = 1 (not exact)
            { inputs: { X0:true, X1:true, X2:false, X3:false, X4:false, X5:false, X6:false, X7:false }, outputs: { S0:true, S1:false, S2:false, S3:false, EXACT:false } }, // √3 = 1 (not exact)
            { inputs: { X0:true, X1:false, X2:true, X3:false, X4:false, X5:false, X6:false, X7:false }, outputs: { S0:false, S1:true, S2:false, S3:false, EXACT:false } }, // √5 = 2 (not exact)
            { inputs: { X0:false, X1:true, X2:false, X3:false, X4:false, X5:false, X6:false, X7:true }, outputs: { S0:true, S1:true, S2:true, S3:true, EXACT:false } } // √130 = 11 (not exact, 11²=121 < 130 < 144=12²)
        ]
    },
    {
        id: 'bcd_adder',
        name: 'BCD Digit Adder',
        description: 'Add two BCD digits (0-9) with carry in/out. Applies BCD correction when sum exceeds 9.',
        tier: 14,
        value: 1.30, // 130% multiplier
        inputs: ['A0', 'A1', 'A2', 'A3', 'B0', 'B1', 'B2', 'B3', 'Cin'],
        outputs: ['S0', 'S1', 'S2', 'S3', 'Cout'],
        productionTier: 'packager',
        productionDescription: 'Decimal arithmetic - BCD encoding mastery',
        researchBonus: { tree: 'research', multiplier: 14.0 },
        blackMarketBonus: 4.0,
        prestigeRevenueBonus: 12.0,
        productionCountBonus: 8.0,
        saturationResistance: 0.85,
        dimensionalResonance: 3.0,
        transcendent: true,
        gateBudget: { gold: 80, silver: 110, bronze: 140 },
        requiresVoidUpgrade: 'transcendent_firmware',
        requires: ['adder_4bit'],
        testCases: [
            // No carry out
            { inputs: { A0:false, A1:false, A2:false, A3:false, B0:false, B1:false, B2:false, B3:false, Cin:false }, outputs: { S0:false, S1:false, S2:false, S3:false, Cout:false } }, // 0+0+0 = 0
            { inputs: { A0:true, A1:false, A2:false, A3:false, B0:false, B1:false, B2:false, B3:false, Cin:false }, outputs: { S0:true, S1:false, S2:false, S3:false, Cout:false } }, // 1+0+0 = 1
            { inputs: { A0:false, A1:true, A2:false, A3:false, B0:true, B1:false, B2:false, B3:false, Cin:false }, outputs: { S0:true, S1:true, S2:false, S3:false, Cout:false } }, // 2+1+0 = 3
            { inputs: { A0:false, A1:false, A2:true, A3:false, B0:true, B1:true, B2:false, B3:false, Cin:false }, outputs: { S0:true, S1:true, S2:true, S3:false, Cout:false } }, // 4+3+0 = 7
            { inputs: { A0:true, A1:false, A2:true, A3:false, B0:false, A1:false, B2:true, B3:false, Cin:false }, outputs: { S0:true, S1:false, S2:false, S3:true, Cout:false } }, // 5+4+0 = 9
            // Carry out (BCD correction needed)
            { inputs: { A0:true, A1:false, A2:true, A3:false, B0:true, B1:false, B2:true, B3:false, Cin:false }, outputs: { S0:false, S1:false, S2:false, S3:false, Cout:true } }, // 5+5+0 = 10 → 0 + Cout
            { inputs: { A0:false, A1:true, A2:true, A3:false, B0:false, B1:true, B2:true, B3:false, Cin:false }, outputs: { S0:false, S1:true, S2:false, S3:false, Cout:true } }, // 6+6+0 = 12 → 2 + Cout
            { inputs: { A0:true, A1:true, A2:true, A3:false, B0:true, B1:true, B2:true, B3:false, Cin:false }, outputs: { S0:false, S1:false, S2:true, S3:false, Cout:true } }, // 7+7+0 = 14 → 4 + Cout
            { inputs: { A0:false, A1:false, A2:false, A3:true, B0:false, A1:false, B2:false, B3:true, Cin:false }, outputs: { S0:false, S1:true, S2:true, S3:false, Cout:true } }, // 8+8+0 = 16 → 6 + Cout
            { inputs: { A0:true, A1:false, A2:false, A3:true, B0:true, B1:false, B2:false, B3:true, Cin:false }, outputs: { S0:false, S1:false, S2:false, S3:true, Cout:true } }, // 9+9+0 = 18 → 8 + Cout
            // With carry in
            { inputs: { A0:false, A1:false, A2:false, A3:false, B0:false, B1:false, B2:false, B3:false, Cin:true }, outputs: { S0:true, S1:false, S2:false, S3:false, Cout:false } }, // 0+0+1 = 1
            { inputs: { A0:true, A1:false, A2:false, A3:true, B0:false, B1:false, B2:false, B3:false, Cin:true }, outputs: { S0:false, S1:false, S2:false, S3:false, Cout:true } }, // 9+0+1 = 10 → 0 + Cout
            { inputs: { A0:false, A1:false, A2:true, A3:false, B0:true, A1:false, B2:true, B3:false, Cin:true }, outputs: { S0:false, S1:false, S2:false, S3:false, Cout:true } }, // 4+5+1 = 10 → 0 + Cout
            { inputs: { A0:true, A1:false, A2:false, A3:true, B0:true, B1:false, B2:false, B3:true, Cin:true }, outputs: { S0:true, S1:false, S2:false, S3:true, Cout:true } } // 9+9+1 = 19 → 9 + Cout
        ]
    },
    {
        id: 'fp_sign_magnitude_mult',
        name: 'Sign-Magnitude Multiplier',
        description: 'Floating point sign-magnitude multiplication. Two signed 4-bit magnitudes produce 8-bit signed result.',
        tier: 14,
        value: 1.50, // 150% multiplier
        inputs: ['SA', 'A0', 'A1', 'A2', 'A3', 'SB', 'B0', 'B1', 'B2', 'B3'],
        outputs: ['SP', 'P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
        productionTier: 'packager',
        productionDescription: 'Floating point arithmetic - The pinnacle of chip design',
        researchBonus: { tree: 'power', multiplier: 16.0 },
        blackMarketBonus: 5.0,
        prestigeRevenueBonus: 15.0,
        productionCountBonus: 10.0,
        saturationResistance: 0.90,
        dimensionalResonance: 4.0,
        transcendent: true,
        gateBudget: { gold: 180, silver: 240, bronze: 300 },
        requiresVoidUpgrade: 'transcendent_firmware',
        requires: ['multiplier_4x4'],
        testCases: [
            // Positive × Positive
            { inputs: { SA:false, A0:false, A1:false, A2:false, A3:false, SB:false, B0:false, B1:false, B2:false, B3:false }, outputs: { SP:false, P0:false, P1:false, P2:false, P3:false, P4:false, P5:false, P6:false, P7:false } }, // +0 × +0 = +0
            { inputs: { SA:false, A0:true, A1:false, A2:false, A3:false, SB:false, B0:true, B1:false, B2:false, B3:false }, outputs: { SP:false, P0:true, P1:false, P2:false, P3:false, P4:false, P5:false, P6:false, P7:false } }, // +1 × +1 = +1
            { inputs: { SA:false, A0:false, A1:true, A2:false, A3:false, SB:false, B0:true, B1:true, B2:false, B3:false }, outputs: { SP:false, P0:false, P1:true, P2:true, P3:false, P4:false, P5:false, P6:false, P7:false } }, // +2 × +3 = +6
            { inputs: { SA:false, A0:true, A1:true, A2:true, A3:false, SB:false, B0:true, B1:true, B2:true, B3:false }, outputs: { SP:false, P0:true, P1:false, P2:false, P3:false, P4:true, P5:true, P6:false, P7:false } }, // +7 × +7 = +49
            // Negative × Positive
            { inputs: { SA:true, A0:true, A1:false, A2:false, A3:false, SB:false, B0:true, B1:false, B2:false, B3:false }, outputs: { SP:true, P0:true, P1:false, P2:false, P3:false, P4:false, P5:false, P6:false, P7:false } }, // -1 × +1 = -1
            { inputs: { SA:true, A0:false, A1:true, A2:false, A3:false, SB:false, B0:true, B1:true, B2:false, B3:false }, outputs: { SP:true, P0:false, P1:true, P2:true, P3:false, P4:false, P5:false, P6:false, P7:false } }, // -2 × +3 = -6
            { inputs: { SA:true, A0:true, A1:false, A2:true, A3:false, SB:false, B0:true, B1:false, B2:true, B3:false }, outputs: { SP:true, P0:true, P1:false, P2:false, P3:true, P4:true, P5:false, P6:false, P7:false } }, // -5 × +5 = -25
            // Positive × Negative
            { inputs: { SA:false, A0:true, A1:false, A2:false, A3:false, SB:true, B0:true, B1:false, B2:false, B3:false }, outputs: { SP:true, P0:true, P1:false, P2:false, P3:false, P4:false, P5:false, P6:false, P7:false } }, // +1 × -1 = -1
            { inputs: { SA:false, A0:false, A1:false, A2:true, A3:false, SB:true, B0:true, B1:true, B2:false, B3:false }, outputs: { SP:true, P0:false, P1:false, P2:true, P3:true, P4:false, P5:false, P6:false, P7:false } }, // +4 × -3 = -12
            // Negative × Negative
            { inputs: { SA:true, A0:true, A1:false, A2:false, A3:false, SB:true, B0:true, B1:false, B2:false, B3:false }, outputs: { SP:false, P0:true, P1:false, P2:false, P3:false, P4:false, P5:false, P6:false, P7:false } }, // -1 × -1 = +1
            { inputs: { SA:true, A0:false, A1:true, A2:false, A3:false, SB:true, B0:true, B1:true, B2:false, B3:false }, outputs: { SP:false, P0:false, P1:true, P2:true, P3:false, P4:false, P5:false, P6:false, P7:false } }, // -2 × -3 = +6
            { inputs: { SA:true, A0:true, A1:true, A2:true, A3:true, SB:true, B0:true, B1:true, B2:true, B3:true }, outputs: { SP:false, P0:true, P1:false, P2:false, P3:false, P4:false, P5:false, P6:true, P7:true } } // -15 × -15 = +225
        ]
    }
];

// Helper function to get requirements by tier
window.getChipRequirementsByTier = function(tier) {
    return window.ChipRequirements.filter(r => r.tier === tier);
};

// Helper function to get all chip tiers
window.getChipTiers = function() {
    const tiers = [...new Set(window.ChipRequirements.map(r => r.tier))];
    return tiers.sort((a, b) => a - b);
};

// Helper function to get requirement by ID
window.getChipRequirementById = function(id) {
    return window.ChipRequirements.find(r => r.id === id);
};

// Helper to get production tier info
window.getProductionTierInfo = function(tierKey) {
    return window.ChipProductionTiers[tierKey] || null;
};

// Check if a firmware tier is unlocked based on chip production
window.isFirmwareTierUnlocked = function(firmwareTier) {
    const requirement = window.FIRMWARE_TIER_REQUIREMENTS[firmwareTier];
    if (!requirement) return true; // No tier requirement (e.g. void firmware uses void upgrade gating)

    const tierProduced = window.game?.gameState?.persistentStats?.tierProduced;
    if (!tierProduced) return false;

    const produced = tierProduced[requirement.chipTier] || 0;
    return produced >= requirement.count;
};

// Get firmware tier unlock progress
window.getFirmwareTierProgress = function(firmwareTier) {
    const requirement = window.FIRMWARE_TIER_REQUIREMENTS[firmwareTier];
    if (!requirement) return { unlocked: false, current: 0, required: 0, chipTier: '' };

    const tierProduced = window.game?.gameState?.persistentStats?.tierProduced;
    const produced = tierProduced?.[requirement.chipTier] || 0;

    return {
        unlocked: produced >= requirement.count,
        current: produced,
        required: requirement.count,
        chipTier: requirement.displayName
    };
};
