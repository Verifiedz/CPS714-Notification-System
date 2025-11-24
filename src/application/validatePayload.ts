/**
 * Validation functions for notification and broadcast inputs
 * Ensures all required fields are present before processing
 */

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

/**
 * Validates notification input before sending
 * Ensures recipient has at least one contact method and all required fields are present
 */
export function validateNotificationInput(input: any): void {
  if (!input || typeof input !== 'object') {
    throw new Error("VALIDATION_ERROR: Input must be an object");
  }

  if (!input.recipient) {
    throw new Error("VALIDATION_ERROR: recipient is required");
  }

  if (!input.recipient.email && !input.recipient.phone) {
    throw new Error("VALIDATION_ERROR: need at least email or phone number");
  }

  if (!input.channels || input.channels.length === 0) {
    throw new Error("VALIDATION_ERROR: channels array is required");
  }

  if (!input.template) {
    throw new Error("VALIDATION_ERROR: template is required");
  }
}

/**
 * Validates broadcast announcement input before processing
 * Ensures message is not empty and target audience is specified
 */
export function validateBroadcastInput(input: any): void {
  if (!input || typeof input !== 'object') {
    throw new Error("VALIDATION_ERROR: Input must be an object");
  }

  if (!input.message || input.message.trim() === "") {
    throw new Error("VALIDATION_ERROR: message cannot be empty");
  }

  if (!input.channels || input.channels.length === 0) {
    throw new Error("VALIDATION_ERROR: need at least one channel");
  }

  if (!input.audience || !input.audience.segment) {
    throw new Error("VALIDATION_ERROR: audience segment is required");
  }
}
