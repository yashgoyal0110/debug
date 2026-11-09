import db from '../data/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * Reads "Authorization: Bearer <token>" and attaches the user to req.user
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Not authorized, token missing'));
  }

  const token = authHeader.split(' ')[1];
  const user = db.users.find((u) => u.token === token);

  if (!user) {
    return next(new ApiError(401, 'Not authorized, invalid token'));
  }

  req.user = user;
  next();
};

/**
 * Allows only the given roles. Usage: authorize('admin')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }
  next();
};

export { protect, authorize };
