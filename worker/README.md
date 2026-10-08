# AlaViva API — despliegue

## 1. Requisitos
- Cuenta gratuita en [Cloudflare](https://dash.cloudflare.com) (Workers)
- API key gratuita en [Google AI Studio](https://aistudio.google.com/apikey)
- Node.js instalado en tu ordenador

## 2. Instalar Wrangler (CLI de Cloudflare)
```
npm install -g wrangler
wrangler login
```
Se abrirá el navegador para autorizar tu cuenta.

## 3. Crear el namespace de KV (para el rate limiting)
```
wrangler kv namespace create RATE_LIMIT_KV
```
Copia el `id` que te devuelve y pégalo en `wrangler.toml`, sustituyendo `PON_AQUI_TU_ID_DE_KV`.

## 4. Subir tu API key como secreto (nunca en el código)
```
cd worker
wrangler secret put GEMINI_API_KEY
```
Pega tu clave de Google AI Studio cuando te la pida.

## 5. Desplegar
```
wrangler deploy
```
Te dará una URL tipo `https://alaviva-api.TU-USUARIO.workers.dev` — esa es la que hay que poner en `identificar.html` y `chat.html` (busca `WORKER_URL` en ambos archivos).

## 6. Ajustar el origen permitido
En `src/index.js`, `ALLOWED_ORIGINS` ya incluye `https://alaviva.pages.dev`. Si cambias de dominio, actualízalo ahí.

## Coste esperado
Con el límite de 40 peticiones/IP/día y un grupo de pocos usuarios: 0€, dentro de las cuotas gratuitas de Cloudflare Workers y Gemini Flash.
