// Funciones auxiliares para manejo multi-tenant
class MultiTenantManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient
  }

  // Obtener información completa del worker actual
  async getCurrentWorkerInfo() {
    try {
      const { data, error } = await this.supabase
        .from('current_worker_info')
        .select('*')
        .single()

      if (error) {
        console.error('Error obteniendo info del worker:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error obteniendo info del worker:', error)
      return null
    }
  }

  // Obtener todos los clientes de la empresa del usuario
  async getCompanyClients() {
    try {
      const { data, error } = await this.supabase
        .from('clientes')
        .select('*')
        .order('nombre')

      if (error) {
        console.error('Error obteniendo clientes:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error obteniendo clientes:', error)
      return []
    }
  }

  // Obtener todas las plantas de la empresa del usuario
  async getCompanyPlantas() {
    try {
      const { data, error } = await this.supabase
        .from('plantas')
        .select(`
          *,
          cliente:cliente_id (
            cliente_id,
            nombre
          )
        `)
        .order('nombre')

      if (error) {
        console.error('Error obteniendo plantas:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error obteniendo plantas:', error)
      return []
    }
  }

  // Obtener controles de la empresa del usuario
  async getCompanyControles(limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('controles')
        .select(`
          *,
          worker:worker_id (
            worker_id,
            nombre
          ),
          planta:planta_id (
            planta_id,
            nombre,
            cliente:cliente_id (
              cliente_id,
              nombre
            )
          )
        `)
        .order('fecha', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error obteniendo controles:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error obteniendo controles:', error)
      return []
    }
  }

  // Crear un nuevo cliente (solo para la empresa del usuario)
  async createClient(clientData) {
    try {
      const { data, error } = await this.supabase
        .from('clientes')
        .insert(clientData)
        .select()
        .single()

      if (error) {
        console.error('Error creando cliente:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error creando cliente:', error)
      return { success: false, error: error.message }
    }
  }

  // Crear una nueva planta
  async createPlanta(plantaData) {
    try {
      const { data, error } = await this.supabase
        .from('plantas')
        .insert(plantaData)
        .select()
        .single()

      if (error) {
        console.error('Error creando planta:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error creando planta:', error)
      return { success: false, error: error.message }
    }
  }

  // Crear un nuevo control
  async createControl(controlData) {
    try {
      // Asegurar que el worker_id sea el usuario actual
      const user = await this.supabase.auth.getUser()
      if (!user.data.user) {
        return { success: false, error: 'Usuario no autenticado' }
      }

      controlData.worker_id = user.data.user.id

      const { data, error } = await this.supabase
        .from('controles')
        .insert(controlData)
        .select()
        .single()

      if (error) {
        console.error('Error creando control:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error creando control:', error)
      return { success: false, error: error.message }
    }
  }

  // Obtener estadísticas de la empresa
  async getCompanyStats() {
    try {
      const [clientes, plantas, controles] = await Promise.all([
        this.getCompanyClientes(),
        this.getCompanyPlantas(),
        this.getCompanyControles(1000) // Obtener más para estadísticas
      ])

      // Calcular estadísticas
      const stats = {
        totalClientes: clientes.length,
        totalPlantas: plantas.length,
        totalControles: controles.length,
        controlesEsteMes: controles.filter(c => {
          const fecha = new Date(c.fecha)
          const ahora = new Date()
          return fecha.getMonth() === ahora.getMonth() && 
                 fecha.getFullYear() === ahora.getFullYear()
        }).length,
        ultimosControles: controles.slice(0, 5) // Últimos 5 controles
      }

      return stats
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return {
        totalClientes: 0,
        totalPlantas: 0,
        totalControles: 0,
        controlesEsteMes: 0,
        ultimosControles: []
      }
    }
  }

  // Verificar si el usuario pertenece a una empresa específica
  async verifyCompanyAccess(empresaId) {
    try {
      const workerInfo = await this.getCurrentWorkerInfo()
      return workerInfo && workerInfo.empresa_id === empresaId
    } catch (error) {
      console.error('Error verificando acceso a empresa:', error)
      return false
    }
  }
}

// Crear instancia global del manager multi-tenant
let multiTenantManager = null

// Inicializar cuando esté disponible supabase
function initMultiTenant() {
  if (typeof supabaseClient !== 'undefined') {
    multiTenantManager = new MultiTenantManager(supabaseClient)
    
    // Agregar a window para acceso global
    window.multiTenant = {
      getWorkerInfo: () => multiTenantManager.getCurrentWorkerInfo(),
      getClients: () => multiTenantManager.getCompanyClients(),
      getPlantas: () => multiTenantManager.getCompanyPlantas(),
      getControles: (limit) => multiTenantManager.getCompanyControles(limit),
      createClient: (data) => multiTenantManager.createClient(data),
      createPlanta: (data) => multiTenantManager.createPlanta(data),
      createControl: (data) => multiTenantManager.createControl(data),
      getStats: () => multiTenantManager.getCompanyStats(),
      verifyAccess: (empresaId) => multiTenantManager.verifyCompanyAccess(empresaId)
    }
  }
}

// Auto-inicializar cuando se carga el script
document.addEventListener('DOMContentLoaded', () => {
  // Esperar un poco para que se cargue supabase
  setTimeout(initMultiTenant, 1000)
})

// Para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MultiTenantManager }
}