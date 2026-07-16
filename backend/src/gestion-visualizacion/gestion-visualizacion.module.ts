import { Module } from '@nestjs/common';
import { AdminController } from './interfaces/controllers/admin.controller';
import { MechanicDashboardController } from './interfaces/controllers/mechanic-dashboard.controller';
import { ClientDashboardController } from './interfaces/controllers/client-dashboard.controller';
import { ObtenerKPIsTaller } from './application/use-cases/ObtenerKPIsTaller';
import { ObtenerKPIsMecanico } from './application/use-cases/ObtenerKPIsMecanico';
import { ObtenerKPIsCliente } from './application/use-cases/ObtenerKPIsCliente';

@Module({
  controllers: [
    AdminController,
    MechanicDashboardController,
    ClientDashboardController,
  ],
  providers: [
    ObtenerKPIsTaller,
    ObtenerKPIsMecanico,
    ObtenerKPIsCliente,
  ],
  exports: [
    ObtenerKPIsTaller,
    ObtenerKPIsMecanico,
    ObtenerKPIsCliente,
  ],
})
export class GestionVisualizacionModule {}
