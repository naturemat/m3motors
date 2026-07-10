export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export abstract class IEmailService {
  abstract sendEmail(params: SendEmailParams): Promise<SendEmailResponse>;
}
