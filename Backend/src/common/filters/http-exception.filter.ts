import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import type { ApiErrorResponse } from '../dto/api-error.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? exception.getResponse() : null;
    const body = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};
    const validationMessages = Array.isArray(body.message) ? body.message : undefined;
    const payload: ApiErrorResponse = {
      error: {
        code: status === HttpStatus.NOT_FOUND ? 'not_found' : validationMessages ? 'invalid_required' : status >= 500 ? 'persistence_failure' : String(body.code ?? 'request_invalid'),
        message: validationMessages ? 'Dữ liệu yêu cầu không hợp lệ.' : typeof body.message === 'string' ? body.message : 'Đã xảy ra lỗi. Vui lòng thử lại.',
        ...(validationMessages ? { details: validationMessages } : {})
      }
    };
    response.status(status).json(payload);
  }
}
