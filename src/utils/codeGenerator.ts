
/**
 * A utility function to generate unique subscription codes
 * 
 * @param prefix The prefix to use for the code (e.g., 'SF')
 * @param categoryCode The category code (e.g., 5 for streaming)
 * @param index The index of the subscription within its category
 * @returns A formatted subscription code (e.g., 'SF5001')
 */
export const generateSubscriptionCode = (
  prefix: string = 'SF',
  categoryCode: number,
  index: number
): string => {
  // Ensure the index is padded to at least 3 digits (e.g., 001, 012, 123)
  const paddedIndex = index.toString().padStart(3, '0');
  return `${prefix}${categoryCode}${paddedIndex}`;
};

/**
 * Adds missing code fields to an array of subscriptions
 * 
 * @param subscriptions Array of subscriptions potentially missing code field
 * @param categoryCode The category code number (1-9)
 * @returns The same array with codes added where missing
 */
export const addMissingCodes = <T extends { code?: string }>(
  subscriptions: T[],
  categoryCode: number
): T[] => {
  return subscriptions.map((subscription, index) => {
    if (!subscription.code) {
      return {
        ...subscription,
        code: generateSubscriptionCode('SF', categoryCode, index + 1)
      };
    }
    return subscription;
  });
};
