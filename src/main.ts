import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable swagger docs
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API Documentation for the application')
    .setVersion('1.0')
    .addServer('http://localhost:3001', 'Local environment')
    .addServer(
      'https://fintrack-production-leon.up.railway.app',
      'Live environment',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'API Documentation',
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
