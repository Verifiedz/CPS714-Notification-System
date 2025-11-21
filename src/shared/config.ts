export interface AppConfig {
  apiKey: string;
  hmacSecret: string;
  sendgridApiKey: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioFromNumber: string;
  memberDirectoryUrl: string;
}

function readEnv(key: string) {
  if (typeof process === 'undefined' || !process.env) return '';
  return process.env[key] || '';
}

export const config: AppConfig = {
  apiKey: readEnv('API_KEY'),
  hmacSecret: readEnv('HMAC_SECRET'),
  sendgridApiKey: readEnv('SENDGRID_API_KEY'),
  twilioAccountSid: readEnv('TWILIO_ACCOUNT_SID'),
  twilioAuthToken: readEnv('TWILIO_AUTH_TOKEN'),
  twilioFromNumber: readEnv('TWILIO_FROM_NUMBER'),
  memberDirectoryUrl: readEnv('MEMBER_DIRECTORY_URL'),
};
