# AlaViva

Primeros auxilios responsables para aves silvestres caídas o heridas en España — identificación, checklist de decisión, papilla, medidas, mapa de centros de recuperación (CRAS) y auditoría de producto.

## Estructura del repositorio

```
alaviva/
├── index.html         (home + triaje)
├── checklist.html      (¿de verdad necesita ayuda?)
├── emergencia.html     (primeros auxilios inmediatos)
├── guia.html            (15 fichas de especies, buscador)
├── mapa-cras.html       (CRAS por comunidad autónoma)
├── especies.json        (base de datos, la lee guia.html)
├── assets/
│   └── styles.css        (sistema de diseño compartido — todas las páginas lo enlazan)
├── README.md
└── AUDITORIA.md          (auditoría completa de producto, guía de todas las decisiones futuras)
```

## Publicar en GitHub Pages (gratis)

1. Sube TODA la carpeta `alaviva` (manteniendo `assets/` como subcarpeta) a la raíz del repositorio.
2. Ve a **Settings → Pages**.
3. En "Source", selecciona la rama `main` y la carpeta `/ (root)`.
4. En 1-2 minutos: `https://TU-USUARIO.github.io/alaviva/`

## Estado actual — ya funcional sin backend

Todo lo siguiente funciona hoy mismo, sin API key ni servidor:
- [x] Identidad de marca y sistema de diseño (`assets/styles.css`, compartido por todas las páginas)
- [x] Home con triaje inicial y aviso legal/sanitario visible
- [x] Checklist interactivo "¿de verdad necesita ayuda?" (evita intervenciones innecesarias)
- [x] Página de primeros auxilios de emergencia (sin depender de identificar la especie)
- [x] Guía de especies navegable y buscable, 15 fichas completas, leídas en vivo desde `especies.json`
- [x] Mapa de CRAS por comunidad autónoma (17 CCAA + Ceuta y Melilla)
- [x] Auditoría completa del proyecto (`AUDITORIA.md`) — guía de todas las decisiones futuras

## Pendiente (necesita que tú generes tus propias credenciales)

- [ ] Backend en Cloudflare Workers (identificación de especie por foto + chat)
- [ ] Integración con la API de Gemini (requiere tu propia API key de Google AI Studio)
- [ ] Conectar el formulario de subida de foto con ese backend
- [ ] Rate limiting / protección anti-abuso del endpoint de IA

Sigue el orden de fases del roadmap en `AUDITORIA.md`, sección 12.
