import sgMail from '@sendgrid/mail';
import { config } from '../shared/config';
import { logInfo, logError } from "./logger";

// Initialize SendGrid with API key from config
sgMail.setApiKey(config.sendgridApiKey);

export interface EmailParameters {
  to: string;
  subject: string;
  text: string;
  uniqueId?: string;
  correlationId?: string;
}

export class SendgridEmailProvider {
  async send({ to, subject, text, correlationId }: EmailParameters) {
    try {
      // Real SendGrid integration
      const msg = {
        to,
        from: config.sendgridFromEmail || 'noreply@example.com', // You'll set this in .env
        subject,
        text,
      };

      const response = await sgMail.send(msg);
      const providerMessageId = response[0].headers['x-message-id'] || 'sent-' + Date.now();

      logInfo(`✓ Email sent to ${to} with subject: ${subject}${correlationId ? ` (correlationId: ${correlationId})` : ''} - Message ID: ${providerMessageId}`);
      return { id: providerMessageId };
    } catch (e: any) {
      logError(`✗ Email failed to send to ${to}${correlationId ? ` (correlationId: ${correlationId})` : ''} - ${e.message}`);
      throw e;
    }
  }
}

// Legacy export for backward compatibility
export const emailProvider = new SendgridEmailProvider();
