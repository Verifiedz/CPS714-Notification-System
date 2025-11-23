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

  const batchSize = 15; // process 15 members at a time
  let batch: Array<{ email?: string; phone?: string }> = [];

  for await (const member of memberDirectory.listRecipients(
    input.audience.segment
  )) {
    batch.push(member);

    // Process batch when it reaches the size limit
    if (batch.length >= batchSize) {
      const batchPromises = batch.map((m) => sendToMember(m));
      const results = await Promise.allSettled(batchPromises);

      // Aggregate results from the batch
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          emailSentCount += result.value.emailSent;
          smsSentCount += result.value.smsSent;
          result.value.errors.forEach((err) => {
            failureReasons[err] = (failureReasons[err] || 0) + 1;
          });
        }
      });

      totalProcessed += batch.length;
      batch = []; // clear batch for next round

      // Log progress so we know it's working
      if (totalProcessed % 100 === 0 || totalProcessed % 90 === 0) {
        console.log(`Broadcast progress: ${totalProcessed} members processed`);
      }
    }

    // Safety check - don't process more than configured max
    if (totalProcessed >= config.MAX_RECIPIENTS) {
      logInfo("Reached max recipient limit for broadcast");
      break;
    }
  }

  // Process any remaining members in the last partial batch
  if (batch.length > 0) {
    const batchPromises = batch.map((m) => sendToMember(m));
    const results = await Promise.allSettled(batchPromises);

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        emailSentCount += result.value.emailSent;
        smsSentCount += result.value.smsSent;
        result.value.errors.forEach((err) => {
          failureReasons[err] = (failureReasons[err] || 0) + 1;
        });
      }
    });

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
