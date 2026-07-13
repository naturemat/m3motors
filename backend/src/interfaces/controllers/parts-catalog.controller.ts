/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ClerkAuthGuard } from '../../shared/infrastructure/clerk/clerk.guard';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';

@ApiTags('Parts Catalog')
@Controller('parts-catalog')
export class PartsCatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar catálogo de repuestos (global + taller)' })
  @ApiQuery({ name: 'categoria', required: false, type: String })
  @ApiQuery({ name: 'subcategoria', required: false, type: String })
  @ApiQuery({ name: 'workshopId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de repuestos' })
  async findAll(
    @Query('categoria') categoria?: string,
    @Query('subcategoria') subcategoria?: string,
    @Query('workshopId') workshopId?: string,
  ) {
    const where: Record<string, unknown> = { activo: true };

    if (categoria) where.categoria = categoria;
    if (subcategoria) where.subcategoria = subcategoria;
    if (workshopId) {
      // Incluir global (null) + específico del taller
      where.OR = [{ workshopId: null }, { workshopId: parseInt(workshopId) }];
    } else {
      // Solo catálogo global
      where.workshopId = null;
    }

    const parts = await this.prisma.client$.partsCatalog.findMany({
      where,
      orderBy: [
        { categoria: 'asc' },
        { subcategoria: 'asc' },
        { nombre: 'asc' },
      ],
    });

    return { parts };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorías disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de categorías únicas' })
  async findCategories() {
    const categories = await this.prisma.client$.partsCatalog.findMany({
      where: { activo: true, workshopId: null },
      distinct: ['categoria'],
      select: { categoria: true },
      orderBy: { categoria: 'asc' },
    });

    return {
      categories: categories.map((c: { categoria: string }) => c.categoria),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un repuesto por ID' })
  @ApiResponse({ status: 200, description: 'Repuesto encontrado' })
  @ApiResponse({ status: 404, description: 'Repuesto no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const part = await this.prisma.client$.partsCatalog.findUnique({
      where: { id },
    });

    if (!part) {
      return { error: 'Repuesto no encontrado' };
    }

    return { part };
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear repuesto personalizado del taller' })
  @ApiResponse({ status: 201, description: 'Repuesto creado' })
  async create(
    @Body()
    body: {
      workshopId: number;
      categoria: string;
      subcategoria: string;
      nombre: string;
      vidaUtilKm: number;
      vidaUtilDias?: number;
      marcasComunes?: string;
      notas?: string;
    },
    @Req() _req: Request,
  ) {
    const part = await this.prisma.client$.partsCatalog.create({
      data: {
        workshopId: body.workshopId,
        categoria: body.categoria,
        subcategoria: body.subcategoria,
        nombre: body.nombre,
        vidaUtilKm: body.vidaUtilKm,
        vidaUtilDias: body.vidaUtilDias ?? null,
        marcasComunes: body.marcasComunes ?? null,
        notas: body.notas ?? null,
      },
    });

    return { part };
  }
}
