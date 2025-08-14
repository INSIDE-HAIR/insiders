/**
 * Convierte texto plano con saltos de línea en HTML
 * @param text - Texto plano con \n
 * @returns HTML con <br> y <p> tags
 */
export function convertTextToHTML(text: string): string {
  if (!text) return "";

  // Convertir saltos de línea en <br> tags
  let html = text.replace(/\n/g, "<br>");

  // Si no hay tags HTML, envolver en <p>
  if (!html.includes("<p>") && !html.includes("<div>")) {
    html = `<p>${html}</p>`;
  }

  return html;
}

/**
 * Convierte HTML en texto plano
 * @param html - HTML string
 * @returns Texto plano con saltos de línea
 */
export function convertHTMLToText(html: string): string {
  if (!html) return "";

  // Remover tags HTML y convertir <br> en saltos de línea
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Limpiar saltos de línea múltiples
  text = text.replace(/\n\s*\n/g, "\n").trim();

  return text;
}

/**
 * Formatea enlaces en HTML para que sean clickeables
 * @param html - HTML string
 * @returns HTML con enlaces formateados
 */
export function formatLinksInHTML(html: string): string {
  if (!html) return "";

  // Buscar URLs y convertirlas en enlaces simples
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return html.replace(urlRegex, (url) => {
    return `<a href="${url}">${url}</a>`;
  });
}

/**
 * Procesa una descripción para mostrar correctamente
 * @param description - Descripción en cualquier formato
 * @returns HTML formateado correctamente
 */
export function processDescription(description: string): string {
  if (!description) return "";

  // Si ya es HTML, no procesar más (evitar duplicación de enlaces)
  if (description.includes("<") && description.includes(">")) {
    return description;
  }

  // Si es texto plano, convertir a HTML
  const html = convertTextToHTML(description);
  return formatLinksInHTML(html);
}
