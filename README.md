# 🦅 AlaViva

**Primeros auxilios responsables para aves silvestres caídas o heridas en España.**

🔗 **Web en vivo:** [alaviva.pages.dev](https://alaviva.pages.dev/)

---

## ¿Qué es AlaViva?

Cada año, miles de personas en España se encuentran con un ave caída — un polluelo sin plumas, un volantón en el suelo, un adulto herido — y no saben qué hacer. AlaViva existe para responder esa pregunta en el momento, con pasos claros y verificados.

**AlaViva no es una guía para convertir un ave silvestre en mascota.** En España, la fauna silvestre está protegida por ley — la misión de este proyecto es ayudar con los primeros cuidados mientras se contacta con un centro de recuperación de fauna (CRAS), no sustituir a esos profesionales.

## Qué puedes hacer en la web

- ✅ **Comprobar si el ave necesita ayuda** — un checklist de 4 preguntas que evita el error más común: "rescatar" un volantón sano al que sus padres seguían alimentando
- 🚑 **Primeros auxilios inmediatos** — 5 pasos, sin necesidad de saber qué especie es
- 🔍 **Identificar la especie por foto**, con IA — nunca una certeza única, siempre varios candidatos con su nivel de confianza
- 📖 **Consultar la ficha completa** de 25+ especies habituales en España: dieta, papilla, medidas, identificación, cuándo derivar a un centro
- 🗺️ **Encontrar el CRAS más cercano**, por comunidad autónoma, con datos verificados
- 💬 **Chatear con un asistente** especializado solo en aves y primeros auxilios — nunca da diagnósticos ni sustituye a un veterinario

## Cómo está construido

Un proyecto deliberadamente ligero y sin dependencias de pago:

| Parte | Tecnología |
|---|---|
| Frontend | HTML/CSS/JS puro, sin frameworks |
| Hosting | GitHub Pages (gratis) |
| Base de datos | JSON estático (`especies.json`) |
| IA (identificación + chat) | Cloudflare Workers + Google Gemini |
| Coste de mantenimiento | 0€, dentro de las cuotas gratuitas |

## Estructura del repositorio

```
alaviva/
├── index.html          → home
├── checklist.html       → "¿de verdad necesita ayuda?"
├── emergencia.html      → primeros auxilios inmediatos
├── guia.html             → guía de especies (buscable)
├── identificar.html      → identificación por foto
├── chat.html              → chat con IA
├── mapa-cras.html         → centros de recuperación por comunidad
├── especies.json          → base de datos de especies
├── assets/styles.css      → sistema de diseño compartido
├── worker/                 → backend (Cloudflare Workers) — no se despliega desde aquí
└── AUDITORIA.md            → auditoría de producto y roadmap
```

## Estado del proyecto

25 especies documentadas de las ~150 habituales en España — en ampliación activa. Ver [`AUDITORIA.md`](./AUDITORIA.md) para el roadmap completo y las decisiones de producto detrás del proyecto.

## Contribuir

¿Ves un dato de un CRAS desactualizado, una ficha de especie con un error, o quieres proponer una especie nueva? Abre un *issue* en este repositorio — cualquier corrección con fuente verificable es bienvenida.

## Aviso legal

AlaViva ofrece orientación general, no sustituye a un centro de recuperación de fauna silvestre (CRAS) ni a asesoría veterinaria profesional. En España, la tenencia de fauna silvestre sin autorización está regulada por ley. Ante heridas graves o dudas serias, contacta siempre con un profesional.

---

*Proyecto personal, sin ánimo de lucro, hecho para ayudar a la fauna silvestre local.*
