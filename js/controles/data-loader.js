/**
 * Módulo para cargar datos desde Supabase
 */

class DataLoader {
    constructor(supabaseClient, workerProfile) {
        this.supabase = supabaseClient;
        this.worker = workerProfile;
    }

    /**
     * Cargar clientes de la empresa
     */
    async cargarClientes() {
        try {
            console.log('📋 Cargando clientes...');
            
            const { data, error } = await this.supabase
                .from('clientes')
                .select('cliente_id, nombre')
                .eq('empresa_id', this.worker.empresa_id)
                .order('nombre');
            
            if (error) throw error;
            
            console.log(`✅ ${data.length} clientes cargados`);
            return data;
            
        } catch (error) {
            console.error('❌ Error cargando clientes:', error);
            throw error;
        }
    }

    /**
     * Cargar plantas de un cliente específico
     */
    async cargarPlantas(clienteId) {
        try {
            console.log('🏭 Cargando plantas del cliente:', clienteId);
            
            const { data, error } = await this.supabase
                .from('plantas')
                .select('planta_id, nombre')
                .eq('cliente_id', clienteId)
                .order('nombre');
            
            if (error) throw error;
            
            console.log(`✅ ${data.length} plantas cargadas`);
            return data;
            
        } catch (error) {
            console.error('❌ Error cargando plantas:', error);
            throw error;
        }
    }

    /**
     * Cargar técnicos de la empresa
     */
    async cargarTecnicos() {
        try {
            console.log('👷 Cargando técnicos...');
            
            const { data, error } = await this.supabase
                .from('worker')
                .select('worker_id, nombre, puesto')
                .eq('empresa_id', this.worker.empresa_id)
                .order('nombre');
            
            if (error) throw error;
            
            console.log(`✅ ${data.length} técnicos cargados`);
            return data;
            
        } catch (error) {
            console.error('❌ Error cargando técnicos:', error);
            throw error;
        }
    }

    /**
     * Cargar productos activos de la empresa
     */
    async cargarProductos() {
        try {
            console.log('🧪 Cargando productos...');
            
            const { data, error } = await this.supabase
                .from('productos')
                .select('producto_id, nombre, tipo_producto, principio_activo, laboratorio, certificado, unidad_medida')
                .eq('empresa_id', this.worker.empresa_id)
                .order('tipo_producto, nombre');
            
            if (error) throw error;
            
            console.log(`✅ ${data.length} productos cargados`);
            return data;
            
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            throw error;
        }
    }
}

// Exportar para uso global
window.DataLoader = DataLoader;
