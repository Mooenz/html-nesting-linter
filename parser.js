"use strict";
// ============================================================
// parser.ts
// Analizador de tags HTML para detectar anidamiento inválido
// Soporta: HTML, JSX/TSX (React), Vue, Svelte, Angular
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMarkupRegions = extractMarkupRegions;
exports.tokenizeTags = tokenizeTags;
exports.findNestingErrors = findNestingErrors;
exports.analyzeDocument = analyzeDocument;
const nestingRules_1 = require("./nestingRules");
/** Tags que no tienen cierre (void elements) */
const VOID_ELEMENTS = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr"
]);
/** Tags que deben ser ignorados al parsear (scripts, estilos, etc.) */
const SKIP_CONTENT_TAGS = new Set(["script", "style", "template"]);
/**
 * Extrae la región de markup HTML de un archivo según su tipo.
 * Para JSX/TSX extrae el bloque return(). Para Vue/Svelte extrae <template>.
 */
function extractMarkupRegions(content, languageId) {
    switch (languageId) {
        case "html":
            return [{ text: content, baseOffset: 0 }];
        case "javascriptreact":
        case "typescriptreact":
            return extractJsxRegions(content);
        case "vue":
        case "svelte":
            return extractTemplateRegion(content);
        case "html-angular":
            return [{ text: content, baseOffset: 0 }];
        default:
            return [{ text: content, baseOffset: 0 }];
    }
}
function extractJsxRegions(content) {
    const regions = [];
    // Busca bloques return( <JSX> ) — captura contenido entre paréntesis del return
    const returnRegex = /\breturn\s*\(\s*/g;
    let match;
    while ((match = returnRegex.exec(content)) !== null) {
        const start = match.index + match[0].length;
        // Busca el primer < a partir de ahí
        const ltIdx = content.indexOf("<", start);
        if (ltIdx === -1)
            continue;
        // Encuentra el cierre del paréntesis del return (sin balanceo completo, solo aproximado)
        let depth = 1;
        let i = start;
        while (i < content.length && depth > 0) {
            if (content[i] === "(")
                depth++;
            else if (content[i] === ")")
                depth--;
            i++;
        }
        const end = i - 1;
        regions.push({ text: content.slice(ltIdx, end), baseOffset: ltIdx });
    }
    // Si no encontró returns, analiza todo el contenido igual
    if (regions.length === 0) {
        regions.push({ text: content, baseOffset: 0 });
    }
    return regions;
}
function extractTemplateRegion(content) {
    const match = /<template[^>]*>([\s\S]*?)<\/template>/i.exec(content);
    if (match) {
        const offset = match.index + match[0].indexOf(">") + 1;
        return [{ text: match[1], baseOffset: offset }];
    }
    return [{ text: content, baseOffset: 0 }];
}
/**
 * Tokeniza las etiquetas HTML en el texto dado.
 */
function tokenizeTags(text) {
    const tokens = [];
    // Regex que captura tags HTML incluyendo JSX (con mayúsculas para componentes)
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\s*(?:[^>]*)?(\/?)>/g;
    let match;
    let skipUntil = null;
    while ((match = tagRegex.exec(text)) !== null) {
        const full = match[0];
        const name = match[1].toLowerCase();
        const selfClose = match[2] === "/" || full.endsWith("/>");
        const isClose = full.startsWith("</");
        // Skip script/style content
        if (skipUntil) {
            if (isClose && name === skipUntil) {
                skipUntil = null;
            }
            continue;
        }
        if (!isClose && SKIP_CONTENT_TAGS.has(name)) {
            skipUntil = name;
            continue;
        }
        let type;
        if (isClose) {
            type = "close";
        }
        else if (selfClose || VOID_ELEMENTS.has(name)) {
            type = "self-closing";
        }
        else {
            type = "open";
        }
        tokens.push({
            type,
            name,
            offset: match.index,
            length: full.length
        });
    }
    return tokens;
}
/**
 * Analiza los tokens y retorna los errores de anidamiento encontrados.
 */
function findNestingErrors(tokens) {
    const errors = [];
    const stack = [];
    for (const token of tokens) {
        if (token.type === "open") {
            // Verifica contra el padre actual en la pila
            if (stack.length > 0) {
                const parent = stack[stack.length - 1].name;
                const key = `${parent}::${token.name}`;
                const rule = nestingRules_1.RULES_MAP.get(key);
                if (rule) {
                    errors.push({
                        parent,
                        child: token.name,
                        offset: token.offset,
                        length: token.length,
                        rule
                    });
                }
                // También verifica anidamiento en toda la pila (para detectar descendientes)
                // Solo verificamos padre inmediato para evitar falsos positivos
            }
            stack.push({ name: token.name, offset: token.offset });
        }
        else if (token.type === "close") {
            // Pop del stack — maneja desequilibrios
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].name === token.name) {
                    stack.splice(i);
                    break;
                }
            }
        }
        // self-closing: no modifica el stack
    }
    return errors;
}
/**
 * Función principal: analiza un documento completo.
 */
function analyzeDocument(content, languageId) {
    const allErrors = [];
    const regions = extractMarkupRegions(content, languageId);
    for (const region of regions) {
        const tokens = tokenizeTags(region.text);
        const errors = findNestingErrors(tokens);
        for (const err of errors) {
            allErrors.push({
                ...err,
                absoluteOffset: err.offset + region.baseOffset
            });
        }
    }
    return allErrors;
}
//# sourceMappingURL=parser.js.map