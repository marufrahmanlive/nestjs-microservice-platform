/** Envelope returned by ResponseInterceptor for every successful HTTP response. */
export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
  path: string;
  correlationId?: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  code: string;
  message: string;
  errors?: unknown;
  timestamp: string;
  path: string;
  correlationId?: string;
}
