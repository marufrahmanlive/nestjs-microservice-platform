import { Logger } from '@nestjs/common';
import type { RmqContext } from '@nestjs/microservices';

/**
 * Acknowledgement helpers used by every consumer in this codebase.
 *
 * Why manual ack instead of auto:
 *   - Auto-ack drops messages on consumer crash mid-processing.
 *   - We need different behaviors for retryable vs poison messages.
 *
 * Decision matrix:
 *   handler succeeds            -> ack
 *   transient error & < max     -> nack(requeue=true)   *but* track attempts so
 *                                   poison loops can't form (see attempt counter)
 *   permanent error OR max hit  -> nack(requeue=false)  -> DLX -> DLQ
 *
 * We track attempts via the `x-attempt` header. Each retry republishes the same
 * payload with attempt+1.
 */
export const MAX_ATTEMPTS_HEADER = 'x-max-attempts';
export const ATTEMPT_HEADER = 'x-attempt';

interface ConsumeOptions {
  maxAttempts: number;
  log: Logger;
}

export async function consumeWithRetry<TPayload>(
  ctx: RmqContext,
  payload: TPayload,
  handler: (payload: TPayload) => Promise<void>,
  { maxAttempts, log }: ConsumeOptions,
): Promise<void> {
  const channel = ctx.getChannelRef();
  const message = ctx.getMessage();
  const headers = (message.properties.headers || {}) as Record<string, unknown>;
  const attempt = Number(headers[ATTEMPT_HEADER] ?? 0);

  try {
    await handler(payload);
    channel.ack(message);
    return;
  } catch (err) {
    const error = err as Error;
    log.error(`Consumer failed (attempt ${attempt + 1}/${maxAttempts}): ${error.message}`, error.stack);

    if (attempt + 1 >= maxAttempts) {
      // Give up — DLX will route to DLQ.
      log.warn(`Max attempts reached, dead-lettering message ${message.properties.messageId ?? '<no-id>'}`);
      channel.nack(message, false, false);
      return;
    }

    // Requeue with attempt incremented. amqplib does not provide an in-place header
    // update, so we republish to the same exchange with incremented x-attempt and
    // ack the original. This is the documented "delayed retry" pattern.
    const newHeaders = { ...headers, [ATTEMPT_HEADER]: attempt + 1 };
    channel.publish(
      message.fields.exchange,
      message.fields.routingKey,
      message.content,
      {
        ...message.properties,
        headers: newHeaders,
      },
    );
    channel.ack(message);
  }
}
