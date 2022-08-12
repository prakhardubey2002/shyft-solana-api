import {
  HttpException,
  HttpStatus,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { configuration } from './common/configs/config';
import { AppModule } from './app.module';
import { ApiMetricAccessor } from './dal/api-repo/api-metric.accessor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ApiMonitorService } from './modules/api-monitor/api.event-handeler';
import { AuthGuard } from './modules/auth/auth.guard';
import { AuthService } from './modules/auth/auth.service';

async function bootstrap() {
  Sentry.init({ dsn: configuration().sentryDSN });
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('sol'); // To run app at `/sol` prefix
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle('API example')
    .setDescription('Shyft API description')
    .setVersion('1.0')
    .addTag('shyft')
    .addApiKey({
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
      description: 'API Key For External calls',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('sol/api/explore', app, document); // openAPI docs route

  const reflector = app.get(Reflector);
  const authService = app.get(AuthService);
  app.useGlobalGuards(new AuthGuard(reflector, authService));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ApiMonitorService(app.get(ApiMetricAccessor)));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      disableErrorMessages: false,
      exceptionFactory: (errors: ValidationError[]) => {
        return new HttpException(
          {
            message: 'Validation failed!',
            errors,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );

  await app.listen(4000);
}
bootstrap();
