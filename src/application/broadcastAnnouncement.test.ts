import { broadcastAnnouncement, MemberDirectory } from './broadcastAnnouncement';
import * as emailProvider from '../infrastructure/emailProvider';
import * as smsProvider from '../infrastructure/smsProvider';
import * as logger from '../infrastructure/logger';
import { config } from '../shared/config';

jest.mock('../infrastructure/emailProvider');
jest.mock('../infrastructure/smsProvider');
jest.mock('../infrastructure/logger');

describe('broadcastAnnouncement', () => {
  let mockDirectory: MemberDirectory;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful provider responses
    (emailProvider.emailProvider.send as jest.Mock).mockResolvedValue({
      id: 'email-123',
    });
    (smsProvider.smsProvider.send as jest.Mock).mockResolvedValue({
      id: 'sms-456',
    });
  });

  // Helper to create a mock member directory
  function createMockDirectory(
    members: Array<{ email?: string; phone?: string }>
  ): MemberDirectory {
    return {
      async *listRecipients(segment: string) {
        for (const member of members) {
          yield member;
        }
      },
    };
  }

  describe('dry run mode', () => {
    it('should return sample of recipients without sending', async () => {
      const members = [
        { email: 'user1@example.com', phone: '+1111111111' },
        { email: 'user2@example.com', phone: '+2222222222' },
        { email: 'user3@example.com', phone: '+3333333333' },
      ];

      mockDirectory = createMockDirectory(members);

      const result = await broadcastAnnouncement(
        {
          message: 'Test announcement',
          channels: ['EMAIL'],
          audience: { segment: 'all-members' },
          dryRun: true,
        },
        mockDirectory
      );

      expect(result.dryRun).toBe(true);
      expect(result.targets).toBe(3);
      expect(result.sample).toHaveLength(3);
      expect(result.sample).toEqual(members);
      expect(emailProvider.emailProvider.send).not.toHaveBeenCalled();
      expect(smsProvider.smsProvider.send).not.toHaveBeenCalled();
    });

    it('should limit sample size to 10 in dry run', async () => {
      const members = Array.from({ length: 50 }, (_, i) => ({
        email: `user${i}@example.com`,
      }));

      mockDirectory = createMockDirectory(members);

      const result = await broadcastAnnouncement(
        {
          message: 'Test',
          channels: ['EMAIL'],
          audience: { segment: 'all' },
          dryRun: true,
        },
        mockDirectory
      );

      expect(result.dryRun).toBe(true);
      expect(result.targets).toBe(50);
      expect(result.sample).toHaveLength(10);
    });

    it('should respect max recipients limit in dry run', async () => {
      const originalMax = config.maxRecipients;
      (config as any).maxRecipients = 100;

      const members = Array.from({ length: 150 }, (_, i) => ({
        email: `user${i}@example.com`,
      }));

      mockDirectory = createMockDirectory(members);

      const result = await broadcastAnnouncement(
        {
          message: 'Test',
          channels: ['EMAIL'],
          audience: { segment: 'all' },
          dryRun: true,
        },
        mockDirectory
      );

      expect(result.targets).toBe(100);
      expect(logger.logInfo).toHaveBeenCalledWith(
        'Hit max recipient limit during dry run'
      );

      (config as any).maxRecipients = originalMax;
    });
  });

  describe('sending broadcasts', () => {
    it('should send email to all members', async () => {
      const members = [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
        { email: 'user3@example.com' },
      ];

      mockDirectory = createMockDirectory(members);

      const result = await broadcastAnnouncement(
        {
          message: 'Important announcement',
          channels: ['EMAIL'],
          audience: { segment: 'all-members' },
        },
        mockDirectory
      );

      expect(result.targets).toBe(3);
      expect(result.sent.EMAIL).toBe(3);
      expect(result.sent.SMS).toBe(0);
      expect(emailProvider.emailProvider.send).toHaveBeenCalledTimes(3);
      expect(emailProvider.emailProvider.send).toHaveBeenCalledWith({
        to: 'user1@example.com',
        subject: 'Gym Announcement',
        text: 'Important announcement',
      });
    });

    it('should send SMS to all members', async () => {
      const members = [
        { phone: '+1111111111' },
        { phone: '+2222222222' },
      ];

      mockDirectory = createMockDirectory(members);

      const result = await broadcastAnnouncement(
        {
          message: 'Urgent message',
          channels: ['SMS'],
          audience: { segment: 'all' },
        },
        mockDirectory
      );

      expect(result.targets).toBe(2);
      expect(result.sent.EMAIL).toBe(0);
      expect(result.sent.SMS).toBe(2);
      expect(smsProvider.smsProvider.send).toHaveBeenCalledTimes(2);
    });

    it('should send both EMAIL and SMS when both channels specified', async () => {
      const members = [
        { email: 'user1@example.com', phone: '+1111111111' },
        { email: 'user2@example.com', phone: '+2222222222' },
      ];

      mockDirectory = createMockDirectory(members);

      const result = await broadcastAnnouncement(
        {
          message: 'Test message',
          channels: ['EMAIL', 'SMS'],
          audience: { segment: 'all' },
        },
        mockDirectory
      );

      expect(result.targets).toBe(2);
      expect(result.sent.EMAIL).toBe(2);
      expect(result.sent.SMS).toBe(2);
      expect(emailProvider.emailProvider.send).toHaveBeenCalledTimes(2);
      expect(smsProvider.smsProvider.send).toHaveBeenCalledTimes(2);
    });

    it('should skip members without contact info for requested channel', async () => {
      const members = [
        { email: 'user1@example.com' }, // Has email, no phone
        { phone: '+2222222222' }, // Has phone, no email
        { email: 'user3@example.com', phone: '+3333333333' }, // Has both
      ];

      mockDirectory = createMockDirectory(members);

      const result = await broadcastAnnouncement(
        {
          message: 'Test',
          channels: ['EMAIL', 'SMS'],
          audience: { segment: 'all' },
        },
        mockDirectory
      );

      expect(result.targets).toBe(3);
      expect(result.sent.EMAIL).toBe(2); // user1 and user3
      expect(result.sent.SMS).toBe(2); // user2 and user3
    });

    it('should handle send failures gracefully', async () => {
      (emailProvider.emailProvider.send as jest.Mock)
        .mockRejectedValueOnce(new Error('RATE_LIMIT_EXCEEDED'))
        .mockResolvedValue({ id: 'email-ok' });

      const members = [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
        { email: 'user3@example.com' },
      ];

      mockDirectory = createMockDirectory(members);

      const result = await broadcastAnnouncement(
        {
          message: 'Test',
          channels: ['EMAIL'],
          audience: { segment: 'all' },
        },
        mockDirectory
      );

      expect(result.targets).toBe(3);
      expect(result.sent.EMAIL).toBe(2); // 1 failed, 2 succeeded
      expect(result.failed.RATE_LIMIT_EXCEEDED).toBe(1);
      expect(logger.logError).toHaveBeenCalledWith(
        expect.stringContaining('RATE_LIMIT_EXCEEDED')
      );
    });

    it('should track multiple failure reasons', async () => {
      (emailProvider.emailProvider.send as jest.Mock)
        .mockRejectedValueOnce(new Error('RATE_LIMIT_EXCEEDED'))
        .mockRejectedValueOnce(new Error('INVALID_EMAIL'))
        .mockRejectedValueOnce(new Error('RATE_LIMIT_EXCEEDED'));

      const members = [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
        { email: 'user3@example.com' },
      ];

      mockDirectory = createMockDirectory(members);

      const result = await broadcastAnnouncement(
        {
          message: 'Test',
          channels: ['EMAIL'],
          audience: { segment: 'all' },
        },
        mockDirectory
      );

      expect(result.sent.EMAIL).toBe(0);
      expect(result.failed.RATE_LIMIT_EXCEEDED).toBe(2);
      expect(result.failed.INVALID_EMAIL).toBe(1);
    });

    it('should process in batches and log progress', async () => {
      // Create 300 members to trigger progress logging
      // Batch size is 15, so only multiples of 15 that are also multiples of 100 will log
      // 300 is divisible by both 15 and 100, so it will log at 300
      const members = Array.from({ length: 300 }, (_, i) => ({
        email: `user${i}@example.com`,
      }));

      mockDirectory = createMockDirectory(members);

      const result = await broadcastAnnouncement(
        {
          message: 'Test',
          channels: ['EMAIL'],
          audience: { segment: 'all' },
        },
        mockDirectory
      );

      expect(result.targets).toBe(300);
      expect(result.sent.EMAIL).toBe(300);

      // Should log progress at 300 (batch boundary that's a multiple of 100)
      expect(logger.logInfo).toHaveBeenCalledWith(
        'Broadcast progress: 300 members processed'
      );

      // Should log completion
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Broadcast complete')
      );
    });

    it('should respect max recipients limit', async () => {
      const originalMax = config.maxRecipients;
      (config as any).maxRecipients = 50;

      const members = Array.from({ length: 100 }, (_, i) => ({
        email: `user${i}@example.com`,
      }));

      mockDirectory = createMockDirectory(members);

      const result = await broadcastAnnouncement(
        {
          message: 'Test',
          channels: ['EMAIL'],
          audience: { segment: 'all' },
        },
        mockDirectory
      );

      // With batch size 15, it processes until totalProcessed >= 50
      // So it processes: 15, 30, 45, 60 (stops after 60)
      expect(result.targets).toBe(60);
      expect(logger.logInfo).toHaveBeenCalledWith(
        'Reached max recipient limit for broadcast'
      );

      (config as any).maxRecipients = originalMax;
    });

    it('should throw validation error for invalid input', async () => {
      mockDirectory = createMockDirectory([]);

      const invalidInput = {
        message: '',
        channels: ['EMAIL'],
        audience: { segment: 'all' },
      } as any;

      await expect(
        broadcastAnnouncement(invalidInput, mockDirectory)
      ).rejects.toThrow('message cannot be empty');
    });
  });
});
