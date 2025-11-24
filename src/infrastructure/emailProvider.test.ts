import { SendgridEmailProvider } from './emailProvider';
import * as logger from './logger';

jest.mock('./logger');

describe('SendgridEmailProvider', () => {
  let provider: SendgridEmailProvider;

  beforeEach(() => {
    provider = new SendgridEmailProvider();
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should send email and return mock ID', async () => {
      const result = await provider.send({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message body',
      });

      expect(result.id).toMatch(/^mock-email-\d+$/);
    });

    it('should log email send attempt', async () => {
      await provider.send({
        to: 'user@example.com',
        subject: 'Welcome',
        text: 'Welcome to our service',
      });

      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('user@example.com')
      );
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Welcome')
      );
    });

    it('should include correlationId in log when provided', async () => {
      await provider.send({
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test body',
        correlationId: 'corr-123',
      });

      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('corr-123')
      );
    });

    it('should generate unique IDs for each send', async () => {
      const result1 = await provider.send({
        to: 'user1@example.com',
        subject: 'Test',
        text: 'Body',
      });

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 2));

      const result2 = await provider.send({
        to: 'user2@example.com',
        subject: 'Test',
        text: 'Body',
      });

      expect(result1.id).not.toBe(result2.id);
    });
  });
});
