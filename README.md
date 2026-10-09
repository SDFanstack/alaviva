# 🦅 AlaViva

**Primeros auxilios responsables para aves silvestres caídas o heridas en España.**

🔗 **Web en vivo:** [alaviva.pages.dev](https://alaviva.pages.dev/)

---

## ¿Qué es AlaViva?

Cada año, miles de personas en España se encuentran con un ave caída — un polluelo sin plumas, un volantón en el suelo, un adulto herido — y no saben qué hacer. AlaViva existe para responder esa pregunta en el momento, con pasos claros.

**AlaViva no es una guía para convertir un ave silvestre en mascota.** En España, la fauna silvestre está protegida por ley (Ley 42/2007). La misión del proyecto es ayudar a decidir si hay que intervenir y, si el ave necesita ayuda, dar los primeros cuidados mientras se contacta con un centro de recuperación de fauna (CRAS), no sustituir a esos profesionales.

> ⚠️ **Estado del contenido:** las pautas de alimentación de urgencia, frecuencias y criterios de derivación son orientativas y **aún no han sido revisadas por un veterinario ni por un rehabilitador de fauna**. Si lo eres y ves algo mejorable, abre un *issue*.

## Qué puedes hacer en la web

- ✅ **Comprobar si el ave necesita ayuda** — un checklist de 4 preguntas que evita el error más común: "rescatar" un volantón sano al que sus padres siguen alimentando
- 🚑 **Primeros auxilios inmediatos** — pasos claros, sin necesidad de saber qué especie es
- 🔍 **Identificar la especie por foto**, con IA — nunca una certeza única, siempre varios candidatos con su nivel de confianza
- 📖 **Consultar la ficha de 50 especies** habituales en España: dieta, papilla de urgencia, medidas, identificación, si es nidícola o nidífuga y cuándo derivar a un centro. Cada especie tiene además su propia página
- 🗺️ **Encontrar el CRAS de tu comunidad** en un mapa interactivo de España (con alternativa en lista), con datos de fuentes públicas
- 💬 **Chatear con un asistente** especializado solo en aves y primeros auxilios — nunca da diagnósticos ni sustituye a un veterinario
- 📱 **Instalarla como app** (PWA) desde el navegador del móvil

## Cómo está construido

Un proyecto deliberadamente ligero y sin dependencias de pago:

| Parte | Tecnología |
|---|---|
| Frontend | HTML/CSS/JS puro, sin frameworks |
| Hosting | Cloudflare Pages (gratis), desplegado desde este repositorio |
| Base de datos | JSON estático (`especies.json`) |
| Páginas por especie | Generadas con `tools/generar-especies.mjs` |
| Mapa de España | SVG propio generado a partir de datos del IGN (es-atlas) |
| IA (identificación + chat) | Cloudflare Worker + Google Gemini, con límite diario por IP |
| Coste de mantenimiento | 0 €, dentro de las cuotas gratuitas |

## Estructura del repositorio

```
alaviva/
├── index.html            → portada
├── checklist.html        → "¿de verdad necesita ayuda?"
├── emergencia.html       → primeros auxilios inmediatos
├── guia.html             → guía de especies (buscable)
├── identificar.html      → identificación por foto
├── chat.html             → chat con IA
├── mapa-cras.html        → mapa y lista de CRAS por comunidad
├── sobre.html            → quién, fuentes y privacidad
├── especies.json         → base de datos de especies (fuente de verdad)
├── especies/             → una página por especie (generada, no editar a mano)
├── tools/                → generador de las páginas de especie y del sitemap
├── assets/               → estilos, iconos, imagen para compartir, fotos de aves
├── manifest.json, sw.js  → PWA
├── worker/               → backend de IA (Cloudflare Worker) — se despliega aparte
└── AUDITORIA.md          → auditoría de producto y roadmap
```

## Cómo actualizar el contenido

1. Edita `especies.json` (un dato nuevo, una especie, una corrección).
2. Regenera las páginas y el sitemap desde la raíz del proyecto:
   ```
   node tools/generar-especies.mjs
   ```
3. Si cambias especies, el Worker también necesita saberlo: regenera `worker/src/especies_compact.js` y despliega con `npx wrangler deploy` dentro de `worker/`.
4. `git add .`, `git commit` y `git push`: Cloudflare Pages publica solo.

## Privacidad

Sin cuentas, sin cookies de seguimiento y sin analítica. Las fotos y mensajes del identificador y el chat se envían a la API de Gemini para generar la respuesta y **no se guardan** en AlaViva. Detalle completo en [`sobre.html`](https://alaviva.pages.dev/sobre.html#privacidad).

## Estado del proyecto

50 especies documentadas, mapa de CRAS de las 17 comunidades y las 2 ciudades autónomas, PWA instalable y páginas individuales por especie. Ver [`AUDITORIA.md`](./AUDITORIA.md) para el roadmap y las decisiones de producto.

## Contribuir

¿Ves un dato de un CRAS desactualizado, una ficha con un error, o quieres proponer una mejora? Abre un *issue* en este repositorio. Cualquier corrección con fuente verificable es bienvenida, y la de alguien del sector, más todavía.

## Aviso legal

AlaViva ofrece orientación general, no sustituye a un centro de recuperación de fauna silvestre (CRAS) ni a asesoría veterinaria profesional. En España, la tenencia de fauna silvestre sin autorización está regulada por ley. Ante heridas graves o dudas serias, contacta siempre con un profesional.

---

*Proyecto personal e independiente, sin ánimo de lucro, hecho para ayudar a la fauna silvestre.*
