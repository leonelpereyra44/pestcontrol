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
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📍</div>
                    <p class="empty-state-message">No se han agregado puntos de control</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.puntos.map((p, index) => {
            const estadoIcon = {
                'ok': '✅',
                'con_actividad': '⚠️',
                'faltante': '❌',
                'reemplazado': '🔄'
            }[p.estado] || '📍';
            
            const estadoBadgeClass = {
                'ok': 'badge-success',
                'con_actividad': 'badge-warning',
                'faltante': 'badge-danger',
                'reemplazado': 'badge-info'
            }[p.estado] || 'badge-primary';
            
            return `
                <div class="item-card">
                    <div class="item-card-content" style="flex: 1;">
                        <div class="item-card-title">
                            ${estadoIcon} Punto #${p.numero} - ${this.formatTipoPlaga(p.tipo_plaga)}
                        </div>
                        <div class="item-card-subtitle">
                            <span class="${estadoBadgeClass}">${this.formatEstado(p.estado)}</span>
                            ${p.ubicacion ? ' • ' + p.ubicacion : ''}
                        </div>
                        ${p.tipo_dispositivo ? `<div class="item-card-meta">Dispositivo: ${p.tipo_dispositivo}</div>` : ''}
                        ${p.accion_realizada ? `<div class="item-card-meta">Acción: ${p.accion_realizada}</div>` : ''}
                    </div>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="puntosManager.eliminar(${index})" title="Eliminar punto">
                        🗑️
                    </button>
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
