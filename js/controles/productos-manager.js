/**
 * Módulo para manejo de productos del control
 */

class ProductosManager {
    constructor() {
        this.productos = [];
    }

    /**
     * Agregar un producto a la lista
     */
    agregar(producto) {
        if (!producto.producto_id || !producto.cantidad || producto.cantidad <= 0) {
            throw new Error('Datos de producto inválidos');
        }
        
        this.productos.push({
            producto_id: producto.producto_id,
            nombre: producto.nombre,
            cantidad: parseFloat(producto.cantidad),
            unidad: producto.unidad
        });
        
        console.log('✅ Producto agregado:', producto.nombre);
        this.renderizar();
    }

    /**
     * Eliminar un producto por índice
     */
    eliminar(index) {
        if (index >= 0 && index < this.productos.length) {
            const eliminado = this.productos.splice(index, 1)[0];
            console.log('🗑️ Producto eliminado:', eliminado.nombre);
            this.renderizar();
        }
    }

    /**
     * Obtener todos los productos
     */
    getAll() {
        return this.productos;
    }

    /**
     * Limpiar todos los productos
     */
    limpiar() {
        this.productos = [];
        this.renderizar();
    }

    /**
     * Renderizar la lista de productos en el DOM
     */
    renderizar() {
        const container = document.getElementById('productosAgregados');
        
        if (!container) return;
        
        if (this.productos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <p class="empty-state-message">No se han agregado productos</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.productos.map((p, index) => `
            <div class="item-card">
                <div class="item-card-content">
                    <div class="item-card-title">${p.nombre}</div>
                    <div class="item-card-subtitle">Cantidad: ${p.cantidad} ${p.unidad}</div>
                </div>
                <button class="btn-icon-sm btn-danger" onclick="productosManager.eliminar(${index})" title="Eliminar producto" aria-label="Eliminar ${p.nombre}">🗑️</button>
            </div>
        `).join('');
    }

    /**
     * Preparar datos para enviar a la base de datos
     */
    prepararParaGuardar(controlId) {
        return this.productos.map(p => ({
            control_id: controlId,
            producto_id: p.producto_id,
            cantidad_usada: p.cantidad,
            unidad: p.unidad
        }));
    }
}

// Exportar para uso global
window.ProductosManager = ProductosManager;
