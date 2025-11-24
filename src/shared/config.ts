/**
 * Centralized application configuration
 * Loads all settings from environment variables with fallback defaults
 */

export interface AppConfig {
  // Authentication
  apiKey: string;

  // Email provider (Sendgrid)
  sendgridApiKey: string;

  // SMS provider (Twilio)
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioFromNumber: string;

  // External services
  memberDirectoryUrl: string;

  // Application settings
  serviceName: string;
  maxRecipients: number;
}

function readEnv(key: string, defaultValue: string = ''): string {
  if (typeof process === 'undefined' || !process.env) return defaultValue;
  return process.env[key] || defaultValue;
}

/**
 * Application configuration loaded from environment variables
 * Use mock/default values for development and testing
 */
export const config: AppConfig = {
  // Authentication
  apiKey: readEnv('API_KEY', 'test-api-key-123'),

  // Email provider
  sendgridApiKey: readEnv('SENDGRID_API_KEY', 'mock-sendgrid-key'),

  // SMS provider
  twilioAccountSid: readEnv('TWILIO_ACCOUNT_SID', 'mock-account-sid'),
  twilioAuthToken: readEnv('TWILIO_AUTH_TOKEN', 'mock-auth-token'),
  twilioFromNumber: readEnv('TWILIO_FROM_NUMBER', '+1234567890'),

  // External services
  memberDirectoryUrl: readEnv('MEMBER_DIRECTORY_URL', 'http://localhost:3001'),

  // Application settings
  serviceName: 'NotificationService',
  maxRecipients: parseInt(readEnv('MAX_RECIPIENTS', '1000'), 10),
};
