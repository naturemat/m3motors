export class NotificacionFallidaEvent {
  static readonly EVENT_NAME = 'notificacion.fallida';

  constructor(
    public readonly notificacionId: number,
    public readonly clienteId: number,
    public readonly tipo: string,
    public readonly canal: string,
    public readonly error: string,
  ) {
    Object.freeze(this);
  }
}
