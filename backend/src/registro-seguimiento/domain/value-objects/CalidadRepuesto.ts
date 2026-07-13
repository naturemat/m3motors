export type CalidadRepuesto = 'ORIGINAL' | 'ALTERNATIVO' | 'REACONDICIONADO';

export const CALIDADES_REPUESTO: CalidadRepuesto[] = [
  'ORIGINAL',
  'ALTERNATIVO',
  'REACONDICIONADO',
];

export function esCalidadRepuestoValida(
  value: string,
): value is CalidadRepuesto {
  return CALIDADES_REPUESTO.includes(value as CalidadRepuesto);
}
