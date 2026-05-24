import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

export interface RpcErrorShape {
  code: string;
  message: string;
  status: HttpStatus;
  details?: unknown;
}

/**
 * Microservices throw RpcException; the API gateway re-throws as HttpException.
 * Both ends use this shape so error code + status survive the transport boundary.
 */
export function toRpcException(err: RpcErrorShape): RpcException {
  return new RpcException(err);
}
