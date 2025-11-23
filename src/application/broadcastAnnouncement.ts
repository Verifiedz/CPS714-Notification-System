import { validateBroadcastInput, BroadcastInput } from "./validatePayload";
import { emailProvider } from "../infrastructure/emailProvider";
import { smsProvider } from "../infrastructure/smsProvider";
import { logInfo, logError } from "../infrastructure/logger";
import { config } from "../shared/config";
import { aggregateBatchResults } from "./_utils/batchHelpers";

// Constants for broadcast processing
const DRY_RUN_SAMPLE_SIZE = 10; // Number of sample recipients to return in dry run
const BATCH_SIZE = 15; // Number of members to process concurrently in each batch
const PROGRESS_LOG_INTERVAL = 100; // Log progress every N members processed

/**
 * Interface for member directory service
 * Provides async iteration over members in a given audience segment
 */
export interface MemberDirectory {
  listRecipients(segment: string): AsyncGenerator<{
    email?: string;
    phone?: string;
  }>;
}

/**
 * Broadcasts an announcement to multiple members in an audience segment
 * Used by Admin Dashboard to send announcements to all members
 * Supports dry run mode to preview recipients before sending
 * Processes members in batches for better performance and error handling
 * @param input - Broadcast details including message, channels, and audience segment
 * @param memberDirectory - Service to fetch member list for the target segment
 * @returns Object with total targets, sent counts, and any failure reasons
 */
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
      if (sample.length < DRY_RUN_SAMPLE_SIZE) {
        sample.push(member);
      }
      totalCount++;

      // Safety limit even for dry run
      if (totalCount >= config.maxRecipients) {
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

  // Helper function to send to a single member across all channels
  async function sendToMember(member: {
    email?: string;
    phone?: string;
  }) {
    const results = { emailSent: 0, smsSent: 0, errors: [] as string[] };

    for (const channel of input.channels) {
      try {
        if (channel === "EMAIL" && member.email) {
          await emailProvider.send({
            to: member.email,
            subject: "Gym Announcement",
            text: input.message,
          });
          results.emailSent++;
        } else if (channel === "SMS" && member.phone) {
          await smsProvider.send({
            to: member.phone,
            body: input.message,
          });
          results.smsSent++;
        }
      } catch (e: any) {
        const reason = e.message || "UNKNOWN_ERROR";
        results.errors.push(reason);
        logError(`Broadcast send failed for ${channel}: ${reason}`);
      }
    }

    return results;
  }

  // Actually send the broadcast - process in batches for better performance
  let emailSentCount = 0;
  let smsSentCount = 0;
  let totalProcessed = 0;
  const failureReasons: Record<string, number> = {};

  let batch: Array<{ email?: string; phone?: string }> = [];

  for await (const member of memberDirectory.listRecipients(
    input.audience.segment
  )) {
    batch.push(member);

    // Process batch when it reaches the size limit
    if (batch.length >= BATCH_SIZE) {
      const batchPromises = batch.map((m) => sendToMember(m));
      const results = await Promise.allSettled(batchPromises);

      // Aggregate results from the batch
      const batchCounts = aggregateBatchResults(results, failureReasons);
      emailSentCount += batchCounts.emailSent;
      smsSentCount += batchCounts.smsSent;

      totalProcessed += batch.length;
      batch = []; // clear batch for next round

      // Log progress so we know it's working
      if (totalProcessed % PROGRESS_LOG_INTERVAL === 0) {
        logInfo(`Broadcast progress: ${totalProcessed} members processed`);
      }
    }

    // Safety check - don't process more than configured max
    if (totalProcessed >= config.maxRecipients) {
      logInfo("Reached max recipient limit for broadcast");
      break;
    }
  }

  // Process any remaining members in the last partial batch
  if (batch.length > 0) {
    const batchPromises = batch.map((m) => sendToMember(m));
    const results = await Promise.allSettled(batchPromises);

    // Aggregate results from final batch
    const batchCounts = aggregateBatchResults(results, failureReasons);
    emailSentCount += batchCounts.emailSent;
    smsSentCount += batchCounts.smsSent;

    totalProcessed += batch.length;
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
