import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ProgramError } from 'src/core/program-error';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      success: false,
      message: exception.message,
      error: exception,
    });
  }
}

@Catch(ProgramError)
export class ProgramErrorFilter implements ExceptionFilter {
  catch(exception: ProgramError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getCode() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    exception.log();

    response.status(status).json({
      success: false,
      error: exception.getMessage(),
    });
  }
}


