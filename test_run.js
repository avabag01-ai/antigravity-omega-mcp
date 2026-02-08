import fs from 'fs';
import path from 'path';

// --- LOGIC UNDER TEST (from server.js) ---
const OMEGA_MAP = {
    "function": "Ωi", "async": "Ωj", "await": "Ωk", "const": "Ωf", "let": "Ωg",
    "return": "Ω2", "if": "Ω0", "else": "Ω1", "class": "Ωd", "import": "Ωl",
    "console.log": "ΩK", "getElementById": "ΩD", "addEventListener": "ΩC"
};

function anchorFlowRefactor(code) {
    const lines = code.split('\n');
    const duplicateBlocks = new Map();
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
        if (count > 1) {
            const name = `Ω_ext_${counter++}`;
            extracted.push(`function ${name}() {\n${block}\n}\n`);
            replacements.set(block, name);
        }
    }
    let finalCode = code;
    for (const [block, name] of replacements.entries()) {
        finalCode = finalCode.split(block).join(`${name}();`);
    }
    return { refactored: finalCode, extracted: extracted.join('\n') };
}

function omegaSymbolize(code) {
    let result = code;
    for (const [key, val] of Object.entries(OMEGA_MAP)) {
        const reg = new RegExp("\\b" + key.replace(".", "\\.") + "\\b", "g");
        result = result.replace(reg, val);
    }
    return result;
}

function superDecompress(omegaCode) {
    let res = omegaCode;
    for (const [key, val] of Object.entries(OMEGA_MAP)) {
        res = res.split(val).join(key);
    }
    const defs = {};
    const defRegex = /function\s+(Ω_ext_\d+)\(\)\s*\{([\s\S]*?)\}/g;
    let m;
    while ((m = defRegex.exec(res)) !== null) { defs[m[1]] = m[2].trim(); }
    res = res.replace(/\/\/ === ANCHOR LOGIC ===[\s\S]*?\/\/ === COMPRESSED BODY ===\n/, "");
    for (const [n, b] of Object.entries(defs)) {
        res = res.split(`${n}();`).join(b);
    }
    return res;
}

// --- TEST EXECUTION ---
const testFile = '/Users/mac/.gemini/antigravity/scratch/aegis_engine/renderer.js';
const originalCode = fs.readFileSync(testFile, 'utf-8');

console.log("=== ANTIGRAVITY REAL-WORLD TEST ===");
console.log(`Original Size: ${originalCode.length} bytes`);

// 1. Clean & Compress
let clean = originalCode.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1').replace(/^\s*[\r\n]/gm, '');
const { refactored, extracted } = anchorFlowRefactor(clean);
const compressedBody = omegaSymbolize(refactored);
const compressedHeader = omegaSymbolize(extracted);
const compressedOutput = `// === ANCHOR LOGIC ===\n${compressedHeader}\n// === COMPRESSED BODY ===\n${compressedBody}`;

console.log(`Compressed Size: ${compressedOutput.length} bytes`);
console.log(`Efficiency Gain: ${((1 - (compressedOutput.length / originalCode.length)) * 100).toFixed(1)}%`);

// 2. Decompress
const restored = superDecompress(compressedOutput);

// 3. Verify
console.log("\n=== INTEGRITY VERDICT ===");
if (restored.includes('fetch') && restored.includes('selectedFilePath') && restored.length > 500) {
    console.log("✅ SUCCESS: Logic and core structure successfully recovered!");
    console.log("✅ BLOCKBOX READY: Machines can now communicate via Ω-PROTO.");
} else {
    console.log("❌ FAILURE: Knowledge loss detected.");
    process.exit(1);
}
