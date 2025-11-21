import type { ChannelProvider, NotificationChannel, ProviderResult } from './channels';
import type { MemberDirectoryClient, MemberRecord } from '../infrastructure/memberDirectoryClient';

export interface BroadcastAudience {
  segment?: string;
  memberIds?: string[];
}

export interface BroadcastInput {
  message: string;
  channels: NotificationChannel[];
  audience: BroadcastAudience;
  dryRun?: boolean;
  correlationId?: string;
}

export interface BroadcastDependencies {
  email: ChannelProvider;
  sms: ChannelProvider;
  directory: MemberDirectoryClient;
}

export interface BroadcastResult {
  dryRun: boolean;
  targets: number;
  sample: Array<Pick<MemberRecord, 'email' | 'phone' | 'memberId'>>;
  results?: Record<NotificationChannel, ProviderResult[]>;
}

const MAX_TARGETS = 1000;

function validateInput(input: BroadcastInput) {
  if (!input.message?.trim()) {
    throw new Error('VALIDATION: message required');
  }
  if (!Array.isArray(input.channels) || input.channels.length === 0) {
    throw new Error('VALIDATION: channels required');
  }
  if (!input.audience) {
    throw new Error('VALIDATION: audience required');
  }
}

function sampleMembers(members: MemberRecord[], count = 5) {
  return members.slice(0, count).map((member) => ({
    email: member.email,
    phone: member.phone,
    memberId: member.memberId,
  }));
}

export async function broadcastAnnouncement(
  input: BroadcastInput,
  deps: BroadcastDependencies
): Promise<BroadcastResult> {
  validateInput(input);
  const members = await deps.directory.listMembers(input.audience);
  const targets = members.length;

  if (!input.dryRun && targets > MAX_TARGETS) {
    throw new Error('TOO_MANY_TARGETS');
  }

  if (input.dryRun) {
    return { dryRun: true, targets, sample: sampleMembers(members) };
  }

  const results: Record<NotificationChannel, ProviderResult[]> = {
    EMAIL: [],
    SMS: [],
  };

  for (const member of members) {
    for (const channel of input.channels) {
      if (channel === 'EMAIL' && !member.email) continue;
      if (channel === 'SMS' && !member.phone) continue;
      const provider = channel === 'EMAIL' ? deps.email : deps.sms;
      const result = await provider.send({
        channel,
        recipient: { email: member.email, phone: member.phone, memberId: member.memberId },
        message: input.message,
        meta: { correlationId: input.correlationId },
      });
      results[channel].push(result);
    }
  }

  return { dryRun: false, targets, sample: sampleMembers(members), results };
}
