// Configuración de Supabase
const SUPABASE_URL = "https://rrgxvwttarkcxqfekfeb.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZ3h2d3R0YXJrY3hxZmVrZmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTE1MjUsImV4cCI6MjA3NDkyNzUyNX0.xYEQV8ZkW9h99psdqTU2XpGicDGHs7q6M8V7lq35ryQ"

// Crear cliente de Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Exportar globalmente para que otras páginas puedan usarlo
window.supabaseClient = supabaseClient

// Clase para manejar autenticación
class AuthManager {
  constructor() {
    this.currentUser = null
    this.init()
  }

  async init() {
    // Verificar sesión actual
    const { data } = await supabaseClient.auth.getSession()
    if (data.session) {
      this.currentUser = data.session.user
    }

    // Escuchar cambios en la autenticación
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.currentUser = session.user
        this.onSignIn(session.user)
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null
        this.onSignOut()
      }
    })
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.currentUser
  }

  // Verificar si está autenticado
  isAuthenticated() {
    return this.currentUser !== null
  }

  // Cerrar sesión
  async signOut() {
    const { error } = await supabaseClient.auth.signOut()
    if (error) {
      console.error('Error al cerrar sesión:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  }

  // Obtener información del trabajador y su empresa
  async getWorkerProfile() {
    if (!this.currentUser) return null

    try {
      // Intentar buscar por user_id primero
      let { data, error } = await supabaseClient
        .from('worker')
        .select(`
          *,
          empresa:empresa_id (
            empresa_id,
            nombre
          )
        `)
        .eq('user_id', this.currentUser.id)
        .maybeSingle()

      // Si no encuentra por user_id, buscar por email (para usuarios recién registrados)
      if (!data && this.currentUser.email) {
        console.log('🔍 No encontrado por user_id, buscando por email...')
        const { data: dataByEmail, error: errorByEmail } = await supabaseClient
          .from('worker')
          .select(`
            *,
            empresa:empresa_id (
              empresa_id,
              nombre
            )
          `)
          .eq('mail', this.currentUser.email)
          .maybeSingle()
        
        if (dataByEmail) {
          console.log('✅ Worker encontrado por email:', dataByEmail)
          
          // Vincular user_id inmediatamente si no está vinculado (en segundo plano)
          if (!dataByEmail.user_id) {
            console.log('🔗 Vinculando user_id en segundo plano...')
            supabaseClient
              .from('worker')
              .update({ user_id: this.currentUser.id })
              .eq('mail', this.currentUser.email)
              .then(({ error }) => {
                if (error) {
                  console.error('❌ Error vinculando user_id:', error)
                } else {
                  console.log('✅ User_id vinculado correctamente')
                }
              })
            
            // Actualizar el objeto localmente
            dataByEmail.user_id = this.currentUser.id
          }
          
          // Retornar los datos inmediatamente (ya tiene la empresa cargada)
          console.log('✅ Retornando perfil completo:', dataByEmail)
          return dataByEmail
        }
        
        error = errorByEmail
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error obteniendo perfil del worker:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error obteniendo perfil del worker:', error)
      return null
    }
  }

  // Obtener información del perfil del usuario (mantener para compatibilidad)
  async getUserProfile() {
    return await this.getWorkerProfile()
  }

  // Actualizar perfil del usuario
  async updateProfile(profileData) {
    if (!this.currentUser) return { success: false, error: 'No autenticado' }

    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .upsert({
          id: this.currentUser.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Redirigir si no está autenticado
  requireAuth(redirectTo = '/pages/login.html') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectTo
      return false
    }
    return true
  }

  // Redirigir si está autenticado
  redirectIfAuthenticated(redirectTo = '/index.html') {
    if (this.isAuthenticated()) {
      window.location.href = redirectTo
      return true
    }
    return false
  }

  // Callbacks para eventos de autenticación
  async onSignIn(user) {
    console.log('Usuario conectado:', user.email)
    
    // Vincular user_id al worker si aún no está vinculado
    try {
      const { data: worker, error } = await supabaseClient
        .from('worker')
        .select('worker_id, user_id, mail')
        .eq('mail', user.email)
        .maybeSingle()
      
      if (worker && !worker.user_id) {
        console.log('🔗 Vinculando user_id al worker...')
        const { error: updateError } = await supabaseClient
          .from('worker')
          .update({ user_id: user.id })
          .eq('mail', user.email)
        
        if (updateError) {
          console.error('Error vinculando user_id:', updateError)
        } else {
          console.log('✅ User_id vinculado correctamente')
        }
      }
    } catch (error) {
      console.error('Error en vinculación de user_id:', error)
    }
  }

  onSignOut() {
    console.log('Usuario desconectado')
  }
}

// Crear instancia global del administrador de autenticación
const authManager = new AuthManager()

// Funciones de utilidad globales
window.authUtils = {
  // Verificar si está autenticado
  isLoggedIn: () => authManager.isAuthenticated(),
  
  // Obtener usuario actual
  getCurrentUser: () => authManager.getCurrentUser(),
  
  // Cerrar sesión
  logout: async () => {
    const result = await authManager.signOut()
    if (result.success) {
      window.location.href = '/pages/login.html'
    }
    return result
  },
  
  // Requerir autenticación
  requireAuth: (redirectTo) => authManager.requireAuth(redirectTo),
  
  // Obtener perfil del worker
  getWorkerProfile: () => authManager.getWorkerProfile(),
  
  // Obtener perfil (alias para compatibilidad)
  getProfile: () => authManager.getUserProfile(),
  
  // Actualizar perfil
  updateProfile: (data) => authManager.updateProfile(data),
  
  // Obtener empresa del usuario actual
  getCurrentCompany: async () => {
    const profile = await authManager.getWorkerProfile()
    return profile ? profile.empresa : null
  }
}

// Función para crear botón de logout
function createLogoutButton(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  const button = document.createElement('button')
  button.textContent = 'Cerrar Sesión'
  button.style.cssText = `
    padding: 8px 16px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 10px;
  `
  
  button.onclick = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await window.authUtils.logout()
    }
  }
  
  container.appendChild(button)
}

// Función para mostrar información del usuario
async function displayUserInfo(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  const user = authManager.getCurrentUser()
  if (user) {
    const userInfo = document.createElement('div')
    userInfo.innerHTML = `
      <span>Bienvenido, ${user.email}</span>
    `
    userInfo.style.cssText = `
      padding: 8px;
      background-color: #f8f9fa;
      border-radius: 4px;
      display: inline-block;
    `
    container.appendChild(userInfo)
  }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { authManager, supabaseClient }
}