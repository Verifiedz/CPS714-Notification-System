import type {
  ChannelProvider,
  NotificationChannel,
  NotificationRecipient,
  ProviderMeta,
  ProviderResult,
} from './channels';

export interface SendNotificationInput {
  recipient: NotificationRecipient;
  channels: NotificationChannel[];
  template: string;
  variables?: Record<string, any>;
  correlationId?: string;
  idempotencyKey?: string;
}

export interface SendNotificationDependencies {
  email: ChannelProvider;
  sms: ChannelProvider;
}

function ensureRecipient(channel: NotificationChannel, recipient: NotificationRecipient) {
  if (!recipient) throw new Error('VALIDATION: recipient required');
  if (channel === 'EMAIL' && !recipient.email) {
    throw new Error('VALIDATION: email required');
  }
  if (channel === 'SMS' && !recipient.phone) {
    throw new Error('VALIDATION: phone required');
  }
}

function buildMeta(input: SendNotificationInput): ProviderMeta {
  return {
    correlationId: input.correlationId,
    idempotencyKey: input.idempotencyKey,
  };
}

export async function sendNotification(
  input: SendNotificationInput,
  deps: SendNotificationDependencies
): Promise<{ results: Partial<Record<NotificationChannel, ProviderResult>> }> {
  if (!Array.isArray(input.channels) || input.channels.length === 0) {
    throw new Error('VALIDATION: channels required');
  }
  if (!input.template) {
    throw new Error('VALIDATION: template required');
  }

  const results: Partial<Record<NotificationChannel, ProviderResult>> = {};
  const meta = buildMeta(input);

  for (const channel of input.channels) {
    if (channel !== 'EMAIL' && channel !== 'SMS') {
      throw new Error(`VALIDATION: unsupported channel ${channel}`);
    }
    ensureRecipient(channel, input.recipient);
    const provider = channel === 'EMAIL' ? deps.email : deps.sms;
    results[channel] = await provider.send({
      channel,
      recipient: input.recipient,
      template: input.template,
      variables: input.variables,
      meta,
    });
  }

  return { results };
}
