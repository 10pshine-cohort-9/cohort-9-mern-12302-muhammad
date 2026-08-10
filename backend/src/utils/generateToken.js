const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = generateToken;
