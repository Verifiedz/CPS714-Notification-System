// Basic validation for notification inputs

export interface NotificationInput {
  recipient: {
    email?: string;
    phone?: string;
  };
  channels: string[];
  template: string;
  variables: Record<string, string>;
}

export interface BroadcastInput {
  message: string;
  channels: string[];
  audience: {
    segment: string;
  };
  dryRun?: boolean;
}

export function validateNotificationInput(input: any): void {
  if (!input.recipient) {
    throw new Error("recipient is required");
  }

  if (!input.recipient.email && !input.recipient.phone) {
    throw new Error("need at least email or phone number");
  }

  if (!input.channels || input.channels.length === 0) {
    throw new Error("channels array is required");
  }

  if (!input.template) {
    throw new Error("template is required");
  }
}

export function validateBroadcastInput(input: any): void {
  if (!input.message || input.message.trim() === "") {
    throw new Error("message cannot be empty");
  }

  if (!input.channels || input.channels.length === 0) {
    throw new Error("need at least one channel");
  }

  if (!input.audience || !input.audience.segment) {
    throw new Error("audience segment is required");
  }
}
