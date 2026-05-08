#!/usr/bin/env node
// Zero-dependency CLI for generating/editing images via Google's Gemini 2.5 Flash Image
// (Nano Banana). Designed to be invoked from the article-thumbnail Claude Code skill.
//
// Usage (generate from prompt + reference images):
//   node generate.js --prompt="..." --refs="path1.png,path2.png" --output=out.png
//
// Usage (edit an existing image):
//   node generate.js --input=src.png --prompt="..." --output=out.png
//
// Optional: override the model with --model=<id> or GEMINI_IMAGE_MODEL env var.
// Default is gemini-2.5-flash-image. See https://ai.google.dev/gemini-api/docs/pricing
// for available models and prices.
//
// API key: read from process.env.GOOGLE_AI_API_KEY (set in shell), falling back to
// a `.env` file in the current working directory.
//
// Requires Node.js 18+ (uses native fetch).

import fs from 'node:fs';
import path from 'node:path';

// ---- Load .env from cwd if present ----
const envFile = path.join(process.cwd(), '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z_0-9]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

// ---- Parse args ----
const args = process.argv.slice(2);
const arg = (name) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : undefined;
};

const prompt = arg('prompt');
const refsArg = arg('refs');
const input = arg('input');
const output = arg('output');

if (!prompt) { console.error('Error: --prompt is required'); process.exit(1); }
if (!output) { console.error('Error: --output is required'); process.exit(1); }
if (!process.env.GOOGLE_AI_API_KEY) {
  console.error('Error: GOOGLE_AI_API_KEY is not set.');
  console.error('       Add it to .env in the current directory (GOOGLE_AI_API_KEY=...)');
  console.error('       or export it in your shell rc file.');
  process.exit(1);
}

// ---- Build request parts ----
function loadImage(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: image not found: ${filePath}`);
    process.exit(1);
  }
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  return { inlineData: { mimeType, data: buf.toString('base64') } };
}

const refs = refsArg ? refsArg.split(',').map(s => s.trim()).filter(Boolean) : [];
const parts = [{ text: prompt }];
if (input) parts.push(loadImage(input));
for (const r of refs) parts.push(loadImage(r));

// ---- Call Gemini ----
// Model can be overridden via the GEMINI_IMAGE_MODEL env var or the --model arg.
// See https://ai.google.dev/gemini-api/docs/pricing for available image models.
// Compatible Gemini-family image models (use the generateContent endpoint):
//   - gemini-2.5-flash-image          (default; ~$0.04/image)
//   - gemini-3.1-flash-image-preview  (newer; ~$0.045-0.067/image)
//   - gemini-3-pro-image-preview      (highest quality; ~$0.13-0.24/image)
const model = arg('model') || process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GOOGLE_AI_API_KEY)}`;

let response, json;
try {
  response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts }] }),
  });
  json = await response.json();
} catch (e) {
  console.error('Error: network call to Gemini failed:', e.message);
  process.exit(1);
}

if (!response.ok) {
  console.error(`Error: Gemini API ${response.status}:`, json?.error?.message || JSON.stringify(json));
  process.exit(1);
}

const respParts = json.candidates?.[0]?.content?.parts || [];
const imgPart = respParts.find(p => p.inlineData?.data);
if (!imgPart) {
  const txt = respParts.filter(p => p.text).map(p => p.text).join(' | ');
  console.error('Error: Gemini returned no image. Text response:', txt || '(empty)');
  process.exit(1);
}

// ---- Save ----
fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
fs.writeFileSync(output, Buffer.from(imgPart.inlineData.data, 'base64'));
console.log('OK:', output);
