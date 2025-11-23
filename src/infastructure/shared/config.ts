export const config = {
  EMAIL_API_KEY: process.env.SENDGRID_KEY || "mock-key",
  SMS_API_KEY: process.env.TWILIO_KEY || "mock-key",
  SERVICE_NAME: "NotificationService",
  MAX_RECIPIENTS: 1000,
};