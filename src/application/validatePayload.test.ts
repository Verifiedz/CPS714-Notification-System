import { validateNotificationInput, validateBroadcastInput } from './validatePayload';

describe('validatePayload', () => {
  describe('validateNotificationInput', () => {
    it('should pass validation with valid input', () => {
      const validInput = {
        recipient: { email: 'user@example.com' },
        channels: ['EMAIL'],
        template: 'Hello {{name}}',
        variables: { name: 'John' },
      };

      expect(() => validateNotificationInput(validInput)).not.toThrow();
    });

    it('should throw error if input is not an object', () => {
      expect(() => validateNotificationInput(null)).toThrow('VALIDATION_ERROR');
      expect(() => validateNotificationInput('string')).toThrow('VALIDATION_ERROR');
    });

    it('should throw error if recipient is missing', () => {
      const input = {
        channels: ['EMAIL'],
        template: 'Test',
      };

      expect(() => validateNotificationInput(input)).toThrow('recipient is required');
    });

    it('should throw error if both email and phone are missing', () => {
      const input = {
        recipient: {},
        channels: ['EMAIL'],
        template: 'Test',
      };

      expect(() => validateNotificationInput(input)).toThrow('at least email or phone');
    });

    it('should pass with only email', () => {
      const input = {
        recipient: { email: 'user@example.com' },
        channels: ['EMAIL'],
        template: 'Test',
      };

      expect(() => validateNotificationInput(input)).not.toThrow();
    });

    it('should pass with only phone', () => {
      const input = {
        recipient: { phone: '+1234567890' },
        channels: ['SMS'],
        template: 'Test',
      };

      expect(() => validateNotificationInput(input)).not.toThrow();
    });

    it('should throw error if channels is missing', () => {
      const input = {
        recipient: { email: 'user@example.com' },
        template: 'Test',
      };

      expect(() => validateNotificationInput(input)).toThrow('channels array is required');
    });

    it('should throw error if channels is empty', () => {
      const input = {
        recipient: { email: 'user@example.com' },
        channels: [],
        template: 'Test',
      };

      expect(() => validateNotificationInput(input)).toThrow('channels array is required');
    });

    it('should throw error if template is missing', () => {
      const input = {
        recipient: { email: 'user@example.com' },
        channels: ['EMAIL'],
      };

      expect(() => validateNotificationInput(input)).toThrow('template is required');
    });
  });

  describe('validateBroadcastInput', () => {
    it('should pass validation with valid input', () => {
      const validInput = {
        message: 'Hello everyone!',
        channels: ['EMAIL', 'SMS'],
        audience: { segment: 'all-members' },
      };

      expect(() => validateBroadcastInput(validInput)).not.toThrow();
    });

    it('should throw error if input is not an object', () => {
      expect(() => validateBroadcastInput(null)).toThrow('VALIDATION_ERROR');
      expect(() => validateBroadcastInput(undefined)).toThrow('VALIDATION_ERROR');
    });

    it('should throw error if message is empty', () => {
      const input = {
        message: '',
        channels: ['EMAIL'],
        audience: { segment: 'test' },
      };

      expect(() => validateBroadcastInput(input)).toThrow('message cannot be empty');
    });

    it('should throw error if message is only whitespace', () => {
      const input = {
        message: '   ',
        channels: ['EMAIL'],
        audience: { segment: 'test' },
      };

      expect(() => validateBroadcastInput(input)).toThrow('message cannot be empty');
    });

    it('should throw error if channels is missing', () => {
      const input = {
        message: 'Test',
        audience: { segment: 'test' },
      };

      expect(() => validateBroadcastInput(input)).toThrow('at least one channel');
    });

    it('should throw error if channels is empty', () => {
      const input = {
        message: 'Test',
        channels: [],
        audience: { segment: 'test' },
      };

      expect(() => validateBroadcastInput(input)).toThrow('at least one channel');
    });

    it('should throw error if audience is missing', () => {
      const input = {
        message: 'Test',
        channels: ['EMAIL'],
      };

      expect(() => validateBroadcastInput(input)).toThrow('audience segment is required');
    });

    it('should throw error if audience segment is missing', () => {
      const input = {
        message: 'Test',
        channels: ['EMAIL'],
        audience: {},
      };

      expect(() => validateBroadcastInput(input)).toThrow('audience segment is required');
    });

    it('should pass with dryRun flag', () => {
      const input = {
        message: 'Test',
        channels: ['EMAIL'],
        audience: { segment: 'test' },
        dryRun: true,
      };

      expect(() => validateBroadcastInput(input)).not.toThrow();
    });
  });
});
