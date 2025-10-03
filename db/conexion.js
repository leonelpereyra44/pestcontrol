// Configuración de Supabase
const SUPABASE_CONFIG = {
  url: "https://rrgxvwttarkcxqfekfeb.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZ3h2d3R0YXJrY3hxZmVrZmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTE1MjUsImV4cCI6MjA3NDkyNzUyNX0.xYEQV8ZkW9h99psdqTU2XpGicDGHs7q6M8V7lq35ryQ"
}

// Función para crear cliente de Supabase (requiere que se incluya la librería primero)
function createSupabaseClient() {
  if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded. Please include the Supabase CDN script.')
    return null
  }
  
  return supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
}

// Exportar configuración para uso global
if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG
  window.createSupabaseClient = createSupabaseClient
  
  // Crear cliente automáticamente cuando el script se carga
  window.supabaseClient = createSupabaseClient()
  console.log('✅ Supabase client inicializado')
}

// Para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_CONFIG, createSupabaseClient }
}