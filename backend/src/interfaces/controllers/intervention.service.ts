import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CrearComponenteDTO {
  nombre: string;
  limiteKilometraje?: number;
}

export interface CrearIntervencionDTO {
  vehiculoId: string;
  fecha: Date;
  kilometrajeActual: number;
  descripcion: string;
  serviciosCatalogo: string[];
  serviciosPersonalizados?: string;
  componentes?: CrearComponenteDTO[];
  fotos?: string[];
}

export class InterventionService {
  async registrarServicioMecanico(data: CrearIntervencionDTO) {
    // 1. Buscar el último kilometraje del vehículo para validar
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: data.vehiculoId },
      select: { kilometrajeActual: true }
    });

    if (!vehiculo) {
      throw new Error("El vehículo especificado no existe.");
    }

    // 2. Criterio de Aceptación: Validar kilometraje mayor al anterior
    if (data.kilometrajeActual <= vehiculo.kilometrajeActual) {
      throw new Error(
        `Validación fallida: El kilometraje ingresado (${data.kilometrajeActual} km) debe ser estrictamente mayor al último registro (${vehiculo.kilometrajeActual} km).`
      );
    }

    // 3. Guardar de forma transaccional en la Base de Datos
    const nuevaIntervencion = await prisma.$transaction(async (tx) => {
      // Crear la intervención principal
      const intervencion = await tx.intervencion.create({
        data: {
          vehiculoId: data.vehiculoId,
          fecha: new Date(data.fecha),
          kilometraje: data.kilometrajeActual,
          descripcion: data.descripcion,
          serviciosCatalogo: data.serviciosCatalogo,
          serviciosPersonalizados: data.serviciosPersonalizados || "",
          fotos: data.fotos || [],
          // Crear los componentes asociados automáticamente si existen
          componentes: data.componentes ? {
            create: data.componentes.map((comp) => ({
              nombre: comp.nombre,
              kilometrajeInstalacion: data.kilometrajeActual, // Autocompletado del actual
              limiteKilometraje: comp.limiteKilometraje || null,
            }))
          } : undefined
        }
      });

      // Actualizar el kilometraje actual en la ficha del vehículo
      await tx.vehiculo.update({
        where: { id: data.vehiculoId },
        data: { kilometrajeActual: data.kilometrajeActual }
      });

      return intervencion;
    });

    // 4. Criterio de Aceptación: Disparar evento de dominio de la intervención
    console.log(`[Evento Dominio] IntervencionRegistrada disparado para ID: ${nuevaIntervencion.id}`);
    // Aquí puedes acoplar tu EventBus local si el proyecto maneja uno, ej:
    // this.eventBus.publish({ eventName: 'IntervencionRegistrada', aggregateId: nuevaIntervencion.id });

    return nuevaIntervencion;
  }
}