// scripts/generate-env.js
// Lê o arquivo .env (na raiz do projeto) e gera env-config.js para uso no browser
// Uso: node scripts/generate-env.js

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const outPath = path.join(root, 'env-config.js');

function parseEnv(content) {
  const lines = content.split(/\r?\n/);
  const obj = {};
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.substring(0, eq).trim();
    let val = line.substring(eq + 1).trim();
    // Remove optional surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    obj[key] = val;
  }
  return obj;
}

// Primeiro, tente ler .env local. Se não existir, usaremos process.env (útil em CI/CD como Vercel).
let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  env = parseEnv(envContent);
} else {
  console.warn('.env não encontrado; lendo variáveis do process.env (útil em deploys como Vercel)');
  // mapear apenas as chaves que nos interessam
  const keys = ['API_BASE_URL', 'CHATBASE_API_KEY', 'CHATBASE_CHATBOT_ID', 'CHATBASE_URL'];
  keys.forEach(k => {
    if (process.env[k]) env[k] = process.env[k];
  });
}

// Mantemos apenas valores string no objeto, na ordem desejada
const safeEnv = {};
['API_BASE_URL', 'CHATBASE_API_KEY', 'CHATBASE_CHATBOT_ID', 'CHATBASE_URL'].forEach(k => {
  if (env[k] !== undefined) safeEnv[k] = String(env[k]);
});

const out = `// Arquivo gerado automaticamente pelo scripts/generate-env.js\n` +
            `// Não editar manualmente - execute \"node scripts/generate-env.js\" para regenerar\n\n` +
            `window.__ENV__ = ${JSON.stringify(safeEnv, null, 2)};\n`;

fs.writeFileSync(outPath, out, 'utf8');
console.log('Gerado:', outPath);
