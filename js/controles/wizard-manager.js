/**
 * Módulo para manejo del wizard de pasos
 */

class WizardManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.initializeClickableSteps();
    }

    /**
     * Inicializar pasos clickeables
     */
    initializeClickableSteps() {
        document.querySelectorAll('.wizard-step').forEach(stepElement => {
            stepElement.style.cursor = 'pointer';
            stepElement.addEventListener('click', () => {
                const stepNum = parseInt(stepElement.dataset.step);
                this.goToStep(stepNum);
            });
        });
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
     * Ir a un paso específico (navegación libre)
     */
    goToStep(step) {
        if (step >= 1 && step <= this.totalSteps) {
            this.currentStep = step;
            this.actualizar();
        }
    }

    /**
     * Alias para compatibilidad
     */
    irAPaso(paso) {
        this.goToStep(paso);
    }

    /**
     * Actualizar la UI del wizard
     */
    actualizar() {
        // Actualizar indicadores de pasos
        document.querySelectorAll('.wizard-step').forEach(stepElement => {
            const stepNum = parseInt(stepElement.dataset.step);
            stepElement.classList.remove('active');
            
            if (stepNum === this.currentStep) {
                stepElement.classList.add('active');
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
     * Validar todos los datos antes de guardar
     */
    validarPasoActual() {
        // Solo validar información obligatoria al guardar
        const cliente = document.getElementById('clienteId')?.value;
        const tecnico = document.getElementById('tecnicoId')?.value;
        const fecha = document.getElementById('fechaControl')?.value;
        const tipo = document.getElementById('tipoControl')?.value;
        
        if (!cliente) {
            alert('⚠️ Debe seleccionar un cliente antes de guardar');
            this.goToStep(1);
            return false;
        }
        
        if (!tecnico) {
            alert('⚠️ Debe seleccionar un técnico responsable antes de guardar');
            this.goToStep(1);
            return false;
        }
        
        if (!fecha) {
            alert('⚠️ Debe seleccionar una fecha antes de guardar');
            this.goToStep(1);
            return false;
        }
        
        if (!tipo) {
            alert('⚠️ Debe seleccionar un tipo de control antes de guardar');
            this.goToStep(1);
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
