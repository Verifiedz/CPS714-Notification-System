import { formatMessage } from './messageFormatter';

describe('messageFormatter', () => {
  describe('formatMessage', () => {
    it('should replace single variable in template', () => {
      const result = formatMessage(
        'Hello {{name}}!',
        { name: 'John' },
        'SMS'
      );

      expect(result.text).toBe('Hello John!');
    });

    it('should replace multiple variables in template', () => {
      const result = formatMessage(
        'Hello {{name}}, your booking {{bookingId}} is confirmed!',
        { name: 'Jane', bookingId: 'B123' },
        'SMS'
      );

      expect(result.text).toBe('Hello Jane, your booking B123 is confirmed!');
    });

    it('should replace same variable multiple times', () => {
      const result = formatMessage(
        '{{name}} welcome! {{name}}, your account is ready.',
        { name: 'Alice' },
        'SMS'
      );

      expect(result.text).toBe('Alice welcome! Alice, your account is ready.');
    });

    it('should extract subject for EMAIL channel', () => {
      const result = formatMessage(
        'Your order {{orderId}} has shipped!',
        { orderId: 'ORD-456', subject: 'Order Shipped' },
        'EMAIL'
      );

      expect(result.text).toBe('Your order ORD-456 has shipped!');
      expect(result.subject).toBe('Order Shipped');
    });

    it('should use default subject if not provided for EMAIL', () => {
      const result = formatMessage(
        'Test message',
        {},
        'EMAIL'
      );

      expect(result.subject).toBe('Notification');
    });

    it('should not include subject for SMS channel', () => {
      const result = formatMessage(
        'SMS message',
        { subject: 'Should be ignored' },
        'SMS'
      );

      expect(result.subject).toBeUndefined();
    });

    it('should handle empty variables object', () => {
      const result = formatMessage(
        'Plain text message',
        {},
        'SMS'
      );

      expect(result.text).toBe('Plain text message');
    });
  });
});
