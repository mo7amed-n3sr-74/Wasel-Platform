import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from "cookie-parser";
import { PrismaExceptions } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['content-type', 'authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // app.use(
    // session({
    //   secret: 'my-secret',
    //   resave: false,
    //   saveUninitialized: false,
    // }),
    // cookieParser()
  // ),
  app.use(cookieParser());
  // app.useGlobalFilters(new PrismaExceptions());

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
