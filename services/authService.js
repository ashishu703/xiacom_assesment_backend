const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const userRepository = require('../repositories/userRepository');
const { validateSignupPayload, validateLoginPayload } = require('../validators/authValidator');
const issueAuthToken = require('../utils/issueAuthToken');

const SALT_ROUNDS = 10;

async function registerAccount(signupBody) {
  validateSignupPayload(signupBody);

  const email = signupBody.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(signupBody.password, SALT_ROUNDS);
  const fullName = typeof signupBody.fullName === 'string' ? signupBody.fullName.trim() : '';

  await userRepository.createUser({ fullName, email, passwordHash });
}

async function loginAccount(loginBody) {
  validateLoginPayload(loginBody);

  const email = loginBody.email.trim().toLowerCase();
  const accountInDb = await userRepository.findByEmailWithPassword(email);

  if (!accountInDb) throw new AppError('Invalid email or password', 401);

  const passwordOk = await bcrypt.compare(loginBody.password, accountInDb.passwordHash);
  if (!passwordOk) throw new AppError('Invalid email or password', 401);

  const accessToken = issueAuthToken(accountInDb);

  const authSession = {
    token: accessToken,
    user: {
      id: accountInDb._id.toString(),
      email: accountInDb.email,
      fullName: accountInDb.fullName || '',
    },
  };

  return authSession;
}

async function getSessionProfile(userId) {
  const accountRow = await userRepository.findByIdLean(userId);
  if (!accountRow) throw new AppError('Account not found', 404);

  return {
    id: accountRow._id.toString(),
    email: accountRow.email,
    fullName: accountRow.fullName || '',
  };
}

module.exports = {
  registerAccount,
  loginAccount,
  getSessionProfile,
};
