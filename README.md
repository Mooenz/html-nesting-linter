# HTML Nesting Validator — Extensión para VSCode

Detecta en tiempo real cuando etiquetas HTML están anidadas de forma inválida, y muestra sugerencias y referencias a la especificación. Compatible con HTML, React (JSX/TSX), Vue, Svelte y Angular.

Incluye reglas explícitas y reglas generadas automáticamente para cubrir estructuras comunes de HTML (tablas, listas, formularios, elementos interactivos y contenido phrasing).

---

## ⚙️ Configuración (`settings.json`)

```json
{
	"htmlNestingLinter.enable": true,
	"htmlNestingLinter.severity": "error"
}
```

| Opción     | Valores                          | Default   | Descripción                                       |
| ---------- | -------------------------------- | --------- | ------------------------------------------------- |
| `enable`   | `true/false`                     | `true`    | Activa o desactiva la extensión                   |
| `severity` | `"error"`, `"warning"`, `"info"` | `"error"` | Nivel de los diagnósticos en el panel de Problems |

---

## 🎯 Qué detecta

### Errores de `<p>`

`<p>` solo puede contener **phrasing content** (elementos inline). Los elementos de bloque cierran implícitamente el `<p>`:

```html
<!-- ❌ Inválido -->
<p><div>contenido</div></p>
<p><h2>Título</h2></p>
<p><ul><li>item</li></ul></p>

<!-- ✅ Válido -->
<p>Texto con <strong>énfasis</strong> y <a href="#">enlace</a></p>
<div><p>párrafo</p><ul><li>item</li></ul></div>
```

### Elementos interactivos anidados

```html
<!-- ❌ Inválido — <a> dentro de <a> -->
<a href="/home"><a href="/about">Sobre nosotros</a></a>

<!-- ❌ Inválido — <button> dentro de <a> -->
<a href="/buy"><button>Comprar</button></a>

<!-- ✅ Válido -->
<a href="/buy" class="btn">Comprar</a>
<button onclick="window.location='/buy'">Comprar</button>
```

### Estructura de tabla

```html
<!-- ❌ Inválido -->
<table>
	<div>fila</div>
</table>
<tr>
	<div>celda</div>
</tr>

<!-- ✅ Válido -->
<table>
	<tbody>
		<tr>
			<td><div>celda</div></td>
		</tr>
	</tbody>
</table>
```

### Listas (`<ul>`, `<ol>`)

```html
<!-- ❌ Inválido -->
<ul>
	<div>item</div>
</ul>
<ol>
	<p>item</p>
</ol>

<!-- ✅ Válido -->
<ul>
	<li><div>item con contenido</div></li>
</ul>
```

### Formularios anidados

```html
<!-- ❌ Inválido -->
<form>
	<form><!-- formulario secundario --></form>
</form>

<!-- ✅ Válido — usa fieldset para agrupar -->
<form>
	<fieldset>
		<legend>Sección 1</legend>
		...
	</fieldset>
	<fieldset>
		<legend>Sección 2</legend>
		...
	</fieldset>
</form>
```

---

## 🖼️ Soporte por framework

| Archivo                     | Lenguaje VSCode                      | Cómo se analiza                                  |
| --------------------------- | ------------------------------------ | ------------------------------------------------ |
| `.html`                     | `html`                               | Documento completo                               |
| `.jsx`, `.tsx`              | `javascriptreact`, `typescriptreact` | Bloques `return()` con JSX (si no hay, todo)     |
| `.vue`                      | `vue`                                | Bloque `<template>` (si no hay, todo el archivo) |
| `.svelte`                   | `svelte`                             | Todo el archivo (o `<template>` si existe)       |
| `.component.html` (Angular) | `html-angular`                       | Documento completo                               |

**Nota React/JSX**: Los nombres de componentes con mayúscula (`<MyComponent>`) son ignorados, solo se validan etiquetas HTML nativas en minúscula.

---

## ⚠️ Limitaciones actuales

- El parser usa expresiones regulares y stack de etiquetas; no es un parser HTML/JSX completo.
- En React, extrae principalmente bloques `return(...)`; JSX construido dinámicamente puede no analizarse de forma exacta.
- En Vue/Svelte prioriza `<template>` si existe; si no, analiza el archivo completo.
- Las reglas se aplican por coincidencia `parent::child` (padre inmediato), sin validación semántica completa del DOM final renderizado.
- Puede haber falsos positivos o falsos negativos en casos muy complejos (templates anidados no estándar, código generado, strings con markup).

---

## 📁 Estructura real del proyecto

```
html-nesting-linter/
├── extension.ts            # Punto de entrada, diagnósticos VSCode
├── parser.ts               # Extracción de markup + tokenización + análisis
├── nestingRules.ts         # Reglas explícitas y generación automática
├── extension.js            # Build JS generado
├── parser.js               # Build JS generado
├── nestingRules.js         # Build JS generado
├── out/                    # Carpeta de salida usada por la extensión
├── icon.png                # Icono usado en package.json
├── logo-html.svg           # Logo del proyecto
├── test.html               # Archivo de prueba manual
├── package.json            # Manifest de la extensión
├── tsconfig.json           # Configuración TypeScript
└── README.md
```

---

## 🧪 Desarrollo local

```bash
npm install
npm run compile
```

- Abre este proyecto en VSCode.
- Presiona `F5` para lanzar una ventana de Extension Development Host.
- Abre o edita un archivo soportado para ver diagnósticos en tiempo real.

---

## 🔧 Cómo agregar nuevas reglas

Edita `nestingRules.ts` y agrega un objeto al array `NESTING_RULES`:

```typescript
{
  parent: "details",
  child: "table",
  reason: "Las tablas dentro de <details> pueden causar problemas de layout.",
  alternatives: [
    "Envuelve la tabla en un <div> primero.",
    "Usa CSS overflow para contener la tabla."
  ],
  references: [
    { label: "MDN: <details>", url: "https://developer.mozilla.org/es/docs/Web/HTML/Element/details" }
  ]
}
```

---

## 📖 Referencias oficiales

| Recurso                       | URL                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| HTML Living Standard (WHATWG) | https://html.spec.whatwg.org/multipage/syntax.html                                                       |
| Modelos de contenido HTML     | https://html.spec.whatwg.org/multipage/dom.html#content-models                                           |
| MDN — Elementos HTML          | https://developer.mozilla.org/es/docs/Web/HTML/Element                                                   |
| W3C Validator                 | https://validator.w3.org/                                                                                |
| Nu Html Checker               | https://validator.nu/                                                                                    |
| WCAG 2.1 — Accesibilidad      | https://www.w3.org/WAI/WCAG21/                                                                           |
| VSCode Extension API          | https://code.visualstudio.com/api                                                                        |
| Diagnósticos VSCode           | https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics |

---

## 🤝 Contribuir

1. Fork del repositorio
2. Agrega reglas en `nestingRules.ts`
3. Compila con `npm run compile`
4. Prueba manualmente con `test.html` o con archivos de los lenguajes soportados
5. Abre un Pull Request

---

## 📄 Licencia

MIT
