import { logInfo, logError } from "./logger";

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
      
      logInfo(`SMS to be sent to: ${to} with message: ${body}${correlationId ? ` (correlationId: ${correlationId})` : ''}`);
      const providerMessageId = "mock-sms-" + Date.now();
      return { id: providerMessageId };
    } catch (e: any) {
      logError(`SMS message failed to send to ${to}${correlationId ? ` (correlationId: ${correlationId})` : ''} - ${e.message}`);
      throw e;
    }
  }
}

export const smsProvider = new TwilioSmsProvider();
