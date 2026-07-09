import { QRGeneradoEvent } from '../../../../src/registro-seguimiento/domain/events/QRGeneradoEvent';

describe('QRGeneradoEvent', () => {
  const params = {
    vehicleId: 'veh-001',
    qrCode: 'QR-ABCD-1234',
    qrUrl: 'https://m3motors.com/qr/ABCD-1234',
  };

  it('debe crear un evento con los atributos correctos', () => {
    const evento = new QRGeneradoEvent(params);

    expect(evento.vehicleId).toBe(params.vehicleId);
    expect(evento.qrCode).toBe(params.qrCode);
    expect(evento.qrUrl).toBe(params.qrUrl);
    expect(evento.fechaGeneracion).toBeInstanceOf(Date);
    expect(evento.eventId).toBeDefined();
    expect(evento.occurredOn).toBeInstanceOf(Date);
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(QRGeneradoEvent.EVENT_NAME).toBe('qr.generado');
  });

  it('debe ser inmutable', () => {
    const evento = new QRGeneradoEvent(params);

    expect(() => {
      (evento as any).qrCode = 'QR-XXXX-XXXX';
    }).toThrow();
  });

  it('debe generar payload con toPayload()', () => {
    const evento = new QRGeneradoEvent(params);
    const payload = evento.toPayload();

    expect(payload.eventId).toBe(evento.eventId);
    expect(payload.eventName).toBe('qr.generado');
    expect(payload.vehicleId).toBe(params.vehicleId);
    expect(payload.qrCode).toBe(params.qrCode);
    expect(payload.qrUrl).toBe(params.qrUrl);
    expect(payload.fechaGeneracion).toBeInstanceOf(Date);
  });
});
