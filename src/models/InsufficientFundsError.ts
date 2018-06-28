export class InsufficientFundsError extends Error {
  constructor(message: string) {
    super(message) /* istanbul ignore next */;
    Object.setPrototypeOf(this, InsufficientFundsError.prototype);
  }
}
