import { sendNotification } from './sendNotification';
import * as emailProvider from '../infrastructure/emailProvider';
import * as smsProvider from '../infrastructure/smsProvider';
import * as messageFormatter from '../infrastructure/messageFormatter';
import * as logger from '../infrastructure/logger';

jest.mock('../infrastructure/emailProvider');
jest.mock('../infrastructure/smsProvider');
jest.mock('../infrastructure/messageFormatter');
jest.mock('../infrastructure/logger');

describe('sendNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock formatMessage to return simple result
    (messageFormatter.formatMessage as jest.Mock).mockReturnValue({
      text: 'Formatted message',
      subject: 'Test Subject',
    });

    // Mock email provider to return success
    (emailProvider.emailProvider.send as jest.Mock).mockResolvedValue({
      id: 'email-123',
    });

    // Mock SMS provider to return success
    (smsProvider.smsProvider.send as jest.Mock).mockResolvedValue({
      id: 'sms-456',
    });
  });

  it('should send email successfully', async () => {
    const input = {
      recipient: { email: 'user@example.com' },
      channels: ['EMAIL'],
      template: 'Hello {{name}}',
      variables: { name: 'John' },
    };

    const { results } = await sendNotification(input);

    expect(results.EMAIL.status).toBe('SENT');
    expect(results.EMAIL.id).toBe('email-123');
    expect(emailProvider.emailProvider.send).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Test Subject',
      text: 'Formatted message',
    });
  });

  it('should send SMS successfully', async () => {
    const input = {
      recipient: { phone: '+1234567890' },
      channels: ['SMS'],
      template: 'Your code: {{code}}',
      variables: { code: '123456' },
    };

    const { results } = await sendNotification(input);

    expect(results.SMS.status).toBe('SENT');
    expect(results.SMS.id).toBe('sms-456');
    expect(smsProvider.smsProvider.send).toHaveBeenCalledWith({
      to: '+1234567890',
      body: 'Formatted message',
    });
  });

  it('should send both EMAIL and SMS', async () => {
    const input = {
      recipient: { email: 'user@example.com', phone: '+1234567890' },
      channels: ['EMAIL', 'SMS'],
      template: 'Test message',
      variables: {},
    };

    const { results } = await sendNotification(input);

    expect(results.EMAIL.status).toBe('SENT');
    expect(results.SMS.status).toBe('SENT');
    expect(emailProvider.emailProvider.send).toHaveBeenCalled();
    expect(smsProvider.smsProvider.send).toHaveBeenCalled();
  });

  it('should skip EMAIL if no email provided', async () => {
    const input = {
      recipient: { phone: '+1234567890' },
      channels: ['EMAIL', 'SMS'],
      template: 'Test',
      variables: {},
    };

    const { results } = await sendNotification(input);

    expect(results.EMAIL.status).toBe('SKIPPED');
    expect(results.EMAIL.reason).toContain('no contact method');
    expect(results.SMS.status).toBe('SENT');
    expect(emailProvider.emailProvider.send).not.toHaveBeenCalled();
  });

  it('should skip SMS if no phone provided', async () => {
    const input = {
      recipient: { email: 'user@example.com' },
      channels: ['EMAIL', 'SMS'],
      template: 'Test',
      variables: {},
    };

    const { results } = await sendNotification(input);

    expect(results.EMAIL.status).toBe('SENT');
    expect(results.SMS.status).toBe('SKIPPED');
    expect(results.SMS.reason).toContain('no contact method');
    expect(smsProvider.smsProvider.send).not.toHaveBeenCalled();
  });

  it('should handle email send failure', async () => {
    (emailProvider.emailProvider.send as jest.Mock).mockRejectedValue(
      new Error('Email service unavailable')
    );

    const input = {
      recipient: { email: 'user@example.com' },
      channels: ['EMAIL'],
      template: 'Test',
      variables: {},
    };

    const { results } = await sendNotification(input);

    expect(results.EMAIL.status).toBe('FAILED');
    expect(results.EMAIL.error).toContain('Email service unavailable');
    expect(logger.logError).toHaveBeenCalled();
  });

  it('should handle SMS send failure', async () => {
    (smsProvider.smsProvider.send as jest.Mock).mockRejectedValue(
      new Error('SMS service down')
    );

    const input = {
      recipient: { phone: '+1234567890' },
      channels: ['SMS'],
      template: 'Test',
      variables: {},
    };

    const { results } = await sendNotification(input);

    expect(results.SMS.status).toBe('FAILED');
    expect(results.SMS.error).toContain('SMS service down');
    expect(logger.logError).toHaveBeenCalled();
  });

  it('should throw validation error for invalid input', async () => {
    const invalidInput = {
      channels: ['EMAIL'],
      template: 'Test',
    } as any;

    await expect(sendNotification(invalidInput)).rejects.toThrow('VALIDATION_ERROR');
  });
});
