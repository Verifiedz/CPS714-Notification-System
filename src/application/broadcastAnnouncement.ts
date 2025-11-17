import { validateBroadcastInput, BroadcastInput } from "./validatePayload";
import { emailProvider } from "../infastructure/emailProvider";
import { smsProvider } from "../infastructure/smsProvider";
import { logInfo, logError } from "../infastructure/logger";
import { config } from "../infastructure/shared/config";

// Interface for member directory - will be provided by external service
export interface MemberDirectory {
  listRecipients(segment: string): AsyncGenerator<{
    email?: string;
    phone?: string;
  }>;
}

// Used by Admin Dashboard to broadcast announcements to all members
export async function broadcastAnnouncement(
  input: BroadcastInput,
  memberDirectory: MemberDirectory
) {
  validateBroadcastInput(input);

  // Dry run mode - preview who would get the message before actually sending
  if (input.dryRun) {
    const sample: Array<{ email?: string; phone?: string }> = [];
    let totalCount = 0;

    for await (const member of memberDirectory.listRecipients(
      input.audience.segment
    )) {
      if (sample.length < 10) {
        sample.push(member);
      }
      totalCount++;

      // Safety limit even for dry run
      if (totalCount >= config.MAX_RECIPIENTS) {
        logInfo("Hit max recipient limit during dry run");
        break;
      }
    }

    return {
      dryRun: true,
      targets: totalCount,
      sample: sample,
    };
  }

  // Actually send the broadcast
  let emailSentCount = 0;
  let smsSentCount = 0;
  let totalProcessed = 0;
  const failureReasons: Record<string, number> = {};

  // TODO: This processes members one at a time which might be slow for large broadcasts
  // Could add batching or parallel processing later if needed
  for await (const member of memberDirectory.listRecipients(
    input.audience.segment
  )) {
    totalProcessed++;

    // Log progress so we know it's working
    if (totalProcessed % 100 === 0) {
      console.log(`Broadcast progress: ${totalProcessed} members processed`);
    }

    // Send via each requested channel
    for (const channel of input.channels) {
      try {
        if (channel === "EMAIL" && member.email) {
          await emailProvider.send({
            to: member.email,
            subject: "Gym Announcement",
            text: input.message,
          });
          emailSentCount++;
        } else if (channel === "SMS" && member.phone) {
          await smsProvider.send({
            to: member.phone,
            body: input.message,
          });
          smsSentCount++;
        }
      } catch (e: any) {
        const reason = e.message || "UNKNOWN_ERROR";
        failureReasons[reason] = (failureReasons[reason] || 0) + 1;
        logError(`Broadcast send failed for ${channel}: ${reason}`);
      }
    }

    // Safety check - don't process more than configured max
    if (totalProcessed >= config.MAX_RECIPIENTS) {
      logInfo("Reached max recipient limit for broadcast");
      break;
    }
  }

  logInfo(
    `Broadcast complete: ${totalProcessed} members, ${emailSentCount} emails, ${smsSentCount} SMS`
  );

  return {
    targets: totalProcessed,
    sent: {
      EMAIL: emailSentCount,
      SMS: smsSentCount,
    },
    failed: failureReasons,
  };
}
