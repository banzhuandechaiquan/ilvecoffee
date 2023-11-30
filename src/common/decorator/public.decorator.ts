import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic"; // SetMetadata 装饰器的 key
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);