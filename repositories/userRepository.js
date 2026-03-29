const User = require('../models/User');

async function createUser({ fullName, email, passwordHash }) {
  return User.create({ fullName, email, passwordHash });
}

async function findByEmailWithPassword(email) {
  // Model hides passwordHash by default; we explicitly pull it only for login compare.
  return User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
}

async function findByIdLean(userId) {
  return User.findById(userId).select('email fullName').lean();
}

module.exports = {
  createUser,
  findByEmailWithPassword,
  findByIdLean,
};
