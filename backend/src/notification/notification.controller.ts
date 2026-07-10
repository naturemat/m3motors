import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EnviarNotificacionDTO } from './application/dto/EnviarNotificacionDTO';
import { NotificacionResponseDTO } from './application/dto/NotificacionResponseDTO';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async sendNotification(
    @Body() dto: EnviarNotificacionDTO,
  ): Promise<NotificacionResponseDTO> {
    return this.notificationService.enviar(dto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<NotificacionResponseDTO | null> {
    return this.notificationService.obtenerPorId(id);
  }

  @Get('client/:clienteId')
  async findByClienteId(
    @Param('clienteId') clienteId: string,
  ): Promise<NotificacionResponseDTO[]> {
    return this.notificationService.obtenerPorClienteId(clienteId);
  }

  @Get('stats')
  async getStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    return this.notificationService.obtenerEstadisticas();
  }

  @Post('retry')
  async retryFailed(): Promise<NotificacionResponseDTO[]> {
    return this.notificationService.reintentarFallidas();
  }
}
