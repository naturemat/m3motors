import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { VehicleQR } from '../../domain/value-objects/VehicleQR';
import { ServicioGeneracionQR } from '../../domain/domain-services/ServicioGeneracionQR';

@Injectable()
export class QRServiceImpl implements ServicioGeneracionQR {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.QR_BASE_URL ?? 'https://m3motors.app/vehicle';
  }

  generarQR(vehicleId: string): VehicleQR {
    const codigo = this.generarCodigoUnico();
    const url = `${this.baseUrl}/${vehicleId}`;

    return new VehicleQR(codigo, new Date(), url);
  }

  async generarImagenQR(codigo: string): Promise<string> {
    const url = `${this.baseUrl}/${codigo}`;
    const imagen = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
    });
    return imagen;
  }

  private generarCodigoUnico(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultado = 'QR-';
    for (let i = 0; i < 4; i++) {
      resultado += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    resultado += '-';
    for (let i = 0; i < 4; i++) {
      resultado += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return resultado;
  }
}
