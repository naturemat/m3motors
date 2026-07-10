import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
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

  @Get('client/:clienteId/unread/count')
  async countUnread(
    @Param('clienteId') clienteId: string,
  ): Promise<{ count: number }> {
    const count = await this.notificationService.contarNoLeidas(clienteId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
  ): Promise<NotificacionResponseDTO | null> {
    return this.notificationService.marcarComoLeida(id);
  }

  @Post('register-device')
  registerDevice(@Body() body: { clienteId: string; externalId: string }): {
    success: boolean;
  } {
    this.notificationService.registrarDeviceToken(
      body.clienteId,
      body.externalId,
    );
    return { success: true };
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
