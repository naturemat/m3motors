export interface SendPushParams {
  externalId: string;
  heading: string;
  content: string;
  data?: Record<string, unknown>;
}

export interface SendPushResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export abstract class IPushService {
  abstract sendPush(params: SendPushParams): Promise<SendPushResponse>;
}
