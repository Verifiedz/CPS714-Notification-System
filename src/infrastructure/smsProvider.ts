import crypto from 'crypto';
import type { ChannelPayload, ChannelProvider, ProviderResult } from '../application/channels';
import { config } from '../shared/config';

export class TwilioSmsProvider implements ChannelProvider {
  constructor(
    private readonly accountSid: string = config.twilioAccountSid,
    private readonly authToken: string = config.twilioAuthToken
  ) {}

  async send(payload: ChannelPayload): Promise<ProviderResult> {
    if (!payload.recipient.phone) {
      return { status: 'FAILED', error: 'MISSING_PHONE' };
    }

    const messageId = this.createMessageId('twilio');

    if (!this.accountSid || !this.authToken) {
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
