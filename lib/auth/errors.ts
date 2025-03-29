/**
 * Error class for HTTP errors
 * This is used to handle errors from the auth API
 * It is a wrapper around the Error class
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
