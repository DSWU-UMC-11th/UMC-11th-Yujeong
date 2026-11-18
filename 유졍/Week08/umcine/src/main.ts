import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import "./index.css";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 프론트엔드 연동을 위한 CORS 허용
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
