export type NotificationChannel = 'EMAIL' | 'SMS';

export interface NotificationRecipient {
  email?: string;
  phone?: string;
  memberId?: string;
}

export interface ProviderMeta {
  correlationId?: string;
  idempotencyKey?: string;
}

export interface ChannelPayload {
  channel: NotificationChannel;
  recipient: NotificationRecipient;
  template?: string;
  message?: string;
  variables?: Record<string, any>;
  meta?: ProviderMeta;
}

export type ProviderStatus = 'SENT' | 'QUEUED' | 'FAILED';

export interface ProviderResult {
  status: ProviderStatus;
  providerMessageId?: string;
  error?: string;
}

export interface ChannelProvider {
  send(payload: ChannelPayload): Promise<ProviderResult>;
}
