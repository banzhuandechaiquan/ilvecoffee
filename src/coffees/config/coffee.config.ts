import { registerAs } from "@nestjs/config";
 
// registerAs 函数在 key 下注册一个命名空间的配置对象
export default registerAs("coffees", () => ({
  foo: "bar",
}));