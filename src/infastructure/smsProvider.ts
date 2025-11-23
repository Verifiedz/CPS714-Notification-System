import { logInfo, logError } from "./logger";

export interface SmsParams {
  to: string;
  body: string;
  uniqueId?: string;
  correlationId?: string;
}

export const smsProvider = {
  async send({ to, body }: SmsParams) {
    try {
      logInfo(`SMS is to be sent to: ${to} with the message:${body}`);

      const providerMessageId = "mock-sms-" + Date.now();
      return { id: providerMessageId };
    } catch (e: any) {
      logError(`the SMS message failed to send due to error:${e.message}`);
      throw e;
    }
  },
};
