"use strict";
// ============================================================
// extension.ts
// Punto de entrada de la extensión HTML Nesting Validator
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const parser_1 = require("./parser");
const DIAGNOSTIC_SOURCE = "HTML Nesting Validator";
const SUPPORTED_LANGUAGES = [
    "html",
    "javascriptreact",
    "typescriptreact",
    "vue",
    "svelte",
    "html-angular"
];
let diagnosticCollection;
function activate(context) {
    console.log("[HTML Nesting Validator] Activando extensión...");
    diagnosticCollection = vscode.languages.createDiagnosticCollection("htmlNesting");
    context.subscriptions.push(diagnosticCollection);
    // Analiza el documento activo al abrir
    if (vscode.window.activeTextEditor) {
        validateDocument(vscode.window.activeTextEditor.document);
    }
    // Analiza al abrir un documento
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument((doc) => {
        if (isSupported(doc)) {
            validateDocument(doc);
        }
    }));
    // Analiza al cambiar el contenido
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
        if (isSupported(event.document)) {
            // Debounce de 300ms para no saturar mientras se escribe
            debounce(() => validateDocument(event.document), 300);
        }
    }));
    // Limpia al cerrar
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument((doc) => {
        diagnosticCollection.delete(doc.uri);
    }));
    // Comando: abrir panel de información
    context.subscriptions.push(vscode.commands.registerCommand("htmlNestingLinter.showInfo", showInfoPanel));
    // Valida todos los docs abiertos al activar
    vscode.workspace.textDocuments.forEach((doc) => {
        if (isSupported(doc)) {
            validateDocument(doc);
        }
    });
    console.log("[HTML Nesting Validator] ✓ Extensión activada.");
}
function deactivate() {
    diagnosticCollection?.clear();
    diagnosticCollection?.dispose();
}
// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function isSupported(doc) {
    if (!vscode.workspace.getConfiguration("htmlNestingLinter").get("enable", true)) {
        return false;
    }
    return SUPPORTED_LANGUAGES.includes(doc.languageId);
}
let debounceTimer;
function debounce(fn, ms) {
    if (debounceTimer)
        clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, ms);
}
function getSeverity() {
    const cfg = vscode.workspace.getConfiguration("htmlNestingLinter").get("severity", "error");
    switch (cfg) {
        case "warning": return vscode.DiagnosticSeverity.Warning;
        case "info": return vscode.DiagnosticSeverity.Information;
        default: return vscode.DiagnosticSeverity.Error;
    }
}
// -------------------------------------------------------
// Validación principal
// -------------------------------------------------------
function validateDocument(doc) {
    const content = doc.getText();
    const errors = (0, parser_1.analyzeDocument)(content, doc.languageId);
    const diagnostics = [];
    const severity = getSeverity();
    for (const err of errors) {
        const pos = doc.positionAt(err.absoluteOffset);
        const endPos = doc.positionAt(err.absoluteOffset + err.length);
        const range = new vscode.Range(pos, endPos);
        // Mensaje principal
        const message = buildMessage(err.parent, err.child, err.rule.reason);
        const diagnostic = new vscode.Diagnostic(range, message, severity);
        diagnostic.source = DIAGNOSTIC_SOURCE;
        diagnostic.code = {
            value: `${err.parent}-no-${err.child}`,
            target: vscode.Uri.parse(err.rule.references[0]?.url ?? "https://developer.mozilla.org/es/docs/Web/HTML")
        };
        // Información adicional en relatedInformation
        diagnostic.relatedInformation = buildRelatedInfo(doc, range, err);
        diagnostics.push(diagnostic);
    }
    diagnosticCollection.set(doc.uri, diagnostics);
}
function buildMessage(parent, child, reason) {
    return `❌ <${child}> no puede estar dentro de <${parent}>. ${reason}`;
}
function buildRelatedInfo(doc, range, err) {
    const info = [];
    // Alternativas
    if (err.rule.alternatives.length > 0) {
        const altText = "💡 Alternativas: " + err.rule.alternatives.join(" | ");
        info.push(new vscode.DiagnosticRelatedInformation(new vscode.Location(doc.uri, range), altText));
    }
    // Referencias
    for (const ref of err.rule.references) {
        info.push(new vscode.DiagnosticRelatedInformation(new vscode.Location(doc.uri, range), `📖 ${ref.label}: ${ref.url}`));
    }
    return info;
}
// -------------------------------------------------------
// Panel de información
// -------------------------------------------------------
function showInfoPanel() {
    const panel = vscode.window.createWebviewPanel("htmlNestingInfo", "HTML Nesting Validator — Guía", vscode.ViewColumn.Beside, { enableScripts: false });
    panel.webview.html = getInfoPanelHtml();
}
function getInfoPanelHtml() {
    return /* html */ `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>HTML Nesting Validator</title>
<style>
  :root {
    --bg: #1e1e2e;
    --surface: #2a2a3d;
    --border: #44475a;
    --accent: #bd93f9;
    --green: #50fa7b;
    --red: #ff5555;
    --yellow: #f1fa8c;
    --cyan: #8be9fd;
    --text: #f8f8f2;
    --muted: #6272a4;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    padding: 2rem;
    line-height: 1.6;
  }
  h1 { color: var(--accent); font-size: 1.8rem; margin-bottom: 0.25rem; }
  h2 { color: var(--cyan); font-size: 1.2rem; margin: 1.5rem 0 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem; }
  h3 { color: var(--yellow); font-size: 1rem; margin: 1rem 0 0.25rem; }
  p { margin: 0.5rem 0; color: #cdd6f4; }
  .subtitle { color: var(--muted); margin-bottom: 2rem; }
  code {
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.1em 0.4em;
    font-size: 0.9em;
    color: var(--green);
  }
  .rule-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--red);
    border-radius: 6px;
    padding: 0.75rem 1rem;
    margin: 0.5rem 0;
  }
  .rule-card .bad { color: var(--red); font-weight: 600; }
  .rule-card .reason { color: var(--muted); font-size: 0.9em; margin-top: 0.25rem; }
  .rule-card .alt { color: var(--green); font-size: 0.9em; margin-top: 0.25rem; }
  .link-list a {
    display: inline-block;
    color: var(--cyan);
    text-decoration: none;
    margin: 0.2rem 0;
    font-size: 0.9em;
  }
  .link-list a:hover { text-decoration: underline; }
  .tip {
    background: #1a3a2a;
    border-left: 3px solid var(--green);
    border-radius: 4px;
    padding: 0.5rem 1rem;
    margin: 0.75rem 0;
    font-size: 0.9em;
  }
  .badge {
    display: inline-block;
    background: var(--accent);
    color: #1e1e2e;
    font-size: 0.75em;
    font-weight: 700;
    padding: 0.1em 0.5em;
    border-radius: 20px;
    margin-right: 0.3em;
  }
  table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; font-size: 0.9em; }
  th { background: var(--border); color: var(--accent); padding: 0.4rem 0.7rem; text-align: left; }
  td { padding: 0.4rem 0.7rem; border-bottom: 1px solid var(--border); }
  tr:last-child td { border-bottom: none; }
</style>
</head>
<body>

<h1>🔍 HTML Nesting Validator</h1>
<p class="subtitle">Guía de referencia sobre anidamiento inválido de etiquetas HTML</p>

<h2>¿Por qué importa el anidamiento correcto?</h2>
<p>HTML tiene reglas estrictas sobre qué elementos pueden contener a otros. Cuando se violan estas reglas, los navegadores intentan "corregir" automáticamente el markup, lo que puede causar comportamientos inesperados en el layout, problemas de accesibilidad y fallos en lectores de pantalla.</p>

<h2>Frameworks soportados</h2>
<p>
  <span class="badge">HTML</span>
  <span class="badge">React JSX/TSX</span>
  <span class="badge">Vue</span>
  <span class="badge">Svelte</span>
  <span class="badge">Angular</span>
</p>

<h2>Errores más comunes</h2>

<h3>❌ Elementos de bloque dentro de &lt;p&gt;</h3>
<div class="rule-card">
  <div class="bad">Inválido: &lt;p&gt;&lt;div&gt;...&lt;/div&gt;&lt;/p&gt;</div>
  <div class="reason">El navegador cierra implícitamente el &lt;p&gt; al encontrar un elemento de bloque.</div>
  <div class="alt">✅ Usa &lt;div&gt; como contenedor, o mueve el bloque fuera del &lt;p&gt;.</div>
</div>

<h3>❌ &lt;a&gt; dentro de &lt;a&gt;</h3>
<div class="rule-card">
  <div class="bad">Inválido: &lt;a&gt;&lt;a href="..."&gt;...&lt;/a&gt;&lt;/a&gt;</div>
  <div class="reason">Produce comportamiento undefined. Los navegadores lo manejan de formas distintas.</div>
  <div class="alt">✅ Usa JavaScript o CSS para lograr el efecto deseado con elementos separados.</div>
</div>

<h3>❌ &lt;button&gt; dentro de &lt;a&gt;</h3>
<div class="rule-card">
  <div class="bad">Inválido: &lt;a href="#"&gt;&lt;button&gt;Click&lt;/button&gt;&lt;/a&gt;</div>
  <div class="reason">Dos elementos interactivos anidados crean problemas de accesibilidad y comportamiento de teclado.</div>
  <div class="alt">✅ Usa solo &lt;a class="btn"&gt; o solo &lt;button&gt; con onclick para navegación.</div>
</div>

<h3>❌ Hijos directos inválidos en &lt;ul&gt;/&lt;ol&gt;</h3>
<div class="rule-card">
  <div class="bad">Inválido: &lt;ul&gt;&lt;div&gt;...&lt;/div&gt;&lt;/ul&gt;</div>
  <div class="reason">&lt;ul&gt; y &lt;ol&gt; solo pueden tener &lt;li&gt; como hijos directos (y opcionalmente &lt;script&gt;/&lt;template&gt;).</div>
  <div class="alt">✅ Usa &lt;li&gt; para cada item: &lt;ul&gt;&lt;li&gt;&lt;div&gt;...&lt;/div&gt;&lt;/li&gt;&lt;/ul&gt;</div>
</div>

<h3>❌ Estructura inválida en &lt;table&gt;</h3>
<div class="rule-card">
  <div class="bad">Inválido: &lt;tr&gt;&lt;div&gt;...&lt;/div&gt;&lt;/tr&gt;</div>
  <div class="reason">Los hijos de &lt;tr&gt; deben ser &lt;td&gt; o &lt;th&gt;. Los hijos de &lt;table&gt; deben ser &lt;thead&gt;, &lt;tbody&gt;, &lt;tfoot&gt;, etc.</div>
  <div class="alt">✅ Coloca el &lt;div&gt; dentro de &lt;td&gt;.</div>
</div>

<h3>❌ &lt;form&gt; dentro de &lt;form&gt;</h3>
<div class="rule-card">
  <div class="bad">Inválido: &lt;form&gt;&lt;form&gt;...&lt;/form&gt;&lt;/form&gt;</div>
  <div class="reason">Los formularios no pueden anidarse. El form interno es ignorado por los navegadores.</div>
  <div class="alt">✅ Usa un solo form con &lt;fieldset&gt; para agrupar secciones.</div>
</div>

<h2>Tabla de contenido permitido</h2>
<table>
  <tr><th>Elemento</th><th>Solo puede contener</th></tr>
  <tr><td><code>&lt;p&gt;</code></td><td>Phrasing content (inline: span, a, strong, em, img...)</td></tr>
  <tr><td><code>&lt;ul&gt;</code>, <code>&lt;ol&gt;</code></td><td>Solo <code>&lt;li&gt;</code></td></tr>
  <tr><td><code>&lt;dl&gt;</code></td><td>Solo <code>&lt;dt&gt;</code> y <code>&lt;dd&gt;</code></td></tr>
  <tr><td><code>&lt;table&gt;</code></td><td>caption, colgroup, thead, tbody, tfoot, tr</td></tr>
  <tr><td><code>&lt;tr&gt;</code></td><td>Solo <code>&lt;td&gt;</code> y <code>&lt;th&gt;</code></td></tr>
  <tr><td><code>&lt;select&gt;</code></td><td>Solo <code>&lt;option&gt;</code> y <code>&lt;optgroup&gt;</code></td></tr>
  <tr><td><code>&lt;head&gt;</code></td><td>Metadata: meta, link, script, style, title, base</td></tr>
</table>

<h2>Referencias oficiales</h2>
<div class="link-list">
  <a href="https://html.spec.whatwg.org/multipage/syntax.html">📖 HTML Living Standard — Especificación de Sintaxis</a><br>
  <a href="https://developer.mozilla.org/es/docs/Web/HTML/Element">📖 MDN Web Docs — Referencia de elementos HTML</a><br>
  <a href="https://html.spec.whatwg.org/multipage/dom.html#content-models">📖 Content Models — Modelos de contenido</a><br>
  <a href="https://www.w3.org/WAI/WCAG21/">📖 WCAG 2.1 — Accesibilidad Web</a><br>
  <a href="https://validator.w3.org/">🛠️ W3C Markup Validation Service</a><br>
  <a href="https://validator.nu/">🛠️ Nu Html Checker</a>
</div>

<h2>Configuración</h2>
<div class="tip">
  <p>Ajusta el comportamiento en <code>settings.json</code>:</p>
  <p><code>"htmlNestingLinter.enable": true</code> — Activa/desactiva</p>
  <p><code>"htmlNestingLinter.severity": "error" | "warning" | "info"</code> — Nivel de alerta</p>
</div>

</body>
</html>`;
}
//# sourceMappingURL=extension.js.map