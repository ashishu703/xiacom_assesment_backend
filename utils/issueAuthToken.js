const jwt = require('jsonwebtoken');

function issueAuthToken(userDoc) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');

  const claims = {
    sub: userDoc._id.toString(),
    email: userDoc.email,
  };

  return jwt.sign(claims, secret, { expiresIn: '7d' });
}

module.exports = issueAuthToken;
