// Error for developers: use this to throw exceptions when a developer is
// using something not in the intended way
export class InterfaceError extends Error {}

// Error for user's input value errors
export class ValueError<T> extends Error {
  private _invalidValue: T;

  public get value(): T {
    return this._invalidValue;
  }

  constructor(value: T, message?: string) {
    super(message);
    this._invalidValue = value;
  }
}

export class ParseError<T> extends ValueError<T> {}

export class InvalidOption extends Error {}

export class UnsupportedFileType extends InvalidOption {
  constructor(fileType: string) {
    super(`Unsupported file type: ${fileType}`);
  }
}

// Example error:
// {
//   "error": "A user with given email address ... already belongs...",
//   "details": null,
//   "code": "UserAlreadyInOrganization"
// }

export interface ErrorDetails {
  error: string;
  details: string | null;
  code: string | null;
}

export class ApplicationError extends Error {
  status: number;
  data?: ErrorDetails | string;
  retry?: () => void;

  constructor(
    message: string,
    statusCode: number,
    data?: ErrorDetails | string
  ) {
    super(message);
    this.status = statusCode;
    this.retry = undefined;
    this.data = data;
  }

  allowRetry(): boolean {
    return this.status === 500;
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string = "Object not found") {
    super(message, 404);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string = "Conflict") {
    super(message, 409);
  }
}

export class PreconditionFailedError extends ApplicationError {
  constructor(message: string = "Precondition failed") {
    super(message, 412);
  }
}

export class UserCancelledOperation extends ApplicationError {
  constructor(message: string = "The user cancelled the operation") {
    super(message, -2);
  }
}
