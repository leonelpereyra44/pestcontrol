import { writeFile } from 'node:fs/promises';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing env SUPABASE_URL / SUPABASE_ANON_KEY');
}

const content = `window.APP_CONFIG = {
  SUPABASE_URL: ${JSON.stringify(SUPABASE_URL)},
  SUPABASE_ANON_KEY: ${JSON.stringify(SUPABASE_ANON_KEY)}
};\n`;

await writeFile('ts/config.js', content, 'utf8');
console.log('✅ ts/config.js generado');
