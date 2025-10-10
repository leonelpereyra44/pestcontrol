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
        const clienteValue = document.getElementById('clienteId')?.value;
        const plantaValue = document.getElementById('plantaId')?.value;
        const tecnicoValue = document.getElementById('tecnicoId')?.value;
        const fechaValue = document.getElementById('fechaControl')?.value;
        const tipoValue = document.getElementById('tipoControl')?.value;
        const observacionesValue = document.querySelector('textarea[placeholder*="observaciones"]')?.value || '';
        
        console.log('📋 Recopilando datos del formulario:', {
            clienteValue,
            plantaValue,
            tecnicoValue,
            fechaValue,
            tipoValue,
            observacionesValue
        });
        
        // NOTA: No usar parseInt() porque son UUIDs, no integers
        const formData = {
            cliente_id: clienteValue,
            planta_id: plantaValue || null,
            tecnico_id: tecnicoValue,
            fecha_control: fechaValue,
            tipo_control: tipoValue,
            observaciones: observacionesValue
        };
        
        console.log('✅ Datos recopilados (UUIDs preservados):', formData);
        
        return formData;
    }

    /**
     * Actualizar control existente con productos y puntos
     */
    async actualizar(controlId, formData, productos, puntos, selloUrl) {
        try {
            console.log('💾 Iniciando actualización de control...');
            console.log('📋 Control ID:', controlId);
            console.log('📋 Datos del formulario:', formData);
            console.log('🧪 Productos:', productos.length);
            console.log('📍 Puntos:', puntos.length);
            console.log('🔖 Sello:', selloUrl);
            
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
            
            console.log('📝 Actualizando control...');
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
            
            console.log('✅ Control actualizado');
            
            // 2. Eliminar productos y puntos existentes
            console.log('🗑️ Eliminando productos y puntos existentes...');
            
            const { error: deleteProdError } = await this.supabase
                .from('control_productos')
                .delete()
                .eq('control_id', controlId);
            
            if (deleteProdError) {
                console.error('❌ Error eliminando productos:', deleteProdError);
                throw deleteProdError;
            }
            
            const { error: deletePuntosError } = await this.supabase
                .from('control_puntos')
                .delete()
                .eq('control_id', controlId);
            
            if (deletePuntosError) {
                console.error('❌ Error eliminando puntos:', deletePuntosError);
                throw deletePuntosError;
            }
            
            console.log('✅ Productos y puntos eliminados');
            
            // 3. Insertar nuevos productos si hay
            if (productos.length > 0) {
                console.log('📦 Guardando productos...');
                
                const productosConId = productos.map(p => ({
                    ...p,
                    control_id: controlId
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
            
            // 4. Insertar nuevos puntos si hay
            if (puntos.length > 0) {
                console.log('📍 Guardando puntos de control...');
                
                const puntosConId = puntos.map(p => ({
                    ...p,
                    control_id: controlId
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
            
            console.log('🎉 Control actualizado exitosamente');
            return control;
            
        } catch (error) {
            console.error('❌ Error en actualizarControl:', error);
            throw error;
        }
    }
}

// Exportar para uso global
window.ControlManager = ControlManager;
