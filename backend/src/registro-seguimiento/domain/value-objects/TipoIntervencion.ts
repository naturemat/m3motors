export type TipoIntervencion = 'PREVENTIVO' | 'CORRECTIVO' | 'PREDICTIVO';

export const TIPOS_INTERVENCION: TipoIntervencion[] = [
  'PREVENTIVO',
  'CORRECTIVO',
  'PREDICTIVO',
];

export function esTipoIntervencionValido(
  value: string,
): value is TipoIntervencion {
  return TIPOS_INTERVENCION.includes(value as TipoIntervencion);
}
