export interface ClienteActivadoPayload {
  readonly eventName: 'cliente.activado';
  readonly clienteId: string;
  readonly preRegisteredCustomerId: string;
  readonly workshopId: string;
  readonly mechanicId: string;
  readonly nombre: string;
  readonly telefono: string;
  readonly email: string;
  readonly fechaActivacion: Date;
}
