/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ClerkAuthGuard } from '../../../shared/infrastructure/clerk/clerk.guard';
import { ClerkService } from '../../../shared/infrastructure/clerk/clerk.service';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { ObtenerKPIsTaller } from '../../application/use-cases/ObtenerKPIsTaller';
import { CreateMechanicDTO } from '../../../application/dto/CreateMechanicDTO';
import { CreateServiceDTO } from '../../../application/dto/CreateServiceDTO';
import { UpdateWorkshopDTO } from '../../../application/dto/UpdateWorkshopDTO';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(ClerkAuthGuard)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clerkService: ClerkService,
    private readonly obtenerKPIs: ObtenerKPIsTaller,
  ) {}

  private findWorkshopForAdmin(userId: string) {
    return this.prisma.client$.workshop.findFirst({
      where: { ownerId: userId },
    });
  }

  @Get('kpis')
  @ApiOperation({ summary: 'KPI del taller' })
  @ApiResponse({ status: 200, description: 'Métricas clave del taller' })
  async getKpis(@Req() req: Request) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { kpis: null };
    return this.obtenerKPIs.ejecutar(workshop.id);
  }

  @Get('workshop')
  @ApiOperation({ summary: 'Obtener configuración del taller' })
  async getWorkshop(@Req() req: Request) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { workshop: null };

    const full = await this.prisma.client$.workshop.findFirst({
      where: { id: workshop.id },
      include: {
        mecanicos: true,
        servicios: true,
        preRegisteredCustomers: true,
      },
    });
    return { workshop: full };
  }

  @Put('workshop')
  @ApiOperation({ summary: 'Actualizar configuración del taller' })
  async updateWorkshop(@Req() req: Request, @Body() dto: UpdateWorkshopDTO) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { error: 'Taller no encontrado' };

    const updated = await this.prisma.client$.workshop.update({
      where: { id: workshop.id },
      data: {
        nombre: dto.nombre ?? workshop.nombre,
        direccion: dto.direccion ?? workshop.direccion,
        horarios: dto.horarios ?? workshop.horarios,
      },
    });
    return { workshop: updated };
  }

  @Get('mechanics')
  @ApiOperation({ summary: 'Listar mecánicos del taller' })
  async getMechanics(@Req() req: Request) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { mechanics: [] };

    const mechanics = await this.prisma.client$.mechanic.findMany({
      where: { workshopId: workshop.id },
    });
    return { mechanics };
  }

  @Post('mechanics')
  @HttpCode(201)
  @ApiOperation({ summary: 'Agregar nuevo mecánico' })
  async createMechanic(@Req() req: Request, @Body() dto: CreateMechanicDTO) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { error: 'Taller no encontrado' };

    const tempPassword = this.generateTempPassword();
    let clerkUserId: string | null = null;

    try {
      const clerkUser = await this.clerkService.createUser({
        email: `${dto.nombre.toLowerCase().replace(/\s/g, '.')}@m3motors.me`,
        password: tempPassword,
        firstName: dto.nombre,
        publicMetadata: { role: 'mechanic' },
      });
      clerkUserId = clerkUser.id;

      if (workshop.clerkOrgId) {
        await this.clerkService.addMemberToOrganization(
          workshop.clerkOrgId,
          clerkUser.id,
          'org:member',
        );
      }
    } catch (error) {
      console.error('[Admin] Error creating Clerk user:', error);
    }

    const mechanic = await this.prisma.client$.mechanic.create({
      data: {
        workshopId: workshop.id,
        clerkId: clerkUserId ?? crypto.randomUUID(),
        nombre: dto.nombre,
        especialidad: dto.especialidad ?? null,
        activo: true,
        creadoPor: workshop.id,
      },
    });

    return {
      mechanic,
      tempPassword: clerkUserId ? tempPassword : undefined,
    };
  }

  @Delete('mechanics/:id')
  @ApiOperation({ summary: 'Eliminar mecánico' })
  async deleteMechanic(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { error: 'Taller no encontrado' };

    await this.prisma.client$.mechanic.deleteMany({
      where: { id, workshopId: workshop.id },
    });
    return { success: true };
  }

  @Get('services')
  @ApiOperation({ summary: 'Listar servicios del taller' })
  async getServices(@Req() req: Request) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { services: [] };

    const services = await this.prisma.client$.serviceCatalog.findMany({
      where: { workshopId: workshop.id },
    });
    return { services };
  }

  @Post('services')
  @HttpCode(201)
  @ApiOperation({ summary: 'Agregar servicio al catálogo' })
  async createService(@Req() req: Request, @Body() dto: CreateServiceDTO) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { error: 'Taller no encontrado' };

    const service = await this.prisma.client$.serviceCatalog.create({
      data: {
        workshopId: workshop.id,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        precioReferencia: dto.precioReferencia,
        categoria: dto.categoria ?? 'General',
      },
    });
    return { service };
  }

  @Get('customers')
  @ApiOperation({ summary: 'Listar clientes y pre-registrados' })
  async getCustomers(@Req() req: Request) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { activeClients: [], preRegistered: [] };

    const full = await this.prisma.client$.workshop.findFirst({
      where: { id: workshop.id },
      include: { preRegisteredCustomers: true, mecanicos: true },
    });

    const activeClients = await this.prisma.client$.cliente.findMany({
      where: {
        idMecanicoActivo: { in: full?.mecanicos?.map((m: any) => m.id) ?? [] },
      },
    });

    return { activeClients, preRegistered: full?.preRegisteredCustomers ?? [] };
  }

  @Post('customers/:id/activate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Activar cliente pre-registrado' })
  async activateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { error: 'Taller no encontrado' };

    const full = await this.prisma.client$.workshop.findFirst({
      where: { id: workshop.id },
      include: { mecanicos: true },
    });

    const preClient = await this.prisma.client$.preRegisteredCustomer.findFirst(
      {
        where: { id, workshopId: workshop.id, status: 'PENDING' },
      },
    );
    if (!preClient) return { error: 'Cliente no encontrado o ya activado' };

    const mechanicId = full?.mecanicos?.[0]?.id;
    if (!mechanicId) return { error: 'No hay mecánico activo disponible' };

    const cliente = await this.prisma.client$.cliente.create({
      data: {
        clerkId: crypto.randomUUID(),
        nombre: preClient.nombre,
        telefono: preClient.telefono,
        email: preClient.email,
        status: 'ACTIVATED',
        idMecanicoActivo: mechanicId,
      },
    });

    await this.prisma.client$.preRegisteredCustomer.update({
      where: { id: preClient.id },
      data: {
        status: 'ACTIVATED',
        fechaActivacion: new Date(),
        idClienteConverted: cliente.id,
      },
    });

    return { cliente };
  }

  @Post('customers')
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
  async createCustomer(
    @Req() req: Request,
    @Body() body: { nombre: string; email: string; telefono: string; status?: string },
  ) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { error: 'Taller no encontrado' };

    const full = await this.prisma.client$.workshop.findFirst({
      where: { id: workshop.id },
      include: { mecanicos: true },
    });

    const mechanicId = full?.mecanicos?.[0]?.id;
    if (!mechanicId) return { error: 'No hay mecánico activo disponible' };

    const cliente = await this.prisma.client$.cliente.create({
      data: {
        clerkId: crypto.randomUUID(),
        nombre: body.nombre,
        email: body.email,
        telefono: body.telefono,
        status: body.status ?? 'ACTIVATED',
        idMecanicoActivo: mechanicId,
      },
    });

    return { cliente };
  }

  @Delete('customers/:id')
  @ApiOperation({ summary: 'Eliminar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado' })
  async deleteCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { error: 'Taller no encontrado' };

    const full = await this.prisma.client$.workshop.findFirst({
      where: { id: workshop.id },
      include: { mecanicos: true },
    });

    const mechanicIds = full?.mecanicos?.map((m: any) => m.id) ?? [];
    if (mechanicIds.length === 0) return { error: 'Taller sin mecánicos' };

    await this.prisma.client$.cliente.deleteMany({
      where: { id, idMecanicoActivo: { in: mechanicIds } },
    });

    return { success: true };
  }

  @Get('orders')
  @ApiOperation({ summary: 'Listar órdenes de servicio (intervenciones)' })
  @ApiResponse({ status: 200, description: 'Lista de intervenciones del taller' })
  async getOrders(@Req() req: Request) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { orders: [] };

    const orders = await this.prisma.client$.intervention.findMany({
      where: { mecanico: { workshopId: workshop.id } },
      include: {
        vehiculo: true,
        serviceCatalog: true,
        mecanico: true,
      },
      orderBy: { fecha: 'desc' },
    });

    return { orders };
  }

  @Post('orders')
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear orden de servicio (intervención)' })
  @ApiResponse({ status: 201, description: 'Orden creada exitosamente' })
  async createOrder(
    @Req() req: Request,
    @Body() body: { clientName: string; vehicle: string; serviceName: string; status?: string; total?: number },
  ) {
    const { userId } = (req as any).auth;
    const workshop = await this.findWorkshopForAdmin(userId);
    if (!workshop) return { error: 'Taller no encontrado' };

    const full = await this.prisma.client$.workshop.findFirst({
      where: { id: workshop.id },
      include: { mecanicos: true },
    });

    const mechanicId = full?.mecanicos?.[0]?.id;
    if (!mechanicId) return { error: 'No hay mecánico activo disponible' };

    // Find service catalog by nombre
    const serviceCatalog = await this.prisma.client$.serviceCatalog.findFirst({
      where: { workshopId: workshop.id, nombre: body.serviceName },
    });

    // Find vehicle by placa or create placeholder
    let vehicle = await this.prisma.client$.vehicle.findFirst({
      where: { placa: body.vehicle },
    });

    if (!vehicle) {
      // Create a placeholder client first if needed
      const placeholderClient = await this.prisma.client$.cliente.create({
        data: {
          clerkId: crypto.randomUUID(),
          nombre: body.clientName,
          email: `placeholder-${crypto.randomUUID()}@m3motors.me`,
          telefono: '0000000000',
          status: 'ACTIVATED',
          idMecanicoActivo: mechanicId,
        },
      });

      vehicle = await this.prisma.client$.vehicle.create({
        data: {
          clienteId: placeholderClient.id,
          placa: body.vehicle,
          marca: 'DESCONOCIDA',
          modelo: 'DESCONOCIDO',
          anio: new Date().getFullYear(),
          status: 'PENDING',
          idMecanicoActivo: mechanicId,
        },
      });
    }

    const intervention = await this.prisma.client$.intervention.create({
      data: {
        vehiculoId: vehicle.id,
        mecanicoId: mechanicId,
        serviceCatalogId: serviceCatalog?.id ?? null,
        estado: body.status ?? 'PENDIENTE',
        manoDeObra: body.total ?? 0,
        kilometrajeOdometro: vehicle.ultimoKilometraje,
      },
      include: {
        vehiculo: true,
        serviceCatalog: true,
      },
    });

    return { order: intervention };
  }

  private generateTempPassword(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
