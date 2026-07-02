import { Placa } from '../value-objects/Placa';
import { TasaDesgaste } from '../value-objects/TasaDesgaste';
import { Intervencion } from './Intervencion';
import { RegistroKilometraje } from '../value-objects/RegistroKilometraje';

export class Vehiculo {
  private historialEvolutivo: Intervencion[];
  private registrosKilometraje: RegistroKilometraje[];
  private tasaDesgasteActual: TasaDesgaste;

  constructor(
    private readonly placa: Placa,
    private readonly marca: string,
    private readonly modelo: string,
    private readonly anio: number,
    private readonly tipoMotor: string
  ) {
    if (!marca || !modelo || !tipoMotor) throw new Error('Marca, modelo y tipo de motor son requeridos');
    const anioActual = new Date().getFullYear();
    if (anio < 1886 || anio > anioActual + 1) throw new Error('Año de vehículo inválido');
    
    this.historialEvolutivo = [];
    this.registrosKilometraje = [];
    this.tasaDesgasteActual = new TasaDesgaste(0);
  }

  registrarIngresoKilometraje(valorKm: number): void {
    const ultimoRegistro = this.registrosKilometraje.length > 0 
      ? this.registrosKilometraje[this.registrosKilometraje.length - 1].getValorKm() 
      : 0;
    
    if (valorKm < ultimoRegistro) {
      throw new Error('El nuevo kilometraje no puede ser menor al registro anterior');
    }
    this.registrosKilometraje.push(new RegistroKilometraje(valorKm, new Date()));
  }

  vincularNuevaIntervencion(intervencion: Intervencion): void {
    this.historialEvolutivo.push(intervencion);
  }

  recalcularTasaDesgasteSemanal(): void {
    const base = this.tasaDesgasteActual.getPorcentaje();
    const incremento = this.registrosKilometraje.length * 0.5;
    const nuevaTasa = Math.min(100, base + incremento);
    this.tasaDesgasteActual = new TasaDesgaste(nuevaTasa);
  }

  getPlaca(): Placa { return this.placa; }
  getMarca(): string { return this.marca; }
  getModelo(): string { return this.modelo; }
  getAnio(): number { return this.anio; }
  getTipoMotor(): string { return this.tipoMotor; }
  getTasaDesgasteActual(): TasaDesgaste { return this.tasaDesgasteActual; }
  getHistorialEvolutivo(): ReadonlyArray<Intervencion> { return Object.freeze([...this.historialEvolutivo]); }
  getRegistrosKilometraje(): ReadonlyArray<RegistroKilometraje> { return Object.freeze([...this.registrosKilometraje]); }
}