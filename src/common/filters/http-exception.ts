import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException) // 逗号隔开可以同时处理多个异常类
// 访问底层平台的 Response 对象，以便可以操作或转换它并继续发送响应
export class HttpExceptionFilter<T extends HttpException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // switchToHttp() 可以访问请求或响应对象
    const response = ctx.getResponse<Response>(); // 返回 底层平台 响应  

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const error = typeof response === "string"
      ? { message: exceptionResponse } // 如果错误为 string 类型需要创建一个对象并将 message 作为它的属性
      : (exceptionResponse as object) // 否则错误已经为一个对象类型
    
    response.status(status).json({
      ...error,
      timestamp: new Date().toISOString()
    });
  }
}