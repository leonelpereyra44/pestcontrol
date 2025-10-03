/**
 * Módulo para manejo del wizard de pasos
 */

class WizardManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
    }

    /**
     * Ir al siguiente paso
     */
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.actualizar();
        }
    }

    /**
     * Ir al paso anterior
     */
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.actualizar();
        }
    }

    /**
     * Ir a un paso específico
     */
    goToStep(step) {
        if (step >= 1 && step <= this.totalSteps) {
            this.currentStep = step;
            this.actualizar();
        }
    }

    /**
     * Actualizar la UI del wizard
     */
    actualizar() {
        // Actualizar indicadores de pasos
        document.querySelectorAll('.wizard-step').forEach(stepElement => {
            const stepNum = parseInt(stepElement.dataset.step);
            stepElement.classList.remove('active', 'completed');
            
            if (stepNum === this.currentStep) {
                stepElement.classList.add('active');
            } else if (stepNum < this.currentStep) {
                stepElement.classList.add('completed');
            }
        });
        
        // Actualizar contenido visible
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeContent = document.querySelector(`.step-content[data-step="${this.currentStep}"]`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
        
        // Scroll suave al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log(`📍 Paso actual: ${this.currentStep}/${this.totalSteps}`);
    }

    /**
     * Validar paso actual antes de avanzar
     */
    validarPasoActual() {
        switch (this.currentStep) {
            case 1:
                return this.validarPaso1();
            case 2:
                return true; // Productos opcionales
            case 3:
                return true; // Puntos opcionales
            case 4:
                return true; // Observaciones opcionales
            case 5:
                return true; // Sello se valida al guardar
            default:
                return true;
        }
    }

    /**
     * Validar Paso 1: Información General
     */
    validarPaso1() {
        const cliente = document.getElementById('clienteId')?.value;
        const tecnico = document.getElementById('tecnicoId')?.value;
        const fecha = document.getElementById('fechaControl')?.value;
        const tipo = document.getElementById('tipoControl')?.value;
        
        if (!cliente) {
            alert('⚠️ Debe seleccionar un cliente');
            return false;
        }
        
        if (!tecnico) {
            alert('⚠️ Debe seleccionar un técnico responsable');
            return false;
        }
        
        if (!fecha) {
            alert('⚠️ Debe seleccionar una fecha');
            return false;
        }
        
        if (!tipo) {
            alert('⚠️ Debe seleccionar un tipo de control');
            return false;
        }
        
        return true;
    }

    /**
     * Obtener paso actual
     */
    getCurrentStep() {
        return this.currentStep;
    }
}

// Exportar para uso global
window.WizardManager = WizardManager;
