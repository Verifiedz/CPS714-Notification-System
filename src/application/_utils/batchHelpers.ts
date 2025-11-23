/**
 * Aggregates batch results from Promise.allSettled
 * Counts successful sends and tracks failure reasons
 * @param results - Array of settled promise results
 * @param failureReasons - Object to accumulate failure reason counts (mutated)
 * @returns Object with total email and SMS sent counts
 */
export function aggregateBatchResults(
  results: PromiseSettledResult<{
    emailSent: number;
    smsSent: number;
    errors: string[];
  }>[],
  failureReasons: Record<string, number>
): { emailSent: number; smsSent: number } {
  let emailSent = 0;
  let smsSent = 0;

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      emailSent += result.value.emailSent;
      smsSent += result.value.smsSent;
      result.value.errors.forEach((err) => {
        failureReasons[err] = (failureReasons[err] || 0) + 1;
      });
    }
  });

  return { emailSent, smsSent };
}
