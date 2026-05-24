import { v4 as uuidv4 } from 'uuid';

export const CORRELATION_HEADER = 'x-correlation-id';

/**
 * Accept upstream correlation IDs when they look safe; otherwise mint a new one.
 * This keeps distributed traces linkable while preventing log-injection via the header.
 */
export function getOrCreateCorrelationId(incoming?: string): string {
  if (incoming && /^[\w-]{8,64}$/.test(incoming)) return incoming;
  return uuidv4();
}
