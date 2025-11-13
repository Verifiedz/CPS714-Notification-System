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
