import { Catch, RpcExceptionFilter as BaseRpcExceptionFilter, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(HttpException)
export class RpcExceptionFilter implements BaseRpcExceptionFilter<HttpException> {
  catch(exception: HttpException): Observable<any> {
    const status = exception.getStatus();
    const response = exception.getResponse();

    return throwError(() =>
      new RpcException({
        status,
        message: response instanceof Object ? response : exception.message,
      }),
    );
  }
}
