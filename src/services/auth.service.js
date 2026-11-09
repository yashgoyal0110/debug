import db from '../data/db.js';
import ApiError from '../utils/ApiError.js';

// Never send password / token fields back in normal responses
const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const login = async (email, password) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = db.users.find((u) => u.email === email.toLowerCase().trim());

  if (!user || user.password !== password) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return { token: user.token, user: sanitizeUser(user) };
};

const getProfile = async (userId) => {
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return sanitizeUser(user);
};

export default { login, getProfile };
