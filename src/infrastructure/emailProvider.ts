import crypto from 'crypto';
import type { ChannelPayload, ChannelProvider, ProviderResult } from '../application/channels';
import { config } from '../shared/config';

export class SendgridEmailProvider implements ChannelProvider {
  constructor(private readonly apiKey: string = config.sendgridApiKey) {}

  async send(payload: ChannelPayload): Promise<ProviderResult> {
    if (!payload.recipient.email) {
      return { status: 'FAILED', error: 'MISSING_EMAIL' };
    }

    const messageId = this.createMessageId('sendgrid');

    if (!this.apiKey) {
      return { status: 'QUEUED', providerMessageId: messageId };
    }

    return { status: 'SENT', providerMessageId: messageId };
  }

  private createMessageId(prefix: string) {
    if (typeof crypto.randomUUID === 'function') {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now().toString(36)}`;
  }
}
