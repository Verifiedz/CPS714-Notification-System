import { validateNotificationInput, NotificationInput } from "./validatePayload";
import { emailProvider } from "../infrastructure/emailProvider";
import { smsProvider } from "../infrastructure/smsProvider";
import { formatMessage } from "../infrastructure/messageFormatter";
import { logInfo, logError } from "../infrastructure/logger";

/**
 * Sends a notification to a single recipient via specified channels
 */
export async function sendNotification(input: NotificationInput) {
  validateNotificationInput(input);

  const results: Record<string, any> = {};

  // Try each channel they requested
  for (const channel of input.channels) {
    try {
      const message = formatMessage(
        input.template,
        input.variables,
        channel as "EMAIL" | "SMS"
      );

      if (channel === "EMAIL" && input.recipient.email) {
        const response = await emailProvider.send({
          to: input.recipient.email,
          subject: message.subject || "Notification",
          text: message.text,
        });

        results.EMAIL = { status: "SENT", id: response.id };
        logInfo(`Email sent to ${input.recipient.email}`);
      } else if (channel === "SMS" && input.recipient.phone) {
        const response = await smsProvider.send({
          to: input.recipient.phone,
          body: message.text,
        });

        results.SMS = { status: "SENT", id: response.id };
        logInfo(`SMS sent to ${input.recipient.phone}`);
      } else {
        // User doesn't have contact info for this channel
        results[channel] = {
          status: "SKIPPED",
          reason: "no contact method available",
        };
      }
    } catch (e: any) {
      logError(`Failed to send ${channel}: ${e.message}`);
      results[channel] = { status: "FAILED", error: e.message };
    }
  }

  return { results };
}
