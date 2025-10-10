/**
 * Módulo para manejo de puntos de control
 */

class PuntosManager {
    constructor() {
        this.puntos = [];
    }

    /**
     * Agregar un punto de control
     */
    agregar(punto) {
        if (!punto.numero || !punto.tipo_plaga || !punto.estado) {
            throw new Error('Faltan datos obligatorios del punto');
        }
        
        // Asegurar que numero sea un número entero
        let numeroFinal = punto.numero;
        if (typeof numeroFinal !== 'number') {
            const numeroParseado = parseInt(numeroFinal);
            numeroFinal = isNaN(numeroParseado) ? this.puntos.length + 1 : numeroParseado;
        }
        
        // Validar duplicados SOLO para roedores y voladores (no para rastreros)
        if (punto.tipo_plaga !== 'rastreros') {
            const puntoExistente = this.puntos.find(
                p => p.numero === numeroFinal && p.tipo_plaga === punto.tipo_plaga
            );
            
            if (puntoExistente) {
                throw new Error(`Ya existe un punto #${numeroFinal} para ${punto.tipo_plaga}. Use otro número o elimine el punto existente.`);
            }
        }
        
        // Guardar TODOS los campos del punto (incluidos los específicos por tipo de plaga)
        this.puntos.push({
            ...punto, // Spread operator para copiar TODOS los campos
            numero: numeroFinal,
            actividad_detectada: punto.estado === 'con_actividad'
        });
        
        console.log(`✅ Punto #${numeroFinal} agregado con campos:`, Object.keys(punto));
        this.renderizar();
    }

    /**
     * Eliminar un punto por índice
     */
    eliminar(index) {
        if (index >= 0 && index < this.puntos.length) {
            const eliminado = this.puntos.splice(index, 1)[0];
            console.log(`🗑️ Punto #${eliminado.numero} eliminado`);
            this.renderizar();
        }
    }

    /**
     * Obtener todos los puntos
     */
    getAll() {
        return this.puntos;
    }

    /**
     * Limpiar todos los puntos
     */
    limpiar() {
        this.puntos = [];
        this.renderizar();
    }

    /**
     * Renderizar la lista de puntos en el DOM
     * NOTA: Esta función ya no se usa porque cada tipo de plaga tiene su propia vista
     * La visualización se maneja con actualizarVistaPuntos() en nuevo-control.html
     */
    renderizar() {
        // No renderizar el listado general
        // Las vistas específicas se manejan por tipo de plaga en actualizarVistaPuntos()
        console.log('📊 Puntos actuales:', this.puntos.length);
    }

    /**
     * Formatear tipo de plaga para mostrar
     */
    formatTipoPlaga(tipo) {
        const tipos = {
            'roedores': 'Roedores',
            'voladores': 'Voladores',
            'rastreros': 'Rastreros'
        };
        return tipos[tipo] || tipo;
    }

    /**
     * Formatear estado para mostrar
     */
    formatEstado(estado) {
        const estados = {
            'ok': 'OK',
            'con_actividad': 'Con Actividad',
            'faltante': 'Faltante',
            'reemplazado': 'Reemplazado'
        };
        return estados[estado] || estado;
    }

    /**
     * Preparar datos para enviar a la base de datos
     */
    prepararParaGuardar(controlId) {
        return this.puntos.map(p => ({
            control_id: controlId,
            numero_punto: p.numero,
            tipo_plaga: p.tipo_plaga,
            tipo_dispositivo: p.tipo_dispositivo,
            ubicacion: p.ubicacion,
            estado: p.estado,
            accion_realizada: p.accion_realizada,
            actividad_detectada: p.actividad_detectada
        }));
    }
}

// Exportar para uso global
window.PuntosManager = PuntosManager;
