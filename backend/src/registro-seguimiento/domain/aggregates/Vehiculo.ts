import { Placa } from '../../../shared/domain/value-objects/Placa';
import { TasaDesgaste } from '../../../prediccion-analisis/domain/value-objects/TasaDesgaste';
import { Intervencion } from '../entities/Intervencion';
import { RegistroKilometraje } from '../value-objects/RegistroKilometraje';
import { IntervencionId } from '../value-objects/IntervencionId';
import { ComponenteCritico } from '../value-objects/ComponenteCritico';
import { VehicleQR } from '../value-objects/VehicleQR';
import { VehiclePhoto } from '../value-objects/VehiclePhoto';

export type EstadoActivacion = 'PENDING' | 'ACTIVATED';

export class Vehiculo {
  private historialEvolutivo: Intervencion[];
  private registrosKilometraje: RegistroKilometraje[];
  private tasaDesgasteActual: TasaDesgaste;
  private qrCode: VehicleQR | null;
  private photos: VehiclePhoto[];
  private estadoActivacion: EstadoActivacion;

  constructor(
    private readonly id: string,
    private readonly placa: Placa,
    private readonly marca: string,
    private readonly modelo: string,
    private readonly anio: number,
    private readonly tipoMotor: string,
    private readonly clienteId: string,
  ) {
    this.validarDatosBasicos();
    this.historialEvolutivo = [];
    this.registrosKilometraje = [];
    this.tasaDesgasteActual = new TasaDesgaste(0);
    this.qrCode = null;
    this.photos = [];
    this.estadoActivacion = 'PENDING';
  }

  activarVehiculo(
    mechanicId: string,
    qr: VehicleQR,
    fotos: VehiclePhoto[],
  ): void {
    if (this.estadoActivacion === 'ACTIVATED')
      throw new Error('El vehículo ya está activado');

    const tieneFotoPlaca = fotos.some((f) => f.getTipo() === 'PLACA');
    if (!tieneFotoPlaca)
      throw new Error(
        'Se requiere al menos una foto de tipo PLACA para activar',
      );

    this.qrCode = qr;
    this.photos = fotos;
    this.estadoActivacion = 'ACTIVATED';
  }

  generarQR(qr: VehicleQR): void {
    if (this.qrCode)
      throw new Error('El QR ya fue generado para este vehículo');
    this.qrCode = qr;
  }

  agregarFoto(photo: VehiclePhoto): void {
    this.photos.push(photo);

    const tienePlaca = this.photos.some((f) => f.getTipo() === 'PLACA');
    if (!tienePlaca && this.estadoActivacion === 'ACTIVATED') {
      throw new Error('Debe existir al menos una foto de tipo PLACA');
    }
  }

  registrarIngresoKilometraje(valorKm: number, fecha: Date = new Date()): void {
    this.validarKilometrajeNoRetrocede(valorKm);
    this.validarConsistenciaCronologica(fecha);
    this.registrosKilometraje.push(new RegistroKilometraje(valorKm, fecha));
  }

  vincularNuevaIntervencion(intervencion: Intervencion): void {
    this.validarConsistenciaCronologica(intervencion.getFecha());
    this.historialEvolutivo.push(intervencion);
  }

  agregarComponenteAIntervencion(
    intervencionId: IntervencionId,
    componente: ComponenteCritico,
  ): void {
    const intervencion = this.buscarIntervencionPorId(intervencionId);
    intervencion.registrarSustitucionComponente(componente);
  }

  finalizarIntervencion(intervencionId: IntervencionId): void {
    const intervencion = this.buscarIntervencionPorId(intervencionId);
    intervencion.finalizarIntervencion();
  }

  recalcularTasaDesgasteSemanal(): void {
    const base = this.tasaDesgasteActual.getPorcentaje();
    const incremento = this.registrosKilometraje.length * 0.5;
    const nuevaTasa = Math.min(100, base + incremento);
    this.tasaDesgasteActual = new TasaDesgaste(nuevaTasa);
  }

  esActivo(): boolean {
    return this.estadoActivacion === 'ACTIVATED';
  }

  obtenerUltimoKilometraje(): number | null {
    if (this.registrosKilometraje.length === 0) return null;
    return this.registrosKilometraje[
      this.registrosKilometraje.length - 1
    ].getValorKm();
  }

  getId(): string {
    return this.id;
  }

  getPlaca(): Placa {
    return this.placa;
  }

  getMarca(): string {
    return this.marca;
  }

  getModelo(): string {
    return this.modelo;
  }

  getAnio(): number {
    return this.anio;
  }

  getTipoMotor(): string {
    return this.tipoMotor;
  }

  getClienteId(): string {
    return this.clienteId;
  }

  getTasaDesgasteActual(): TasaDesgaste {
    return this.tasaDesgasteActual;
  }

  getHistorialEvolutivo(): ReadonlyArray<Intervencion> {
    return Object.freeze([...this.historialEvolutivo]);
  }

  getRegistrosKilometraje(): ReadonlyArray<RegistroKilometraje> {
    return Object.freeze([...this.registrosKilometraje]);
  }

  getQrCode(): VehicleQR | null {
    return this.qrCode;
  }

  getPhotos(): ReadonlyArray<VehiclePhoto> {
    return Object.freeze([...this.photos]);
  }

  getEstadoActivacion(): EstadoActivacion {
    return this.estadoActivacion;
  }

  private validarDatosBasicos(): void {
    if (!this.marca || !this.modelo || !this.tipoMotor) {
      throw new Error('Marca, modelo y tipo de motor son requeridos');
    }
    const anioActual = new Date().getFullYear();
    if (this.anio < 1886 || this.anio > anioActual + 1) {
      throw new Error('Año de vehículo inválido');
    }
  }

  private validarKilometrajeNoRetrocede(valorKm: number): void {
    const ultimoRegistro =
      this.registrosKilometraje.length > 0
        ? this.registrosKilometraje[
            this.registrosKilometraje.length - 1
          ].getValorKm()
        : 0;
    if (valorKm < ultimoRegistro) {
      throw new Error(
        'El nuevo kilometraje no puede ser menor al registro anterior',
      );
    }
  }

  private validarConsistenciaCronologica(nuevaFecha: Date): void {
    const ultimoRegistroKm =
      this.registrosKilometraje.length > 0
        ? this.registrosKilometraje[
            this.registrosKilometraje.length - 1
          ].getFecha()
        : new Date(0);

    const ultimaIntervencion =
      this.historialEvolutivo.length > 0
        ? this.historialEvolutivo[this.historialEvolutivo.length - 1].getFecha()
        : new Date(0);

    const ultimaFechaMecanica =
      ultimoRegistroKm > ultimaIntervencion
        ? ultimoRegistroKm
        : ultimaIntervencion;

    if (nuevaFecha < ultimaFechaMecanica) {
      throw new Error(
        'Inconsistencia cronológica: no se puede registrar un evento en una fecha anterior al último evento validado.',
      );
    }
  }

  private buscarIntervencionPorId(
    intervencionId: IntervencionId,
  ): Intervencion {
    const intervencion = this.historialEvolutivo.find(
      (i) => i.getId().getValue() === intervencionId.getValue(),
    );
    if (!intervencion) {
      throw new Error(
        'Intervención no encontrada en el historial del vehículo.',
      );
    }
    return intervencion;
  }
}
