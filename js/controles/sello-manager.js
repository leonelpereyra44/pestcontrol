/**
 * Módulo para cargar y mostrar sellos de técnicos desde Supabase Storage
 */

class SelloManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.selloUrl = null;
    }

    /**
     * Cargar sello del técnico desde storage
     * @param {string} tecnicoId - ID del técnico
     * @returns {Promise<string|null>} - Ruta del sello o null si no existe
     */
    async cargarSello(tecnicoId) {
        try {
            console.log('🔍 Cargando sello del técnico:', tecnicoId);
            
            if (!tecnicoId) {
                this.mostrarPlaceholder('Seleccione un técnico');
                return null;
            }

            // Listar archivos en: workers/{worker_id}/sello/
            const selloFolder = `${tecnicoId}/sello`;
            console.log(`� Buscando en: bucket='workers', carpeta='${selloFolder}'`);
            
            const { data: files, error: listError } = await this.supabase.storage
                .from('workers')
                .list(selloFolder);
            
            if (listError) {
                console.error('❌ Error listando archivos:', listError);
                this.mostrarError('Error al buscar sello en storage');
                return null;
            }
            
            console.log('📁 Archivos encontrados:', files);
            
            if (!files || files.length === 0) {
                console.warn('⚠️ No se encontró sello para este técnico');
                this.mostrarError('Este técnico no tiene sello cargado');
                return null;
            }
            
            // Usar el primer archivo encontrado
            const selloPath = `${tecnicoId}/sello/${files[0].name}`;
            console.log('🎯 Ruta del sello:', selloPath);
            
            // Obtener URL firmada (válida por 1 hora)
            const { data: urlData, error: urlError } = await this.supabase.storage
                .from('workers')
                .createSignedUrl(selloPath, 3600); // 1 hora de validez
            
            if (urlError) {
                console.error('❌ Error generando URL firmada:', urlError);
                this.mostrarError('Error al generar URL del sello');
                return null;
            }
            
            console.log('🌐 URL firmada generada:', urlData.signedUrl);
            
            // Guardar ruta para uso posterior
            this.selloUrl = selloPath;
            
            // Mostrar imagen
            this.mostrarImagen(urlData.signedUrl);
            
            console.log('✅ Sello cargado exitosamente');
            return selloPath;
            
        } catch (error) {
            console.error('❌ Error cargando sello:', error);
            this.mostrarError('Error inesperado al cargar sello');
            return null;
        }
    }

    /**
     * Mostrar la imagen del sello en el DOM
     */
    mostrarImagen(url) {
        console.log('🖼️ mostrarImagen() llamado con URL:', url);
        
        // Actualizar en el paso 5 (final)
        const img = document.getElementById('selloTecnicoImg');
        const placeholder = document.getElementById('selloTecnicoPlaceholder');
        
        console.log('🔍 Elementos encontrados:', {
            img: img ? 'SÍ' : 'NO',
            placeholder: placeholder ? 'SÍ' : 'NO'
        });
        
        if (img && placeholder) {
            img.src = url;
            img.style.display = 'block';
            img.classList.remove('hidden'); // Remover clase hidden
            placeholder.style.display = 'none';
            console.log('✅ Imagen del sello actualizada en paso 5');
            console.log('📸 URL de la imagen:', img.src);
            console.log('🎨 Display de imagen:', img.style.display);
            console.log('🎨 Classes de imagen:', img.className);
        } else {
            console.warn('⚠️ No se encontraron elementos del sello en paso 5');
        }
        
        // Actualizar preview en el paso 1
        const previewImg = document.getElementById('selloPreviewImg');
        const previewPlaceholder = document.getElementById('selloPreviewPlaceholder');
        const previewContainer = document.getElementById('selloPreviewContainer');
        
        console.log('🔍 Elementos preview encontrados:', {
            previewImg: previewImg ? 'SÍ' : 'NO',
            previewPlaceholder: previewPlaceholder ? 'SÍ' : 'NO',
            previewContainer: previewContainer ? 'SÍ' : 'NO'
        });
        
        if (previewImg && previewPlaceholder && previewContainer) {
            previewImg.src = url;
            previewImg.style.display = 'block';
            previewImg.classList.remove('hidden');
            previewPlaceholder.style.display = 'none';
            previewContainer.style.display = 'block';
            console.log('✅ Preview del sello actualizado en paso 1');
        } else {
            console.warn('⚠️ No se encontraron elementos del preview del sello');
        }
    }

    /**
     * Mostrar placeholder cuando no hay sello seleccionado
     */
    mostrarPlaceholder(mensaje) {
        const img = document.getElementById('selloTecnicoImg');
        const placeholder = document.getElementById('selloTecnicoPlaceholder');
        
        if (img) {
            img.style.display = 'none';
            img.src = '';
        }
        
        if (placeholder) {
            placeholder.style.display = 'block';
            placeholder.innerHTML = `<p style="color: #666;">👤 ${mensaje}</p>`;
        }
        
        this.selloUrl = null;
    }

    /**
     * Mostrar mensaje de error
     */
    mostrarError(mensaje) {
        const placeholder = document.getElementById('selloTecnicoPlaceholder');
        const img = document.getElementById('selloTecnicoImg');
        
        if (img) {
            img.style.display = 'none';
        }
        
        if (placeholder) {
            placeholder.style.display = 'block';
            placeholder.innerHTML = `
                <div>
                    <p style="color: #dc3545;">⚠️ ${mensaje}</p>
                    <small style="color: #666;">Los sellos se suben desde la gestión de usuarios</small>
                </div>
            `;
        }
        
        this.selloUrl = null;
    }

    /**
     * Limpiar sello
     */
    limpiar() {
        this.mostrarPlaceholder('Seleccione un técnico para ver su sello');
        
        // Ocultar preview del paso 1
        const previewContainer = document.getElementById('selloPreviewContainer');
        if (previewContainer) {
            previewContainer.style.display = 'none';
        }
    }

    /**
     * Obtener la ruta del sello actual
     */
    getSelloUrl() {
        return this.selloUrl;
    }
}

// Exportar para uso global
window.SelloManager = SelloManager;
