/**
 * Módulo para guardar control en la base de datos
 */

class ControlManager {
    constructor(supabaseClient, workerProfile) {
        this.supabase = supabaseClient;
        this.worker = workerProfile;
    }

    /**
     * Guardar control completo con productos y puntos
     */
    async guardar(formData, productos, puntos, selloUrl) {
        try {
            console.log('💾 Iniciando guardado de control...');
            console.log('📋 Datos del formulario:', formData);
            console.log('🧪 Productos:', productos.length);
            console.log('📍 Puntos:', puntos.length);
            console.log('🔖 Sello:', selloUrl);
            
            // Validar datos obligatorios
            if (!formData.cliente_id || !formData.tecnico_id) {
                throw new Error('Faltan datos obligatorios');
            }
            
            // 1. Crear control principal
            const controlData = {
                empresa_id: this.worker.empresa_id,
                cliente_id: formData.cliente_id,
                planta_id: formData.planta_id || null,
                tecnico_id: formData.tecnico_id,
                fecha_control: formData.fecha_control,
                tipo_control: formData.tipo_control,
                observaciones: formData.observaciones || null,
                firma_tecnico: selloUrl,
                estado: 'completado',
                completed_at: new Date().toISOString()
            };
            
            console.log('📝 Insertando control...');
            const { data: control, error: controlError } = await this.supabase
                .from('controles')
                .insert([controlData])
                .select()
                .single();
            
            if (controlError) {
                console.error('❌ Error creando control:', controlError);
                throw controlError;
            }
            
            console.log('✅ Control creado con ID:', control.control_id);
            
            // 2. Guardar productos si hay
            if (productos.length > 0) {
                console.log('📦 Guardando productos...');
                
                // Asignar el control_id real a cada producto
                const productosConId = productos.map(p => ({
                    ...p,
                    control_id: control.control_id
                }));
                
                const { error: prodError } = await this.supabase
                    .from('control_productos')
                    .insert(productosConId);
                
                if (prodError) {
                    console.error('❌ Error guardando productos:', prodError);
                    throw prodError;
                }
                
                console.log(`✅ ${productos.length} productos guardados`);
            }
            
            // 3. Guardar puntos si hay
            if (puntos.length > 0) {
                console.log('📍 Guardando puntos de control...');
                
                // Asignar el control_id real a cada punto
                const puntosConId = puntos.map(p => ({
                    ...p,
                    control_id: control.control_id
                }));
                
                const { error: puntosError } = await this.supabase
                    .from('control_puntos')
                    .insert(puntosConId);
                
                if (puntosError) {
                    console.error('❌ Error guardando puntos:', puntosError);
                    throw puntosError;
                }
                
                console.log(`✅ ${puntos.length} puntos guardados`);
            }
            
            console.log('🎉 Control guardado exitosamente');
            return control;
            
        } catch (error) {
            console.error('❌ Error en guardarControl:', error);
            throw error;
        }
    }

    /**
     * Recopilar datos del formulario
     */
    recopilarDatosFormulario() {
        return {
            cliente_id: document.getElementById('clienteId')?.value,
            planta_id: document.getElementById('plantaId')?.value || null,
            tecnico_id: document.getElementById('tecnicoId')?.value,
            fecha_control: document.getElementById('fechaControl')?.value,
            tipo_control: document.getElementById('tipoControl')?.value,
            observaciones: document.getElementById('observaciones')?.value || null
        };
    }
}

// Exportar para uso global
window.ControlManager = ControlManager;
