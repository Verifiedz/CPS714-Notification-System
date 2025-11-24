import { TwilioSmsProvider } from './smsProvider';
import * as logger from './logger';

jest.mock('./logger');

describe('TwilioSmsProvider', () => {
  let provider: TwilioSmsProvider;

  beforeEach(() => {
    provider = new TwilioSmsProvider();
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should send SMS and return mock ID', async () => {
      const result = await provider.send({
        to: '+1234567890',
        body: 'Test SMS message',
      });

      expect(result.id).toMatch(/^mock-sms-\d+$/);
    });

    it('should log SMS send attempt', async () => {
      await provider.send({
        to: '+1234567890',
        body: 'Your code is 123456',
      });

      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('+1234567890')
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Your code is 123456')
      );
    });

    it('should include correlationId in log when provided', async () => {
      await provider.send({
        to: '+1234567890',
        body: 'Test message',
        correlationId: 'corr-456',
      });

      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('corr-456')
      );
    });

    it('should generate unique IDs for each send', async () => {
      const result1 = await provider.send({
        to: '+1111111111',
        body: 'Message 1',
      });

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 2));

      const result2 = await provider.send({
        to: '+2222222222',
        body: 'Message 2',
      });

      expect(result1.id).not.toBe(result2.id);
    });
  });
});
