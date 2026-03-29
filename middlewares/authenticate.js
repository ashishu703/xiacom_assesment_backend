const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { isNonEmptyString } = require('../utils/textValidation');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!isNonEmptyString(authHeader)) {
    return next(new AppError('Login required', 401));
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !isNonEmptyString(token)) {
    return next(new AppError('Invalid auth format', 401));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) return next(new AppError('Server config error', 500));

  const decoded = safeVerifyJwt(token, secret);
  if (!decoded) return next(new AppError('Session expired', 401));

  if (!decoded.sub) {
    return next(new AppError('Invalid session', 401));
  }

  req.userId = decoded.sub;
  req.userEmail = decoded.email || '';

  next();
}

function safeVerifyJwt(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

module.exports = authenticate;
