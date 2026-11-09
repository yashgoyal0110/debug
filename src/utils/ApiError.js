/**
 * Custom error class so services can throw errors with an HTTP status code.
 * Example: throw new ApiError(404, 'Product not found');
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ApiError;
