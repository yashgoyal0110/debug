/**
 * Wraps an async route handler so any thrown error / rejected promise
 * is forwarded to Express's error-handling middleware via next().
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
