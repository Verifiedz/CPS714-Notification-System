import { logInfo, logError } from "./logger";

export interface EmailParameters {
  to: string;
  subject: string;
  text: string;
  uniqueId?: string;
  correlationId?: string;
}
//Provider layer to import Data for SendGrid API
export class SendgridEmailProvider {
  async send({ to, subject, text, correlationId }: EmailParameters) {
    try {
      logInfo(`Email to be sent to ${to} with subject: ${subject}${correlationId ? ` (correlationId: ${correlationId})` : ''}`);
      const providerMessageId = "mock-email-" + Date.now();
      return { id: providerMessageId };
    } catch (e: any) {
      logError(`Error occurred: Email failed to send to ${to}${correlationId ? ` (correlationId: ${correlationId})` : ''} - ${e.message}`);
      throw e;
    }
  }
}

// Legacy export for backward compatibility
export const emailProvider = new SendgridEmailProvider();
