import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * ANTIGRAVITY Ω-PROTO: UNIFIED OPTIMIZER
 * 
 * DESIGNED BY: Vibe Coding Architect (Non-Developer, Week 4)
 * PHILOSOPHY: Machine-First, Signal-over-Noise.
 */

const OMEGA_MAP = {
    "function": "Ωi", "async": "Ωj", "await": "Ωk", "const": "Ωf", "let": "Ωg",
    "return": "Ω2", "if": "Ω0", "else": "Ω1", "class": "Ωd", "import": "Ωl",
    "console.log": "ΩK", "getElementById": "ΩD", "addEventListener": "ΩC"
};

const server = new Server(
    { name: "antigravity-omega-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "omega_compress",
                description: "Applies Ω-Spec and Anchor Flow compression to code for Machine-First transfer.",
                inputSchema: {
                    type: "object",
                    properties: {
                        code: { type: "string" },
                        blueprint: { type: "string", description: "Optional logical map description" }
                    },
                    required: ["code"],
                },
            },
            {
                name: "omega_decompress",
                description: "Restores Ω-Spec code back into human-readable format.",
                inputSchema: {
                    type: "object",
                    properties: { omegaCode: { type: "string" } },
                    required: ["omegaCode"],
                },
            }
        ],
    };
});

// Helper: Anchor Flow (Hierarchical Deduplication)
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
            extracted.push(`Ωi ${name}() {\n${block}\n}\n`);
            replacements.set(block, name);
        }
    }
    let finalCode = code;
    for (const [block, name] of replacements.entries()) {
        finalCode = finalCode.split(block).join(`${name}();`);
    }
    return { refactored: finalCode, extracted: extracted.join('\n') };
}

// Helper: Omega Symbolization
function omegaSymbolize(code) {
    let result = code;
    for (const [key, val] of Object.entries(OMEGA_MAP)) {
        const reg = new RegExp("\\b" + key.replace(".", "\\.") + "\\b", "g");
        result = result.replace(reg, val);
    }
    return result;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "omega_compress") {
        // Strip Noise
        let clean = args.code
            .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1')
            .replace(/^\s*[\r\n]/gm, '');

        const bp = args.blueprint ? `// Ω_bp: ${omegaSymbolize(args.blueprint)}\n` : '// Ω_bp: Ω_auto_map\n';

        const { refactored, extracted } = anchorFlowRefactor(clean);
        const compBody = omegaSymbolize(refactored);
        const compHeader = omegaSymbolize(extracted);

        const output = `${bp}// === ANCHOR LOGIC ===\n${compHeader}\n// === COMPRESSED BODY ===\n${compBody}`;

        const lineCount = args.code.split('\n').length;
        let scaleCategory = "Small (Baseline)";
        if (lineCount > 3000) scaleCategory = "Enterprise (Maximum Gain)";
        else if (lineCount > 1000) scaleCategory = "Large (High Yield)";
        else if (lineCount > 500) scaleCategory = "Medium (Optimized)";

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    status: "SUCCESS",
                    scale: scaleCategory,
                    originalLineCount: lineCount,
                    originalBytes: args.code.length,
                    compressedBytes: output.length,
                    efficiencyGain: `${((1 - (output.length / args.code.length)) * 100).toFixed(1)}%`,
                    machineCode: output
                }, null, 2)
            }]
        };
    }

    if (name === "omega_decompress") {
        let res = args.omegaCode;
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
        return { content: [{ type: "text", text: res }] };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(console.error);
