import { aggregateBatchResults } from './batchHelpers';

describe('batchHelpers', () => {
  describe('aggregateBatchResults', () => {
    it('should aggregate results from successful promises', () => {
      const results: PromiseSettledResult<{
        emailSent: number;
        smsSent: number;
        errors: string[];
      }>[] = [
        {
          status: 'fulfilled',
          value: { emailSent: 2, smsSent: 1, errors: [] },
        },
        {
          status: 'fulfilled',
          value: { emailSent: 3, smsSent: 2, errors: [] },
        },
      ];

      const failureReasons: Record<string, number> = {};
      const totals = aggregateBatchResults(results, failureReasons);

      expect(totals.emailSent).toBe(5);
      expect(totals.smsSent).toBe(3);
      expect(failureReasons).toEqual({});
    });

    it('should track failure reasons from errors array', () => {
      const results: PromiseSettledResult<{
        emailSent: number;
        smsSent: number;
        errors: string[];
      }>[] = [
        {
          status: 'fulfilled',
          value: {
            emailSent: 1,
            smsSent: 0,
            errors: ['RATE_LIMIT_EXCEEDED'],
          },
        },
        {
          status: 'fulfilled',
          value: {
            emailSent: 0,
            smsSent: 1,
            errors: ['INVALID_EMAIL', 'RATE_LIMIT_EXCEEDED'],
          },
        },
      ];

      const failureReasons: Record<string, number> = {};
      const totals = aggregateBatchResults(results, failureReasons);

      expect(totals.emailSent).toBe(1);
      expect(totals.smsSent).toBe(1);
      expect(failureReasons).toEqual({
        RATE_LIMIT_EXCEEDED: 2,
        INVALID_EMAIL: 1,
      });
    });

    it('should ignore rejected promises', () => {
      const results: PromiseSettledResult<{
        emailSent: number;
        smsSent: number;
        errors: string[];
      }>[] = [
        {
          status: 'fulfilled',
          value: { emailSent: 2, smsSent: 1, errors: [] },
        },
        {
          status: 'rejected',
          reason: new Error('Promise rejected'),
        },
        {
          status: 'fulfilled',
          value: { emailSent: 1, smsSent: 1, errors: [] },
        },
      ];

      const failureReasons: Record<string, number> = {};
      const totals = aggregateBatchResults(results, failureReasons);

      expect(totals.emailSent).toBe(3);
      expect(totals.smsSent).toBe(2);
    });

    it('should handle empty results array', () => {
      const results: PromiseSettledResult<{
        emailSent: number;
        smsSent: number;
        errors: string[];
      }>[] = [];

      const failureReasons: Record<string, number> = {};
      const totals = aggregateBatchResults(results, failureReasons);

      expect(totals.emailSent).toBe(0);
      expect(totals.smsSent).toBe(0);
      expect(failureReasons).toEqual({});
    });

    it('should accumulate failure reasons across multiple calls', () => {
      const failureReasons: Record<string, number> = {
        TIMEOUT: 1,
      };

      const results1: PromiseSettledResult<{
        emailSent: number;
        smsSent: number;
        errors: string[];
      }>[] = [
        {
          status: 'fulfilled',
          value: {
            emailSent: 1,
            smsSent: 1,
            errors: ['TIMEOUT', 'INVALID_PHONE'],
          },
        },
      ];

      aggregateBatchResults(results1, failureReasons);

      expect(failureReasons).toEqual({
        TIMEOUT: 2,
        INVALID_PHONE: 1,
      });

      const results2: PromiseSettledResult<{
        emailSent: number;
        smsSent: number;
        errors: string[];
      }>[] = [
        {
          status: 'fulfilled',
          value: {
            emailSent: 0,
            smsSent: 0,
            errors: ['TIMEOUT'],
          },
        },
      ];

      aggregateBatchResults(results2, failureReasons);

      expect(failureReasons).toEqual({
        TIMEOUT: 3,
        INVALID_PHONE: 1,
      });
    });

    it('should handle mixed successful and failed sends', () => {
      const results: PromiseSettledResult<{
        emailSent: number;
        smsSent: number;
        errors: string[];
      }>[] = [
        {
          status: 'fulfilled',
          value: {
            emailSent: 1,
            smsSent: 0,
            errors: ['SMS_FAILED'],
          },
        },
        {
          status: 'fulfilled',
          value: {
            emailSent: 0,
            smsSent: 1,
            errors: ['EMAIL_FAILED'],
          },
        },
        {
          status: 'fulfilled',
          value: {
            emailSent: 1,
            smsSent: 1,
            errors: [],
          },
        },
      ];

      const failureReasons: Record<string, number> = {};
      const totals = aggregateBatchResults(results, failureReasons);

      expect(totals.emailSent).toBe(2);
      expect(totals.smsSent).toBe(2);
      expect(failureReasons).toEqual({
        SMS_FAILED: 1,
        EMAIL_FAILED: 1,
      });
    });
  });
});
