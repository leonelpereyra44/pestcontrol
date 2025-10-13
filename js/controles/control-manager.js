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
            
            const { data: control, error: controlError } = await this.supabase
                .from('controles')
                .insert([controlData])
                .select()
                .single();
            
            if (controlError) {
                console.error('❌ Error creando control:', controlError);
                throw controlError;
            }
            
            // 2. Guardar productos si hay
            if (productos.length > 0) {
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
            }
            
            // 3. Guardar puntos si hay
            if (puntos.length > 0) {
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
            }
            
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
        const clienteValue = document.getElementById('clienteId')?.value;
        const plantaValue = document.getElementById('plantaId')?.value;
        const tecnicoValue = document.getElementById('tecnicoId')?.value;
        const fechaValue = document.getElementById('fechaControl')?.value;
        const tipoValue = document.getElementById('tipoControl')?.value;
        const observacionesValue = document.querySelector('textarea[placeholder*="observaciones"]')?.value || '';
        
        // NOTA: No usar parseInt() porque son UUIDs, no integers
        return {
            cliente_id: clienteValue,
            planta_id: plantaValue || null,
            tecnico_id: tecnicoValue,
            fecha_control: fechaValue,
            tipo_control: tipoValue,
            observaciones: observacionesValue
        };
    }

    /**
     * Actualizar control existente con productos y puntos
     */
    async actualizar(controlId, formData, productos, puntos, selloUrl) {
        try {
            // Validar datos obligatorios
            if (!formData.cliente_id || !formData.tecnico_id) {
                throw new Error('Faltan datos obligatorios');
            }
            
            // 1. Actualizar control principal
            const controlData = {
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
            
            const { data: control, error: controlError } = await this.supabase
                .from('controles')
                .update(controlData)
                .eq('control_id', controlId)
                .select()
                .single();
            
            if (controlError) {
                console.error('❌ Error actualizando control:', controlError);
                throw controlError;
            }
            
            // 2. Eliminar productos y puntos existentes
            const { data: deletedProds, error: deleteProdError } = await this.supabase
                .from('control_productos')
                .delete()
                .eq('control_id', controlId)
                .select();
            
            if (deleteProdError) {
                console.error('❌ Error eliminando productos:', deleteProdError);
                throw deleteProdError;
            }
            
            const { data: deletedPuntos, error: deletePuntosError } = await this.supabase
                .from('control_puntos')
                .delete()
                .eq('control_id', controlId)
                .select();
            
            if (deletePuntosError) {
                console.error('❌ Error eliminando puntos:', deletePuntosError);
                throw deletePuntosError;
            }
            
            // 3. Insertar nuevos productos si hay
            if (productos.length > 0) {
                // Excluir explícitamente el campo 'id' para evitar duplicados
                const productosConId = productos.map(p => ({
                    control_id: controlId,
                    producto_id: p.producto_id,
                    cantidad_usada: p.cantidad_usada || p.cantidad,
                    unidad: p.unidad
                }));
                
                const { error: prodError } = await this.supabase
                    .from('control_productos')
                    .insert(productosConId);
                
                if (prodError) {
                    console.error('❌ Error guardando productos:', prodError);
                    throw prodError;
                }
            }
            
            // 4. Insertar nuevos puntos si hay
            if (puntos.length > 0) {
                // Excluir explícitamente el campo 'id' para evitar duplicados
                const puntosConId = puntos.map(p => ({
                    control_id: controlId,
                    numero_punto: p.numero_punto,
                    tipo_plaga: p.tipo_plaga,
                    tipo_dispositivo: p.tipo_dispositivo,
                    ubicacion: p.ubicacion,
                    estado: p.estado,
                    actividad_detectada: p.actividad_detectada,
                    descripcion_actividad: p.descripcion_actividad,
                    accion_realizada: p.accion_realizada
                }));
                
                const { error: puntosError } = await this.supabase
                    .from('control_puntos')
                    .insert(puntosConId);
                
                if (puntosError) {
                    console.error('❌ Error guardando puntos:', puntosError);
                    throw puntosError;
                }
            }
            
            return control;
            
        } catch (error) {
            console.error('❌ Error actualizando control:', error);
            throw error;
        }
    }
}

// Exportar para uso global
window.ControlManager = ControlManager;
