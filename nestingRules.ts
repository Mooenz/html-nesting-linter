// ============================================================
// nestingRules.ts
// Base de datos de reglas de anidamiento HTML inválido
// Basado en: https://html.spec.whatwg.org/multipage/syntax.html
// ============================================================

export interface NestingRule {
	/** Etiqueta padre que NO puede contener a `child` */
	parent: string;
	/** Etiqueta hija que NO puede ir dentro de `parent` */
	child: string;
	/** Descripción del problema */
	reason: string;
	/** Alternativas sugeridas */
	alternatives: string[];
	/** URL a la especificación o documentación */
	references: { label: string; url: string }[];
}

/**
 * Etiquetas que NO pueden contener elementos de bloque (solo inline/texto)
 * Estas son "transparent" o "phrasing content" elements.
 */
export const INLINE_ONLY_PARENTS = new Set(['a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 'object', 'output', 'q', 'samp', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'u', 'var']);

/**
 * Elementos de bloque que NO pueden ir dentro de elementos inline.
 */
export const BLOCK_ELEMENTS = new Set(['address', 'article', 'aside', 'blockquote', 'canvas', 'dd', 'details', 'dialog', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'li', 'main', 'nav', 'noscript', 'ol', 'p', 'pre', 'section', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul']);

/**
 * Catálogo de etiquetas HTML estándar (incluye etiquetas legacy aún parseables).
 * Se usa para generar reglas automáticas y ampliar la cobertura.
 */
export const ALL_HTML_TAGS = [
	'a',
	'abbr',
	'address',
	'area',
	'article',
	'aside',
	'audio',
	'b',
	'base',
	'bdi',
	'bdo',
	'blockquote',
	'body',
	'br',
	'button',
	'canvas',
	'caption',
	'cite',
	'code',
	'col',
	'colgroup',
	'data',
	'datalist',
	'dd',
	'del',
	'details',
	'dfn',
	'dialog',
	'div',
	'dl',
	'dt',
	'em',
	'embed',
	'fieldset',
	'figcaption',
	'figure',
	'footer',
	'form',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'head',
	'header',
	'hgroup',
	'hr',
	'html',
	'i',
	'iframe',
	'img',
	'input',
	'ins',
	'kbd',
	'label',
	'legend',
	'li',
	'link',
	'main',
	'map',
	'mark',
	'menu',
	'meta',
	'meter',
	'nav',
	'noscript',
	'object',
	'ol',
	'optgroup',
	'option',
	'output',
	'p',
	'param',
	'picture',
	'pre',
	'progress',
	'q',
	'rp',
	'rt',
	'ruby',
	's',
	'samp',
	'script',
	'search',
	'section',
	'select',
	'slot',
	'small',
	'source',
	'span',
	'strong',
	'style',
	'sub',
	'summary',
	'sup',
	'table',
	'tbody',
	'td',
	'template',
	'textarea',
	'tfoot',
	'th',
	'thead',
	'time',
	'title',
	'tr',
	'track',
	'u',
	'ul',
	'var',
	'video',
	'wbr',
] as const;

const HTML_TAGS_SET = new Set<string>(ALL_HTML_TAGS);

const PHRASING_CONTENT_TAGS = new Set<string>(['a', 'abbr', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'map', 'mark', 'meter', 'noscript', 'object', 'output', 'picture', 'progress', 'q', 'ruby', 's', 'samp', 'script', 'select', 'slot', 'small', 'span', 'strong', 'sub', 'sup', 'template', 'textarea', 'time', 'u', 'var', 'video', 'wbr']);

/**
 * Reglas explícitas de anidamiento inválido.
 * child NO puede ir dentro de parent.
 */
export const NESTING_RULES: NestingRule[] = [
	// --- <p> solo puede contener phrasing content ---
	{
		parent: 'p',
		child: 'div',
		reason: '<p> solo puede contener phrasing content (texto e inline). <div> es un bloque y cierra implícitamente el <p>.',
		alternatives: ['Usa <div> en lugar de <p> si necesitas contener bloques.', 'Mueve el <div> fuera del <p>.', 'Si quieres un párrafo con un wrapper, usa <section> o <article>.'],
		references: [
			{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' },
			{ label: 'HTML Spec: phrasing content', url: 'https://html.spec.whatwg.org/multipage/dom.html#phrasing-content' },
		],
	},
	{
		parent: 'p',
		child: 'h1',
		reason: 'Los encabezados no pueden ir dentro de <p>.',
		alternatives: ['Cierra el <p> antes del encabezado.', 'Usa <p> antes y después del encabezado.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'h2',
		reason: 'Los encabezados no pueden ir dentro de <p>.',
		alternatives: ['Cierra el <p> antes del encabezado.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'h3',
		reason: 'Los encabezados no pueden ir dentro de <p>.',
		alternatives: ['Cierra el <p> antes del encabezado.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'h4',
		reason: 'Los encabezados no pueden ir dentro de <p>.',
		alternatives: ['Cierra el <p> antes del encabezado.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'h5',
		reason: 'Los encabezados no pueden ir dentro de <p>.',
		alternatives: ['Cierra el <p> antes del encabezado.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'h6',
		reason: 'Los encabezados no pueden ir dentro de <p>.',
		alternatives: ['Cierra el <p> antes del encabezado.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'ul',
		reason: '<ul> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Cierra <p> antes de la lista.', 'Usa un <div> como wrapper en lugar de <p>.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'ol',
		reason: '<ol> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Cierra <p> antes de la lista.', 'Usa un <div> como wrapper.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'table',
		reason: '<table> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Coloca la tabla fuera del <p>.', 'Usa un <div> o <section> como contenedor.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'form',
		reason: '<form> no puede anidarse dentro de <p>.',
		alternatives: ['Coloca el <form> fuera del <p>.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'blockquote',
		reason: '<blockquote> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Coloca el <blockquote> fuera del <p>.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'pre',
		reason: '<pre> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Coloca el <pre> fuera del <p>.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'section',
		reason: '<section> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Usa <div> en lugar de <p>, o reestructura el contenido.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'article',
		reason: '<article> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Usa <div> como contenedor en lugar de <p>.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'aside',
		reason: '<aside> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Usa <div> como contenedor.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'figure',
		reason: '<figure> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Coloca el <figure> fuera del <p>.'],
		references: [{ label: 'MDN: <figure>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/figure' }],
	},
	{
		parent: 'p',
		child: 'footer',
		reason: '<footer> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Coloca el <footer> fuera del <p>.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'header',
		reason: '<header> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Coloca el <header> fuera del <p>.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'nav',
		reason: '<nav> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Coloca el <nav> fuera del <p>.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},
	{
		parent: 'p',
		child: 'main',
		reason: '<main> es un bloque y no puede ir dentro de <p>.',
		alternatives: ['Coloca el <main> fuera del <p>.'],
		references: [{ label: 'MDN: <p>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/p' }],
	},

	// --- <a> no puede contener elementos interactivos ---
	{
		parent: 'a',
		child: 'a',
		reason: 'No puedes anidar un <a> dentro de otro <a>. Es inválido según la especificación HTML.',
		alternatives: ['Usa CSS para dar apariencia de enlace a un contenedor.', 'Usa JavaScript (onclick) en un <div> o <span>.', 'Reestructura el contenido para tener enlaces separados.'],
		references: [
			{ label: 'MDN: <a>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/a' },
			{ label: 'HTML Spec: transparent content', url: 'https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element' },
		],
	},
	{
		parent: 'a',
		child: 'button',
		reason: 'Un <button> es interactivo y no puede estar dentro de un <a> (ambos son focusables).',
		alternatives: ['Usa solo <a> o solo <button>, no ambos.', "Si necesitas un enlace con estilo de botón, usa <a class='btn'>.", 'Si necesitas acción + navegación, maneja con JavaScript.'],
		references: [
			{ label: 'MDN: <a>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/a' },
			{ label: 'WCAG: Interactive elements', url: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html' },
		],
	},
	{
		parent: 'a',
		child: 'input',
		reason: 'Elementos de formulario interactivos no deben ir dentro de <a>.',
		alternatives: ['Usa el formulario fuera del enlace.', 'Usa JavaScript para la acción del input.'],
		references: [{ label: 'MDN: <a>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/a' }],
	},
	{
		parent: 'a',
		child: 'select',
		reason: 'Elementos de formulario interactivos no deben ir dentro de <a>.',
		alternatives: ['Usa el select fuera del enlace.'],
		references: [{ label: 'MDN: <a>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/a' }],
	},
	{
		parent: 'a',
		child: 'textarea',
		reason: 'Elementos de formulario interactivos no deben ir dentro de <a>.',
		alternatives: ['Usa el textarea fuera del enlace.'],
		references: [{ label: 'MDN: <a>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/a' }],
	},

	// --- <button> no puede contener elementos interactivos ---
	{
		parent: 'button',
		child: 'a',
		reason: 'Un enlace <a> no puede estar dentro de un <button>. Crea conflictos de accesibilidad y comportamiento.',
		alternatives: ['Usa solo <a> con estilos CSS para que parezca botón.', 'Usa solo <button> con JavaScript para la navegación.', "Usa <a role='button'> para semántica de botón en un enlace."],
		references: [
			{ label: 'MDN: <button>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/button' },
			{ label: 'WCAG: Botones y enlaces', url: 'https://www.w3.org/WAI/WCAG21/Techniques/html/H91' },
		],
	},
	{
		parent: 'button',
		child: 'button',
		reason: 'No puedes anidar un <button> dentro de otro <button>.',
		alternatives: ['Usa botones separados.', 'Usa CSS para crear grupos de botones visualmente.'],
		references: [{ label: 'MDN: <button>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/button' }],
	},
	{
		parent: 'button',
		child: 'input',
		reason: 'Elementos de formulario interactivos no deben ir dentro de <button>.',
		alternatives: ['Usa el input fuera del botón.'],
		references: [{ label: 'MDN: <button>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/button' }],
	},

	// --- Tabla: estructura inválida ---
	{
		parent: 'table',
		child: 'div',
		reason: '<div> no puede ser hijo directo de <table>. Los hijos válidos son: <thead>, <tbody>, <tfoot>, <tr>, <caption>, <colgroup>.',
		alternatives: ['Usa <td> o <th> para el contenido.', 'Coloca el <div> dentro de una celda <td>.', 'Considera usar CSS Grid o Flexbox si no necesitas semántica de tabla.'],
		references: [
			{ label: 'MDN: <table>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/table' },
			{ label: 'HTML Spec: table', url: 'https://html.spec.whatwg.org/multipage/tables.html#the-table-element' },
		],
	},
	{
		parent: 'table',
		child: 'p',
		reason: '<p> no puede ser hijo directo de <table>.',
		alternatives: ['Coloca el <p> dentro de una celda <td>.', 'Usa <caption> para texto descriptivo de la tabla.'],
		references: [{ label: 'MDN: <table>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/table' }],
	},
	{
		parent: 'tr',
		child: 'div',
		reason: '<div> no puede ser hijo directo de <tr>. Solo se permiten <td> y <th>.',
		alternatives: ['Coloca el <div> dentro de <td>.', 'Usa CSS para lograr el layout deseado dentro de la celda.'],
		references: [{ label: 'MDN: <tr>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/tr' }],
	},
	{
		parent: 'tr',
		child: 'p',
		reason: '<p> no puede ser hijo directo de <tr>. Solo se permiten <td> y <th>.',
		alternatives: ['Coloca el <p> dentro de <td>.'],
		references: [{ label: 'MDN: <tr>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/tr' }],
	},
	{
		parent: 'tr',
		child: 'span',
		reason: '<span> no puede ser hijo directo de <tr>.',
		alternatives: ['Coloca el <span> dentro de <td>.'],
		references: [{ label: 'MDN: <tr>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/tr' }],
	},
	{
		parent: 'tr',
		child: 'a',
		reason: '<a> no puede ser hijo directo de <tr>.',
		alternatives: ['Coloca el enlace dentro de <td>.'],
		references: [{ label: 'MDN: <tr>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/tr' }],
	},

	// --- Listas ---
	{
		parent: 'ul',
		child: 'div',
		reason: '<ul> solo puede contener elementos <li> como hijos directos.',
		alternatives: ['Envuelve el <div> dentro de un <li>.', 'Usa CSS Flexbox/Grid en lugar de <ul> si no necesitas semántica de lista.'],
		references: [{ label: 'MDN: <ul>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/ul' }],
	},
	{
		parent: 'ul',
		child: 'p',
		reason: '<ul> solo puede contener elementos <li> como hijos directos.',
		alternatives: ['Envuelve el <p> dentro de un <li>.'],
		references: [{ label: 'MDN: <ul>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/ul' }],
	},
	{
		parent: 'ul',
		child: 'span',
		reason: '<ul> solo puede contener elementos <li> como hijos directos.',
		alternatives: ['Envuelve el <span> dentro de un <li>.'],
		references: [{ label: 'MDN: <ul>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/ul' }],
	},
	{
		parent: 'ul',
		child: 'a',
		reason: '<ul> solo puede contener <li> como hijos directos.',
		alternatives: ['Envuelve el <a> dentro de un <li>.'],
		references: [{ label: 'MDN: <ul>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/ul' }],
	},
	{
		parent: 'ol',
		child: 'div',
		reason: '<ol> solo puede contener elementos <li> como hijos directos.',
		alternatives: ['Envuelve el <div> dentro de un <li>.'],
		references: [{ label: 'MDN: <ol>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/ol' }],
	},
	{
		parent: 'ol',
		child: 'p',
		reason: '<ol> solo puede contener elementos <li> como hijos directos.',
		alternatives: ['Envuelve el <p> dentro de un <li>.'],
		references: [{ label: 'MDN: <ol>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/ol' }],
	},

	// --- <head> ---
	{
		parent: 'head',
		child: 'div',
		reason: '<head> no puede contener elementos visibles como <div>.',
		alternatives: ['Coloca el <div> dentro del <body>.', 'Usa <meta>, <link>, <script> o <style> dentro de <head>.'],
		references: [{ label: 'MDN: <head>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/head' }],
	},
	{
		parent: 'head',
		child: 'p',
		reason: '<head> no puede contener elementos visibles como <p>.',
		alternatives: ['Coloca el contenido dentro del <body>.'],
		references: [{ label: 'MDN: <head>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/head' }],
	},

	// --- <form> dentro de <form> ---
	{
		parent: 'form',
		child: 'form',
		reason: 'No puedes anidar un <form> dentro de otro <form>.',
		alternatives: ['Usa un solo formulario con fieldsets para agrupar.', 'Usa JavaScript para manejar múltiples sets de datos.', 'Usa <dialog> para formularios secundarios.'],
		references: [
			{ label: 'MDN: <form>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/form' },
			{ label: 'HTML Spec: form', url: 'https://html.spec.whatwg.org/multipage/form-elements.html#the-form-element' },
		],
	},

	// --- Encabezados ---
	{
		parent: 'h1',
		child: 'h1',
		reason: 'No puedes anidar encabezados del mismo nivel.',
		alternatives: ['Usa encabezados jerárquicos (h1 > h2 > h3...).'],
		references: [{ label: 'MDN: Headings', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/Heading_Elements' }],
	},
	{
		parent: 'h1',
		child: 'h2',
		reason: 'No puedes anidar encabezados dentro de otros encabezados.',
		alternatives: ['Usa los encabezados como elementos separados, no anidados.'],
		references: [{ label: 'MDN: Headings', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/Heading_Elements' }],
	},
	{
		parent: 'h2',
		child: 'h1',
		reason: 'No puedes anidar encabezados.',
		alternatives: ['Usa los encabezados como elementos separados.'],
		references: [{ label: 'MDN: Headings', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/Heading_Elements' }],
	},

	// --- <label> ---
	{
		parent: 'label',
		child: 'label',
		reason: 'No puedes anidar un <label> dentro de otro <label>.',
		alternatives: ['Usa etiquetas separadas para cada control de formulario.'],
		references: [{ label: 'MDN: <label>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/label' }],
	},

	// --- <select> ---
	{
		parent: 'select',
		child: 'div',
		reason: '<select> solo puede contener <option> y <optgroup>.',
		alternatives: ['Usa <option> para las opciones.', 'Si necesitas más control visual, considera librerías de UI custom.'],
		references: [{ label: 'MDN: <select>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/select' }],
	},
	{
		parent: 'select',
		child: 'span',
		reason: '<select> solo puede contener <option> y <optgroup>.',
		alternatives: ['Usa <option> dentro de <select>.'],
		references: [{ label: 'MDN: <select>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/select' }],
	},

	// --- <figure> y <figcaption> ---
	{
		parent: 'figcaption',
		child: 'figcaption',
		reason: 'No puedes anidar <figcaption> dentro de otro <figcaption>.',
		alternatives: ['Usa solo un <figcaption> por <figure>.'],
		references: [{ label: 'MDN: <figcaption>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/figcaption' }],
	},

	// --- <details> y <summary> ---
	{
		parent: 'summary',
		child: 'div',
		reason: '<summary> solo puede contener phrasing content. <div> es un bloque.',
		alternatives: ['Usa <span> o texto directamente en <summary>.'],
		references: [{ label: 'MDN: <summary>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/summary' }],
	},

	// --- <dt> ---
	{
		parent: 'dt',
		child: 'div',
		reason: '<dt> solo puede contener phrasing content.',
		alternatives: ['Usa solo texto o elementos inline dentro de <dt>.'],
		references: [{ label: 'MDN: <dt>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/dt' }],
	},

	// --- <caption> en tabla ---
	{
		parent: 'caption',
		child: 'table',
		reason: 'No puedes anidar una tabla dentro de <caption>.',
		alternatives: ['Usa <p> o texto simple en <caption>.'],
		references: [{ label: 'MDN: <caption>', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element/caption' }],
	},
];

const DEFAULT_REFS = [
	{ label: 'HTML Living Standard', url: 'https://html.spec.whatwg.org/' },
	{ label: 'MDN: Referencia HTML', url: 'https://developer.mozilla.org/es/docs/Web/HTML/Element' },
];

function makeRule(parent: string, child: string, reason: string, alternatives: string[], references = DEFAULT_REFS): NestingRule {
	return { parent, child, reason, alternatives, references };
}

function generateRulesForAllowedChildren(parent: string, allowedChildren: Set<string>, reason: string, alternatives: string[], references = DEFAULT_REFS): NestingRule[] {
	const rules: NestingRule[] = [];
	for (const child of ALL_HTML_TAGS) {
		if (!allowedChildren.has(child)) {
			rules.push(makeRule(parent, child, reason, alternatives, references));
		}
	}
	return rules;
}

function generateAutomaticRules(): NestingRule[] {
	const autoRules: NestingRule[] = [];

	// Elementos con hijos directos estrictos
	autoRules.push(...generateRulesForAllowedChildren('html', new Set(['head', 'body']), '<html> solo puede contener <head> y <body> como hijos directos.', ['Mueve este elemento dentro de <head> o <body> según corresponda.']));

	autoRules.push(...generateRulesForAllowedChildren('head', new Set(['base', 'link', 'meta', 'noscript', 'script', 'style', 'template', 'title']), '<head> solo puede contener metadatos y recursos del documento.', ['Mueve contenido visible dentro de <body>.']));

	autoRules.push(...generateRulesForAllowedChildren('table', new Set(['caption', 'colgroup', 'thead', 'tbody', 'tfoot', 'tr', 'script', 'template']), '<table> tiene una estructura de hijos directos restringida por la especificación.', ['Usa <thead>, <tbody>, <tfoot> y filas <tr> para estructurar la tabla.']));

	autoRules.push(...generateRulesForAllowedChildren('colgroup', new Set(['col', 'template']), '<colgroup> solo admite <col> (y opcionalmente <template>).', ['Reemplaza este hijo por elementos <col>.']));

	for (const sectionTag of ['thead', 'tbody', 'tfoot'] as const) {
		autoRules.push(...generateRulesForAllowedChildren(sectionTag, new Set(['tr', 'script', 'template']), `<${sectionTag}> solo admite filas <tr> como hijos directos.`, ['Mueve este elemento dentro de una celda (<td>/<th>) dentro de <tr>.']));
	}

	autoRules.push(...generateRulesForAllowedChildren('tr', new Set(['td', 'th', 'script', 'template']), '<tr> solo puede contener celdas <td> o encabezados <th>.', ['Encapsula el contenido dentro de <td> o <th>.']));

	for (const listTag of ['ul', 'ol', 'menu'] as const) {
		autoRules.push(...generateRulesForAllowedChildren(listTag, new Set(['li', 'script', 'template']), `<${listTag}> solo puede contener <li> como hijos directos.`, ['Envuelve el contenido en <li>.']));
	}

	autoRules.push(...generateRulesForAllowedChildren('dl', new Set(['dt', 'dd', 'script', 'template']), '<dl> solo puede contener pares <dt>/<dd> como hijos directos.', ['Usa <dt> para términos y <dd> para descripciones.']));

	autoRules.push(...generateRulesForAllowedChildren('select', new Set(['option', 'optgroup', 'hr', 'script', 'template']), '<select> solo admite <option> y <optgroup> como contenido principal.', ['Reemplaza este elemento por <option> u <optgroup>.']));

	autoRules.push(...generateRulesForAllowedChildren('optgroup', new Set(['option', 'script', 'template']), '<optgroup> solo puede contener elementos <option>.', ['Mueve este nodo fuera del <optgroup> o conviértelo en <option>.']));

	autoRules.push(...generateRulesForAllowedChildren('picture', new Set(['source', 'img', 'script', 'template']), '<picture> solo puede contener <source> y un <img> de fallback.', ['Usa <source> para variantes y <img> como fallback.']));

	// Elementos que solo admiten phrasing content
	const phrasingOnlyParents = ['p', 'summary', 'dt', 'legend', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
	for (const parent of phrasingOnlyParents) {
		autoRules.push(...generateRulesForAllowedChildren(parent, PHRASING_CONTENT_TAGS, `<${parent}> solo puede contener phrasing content (contenido inline).`, ['Mueve elementos de bloque fuera del contenedor o usa un wrapper de bloque.']));
	}

	// Restricciones interactivas clave
	const interactiveInsideA = new Set(['a', 'button', 'input', 'select', 'textarea', 'label', 'details']);
	for (const child of interactiveInsideA) {
		autoRules.push(makeRule('a', child, '<a> no debe contener elementos interactivos anidados.', ['Usa un único elemento interactivo por control de UI.']));
	}

	const interactiveInsideButton = new Set(['a', 'button', 'input', 'select', 'textarea', 'label', 'details', 'form']);
	for (const child of interactiveInsideButton) {
		autoRules.push(makeRule('button', child, '<button> no debe contener elementos interactivos anidados.', ['Usa controles separados o reestructura la interacción.']));
	}

	autoRules.push(makeRule('form', 'form', 'No puedes anidar un <form> dentro de otro <form>.', ['Usa un único formulario y agrupa secciones con <fieldset>.']));

	autoRules.push(makeRule('label', 'label', 'No puedes anidar un <label> dentro de otro <label>.', ['Usa etiquetas separadas para cada control de formulario.']));

	// Conserva únicamente tags del catálogo HTML y evita ruido no estándar.
	return autoRules.filter((rule) => HTML_TAGS_SET.has(rule.parent) && HTML_TAGS_SET.has(rule.child));
}

export const GENERATED_NESTING_RULES = generateAutomaticRules();
export const NESTING_RULES_COMPLETE = [...NESTING_RULES, ...GENERATED_NESTING_RULES];

/**
 * Construye un mapa para búsqueda rápida: parent+child -> NestingRule
 */
export function buildRulesMap(rules: NestingRule[]): Map<string, NestingRule> {
	const map = new Map<string, NestingRule>();
	for (const rule of rules) {
		map.set(`${rule.parent}::${rule.child}`, rule);
	}
	return map;
}

export const RULES_MAP = buildRulesMap(NESTING_RULES_COMPLETE);
