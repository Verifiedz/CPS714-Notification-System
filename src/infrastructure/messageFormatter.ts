/**
 * Formats a message template by replacing variables with actual values
 * Variables are specified using {{variableName}} syntax in the template
 * For EMAIL channel, extracts subject from variables or uses default
 * @param template - Message template with {{variable}} placeholders
 * @param variables - Key-value pairs to replace in template
 * @param channel - Channel type (EMAIL or SMS) to determine if subject is needed
 * @returns Object with formatted text and optional subject (for EMAIL only)
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
