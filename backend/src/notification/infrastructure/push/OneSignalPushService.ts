/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import {
  IPushService,
  SendPushParams,
  SendPushResponse,
} from '../../domain/ports/IPushService';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OneSignalPushService implements IPushService {
  private readonly logger = new Logger(OneSignalPushService.name);
  private readonly appId: string;
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.onesignal.com/notifications';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.appId = this.configService.get<string>('ONESIGNAL_APP_ID', '');
    this.apiKey = this.configService.get<string>('ONESIGNAL_REST_API_KEY', '');

    if (!this.appId || !this.apiKey) {
      this.logger.warn('Credenciales de OneSignal no configuradas');
    }
  }

  async sendPush(params: SendPushParams): Promise<SendPushResponse> {
    try {
      const payload = {
        app_id: this.appId,
        contents: { en: params.content },
        headings: { en: params.heading },
        include_player_ids: [params.externalId],
        data: params.data || {},
      };

      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Key ${this.apiKey}`,
          },
        }),
      );

      const data = response.data;

      if (data.errors) {
        const errorMessage = Object.values(data.errors).join(', ');
        this.logger.error(`Error de OneSignal: ${errorMessage}`);
        return {
          success: false,
          error: errorMessage,
        };
      }

      this.logger.log(`Push notification enviada: ${data.id}`);
      return {
        success: true,
        messageId: data.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error enviando push: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
