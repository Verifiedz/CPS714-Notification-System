import { logInfo, logError } from "./logger";

export interface EmailParameters {
  to: string;
  subject: string;
  text: string;
  uniqueId?: string;
  correlationId?: string;
}



export const emailProvider = {
  async send({ to, subject, text }: EmailParameters) {
    try {
    
      logInfo(`Email to be sent ${to} the subject: ${subject}`);
      const providerMessageId = "mock-email-" + Date.now();
      return { id: providerMessageId };

    } catch (e: any) {
      logError(`Error occured Email failed to send ${e.message}`);
      throw e;
    }
  },
};
