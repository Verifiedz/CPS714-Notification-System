/**
 * Formats a message template by replacing variables with actual values
 * Format messaeg to inlcude RegExp based textual changes. Allow for flexible format.
 */
export function formatMessage(
  template: string,
  variables: Record<string, string>,
  channel: "EMAIL" | "SMS"
) {
  let text = template;
  for (const [key, value] of Object.entries(variables)) {
    text = text.replace(new RegExp(`{{${key}}}`, "g"), value);
  }

  const subject = channel === "EMAIL" ? variables.subject || "Notification" : undefined;
  return { text, subject };
}
