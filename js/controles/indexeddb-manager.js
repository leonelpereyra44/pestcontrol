/**
 * Módulo para manejo de IndexedDB (guardado local de controles)
 * Permite trabajar offline y recuperar borradores
 */

class IndexedDBManager {
    constructor() {
        this.dbName = 'ControlPlagasDB';
        this.dbVersion = 1;
        this.db = null;
    }

    /**
     * Inicializar la base de datos
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ Error abriendo IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB inicializada');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Crear object store para controles en borrador
                if (!db.objectStoreNames.contains('controles_draft')) {
                    const controlStore = db.createObjectStore('controles_draft', { 
                        keyPath: 'local_id',
                        autoIncrement: true 
                    });
                    
                    // Índices para búsqueda
                    controlStore.createIndex('empresa_id', 'empresa_id', { unique: false });
                    controlStore.createIndex('created_at', 'created_at', { unique: false });
                    controlStore.createIndex('cliente_id', 'cliente_id', { unique: false });
                    
                    console.log('✅ Object store "controles_draft" creado');
                }

                // Crear object store para productos del control
                if (!db.objectStoreNames.contains('productos_draft')) {
                    const prodStore = db.createObjectStore('productos_draft', { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                    prodStore.createIndex('local_control_id', 'local_control_id', { unique: false });
                    console.log('✅ Object store "productos_draft" creado');
                }

                // Crear object store para puntos del control
                if (!db.objectStoreNames.contains('puntos_draft')) {
                    const puntosStore = db.createObjectStore('puntos_draft', { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                    puntosStore.createIndex('local_control_id', 'local_control_id', { unique: false });
                    console.log('✅ Object store "puntos_draft" creado');
                }
            };
        });
    }

    /**
     * Guardar control en borrador
     */
    async guardarControl(controlData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['controles_draft'], 'readwrite');
            const store = transaction.objectStore('controles_draft');

            const data = {
                ...controlData,
                created_at: controlData.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const request = controlData.local_id 
                ? store.put(data) // Actualizar existente
                : store.add(data); // Crear nuevo

            request.onsuccess = () => {
                const localId = request.result;
                console.log('✅ Control guardado localmente con ID:', localId);
                resolve(localId);
            };

            request.onerror = () => {
                console.error('❌ Error guardando control:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Obtener control por ID local
     */
    async obtenerControl(localId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['controles_draft'], 'readonly');
            const store = transaction.objectStore('controles_draft');
            const request = store.get(localId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Obtener todos los controles en borrador
     */
    async obtenerTodosControles() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['controles_draft'], 'readonly');
            const store = transaction.objectStore('controles_draft');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Guardar producto del control
     */
    async guardarProducto(localControlId, productoData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['productos_draft'], 'readwrite');
            const store = transaction.objectStore('productos_draft');

            const data = {
                ...productoData,
                local_control_id: localControlId
            };

            const request = store.add(data);

            request.onsuccess = () => {
                console.log('✅ Producto guardado localmente');
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Obtener productos de un control
     */
    async obtenerProductos(localControlId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['productos_draft'], 'readonly');
            const store = transaction.objectStore('productos_draft');
            const index = store.index('local_control_id');
            const request = index.getAll(localControlId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Eliminar todos los productos de un control
     */
    async eliminarProductos(localControlId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['productos_draft'], 'readwrite');
            const store = transaction.objectStore('productos_draft');
            const index = store.index('local_control_id');
            const request = index.openCursor(IDBKeyRange.only(localControlId));

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Guardar punto de control
     */
    async guardarPunto(localControlId, puntoData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['puntos_draft'], 'readwrite');
            const store = transaction.objectStore('puntos_draft');

            const data = {
                ...puntoData,
                local_control_id: localControlId
            };

            console.log('💾 Guardando punto en IndexedDB con campos:', Object.keys(data));

            const request = store.add(data);

            request.onsuccess = () => {
                console.log('✅ Punto guardado localmente con todos los campos');
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Obtener puntos de un control
     */
    async obtenerPuntos(localControlId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['puntos_draft'], 'readonly');
            const store = transaction.objectStore('puntos_draft');
            const index = store.index('local_control_id');
            const request = index.getAll(localControlId);

            request.onsuccess = () => {
                const puntos = request.result;
                console.log(`📥 Obtenidos ${puntos.length} puntos de IndexedDB`);
                if (puntos.length > 0) {
                    console.log('🔍 Primer punto con campos:', Object.keys(puntos[0]));
                    console.log('📊 Contenido del primer punto:', puntos[0]);
                }
                resolve(puntos);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Eliminar todos los puntos de un control
     */
    async eliminarPuntos(localControlId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['puntos_draft'], 'readwrite');
            const store = transaction.objectStore('puntos_draft');
            const index = store.index('local_control_id');
            const request = index.openCursor(IDBKeyRange.only(localControlId));

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Eliminar control completo (con productos y puntos)
     */
    async eliminarControl(localId) {
        try {
            // Eliminar productos
            await this.eliminarProductos(localId);
            
            // Eliminar puntos
            await this.eliminarPuntos(localId);
            
            // Eliminar control
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['controles_draft'], 'readwrite');
                const store = transaction.objectStore('controles_draft');
                const request = store.delete(localId);

                request.onsuccess = () => {
                    console.log('✅ Control eliminado de IndexedDB');
                    resolve();
                };

                request.onerror = () => {
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Error eliminando control:', error);
            throw error;
        }
    }

    /**
     * Sincronizar: Guardar productos actuales
     */
    async sincronizarProductos(localControlId, productos) {
        try {
            // Eliminar productos existentes
            await this.eliminarProductos(localControlId);
            
            // Guardar nuevos productos
            for (const producto of productos) {
                await this.guardarProducto(localControlId, producto);
            }
            
            console.log(`✅ ${productos.length} productos sincronizados`);
        } catch (error) {
            console.error('❌ Error sincronizando productos:', error);
            throw error;
        }
    }

    /**
     * Sincronizar: Guardar puntos actuales
     */
    async sincronizarPuntos(localControlId, puntos) {
        try {
            // Eliminar puntos existentes
            await this.eliminarPuntos(localControlId);
            
            // Guardar nuevos puntos
            for (const punto of puntos) {
                await this.guardarPunto(localControlId, punto);
            }
            
            console.log(`✅ ${puntos.length} puntos sincronizados`);
        } catch (error) {
            console.error('❌ Error sincronizando puntos:', error);
            throw error;
        }
    }
}

// Exportar para uso global
window.IndexedDBManager = IndexedDBManager;
