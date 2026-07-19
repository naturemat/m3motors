/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpCode,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UnifiedAuthGuard } from '../../shared/infrastructure/auth/unified-auth.guard';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { CreateVehicleDTO } from '../../application/dto/CreateVehicleDTO';
import { UploadPhotoDTO } from '../../application/dto/UploadPhotoDTO';
import { ObtenerHistorialVehiculo } from '../../registro-seguimiento/application/use-cases/ObtenerHistorialVehiculo';
import { QRServiceImpl } from '../../registro-seguimiento/infrastructure/external-services/QRServiceImpl';
import { SupabaseStorageService } from '../../shared/infrastructure/storage/supabase-storage.service';
import {
  ISERVICIO_GENERACION_QR,
  IOCR_SERVICE,
} from '../../shared/domain/ports/tokens';

@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller('vehicles')
@UseGuards(UnifiedAuthGuard)
export class VehicleController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly obtenerHistorial: ObtenerHistorialVehiculo,
    @Inject(ISERVICIO_GENERACION_QR) private readonly qrService: QRServiceImpl,
    @Inject(IOCR_SERVICE) private readonly ocrService: any,
    private readonly storageService: SupabaseStorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar vehículos del taller' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos' })
  async findAll(@Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      return { vehicles: [] };
    }

    const vehicles = await this.prisma.client$.vehicle.findMany({
      where: { idMecanicoActivo: mechanic.id },
      include: { qr: true, fotos: true },
    });

    return { vehicles };
  }

  // NOTE: qr/:qrCode MUST come before :id to avoid NestJS route collision
  @Get('qr/:qrCode')
  @ApiOperation({ summary: 'Obtener historial completo por QR' })
  @ApiResponse({ status: 200, description: 'Historial del vehiculo' })
  @ApiResponse({ status: 404, description: 'QR no valido' })
  async findByQr(@Param('qrCode') qrCode: string) {
    const historial = await this.obtenerHistorial.execute(qrCode);

    if (!historial) {
      return { error: 'Codigo QR no valido. Intenta nuevamente.' };
    }

    return historial;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener perfil completo de un vehículo' })
  @ApiResponse({ status: 200, description: 'Perfil del vehículo con timeline' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const vehicle = await this.prisma.client$.vehicle.findUnique({
      where: { id },
      include: {
        qr: true,
        fotos: true,
        intervenciones: {
          orderBy: { fecha: 'desc' },
          include: {
            detalles: { include: { partsCatalog: true } },
            fotos: true,
            mecanico: { select: { nombre: true } },
          },
        },
        alertas: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!vehicle) {
      return { error: 'Vehículo no encontrado' };
    }

    return vehicle;
  }

  @Get(':id/qr-image')
  @ApiOperation({ summary: 'Obtener imagen QR del vehículo' })
  @ApiResponse({ status: 200, description: 'Imagen QR en base64' })
  @ApiResponse({ status: 404, description: 'Vehículo sin QR' })
  async getQrImage(@Param('id', ParseIntPipe) id: number) {
    const vehicle = await this.prisma.client$.vehicle.findUnique({
      where: { id },
      include: { qr: true },
    });

    if (!vehicle?.qr) {
      return { error: 'Vehículo no tiene código QR generado' };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const imagen = await this.qrService.generarImagenQR(vehicle.qr.codigo);

    return {
      vehicleId: id,
      qrCode: vehicle.qr.codigo,
      qrUrl: vehicle.qr.url,
      qrImage: imagen,
    };
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Registrar un nuevo vehículo' })
  @ApiResponse({ status: 201, description: 'Vehículo creado' })
  async create(@Body() dto: CreateVehicleDTO, @Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      return { error: 'Mecánico no encontrado' };
    }

    const vehicle = await this.prisma.client$.vehicle.create({
      data: {
        placa: dto.placa,
        marca: dto.marca,
        modelo: dto.modelo,
        anio: dto.anio,
        tipoMotor: dto.tipoMotor,
        status: 'PENDING',
        ultimoKilometraje: 0,
        clienteId: dto.clienteId ?? 1,
        idMecanicoActivo: mechanic.id,
      },
    });

    return vehicle;
  }

  @Put(':id/update-km')
  @ApiOperation({ summary: 'Actualizar kilometraje del vehículo' })
  @ApiResponse({ status: 200, description: 'Kilometraje actualizado' })
  async updateKm(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { kilometraje: number },
  ) {
    const vehicle = await this.prisma.client$.vehicle.update({
      where: { id },
      data: { ultimoKilometraje: body.kilometraje },
    });

    return { vehicle };
  }

  @Post(':id/photo')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Subir foto del vehículo (OCR reconoce placa automaticamente)',
  })
  @ApiResponse({ status: 201, description: 'Foto subida y procesada' })
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UploadPhotoDTO,
    @Req() req: Request,
  ) {
    const { userId } = (req as any).auth;

    const vehicle = await this.prisma.client$.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return { error: 'Vehiculo no encontrado' };
    }

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    const photoUrl = await this.storageService.uploadImage(
      dto.fotoBase64,
      dto.mimeType,
      'vehicles',
    );

    const photo = await this.prisma.client$.vehiclePhoto.create({
      data: {
        vehiculoId: id,
        url: photoUrl,
        tipo: dto.tipo ?? 'VEHICLE',
        idMecanicoCapturo: mechanic?.id ?? 0,
        descripcion: dto.descripcion ?? null,
      },
    });

    return { photo, url: photoUrl };
  }

  @Post('recognize-plate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reconocer placa desde foto (OCR)' })
  @ApiResponse({ status: 200, description: 'Placa reconocida' })
  async recognizePlate(@Body() dto: UploadPhotoDTO) {
    const base64Clean = dto.fotoBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    const placa = await this.ocrService.reconocerPlaca(buffer, dto.mimeType);

    const existingVehicle = await this.prisma.client$.vehicle.findFirst({
      where: { placa },
    });

    return {
      placa,
      vehicleExists: !!existingVehicle,
      vehicle: existingVehicle ?? null,
    };
  }

  @Post('qr/generate/:id')
  @HttpCode(201)
  @ApiOperation({ summary: 'Generar QR para un vehiculo existente' })
  @ApiResponse({ status: 201, description: 'QR generado' })
  async generateQr(@Param('id', ParseIntPipe) id: number) {
    const vehicle = await this.prisma.client$.vehicle.findUnique({
      where: { id },
      include: { qr: true },
    });

    if (!vehicle) {
      return { error: 'Vehiculo no encontrado' };
    }

    if (vehicle.qr) {
      return { qr: vehicle.qr, message: 'QR ya existe para este vehiculo' };
    }

    const qrObj = this.qrService.generarQR(String(id));

    const qr = await this.prisma.client$.vehicleQR.create({
      data: {
        vehiculoId: id,
        codigo: qrObj.getCodigo(),
        url: qrObj.getUrl(),
      },
    });

    return { qr };
  }

  @Get(':id/prediction')
  @ApiOperation({
    summary: 'Predecir proximo mantenimiento basado en kilometraje',
  })
  @ApiResponse({ status: 200, description: 'Prediccion de mantenimiento' })
  async getPrediction(@Param('id', ParseIntPipe) id: number) {
    const vehicle = await this.prisma.client$.vehicle.findUnique({
      where: { id },
      include: {
        intervenciones: {
          orderBy: { fecha: 'desc' },
          take: 5,
          include: { detalles: true },
        },
      },
    });

    if (!vehicle) {
      return { error: 'Vehiculo no encontrado' };
    }

    const kmActual = vehicle.ultimoKilometraje;
    const tasaDesgaste = vehicle.tasaDesgasteKmSem;

    const predicciones: {
      servicio: string;
      kmEstimado: number;
      semanasEstimadas: number;
      prioridad: string;
    }[] = [];

    const serviciosBase = [
      { servicio: 'Cambio de aceite', kmIntervalo: 5000 },
      { servicio: 'Frenos', kmIntervalo: 15000 },
      { servicio: 'Alineacion y balanceo', kmIntervalo: 10000 },
      { servicio: 'Cambio de correa', kmIntervalo: 40000 },
    ];

    for (const s of serviciosBase) {
      const ultimaIntervencion = vehicle.intervenciones.find((i) =>
        i.diagnostico
          ?.toLowerCase()
          .includes(s.servicio.toLowerCase().split(' ')[0]),
      );

      const kmDesdeUltima = ultimaIntervencion
        ? kmActual - ultimaIntervencion.kilometrajeOdometro
        : kmActual;

      const kmRestante = s.kmIntervalo - kmDesdeUltima;
      const semanasEstimadas =
        tasaDesgaste > 0
          ? Math.max(0, Math.round(kmRestante / tasaDesgaste))
          : 0;

      predicciones.push({
        servicio: s.servicio,
        kmEstimado: Math.max(0, kmRestante),
        semanasEstimadas,
        prioridad:
          kmRestante <= 500
            ? 'CRITICA'
            : kmRestante <= 2000
              ? 'ALTA'
              : kmRestante <= 5000
                ? 'MEDIA'
                : 'BAJA',
      });
    }

    return {
      vehiculo: {
        id,
        placa: vehicle.placa,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
      },
      kmActual,
      tasaDesgasteSemanal: tasaDesgaste,
      predicciones,
    };
  }
}
