// @/lib/customers/auth/errors.ts

export class AuthError extends Error {
  status: number
  code: string

  constructor(message: string, status: number, code: string) {
    super(message)
    this.name = "AuthError"
    this.status = status
    this.code = code
    Object.setPrototypeOf(this, AuthError.prototype)
  }
}

export const AUTH_ERRORS = {
  UNAUTHORIZED: () => new AuthError("Unauthorized", 401, "UNAUTHORIZED"),

  FORBIDDEN: () => new AuthError("Forbidden", 403, "FORBIDDEN"),

  INVALID_TOKEN: () =>
    new AuthError("Invalid or expired token", 401, "INVALID_TOKEN"),

  TOKEN_EXPIRED: () => new AuthError("Session expired", 401, "TOKEN_EXPIRED"),

  INVALID_PAYLOAD: () =>
    new AuthError("Invalid token payload", 400, "INVALID_PAYLOAD"),

  RATE_LIMITED: () => new AuthError("Too many requests", 429, "RATE_LIMITED"),
}
