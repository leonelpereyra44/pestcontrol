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
        
        this.puntos.push({
            numero: parseInt(punto.numero),
            tipo_plaga: punto.tipo_plaga,
            tipo_dispositivo: punto.tipo_dispositivo || '',
            ubicacion: punto.ubicacion || '',
            estado: punto.estado,
            accion_realizada: punto.accion_realizada || '',
            actividad_detectada: punto.estado === 'con_actividad'
        });
        
        console.log(`✅ Punto #${punto.numero} agregado`);
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
     */
    renderizar() {
        const container = document.getElementById('puntosAgregados');
        
        if (!container) return;
        
        if (this.puntos.length === 0) {
            container.innerHTML = '<p style="color: #999; font-style: italic;">No se han agregado puntos de control</p>';
            return;
        }
        
        container.innerHTML = this.puntos.map((p, index) => {
            const estadoIcon = {
                'ok': '✅',
                'con_actividad': '⚠️',
                'faltante': '❌',
                'reemplazado': '🔄'
            }[p.estado] || '📍';
            
            return `
                <div class="punto-item">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <strong>${estadoIcon} Punto #${p.numero} - ${this.formatTipoPlaga(p.tipo_plaga)}</strong><br>
                            <span style="color: #666;">
                                Estado: ${this.formatEstado(p.estado)}
                                ${p.ubicacion ? ' | ' + p.ubicacion : ''}
                            </span>
                            ${p.tipo_dispositivo ? '<br><small>Dispositivo: ' + p.tipo_dispositivo + '</small>' : ''}
                            ${p.accion_realizada ? '<br><small>Acción: ' + p.accion_realizada + '</small>' : ''}
                        </div>
                        <button class="btn btn-danger btn-sm" onclick="puntosManager.eliminar(${index})">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
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
