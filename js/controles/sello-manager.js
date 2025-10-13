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
            if (!tecnicoId) {
                this.mostrarPlaceholder('Seleccione un técnico');
                return null;
            }

            // Listar archivos en: workers/{worker_id}/sello/
            const selloFolder = `${tecnicoId}/sello`;
            
            const { data: files, error: listError } = await this.supabase.storage
                .from('workers')
                .list(selloFolder);
            
            if (listError) {
                console.error('❌ Error listando archivos:', listError);
                this.mostrarError('Error al buscar sello en storage');
                return null;
            }
            
            if (!files || files.length === 0) {
                this.mostrarError('Este técnico no tiene sello cargado');
                return null;
            }
            
            // Usar el primer archivo encontrado
            const selloPath = `${tecnicoId}/sello/${files[0].name}`;
            
            // Obtener URL firmada (válida por 1 hora)
            const { data: urlData, error: urlError } = await this.supabase.storage
                .from('workers')
                .createSignedUrl(selloPath, 3600); // 1 hora de validez
            
            if (urlError) {
                console.error('❌ Error generando URL firmada:', urlError);
                this.mostrarError('Error al generar URL del sello');
                return null;
            }
            
            // Guardar ruta para uso posterior
            this.selloUrl = selloPath;
            
            // Mostrar imagen
            this.mostrarImagen(urlData.signedUrl);
            
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
        // Actualizar en el paso 5 (final)
        const img = document.getElementById('selloTecnicoImg');
        const placeholder = document.getElementById('selloTecnicoPlaceholder');
        
        if (img && placeholder) {
            img.src = url;
            img.style.display = 'block';
            img.classList.remove('hidden');
            placeholder.style.display = 'none';
        }
        
        // Actualizar preview en el paso 1
        const previewImg = document.getElementById('selloPreviewImg');
        const previewPlaceholder = document.getElementById('selloPreviewPlaceholder');
        const previewContainer = document.getElementById('selloPreviewContainer');
        
        if (previewImg && previewPlaceholder && previewContainer) {
            previewImg.src = url;
            previewImg.style.display = 'block';
            previewImg.classList.remove('hidden');
            previewPlaceholder.style.display = 'none';
            previewContainer.style.display = 'block';
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
