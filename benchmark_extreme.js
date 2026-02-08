import fs from 'fs';
import { performance } from 'perf_hooks';

// --- CORE LOGIC TO BENCHMARK ---
const OMEGA_MAP = {
    "function": "Ωi", "async": "Ωj", "await": "Ωk", "const": "Ωf", "let": "Ωg",
    "return": "Ω2", "if": "Ω0", "else": "Ω1", "class": "Ωd", "import": "Ωl",
    "console.log": "ΩK", "getElementById": "ΩD", "addEventListener": "ΩC"
};

function anchorFlowRefactor(code) {
    const lines = code.split('\n');
    const duplicateBlocks = new Map();
    // Scan for 3-line blocks
    for (let i = 0; i < lines.length - 2; i++) {
        const block = lines.slice(i, i + 3).join('\n');
        if (block.trim().length > 30) {
            duplicateBlocks.set(block, (duplicateBlocks.get(block) || 0) + 1);
        }
    }
    let counter = 0;
    const replacements = new Map();
    const extracted = [];
    for (const [block, count] of duplicateBlocks.entries()) {
        if (count > 2) { // Extreme threshold: only extract if repeated > 2 times
            const name = `Ω_ext_${counter++}`;
            extracted.push(`function ${name}() {\n${block}\n}\n`);
            replacements.set(block, name);
        }
    }
    let finalCode = code;
    for (const [block, name] of replacements.entries()) {
        finalCode = finalCode.split(block).join(`${name}();`);
    }
    return { refactored: finalCode, extractedCount: extracted.length, header: extracted.join('\n') };
}

function omegaSymbolize(code) {
    let result = code;
    for (const [key, val] of Object.entries(OMEGA_MAP)) {
        const reg = new RegExp("\\b" + key.replace(".", "\\.") + "\\b", "g");
        result = result.replace(reg, val);
    }
    return result;
}

// --- EXTREME DATA GENERATOR ---
function generateExtremeCode(iterations) {
    let code = "async function extremeTest() {\n";
    const pattern = `
    const data = await fetch('http://api.example.com/data');
    const json = await data.json();
    if (json.success) {
        console.log('Success optimization triggered');
        return json.payload;
    } else {
        console.log('Failure state detected');
        return null;
    }
    `;
    for (let i = 0; i < iterations; i++) {
        code += `// Block ${i}\n` + pattern;
    }
    code += "\n}";
    return code;
}

// --- BENCHMARK RUN ---
console.log("🔥 ANTIGRAVITY Ω-PROTO EXTREME BENCHMARK 🔥");
console.log("------------------------------------------");

const ITERATIONS = 500; // Create 500 repetitive logic blocks
const rawCode = generateExtremeCode(ITERATIONS);
const rawSize = Buffer.byteLength(rawCode, 'utf8');

console.log(`[TARGET] Artificial Logic Volume: ${rawSize.toLocaleString()} bytes (~${Math.round(rawSize / 4).toLocaleString()} tokens)`);

const t0 = performance.now();

// 1. Noise Removal
let cleanCode = rawCode.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1').replace(/^\s*[\r\n]/gm, '');

// 2. Anchor Flow (Hierarchical Deduplication)
const { refactored, extractedCount, header } = anchorFlowRefactor(cleanCode);

// 3. Omega Symbolization
const finalMachineCode = omegaSymbolize(header + "\n" + refactored);

const t1 = performance.now();
const finalSize = Buffer.byteLength(finalMachineCode, 'utf8');
const reduction = ((1 - (finalSize / rawSize)) * 100).toFixed(2);

console.log(`[RESULT] Compressed Size: ${finalSize.toLocaleString()} bytes`);
console.log(`[RESULT] Extracted Anchors: ${extractedCount} unique patterns`);
console.log(`[RESULT] Processing Time: ${(t1 - t0).toFixed(2)} ms`);
console.log(`[RESULT] Efficiency Gain: ${reduction}%`);

console.log("\n--- VERDICT ---");
if (reduction > 80) {
    console.log("💎 DIAMOND TIER: Massive logic duplication collapsed successfully.");
} else if (reduction > 50) {
    console.log("🥇 GOLD TIER: Significant token savings achieved.");
} else {
    console.log("⚠️ NORMAL TIER: Standard optimization applied.");
}

if (finalMachineCode.includes('Ω_ext_0')) {
    console.log("✅ ANCHOR FLOW VERIFIED: Recurrent patterns extracted into symbols.");
}
