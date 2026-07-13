import { Inject } from '@nestjs/common';
import { IVehiculoRepository } from '../../domain/ports/repositories/IVehiculoRepository';
import { IClienteRepository } from '../../domain/ports/repositories/IClienteRepository';
import {
  IVEHICULO_REPOSITORY,
  ICLIENTE_REPOSITORY,
} from '../../../shared/domain/ports/tokens';

export interface ComponenteCriticoDTO {
  id: string;
  nombre: string;
  kilometrajeInstalacion: number;
  limiteKilometrajeFabricante: number;
  porcentajeDesgaste: number;
  estado: 'OPTIMO' | 'DESGASTE_MEDIO' | 'CRITICO';
}

export interface IntervencionDTO {
  id: string;
  fecha: Date;
  diagnostico: string;
  observaciones: string;
  nivelSeveridad: string;
  manoDeObra: number;
  mecanicoId: string;
  estado: 'PENDIENTE' | 'FINALIZADO';
  componentes: ComponenteCriticoDTO[];
}

export interface VehiculoHistorialDTO {
  vehicleId: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoMotor: string;
  kilometrajeActual: number | null;
  tasaDesgasteSemanal: number;
  proximoMantenimiento: Date | null;
  cliente: {
    id: string;
    nombre: string;
    telefono: string;
    email: string;
  } | null;
  intervenciones: IntervencionDTO[];
  estadoGeneral: 'OPTIMO' | 'ATENCION' | 'CRITICO';
  mensajeEstado: string;
}

export class ObtenerHistorialVehiculo {
  constructor(
    @Inject(IVEHICULO_REPOSITORY)
    private readonly vehiculoRepository: IVehiculoRepository,
    @Inject(ICLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(qrCode: string): Promise<VehiculoHistorialDTO | null> {
    const vehiculos = await this.vehiculoRepository.findAll();
    const vehiculo = vehiculos.find((v) => {
      const qr = v.getQrCode();
      return qr && qr.getCodigo() === qrCode;
    });

    if (!vehiculo) {
      return null;
    }

    const kilometrajeActual = vehiculo.obtenerUltimoKilometraje();
    const tasaDesgaste = vehiculo
      .getTasaDesgasteActual()
      .getKilometrosSemanales();
    const proximoMantenimiento = vehiculo.obtenerProximoMantenimiento();

    let cliente: { id: string; nombre: string; telefono: string; email: string } | null = null;
    try {
      const { ClienteId } =
        await import('../../domain/value-objects/ClienteId');
      const clienteId = new ClienteId(vehiculo.getClienteId());
      const clienteEntity = await this.clienteRepository.findById(clienteId);
      if (clienteEntity) {
        cliente = {
          id: clienteEntity.getId().getValue(),
          nombre: clienteEntity.getNombre(),
          telefono: clienteEntity.getTelefono(),
          email: clienteEntity.getEmail(),
        };
      }
    } catch {
      // Cliente no encontrado o error al obtener
    }

    const intervenciones: IntervencionDTO[] = vehiculo
      .getHistorialEvolutivo()
      .map((intervencion) => ({
        id: intervencion.getId().getValue(),
        fecha: intervencion.getFecha(),
        diagnostico: intervencion.getDiagnostico().getFallaDetectada(),
        observaciones: intervencion.getDiagnostico().getObservacionesMecanico(),
        nivelSeveridad: intervencion.getDiagnostico().getNivelSeveridad(),
        manoDeObra: intervencion.getManoDeObra(),
        mecanicoId: intervencion.getMecanicoId().getValue(),
        estado: intervencion.getEstado(),
        componentes: intervencion.getComponentesSustituidos().map((comp) => ({
          id: comp.getId(),
          nombre: comp.getNombre(),
          kilometrajeInstalacion: comp.getKilometrajeInstalacion(),
          limiteKilometrajeFabricante: comp.getLimiteKilometrajeFabricante(),
          porcentajeDesgaste: kilometrajeActual
            ? comp.calcularDesgaste(kilometrajeActual)
            : 0,
          estado: comp.getEstadoActual(),
        })),
      }));

    const estadoGeneral = this.determinarEstado(intervenciones, tasaDesgaste);
    const mensajeEstado = this.obtenerMensajeEstado(estadoGeneral);

    return {
      vehicleId: vehiculo.getId(),
      placa: vehiculo.getPlaca().getValue(),
      marca: vehiculo.getMarca(),
      modelo: vehiculo.getModelo(),
      anio: vehiculo.getAnio(),
      tipoMotor: vehiculo.getTipoMotor(),
      kilometrajeActual,
      tasaDesgasteSemanal: tasaDesgaste,
      proximoMantenimiento,
      cliente,
      intervenciones,
      estadoGeneral,
      mensajeEstado,
    };
  }

  private determinarEstado(
    intervenciones: IntervencionDTO[],
    tasaDesgaste: number,
  ): 'OPTIMO' | 'ATENCION' | 'CRITICO' {
    const componentesCriticos = intervenciones.flatMap((i) =>
      i.componentes.filter((c) => c.estado === 'CRITICO'),
    );

    if (componentesCriticos.length > 0) {
      return 'CRITICO';
    }

    const componentesDesgaste = intervenciones.flatMap((i) =>
      i.componentes.filter((c) => c.estado === 'DESGASTE_MEDIO'),
    );

    if (componentesDesgaste.length > 0 || tasaDesgaste > 800) {
      return 'ATENCION';
    }

    return 'OPTIMO';
  }

  private obtenerMensajeEstado(
    estado: 'OPTIMO' | 'ATENCION' | 'CRITICO',
  ): string {
    switch (estado) {
      case 'OPTIMO':
        return 'El vehiculo esta en buen estado';
      case 'ATENCION':
        return 'Se recomienda mantenimiento preventivo';
      case 'CRITICO':
        return 'Atencion: componente en estado critico';
    }
  }
}
