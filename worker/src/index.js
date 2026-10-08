/**
 * AlaViva — Worker de Cloudflare
 * =========================================================
 * Dos rutas:
 *   POST /api/identify  → identificación de especie a partir de una foto
 *   POST /api/chat       → chat de seguimiento, opcionalmente anclado a una especie
 *
 * Requiere, como secretos de Worker (nunca en el código ni en el frontend):
 *   GEMINI_API_KEY   → tu clave de Google AI Studio
 *
 * Requiere, como binding de KV (para el rate limiting):
 *   RATE_LIMIT_KV
 *
 * Ver README del worker para los pasos exactos de despliegue.
 */

import { ESPECIES_COMPACTAS } from './especies_compact.js';

// ---------- Configuración ----------

// Orígenes permitidos a llamar a este Worker. Ajusta si cambias de dominio.
const ALLOWED_ORIGINS = [
  'https://alaviva.pages.dev',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// Límites de uso — pensados para un grupo pequeño de usuarios, no para tráfico masivo.
const LIMITS = {
  MAX_REQUESTS_PER_IP_PER_DAY: 40,
  MAX_IMAGE_BYTES: 6 * 1024 * 1024, // 6 MB
  MAX_CHAT_MESSAGE_CHARS: 1000,
  MAX_CHAT_HISTORY_MESSAGES: 20
};

const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ---------- Utilidades ----------

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
  });
}

// Clave de KV: una entrada por IP y por día (se resetea sola al cambiar la fecha)
function rateLimitKey(ip) {
  const today = new Date().toISOString().slice(0, 10);
  return `ratelimit:${ip}:${today}`;
}

async function checkAndIncrementRateLimit(kv, ip) {
  const key = rateLimitKey(ip);
  const current = parseInt((await kv.get(key)) || '0', 10);
  if (current >= LIMITS.MAX_REQUESTS_PER_IP_PER_DAY) {
    return false;
  }
  // TTL de 26h: suficiente para cubrir el día completo con margen, y se autolimpia solo
  await kv.put(key, String(current + 1), { expirationTtl: 26 * 60 * 60 });
  return true;
}

// ---------- Prompt del sistema: identificación ----------

function buildIdentifyPrompt() {
  const listado = ESPECIES_COMPACTAS.map(e =>
    `- id:"${e.id}" | ${e.nombre_comun} (${e.nombre_cientifico}, ${e.familia}) — ${e.rasgos}. Confundible con: ${e.confundible_con.join(', ')}.`
  ).join('\n');

  return `Eres el módulo de identificación de especies de AlaViva, una guía de primeros auxilios para aves silvestres caídas en España.

Tu única tarea: mirar la foto y devolver los candidatos de especie MÁS PROBABLES, anclados a esta lista verificada. NUNCA inventes una especie fuera de esta lista salvo que estés muy seguro de que ninguna encaja, en cuyo caso dilo explícitamente.

Lista de especies verificadas (usa el "id" exacto tal cual aparece):
${listado}

Reglas estrictas:
1. Devuelve SIEMPRE entre 1 y 3 candidatos, nunca uno solo si hay ambigüedad real.
2. Cada candidato lleva una confianza aproximada (alta / media / baja), nunca finjas certeza al 100%.
3. Si la imagen no muestra un ave con claridad, o no se parece a ninguna especie de la lista, dilo honestamente en el campo "aviso" y deja "candidatos" vacío.
4. Responde ÚNICAMENTE con JSON válido, sin texto antes ni después, con este formato exacto:
{
  "candidatos": [
    { "id": "id-de-la-lista", "confianza": "alta|media|baja", "razon": "una frase breve de por qué" }
  ],
  "aviso": "texto opcional si hay algo importante que decir (imagen poco clara, no es un ave, etc.), o cadena vacía si no aplica"
}`;
}

// ---------- Prompt del sistema: chat ----------

function buildChatPrompt(especieContexto) {
  let contexto = '';
  if (especieContexto) {
    const e = ESPECIES_COMPACTAS.find(x => x.id === especieContexto);
    if (e) {
      contexto = `\n\nEl usuario está consultando sobre esta ave concreta: ${e.nombre_comun} (${e.nombre_cientifico}). Rasgos: ${e.rasgos}. Desarrollo de las crías: ${e.desarrollo || 'desconocido'}.`;
    }
  }

  return `Eres el asistente de chat de AlaViva, una guía española de primeros auxilios para aves silvestres caídas o heridas.

Tu ámbito es ESTRICTAMENTE: identificación de aves, primeros auxilios, alimentación de urgencia, y derivación a centros de recuperación (CRAS). Si te preguntan por cualquier otro tema, redirige amablemente al ámbito de la web y no respondas la pregunta fuera de tema.

Reglas que no puedes romper nunca:
- NUNCA sugieras que alguien se quede con un ave silvestre como mascota. En España la tenencia de fauna silvestre sin autorización está regulada por ley; tu recomendación por defecto en casos dudosos es siempre contactar con un CRAS.
- NUNCA recomiendes medicamentos humanos, dosis, ni tratamientos veterinarios.
- NUNCA minimices heridas graves, sangrado, fracturas o inconsciencia — ante eso, indica derivar de inmediato a un CRAS.
- Antes de recomendar rescatar a una cría, comprueba si es un volantón (con plumas, saltando, piden comida) o una cría de especie nidífuga: en esos casos lo habitual es DEJARLA donde está y observar de lejos; los padres la siguen cuidando. Solo si está herida, expuesta a un peligro inmediato, empapada/fría o sin plumas y sin nido accesible, recomienda un CRAS.
- Si no estás segura de algo, dilo explícitamente en vez de inventar una respuesta con apariencia de certeza.
- Sé breve y clara, en español, con un tono cálido pero directo — la persona puede estar con el ave en la mano mientras te escribe.${contexto}`;
}

// ---------- Llamada a Gemini ----------

async function callGemini(apiKey, systemPrompt, userParts) {
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: userParts }],
    generationConfig: {
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingLevel: 'minimal' }
    }
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini respondió ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini no devolvió texto en la respuesta.');
  return text;
}

// ---------- Ruta: /api/identify ----------

async function handleIdentify(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'JSON inválido en la petición.' }, 400, origin);
  }

  const { image_base64, mime_type } = body;
  if (!image_base64 || !mime_type) {
    return jsonResponse({ error: 'Faltan image_base64 o mime_type.' }, 400, origin);
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime_type)) {
    return jsonResponse({ error: 'Formato de imagen no soportado. Usa JPEG, PNG o WebP.' }, 400, origin);
  }
  // El base64 pesa ~1.37x el binario original; comprobamos con margen
  const approxBytes = image_base64.length * 0.75;
  if (approxBytes > LIMITS.MAX_IMAGE_BYTES) {
    return jsonResponse({ error: 'La imagen pesa demasiado. Máximo 6 MB.' }, 400, origin);
  }

  try {
    const systemPrompt = buildIdentifyPrompt();
    const userParts = [
      { text: 'Identifica el ave de esta foto siguiendo tus instrucciones.' },
      { inline_data: { mime_type, data: image_base64 } }
    ];
    const rawText = await callGemini(env.GEMINI_API_KEY, systemPrompt, userParts);

    const cleaned = rawText.replace(/```json|```/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return jsonResponse({ error: 'La IA no devolvió un formato válido. Inténtalo de nuevo.' }, 502, origin);
    }

    // Anclamos: solo aceptamos ids que de verdad existen en nuestra base de datos
    const idsValidos = new Set(ESPECIES_COMPACTAS.map(e => e.id));
    const candidatosValidos = (parsed.candidatos || []).filter(c => idsValidos.has(c.id));

    return jsonResponse({
      candidatos: candidatosValidos,
      aviso: parsed.aviso || ''
    }, 200, origin);
  } catch (err) {
    return jsonResponse({ error: 'Error al procesar la imagen: ' + err.message }, 502, origin);
  }
}

// ---------- Ruta: /api/chat ----------

async function handleChat(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'JSON inválido en la petición.' }, 400, origin);
  }

  const { message, history, especie_id } = body;
  if (!message || typeof message !== 'string') {
    return jsonResponse({ error: 'Falta el mensaje.' }, 400, origin);
  }
  if (message.length > LIMITS.MAX_CHAT_MESSAGE_CHARS) {
    return jsonResponse({ error: `El mensaje es demasiado largo (máximo ${LIMITS.MAX_CHAT_MESSAGE_CHARS} caracteres).` }, 400, origin);
  }

  const safeHistory = Array.isArray(history) ? history.slice(-LIMITS.MAX_CHAT_HISTORY_MESSAGES) : [];

  try {
    const systemPrompt = buildChatPrompt(especie_id);

    const contents = safeHistory.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.text || '').slice(0, LIMITS.MAX_CHAT_MESSAGE_CHARS) }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const geminiBody = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        maxOutputTokens: 1024,
        thinkingConfig: { thinkingLevel: 'low' }
      }
    };

    const res = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini respondió ${res.status}: ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No he podido generar una respuesta, inténtalo de nuevo.';

    return jsonResponse({ reply }, 200, origin);
  } catch (err) {
    return jsonResponse({ error: 'Error en el chat: ' + err.message }, 502, origin);
  }
}

// ---------- Enrutador principal ----------

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (!ALLOWED_ORIGINS.includes(origin)) {
      return jsonResponse({ error: 'Origen no permitido.' }, 403, origin);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Método no soportado.' }, 405, origin);
    }

    // Rate limiting por IP, compartido entre las dos rutas
    const ip = request.headers.get('CF-Connecting-IP') || 'desconocida';
    const dentroDelLimite = await checkAndIncrementRateLimit(env.RATE_LIMIT_KV, ip);
    if (!dentroDelLimite) {
      return jsonResponse({ error: 'Se ha alcanzado el límite diario de peticiones. Inténtalo mañana.' }, 429, origin);
    }

    if (url.pathname === '/api/identify') {
      return handleIdentify(request, env, origin);
    }
    if (url.pathname === '/api/chat') {
      return handleChat(request, env, origin);
    }

    return jsonResponse({ error: 'Ruta no encontrada.' }, 404, origin);
  }
};
