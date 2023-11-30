import { CallHandler, ExecutionContext, Injectable, NestInterceptor, RequestTimeoutException } from "@nestjs/common";
import { Observable, TimeoutError, catchError, throwError, timeout } from "rxjs";

@Injectable()
export class Timeoutnterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      timeout(3000), 
      catchError(err => {
        if(err instanceof TimeoutError) {
          return throwError(new RequestTimeoutException());
        }else {
          return throwError(err);
        }
      })
    );
  }
}