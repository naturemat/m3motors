/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IntervencionRegistradaPayload } from '../../../registro-seguimiento/domain/events/IntervencionRegistradaEvent';
import { CalculoDesgasteService } from '../CalculoDesgasteService';
import { RegistroKilometraje } from '../../../registro-seguimiento/domain/value-objects/RegistroKilometraje';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';

const MINIMO_INTERVENCIONES = 3;

@Injectable()
export class IntervencionRegistradaHandler {
  private readonly logger = new Logger(IntervencionRegistradaHandler.name);

  constructor(
    private readonly calculoDesgaste: CalculoDesgasteService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('intervencion.registrada')
  async handle(payload: IntervencionRegistradaPayload): Promise<void> {
    this.logger.log(
      `Procesando intervención ${payload.intervencionId} para cálculo de desgaste`,
    );

    const vehicleId = parseInt(payload.vehicleId);

    const intervenciones = await this.prisma.client$.intervention.findMany({
      where: {
        vehiculoId: vehicleId,
        estado: 'FINALIZADO',
      },
      orderBy: { fecha: 'asc' },
      select: {
        fecha: true,
        kilometrajeOdometro: true,
      },
    });

    if (intervenciones.length < MINIMO_INTERVENCIONES) {
      this.logger.log(
        `Vehículo ${vehicleId}: ${intervenciones.length}/${MINIMO_INTERVENCIONES} intervenciones — aún no se calcula desgaste`,
      );
      return;
    }

    const registros = intervenciones.map(
      (i: { kilometrajeOdometro: number; fecha: Date }) =>
        new RegistroKilometraje(i.kilometrajeOdometro, new Date(i.fecha)),
    );

    const tasa = this.calculoDesgaste.calcularTasaSemanal(registros);

    this.logger.log(
      `Vehículo ${vehicleId}: tasa calculada = ${tasa.getKilometrosSemanales().toFixed(1)} km/sem ` +
        `(método: ${tasa.getMetodo()}, confianza: ${(tasa.getNivelConfianza() * 100).toFixed(0)}%)`,
    );

    await this.prisma.client$.vehiculo.update({
      where: { id: vehicleId },
      data: {
        ultimoKilometraje: intervenciones[intervenciones.length - 1].kilometrajeOdometro,
        tasaDesgasteKmSem: Math.round(tasa.getKilometrosSemanales()),
        metodoCalculo: tasa.getMetodo(),
        confianzaTasa: tasa.getNivelConfianza(),
        fechaCalculoTasa: new Date(),
      },
    });
  }
}
