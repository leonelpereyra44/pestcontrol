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
            container.innerHTML = '<p style="color: #999; font-style: italic;">No se han agregado productos</p>';
            return;
        }
        
        container.innerHTML = this.productos.map((p, index) => `
            <div class="producto-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${p.nombre}</strong><br>
                        <span style="color: #666;">Cantidad: ${p.cantidad} ${p.unidad}</span>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="productosManager.eliminar(${index})">
                        🗑️ Eliminar
                    </button>
                </div>
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
