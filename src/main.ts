import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

function swagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('SchoolLife')
    .setDescription('SchoolLife API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('document', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new ConfigService();

  const env = config.get<'development' | 'production'>('NODE_ENV');
  const port = config.get<number>('PORT', 3000);

  if (env === 'development') {
    swagger(app);
    Logger.log(
      `Swagger is running on http://localhost:3000/document`,
      `Swagger`,
    );
  }

  await app.listen(port);

  Logger.log(`Server is running on http://localhost:${port}`, `Bootstrap`);
}
bootstrap();
