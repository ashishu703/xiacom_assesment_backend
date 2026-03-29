const AppError = require('../utils/AppError');
const { EMAIL_REGEX, isNonEmptyString } = require('../utils/textValidation');

const MIN_PASSWORD_LEN = 8;

function validateSignupPayload(signupFields) {
  if (!isNonEmptyString(signupFields.email)) throw new AppError('Email is required', 400);

  const email = signupFields.email.trim();
  if (!EMAIL_REGEX.test(email)) throw new AppError('Enter a valid email address', 400);

  if (!isNonEmptyString(signupFields.password)) throw new AppError('Password is required', 400);
  if (signupFields.password.length < MIN_PASSWORD_LEN) {
    throw new AppError(`Password must be at least ${MIN_PASSWORD_LEN} characters`, 400);
  }

  if (
    signupFields.fullName !== undefined &&
    signupFields.fullName !== null &&
    typeof signupFields.fullName !== 'string'
  ) {
    throw new AppError('Full name must be text', 400);
  }
}

function validateLoginPayload(loginFields) {
  if (!isNonEmptyString(loginFields.email)) throw new AppError('Email is required', 400);
  if (!isNonEmptyString(loginFields.password)) throw new AppError('Password is required', 400);
}

module.exports = {
  validateSignupPayload,
  validateLoginPayload,
};
