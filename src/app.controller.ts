import { Controller, Get, RequestTimeoutException, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { CircuitBreakerInterceptorInterceptor } from './circuit-breaker/common/interceptor/circuit-breaker.interceptor.interceptor';

@UseInterceptors(CircuitBreakerInterceptorInterceptor)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log('controller is called 🔥 🔥 🔥')
    throw new RequestTimeoutException()
  }
}
