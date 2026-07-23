# Auditoría completa — AlaViva
*Análisis crítico del proyecto a fecha 22 julio 2026. Sin código, solo arquitectura y producto.*

---

## 0. Resumen ejecutivo (léelo aunque no leas nada más)

Lo que tenéis hoy —home, mapa de CRAS, base de 15 especies— es un **esqueleto de marca sólido**, pero el proyecto en su conjunto tiene un **problema de encuadre, no de features**: está planteado como "app para criar un ave hasta que vuele", cuando legal y prácticamente debería ser "guía de primeros auxilios + derivación rápida a profesionales". Ese cambio de enfoque afecta a UX, IA, base de datos y legal a la vez — es la corrección más importante de todo este documento, todo lo demás es secundario a esto.

---

## 1. Funcionalidades

**Faltan (críticas para lanzar):**
- Identificación real por foto (hoy es una ficha estática de ejemplo)
- Chat real conectado a un backend (hoy es un botón sin función)
- Formulario de "estado del ave" (edad, heridas, ubicación) que alimente la guía
- Generador de guía dinámica (especie + estado → texto personalizado)
- Protocolo de "primeros 10 minutos" que no dependa de identificar la especie primero (calor, caja, oscuridad, no dar agua/comida a ciegas)
- Checklist de decisión "¿de verdad necesita tu ayuda?" — la causa nº1 de intervenciones innecesarias es recoger volantones sanos que sus padres siguen alimentando en el suelo
- Botón de reporte para corregir datos de CRAS caducados (vas a tener errores, necesitas que la gente te avise)

**Sobran / posponer:**
- Perfiles de usuario, cuentas, login — no aportan nada al caso de uso real ("tengo un pájaro en la mano AHORA") y añaden fricción justo cuando menos la quieres
- Comunidad/social — con 2-5 usuarios reales ahora mismo, es prematuro en varios órdenes de magnitud
- Reconocimiento por sonido — complejo, y las aves caídas casi nunca cantan (están asustadas o son crías)
- Gamificación — el tono "logros/rachas" encaja mal con un tema de rescate de fauna

**Diferenciadores reales frente a lo que ya existe:**
- Nadie en España une identificación + guía dinámica + mapa de CRAS en un solo flujo — hoy eso está repartido entre foros, PDFs sueltos y apps de biodiversidad genéricas (eBird, iNaturalist) que no dan cuidados
- Un protocolo de decisión "nidícola vs nidífugo vs volantón sano" al principio, antes de pedir la foto, evitaría el error más común del sector
- Modo emergencia que no bloquea al usuario detrás de la identificación de especie

---

## 2. Experiencia de usuario (UX)

**Pantallas que faltan:**
1. Subida de foto (con consejos: fondo simple, luz natural, encuadre)
2. Resultados candidatos con % de confianza (nunca una única respuesta)
3. Confirmación de especie por el usuario
4. Formulario de estado (edad, heridas, ubicación, cómo lo encontró)
5. Guía generada final
6. Chat de seguimiento
7. Fallback: "no estoy segura" / "esto no parece un ave" / "no se pudo procesar la imagen"
8. Modo emergencia (bypass total de identificación)
9. 404 y error de red/backend caído

**Flujo ideal, de principio a fin:**
Entra → triaje urgente/no urgente → si urgente: pasos inmediatos + CRAS ya → si no urgente: ¿está realmente necesitando ayuda? (checklist volantón) → si sí: foto → candidatos → confirmar → estado del ave → guía → chat opcional → CRAS si aplica

**Qué confunde ahora mismo:**
- Las dos tarjetas del hero y el botón "Abrir chat" son enlaces muertos (`href="#"`) pero visualmente parecen terminados — nada le dice al usuario que está viendo una demo
- No hay ningún punto en la web que diga "esto no es tu mascota" — falta esa aclaración educativa/legal desde el primer contacto
- El mapa de CRAS es un mosaico esquemático, no geografía real — alguien puede esperar un mapa de verdad y confundirse con la disposición

---

## 3. Diseño

**Ya definido y correcto:** paleta natural (crema/verde bosque/ocre), Fraunces + Inter + IBM Plex Mono, estética "ficha de campo".

**Falta especificar:**
- **Iconografía**: custom, trazo orgánico tipo "field guide" — nada de librerías genéricas de iconos planos tipo Material Icons, rompería el tono
- **Animaciones**: sutiles, funcionales (fade/slide al cambiar de pantalla, no motion decorativo) — es un tema serio, no una app de consumo
- **Responsive**: mobile-first real, no adaptado — la mayoría de gente va a hacer la foto y usar la web desde el móvil en el momento del hallazgo, en el campo, con mala cobertura
- **Accesibilidad**: contraste AA mínimo (revisar el ocre `#C98A3B` sobre crema `#FAF7F0` en texto pequeño, puede no pasar AA), alt text en todas las fotos de aves, navegación completa por teclado, no depender solo del color para "urgente vs no urgente" (ya usáis icono + texto, mantenerlo siempre)

---

## 4. Inteligencia Artificial

**Qué puede hacer bien:**
- Reducir candidatos de especie combinando visión + contexto (ubicación, época del año, tamaño relativo)
- Generar el *fraseo* de la guía a partir de datos reales de la ficha (no inventar cifras)
- Responder dudas de seguimiento ancladas a la ficha ya identificada

**Qué NO debe hacer nunca:**
- Diagnosticar enfermedades con certeza
- Recomendar dosis de medicamentos o tratamientos veterinarios
- Dar por buena una identificación única sin alternativas cuando la confianza es baja
- "Resolver" casos que son claramente de derivación obligatoria — su trabajo ahí es redirigir, no intentar ayudar más allá de eso

**Cómo evitar alucinaciones (esto es lo importante técnicamente):**
- La IA nunca debe inventar datos de la especie — el prompt del sistema debe inyectar la ficha real del JSON y decirle explícitamente "usa solo estos datos, no completes con conocimiento general salvo que se indique"
- Si identifica una especie que no está en vuestra base de 15/150, debe decirlo explícitamente ("no tengo ficha verificada para esta especie, esto es orientación general") en vez de fingir que tiene una ficha
- Nunca debe dar una única especie con 100% de aparente seguridad — siempre top 2-3 candidatos con probabilidad relativa

**Cuando no está segura:** debe decirlo en lenguaje llano ("no estoy segura, podría ser A o B") y ofrecer el camino más seguro por defecto (derivar a CRAS) en vez de arriesgar una recomendación.

---

## 5. Base de datos

**Campos que faltan en cada especie:**
- Imágenes de referencia (macho/hembra/juvenil/pollo — el aspecto cambia muchísimo)
- **Nidícola vs nidífugo** — esto es el campo más importante que falta, determina si es normal que esté en el suelo o no
- Hábitat y temporada de cría
- Riesgo de impronta/imprimación (crítico en rapaces — un ave impronta se vuelve inviable para soltar)
- Estatus legal/catalogación específica (algunas requieren permiso especial de manejo)
- Sinónimos regionales del nombre común (en España cambian mucho por comunidad)
- `especies_similares` como array de IDs reales (hoy es solo texto suelto en `confundible_con`, no está enlazado)

**Organización a cientos de especies:**
- Separar en índice ligero (las 638, solo nombre + familia + si tiene ficha completa) + fichas detalladas cargadas bajo demanda
- Cuando pase de ~100 fichas, mover de JSON plano a una base de datos real (Postgres vía Supabase, por ejemplo) — el JSON deja de ser manejable mucho antes de las 638

**Imágenes:** nunca incrustadas en el JSON. Carpeta `/assets/aves/` o CDN, formato WebP, y ojo con las licencias — solo Wikimedia Commons con licencia CC verificada o fotos propias, nunca imágenes con copyright de terceros sin permiso.

---

## 6. Seguridad

**Riesgos reales:**
- Abuso económico del endpoint de IA (alguien hace un script que dispara peticiones y os come la cuota gratuita en un día)
- Prompt injection en el chat
- Subida de imágenes no relacionadas con aves (o maliciosas)
- Exposición de la API key si el proxy está mal hecho

**Mitigación:**
- La API key nunca toca el frontend — todo pasa por el Worker
- Rate limiting por IP/sesión + límite diario duro
- Validar tamaño y tipo de archivo antes de mandar la imagen al modelo
- El chat debe rechazar (educadamente) cualquier tema fuera de aves/fauna

---

## 7. SEO

- GitHub Pages con todo el contenido generado por JavaScript del lado cliente **es malo para SEO** — Google puede no indexar bien contenido que solo existe tras ejecutar JS. Si el objetivo es "salir primero en Google", en algún momento hay que migrar a páginas reales por especie o un generador estático (Astro/11ty), no un único `index.html`
- Páginas a crear: una URL por especie (`/especies/gorrion-comun`), una por comunidad de CRAS (`/cras/madrid`), contenido educativo tipo blog ("qué hacer si encuentras un pájaro caído", "nidícola vs nidífugo")
- URLs limpias en español, sin query params para contenido indexable
- Schema.org tipo `Article`/`FAQPage` en las guías
- Open Graph con imagen y descripción específica por página
- Rendimiento: lazy loading de imágenes, Core Web Vitals cuidados

---

## 8. Legal

**Esto es lo más urgente de corregir, no lo más aburrido:**
- Aviso explícito de que **la tenencia de fauna silvestre protegida sin autorización es ilegal en España** (Ley 42/2007) — hay obligación general de entregar el ave a un centro autorizado, salvo cuidados de urgencia mientras se contacta con él. El proyecto entero debe reflejar esto, no solo un disclaimer al pie
- Aviso de riesgo zoonótico y recomendación de lavado de manos/guantes — ausente hasta ahora
- Disclaimer de que la web no sustituye asesoría veterinaria profesional
- Si en algún momento se guardan fotos o conversaciones: aviso RGPD, política de privacidad
- Si se usa analítica: banner de cookies
- Limitación de responsabilidad clara sobre decisiones tomadas a partir de la guía
- **La IA nunca debe**: sugerir quedarse con el ave como mascota, recomendar medicamentos humanos o dosis, minimizar heridas graves, animar a la automedicación

---

## 9. Escalabilidad

- Separar frontend estático de un backend con base de datos real cuando el proyecto crezca — JSON plano + Cloudflare Workers gratis está bien para el MVP y para vuestro grupo de amigos, no para miles de usuarios
- Cache de respuestas de IA para preguntas repetidas (mismo ave + mismo estado no debería regenerar guía desde cero cada vez)
- Diseñar el JSON/API con versionado desde ya, para no romper nada al migrar
- Tener un plan B si Gemini o Cloudflare cambian sus condiciones gratuitas (ya pasó en diciembre 2025 con Imagen — no es hipotético)

---

## 10. Cien ideas para el futuro

**Identificación y datos**
1. Identificación por foto con top-3 candidatos
2. Identificación asistida por ubicación GPS (descarta especies imposibles en la zona)
3. Identificación asistida por temporada del año
4. Reconocimiento por sonido de reclamo
5. Comparador visual lado a lado de especies confundibles
6. Detección automática de heridas visibles en la foto
7. Estimación de edad aproximada a partir de la foto (plumón/plumas)
8. Base de datos ampliada a las 638 especies oficiales
9. Fichas con mapa de distribución por especie
10. Alertas de especies en peligro específico detectadas

**Herramientas prácticas**
11. Calculadora de proporción de papilla según peso del ave
12. Temporizador de alimentación con notificaciones
13. Registro de peso diario con gráfica de evolución
14. Checklist imprimible de "qué necesitas ya"
15. Modo linterna/calculadora de horas de luz restantes
16. Lista de la compra automática (qué comprar en la farmacia/tienda de animales)
17. Conversor de unidades (ml de papilla por gramo de peso)
18. Generador de PDF con la guía para tenerla offline
19. Modo sin conexión con los protocolos básicos cacheados
20. Widget de "cuenta atrás hasta la próxima toma"

**Mapa y comunidad**
21. Mapa real con fronteras geográficas (sustituyendo el mosaico actual)
22. Geolocalización automática para sugerir el CRAS más cercano
23. Rutas de transporte al CRAS más cercano
24. Estado en tiempo real del CRAS (abierto/cerrado/colapsado)
25. Formulario de verificación colaborativa de datos de CRAS
26. Mapa de avistamientos (no solo rescates)
27. Foro de rehabilitadores voluntarios
28. Red de "padrinos" que acompañan casos a distancia
29. Directorio de veterinarios de fauna silvestre por zona
30. Sistema de turnos de transporte voluntario a CRAS

**Panel para centros de recuperación**
31. Panel donde un CRAS pueda editar sus propios datos
32. Sistema de derivación directa con formulario prellenado
33. Estadísticas anónimas de qué especies llegan más y cuándo
34. Canal de contacto directo CRAS-usuario dentro de la app
35. Certificación/verificación oficial de centros por la propia app

**Educación**
36. Guía "nidícola vs nidífugo" ilustrada
37. Curso corto in-app de primeros auxilios para fauna
38. Quiz de identificación de especies (modo aprendizaje, no rescate)
39. Glosario ilustrado de términos ornitológicos
40. Sección "mitos vs realidad" (ej. "tocar un pollo no hace que la madre lo abandone")
41. Vídeos cortos de técnicas de manejo seguro
42. Calendario de épocas críticas de cría por región
43. Explicación de por qué NO intervenir en la mayoría de casos
44. Casos reales anonimizados como aprendizaje
45. Certificados de "primeros auxilios de fauna" tras completar el curso

**IA y personalización**
46. IA entrenada/afinada específicamente con aves ibéricas (no genérica)
47. Historial de conversación por caso, no por usuario
48. Resumen automático del caso para pasarlo al CRAS por teléfono
49. Generación de informe descargable del caso completo
50. Traducción automática de la guía a otros idiomas (turistas, residentes extranjeros)
51. Modo voz para manos ocupadas mientras sostienes al ave
52. Alertas proactivas si describes síntomas de emergencia en el chat
53. IA que sugiera cuándo ES buena idea NO haber intervenido (feedback educativo)

**Seguimiento**
54. Historial de casos propios (sin necesidad de cuenta compleja, solo local)
55. Seguimiento de crecimiento con fotos comparativas
56. Recordatorio de "hoy toca prueba de vuelo" en el proceso de suelta
57. Diario del proceso, exportable
58. Notificación de "esta especie ya debería haber emplumado, revisa"

**Accesibilidad y alcance**
59. Modo alto contraste
60. Compatibilidad con lectores de pantalla verificada
61. Versión en gallego, catalán y euskera
62. Modo texto grande para mayores
63. Versión ligera para conexiones lentas (rural)
64. App instalable (PWA) para uso sin tienda de apps
65. Modo oscuro (cuidando que siga siendo "field guide", no "app gamer")

**Integraciones**
66. Integración con eBird/iNaturalist para cruzar avistamientos
67. Integración con SEO/BirdLife como fuente de datos oficial
68. API pública para que otros proyectos usen vuestra base de datos
69. Bot de Telegram/WhatsApp para consultas rápidas
70. Widget embebible para que otras webs de fauna lo integren

**Confianza y verificación**
71. Sello de "datos verificados en fecha X" visible por ficha
72. Changelog público de correcciones a la base de datos
73. Colaboración oficial con SEO/BirdLife o un CRAS real como validador de contenido
74. Sistema de reporte de error por ficha con respuesta pública

**Negocio/sostenibilidad (si algún día quieres que se mantenga solo)**
75. Donaciones voluntarias para cubrir coste de API a escala
76. Colaboración con tiendas de productos de fauna (sin publicidad intrusiva)
77. Patrocinio institucional de una comunidad autónoma
78. Versión "white label" para que un CRAS la use con su marca

**Ideas más ambiciosas**
79. Modelo de visión propio entrenado solo con fauna ibérica (independencia de APIs externas)
80. Red de cámaras/sensores IoT en puntos de suelta para seguimiento post-liberación
81. Anillamiento asistido con QR para seguimiento a largo plazo
82. Colaboración con universidades para datos de investigación anonimizados
83. Sistema de predicción de "picos de temporada" por IA (cuándo va a haber más casos)
84. Alerta ciudadana geolocalizada tipo "se ha visto un ave herida cerca de ti, ¿puedes ayudar?"
85. Traducción del protocolo a formato accesible para colegios (educación ambiental)

**Pequeñas mejoras de producto**
86. Botón de "compartir caso" con un amigo
87. Modo "solo lectura" para consultar sin subir foto (curiosidad/aprendizaje)
88. Buscador de especies por características visuales (sin foto: "pájaro pequeño, marrón, pecho rojo")
89. Sección de preguntas frecuentes reales, extraídas de vuestro propio chat con el tiempo
90. Feedback tras cada caso ("¿te sirvió esta guía?")
91. Modo "imprimir ficha" para llevártela sin móvil
92. Alertas de mal tiempo (frío extremo = más caídas de nido)
93. Contador público de "aves ayudadas" (transparente, no inflado)
94. Sistema de etiquetas por ficha (rapaz nocturna, migratoria, protegida...)
95. Ficha con "sonidos que hace de bebé" para reconocer si algo va mal por el reclamo
96. Modo comparación de tres especies a la vez
97. Exportar guía a Google Calendar (recordatorios de toma)
98. Integración con Google Lens como método alternativo de foto
99. Sección "después de la suelta" — qué esperar, cuándo preocuparse si vuelve
100. Versión API-only para desarrolladores que quieran construir sobre vuestros datos

---

## 11. Errores conceptuales — dónde está mal planteado el proyecto

Aquí sí, sin filtro:

1. **El marco legal está invertido.** Lo habéis planteado como "cría el ave hasta que vuele", cuando la realidad legal española es "cuidados de urgencia + derivación obligatoria". Esto no es un matiz, es el eje central del producto y hay que rehacerlo desde ahí.

2. **Cero mención a riesgo zoonótico** en todas las conversaciones que hemos tenido hasta ahora. Es una guía de manejo de fauna silvestre sin una sola línea sobre lavarse las manos. Grave.

3. **Confiar en un modelo de visión genérico (Gemini) sin dataset especializado** para algo con consecuencias reales si se equivoca (papilla equivocada para la especie equivocada puede matar al ave). Necesitáis un sistema de "confianza baja = no arriesgar" muy estricto, no un simple "aquí tienes la especie".

4. **El objetivo de "las 638 especies" es una trampa de perfeccionismo.** Suena bien decirlo, pero en la práctica: nunca se termina, y las últimas 400 especies (rarezas) aportan casi cero valor real frente a pulir bien las 150 que sí aparecen. Mejor gastar ese esfuerzo en profundidad (más campos por especie) que en anchura (más especies raras).

5. **Depender al 100% de cuotas gratuitas sin plan B.** Ya visteis con Gemini Imagen en diciembre 2025 que estas cuotas cambian sin aviso. Si el proyecto crece y un día Google recorta el free tier de Gemini Flash, toda la identificación se cae de golpe. Necesitáis al menos un proveedor de respaldo pensado desde ya, aunque no lo implementéis todavía.

6. **El mapa "mosaico" no es un mapa.** Es una solución razonable para el MVP, pero si de verdad queréis ser "la mejor guía de España", un mapa esquemático sin geografía real transmite menos profesionalidad de la que el resto del proyecto ya tiene. Es de las primeras cosas a sustituir cuando haya tiempo.

7. **El chat "para todo el proceso" es una promesa muy grande para una IA sin supervisión humana real detrás.** Si un ave muere porque la IA dio un consejo malo, ¿quién responde? Necesitáis un límite muy claro y comunicado de qué SÍ puede resolver el chat y qué NO — y derivar rápido a humano/CRAS en todo lo demás.

8. **No hay ningún mecanismo para detectar y frenar el mal uso** (alguien preguntando por temas ajenos a aves, o intentando usar el chat como una IA general gratis). Sin esto, el coste de la API se puede disparar sin control.

---

## 12. Roadmap

### MVP (v1) — "Que funcione y sea honesto"
- Reencuadrar todo el copy hacia "primeros auxilios + derivación", no "cría en casa"
- Aviso legal + riesgo zoonótico visibles desde el primer contacto
- Protocolo de "primeros 10 minutos" sin necesidad de identificar especie
- Checklist "¿de verdad necesita ayuda?" (nidícola/nidífugo/volantón sano)
- Identificación por foto funcional (backend Cloudflare Workers + Gemini) con top-3 candidatos y aviso de incertidumbre
- Formulario de estado del ave
- Guía generada dinámicamente a partir de las 15 fichas ya creadas
- Mapa de CRAS ya construido, enlazado desde la guía
- Chat básico, limitado estrictamente al caso activo, con rate limiting

### v2 — "Que sea fiable a escala"
- Ampliar base de datos a ~100-150 especies habituales
- Añadir campos críticos que faltan (nidícola/nidífugo, imágenes de referencia, especies similares enlazadas)
- Cache de respuestas de IA para reducir coste
- Sistema de reporte de errores en fichas y en CRAS
- Mapa geográfico real sustituyendo el mosaico
- Migrar de un solo `index.html` a páginas reales por especie (mejor SEO)

### v3 — "Que se encuentre y se confíe en ella"
- SEO completo: URLs limpias, Schema.org, Open Graph, contenido educativo (blog)
- PWA instalable, modo offline con protocolos básicos
- Panel simple para que los propios CRAS actualicen sus datos
- Verificación colaborativa de datos (usuarios reportan, vosotros aprobáis)
- Accesibilidad completa (lectores de pantalla, alto contraste, idiomas cooficiales)

### v4 — "Que crezca sin romperse"
- Migrar de JSON plano a base de datos real (Postgres/Supabase)
- Historial de casos por dispositivo/usuario (sin cuentas complejas)
- Seguimiento de peso/crecimiento con gráficas
- Integración con eBird/iNaturalist
- Colaboración oficial con SEO/BirdLife o un CRAS real como validador

### v5 — "Ambición"
- Modelo de visión propio entrenado con fauna ibérica (independencia de APIs externas)
- Red de voluntarios/transporte coordinada desde la app
- API pública para terceros
- Expansión a otras comunidades de fauna (mamíferos, reptiles) si el modelo de aves funciona bien primero

---

*Fin de la auditoría. El punto más urgente de todos, si solo vas a arreglar uno antes de seguir programando, es el #1 de la sección 11: el marco legal.*
