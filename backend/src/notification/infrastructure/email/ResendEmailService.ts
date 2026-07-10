import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  IEmailService,
  SendEmailParams,
  SendEmailResponse,
} from '../../domain/ports/IEmailService';

@Injectable()
export class ResendEmailService implements IEmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>(
      'RESEND_FROM_EMAIL',
      'onboarding@resend.dev',
    );

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY no configurado');
    }

    this.resend = new Resend(apiKey);
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResponse> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      });

      if (error) {
        this.logger.error(`Error de Resend: ${error.message}`);
        return {
          success: false,
          error: error.message,
        };
      }

      this.logger.log(`Email enviado exitosamente: ${data?.id}`);
      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error enviando email: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
