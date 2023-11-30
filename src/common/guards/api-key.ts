import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "../decorator/public.decorator";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    // 此处使用到了依赖注入，因此全局守卫必须在模块中绑定
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) {} // Reflector 类允许在特定上下文中检索元数据

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> { // 返回 true 则继续请求

    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());
    if(isPublic) {
      return true;
    }else {
      // 从任何未标记为 公共 的传入请求中检索 API_KEY
      const request = context.switchToHttp().getRequest<Request>();
      const authHeader = request.header('Authorization');
      return authHeader === this.configService.get("API_KEY"); // 与 .env 文件的 API_KEY 变量进行全等判断
    }
  }
}