import { CallHandler } from "@nestjs/common"
import { tap, throwError } from "rxjs"

enum CircuitBreakerState {
  CLOSED,
  OPEN,
  HALF_OPEN
}

interface CircuitBreakerConfig {
  successThreshold: number;
  failureThreshold: number;
  openToHalfOpenWaitTime: number;
}

export class CircuitBreaker {
  private state = CircuitBreakerState.CLOSED
  private failureCount = 0
  private successCount = 0
  private lastError: Error
  private nextAttempt: number

  constructor(private readonly config: CircuitBreakerConfig) {}

  executeRequest(next: CallHandler) {
    if (this.state === CircuitBreakerState.OPEN) {
        if(this.nextAttempt > Date.now()){
          return throwError(() => this.lastError)
        }
        this.state = CircuitBreakerState.HALF_OPEN;
        console.log('Circuit State: HALF_OPEN')
      }
  
      return next.handle().pipe(
        tap({
          next: () => this.onRequestSuccess(),
          error: (err) => this.onRequestFailure(err)
        })
      )
  }

  private onRequestSuccess() {
    this.failureCount = 0
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++

      if (this.successCount >= this.config.successThreshold) {
        this.successCount = 0
        this.state = CircuitBreakerState.CLOSED
        console.log('Circuit State: CLOSED')
      }
    }
  }

  private onRequestFailure(error: Error) {
    this.failureCount++

    if (this.failureCount >= this.config.failureThreshold || this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN
      this.lastError = error
      this.nextAttempt = Date.now() + this.config.openToHalfOpenWaitTime
      console.log(`Circuit State: OPEN. Next attempt at: ${new Date(this.nextAttempt)}`)
    }
  }

}