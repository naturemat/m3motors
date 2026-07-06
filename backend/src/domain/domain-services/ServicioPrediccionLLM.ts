export interface AlertaPredictiva {
    componenteId: string;
    diasRestantesEstimados: number;
    nivelRiesgo: 'BAJO' | 'MEDIO' | 'CRÍTICO';
    mensaje: string;
}

export class ServicioPrediccionLLM {
    public predecirFallas(
        kilometrajeActual: number,
        tasaDesgasteActual: number,
        componentesCriticos: Array<{ id: string; nombre: string; limiteKm: number }>
    ): AlertaPredictiva[] {
        
        return componentesCriticos.map(componente => {
            const porcentajeUso = (kilometrajeActual / componente.limiteKm) * 100;
            const factorDesgaste = tasaDesgasteActual / 50; 
            const scoreRiesgo = porcentajeUso * factorDesgaste;

            let nivelRiesgo: 'BAJO' | 'MEDIO' | 'CRÍTICO' = 'BAJO';
            let diasEstimados = 180;

            if (scoreRiesgo > 85) {
                nivelRiesgo = 'CRÍTICO';
                diasEstimados = 7;
            } else if (scoreRiesgo > 50) {
                nivelRiesgo = 'MEDIO';
                diasEstimados = 45;
            }

            return {
                componenteId: componente.id,
                diasRestantesEstimados: diasEstimados,
                nivelRiesgo,
                mensaje: `[Predicción LLM Mock] El componente ${componente.nombre} presenta un riesgo ${nivelRiesgo}.`
            };
        });
    }
}