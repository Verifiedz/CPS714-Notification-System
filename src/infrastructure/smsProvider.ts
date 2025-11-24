import twilio from 'twilio';
import { config } from '../shared/config';
import { logInfo, logError } from "./logger";

// Initialize Twilio client with credentials from config
const client = twilio(config.twilioAccountSid, config.twilioAuthToken);

export interface SmsParams {
  to: string;
  body: string;
  uniqueId?: string;
  correlationId?: string;
}
// class for twilio integration send data to twilio API
export class TwilioSmsProvider {
  async send({ to, body, correlationId }: SmsParams) {
    try {
      // Real Twilio integration
      const message = await client.messages.create({
        body,
        from: config.twilioFromNumber,
        to,
      });

      const providerMessageId = message.sid;

      logInfo(`✓ SMS sent to: ${to} with message: ${body}${correlationId ? ` (correlationId: ${correlationId})` : ''} - Message SID: ${providerMessageId}`);
      return { id: providerMessageId };
    } catch (e: any) {
      logError(`✗ SMS message failed to send to ${to}${correlationId ? ` (correlationId: ${correlationId})` : ''} - ${e.message}`);
      throw e;
    }
  }
}

export const smsProvider = new TwilioSmsProvider();
