const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    console.log(token)

    // Full user object was signed into the token — decode it directly
// 2. Verify the token — user object is embedded directly in payload
const decoded = jwt.verify(token, process.env.JWT_KEY);
console.log(decoded)
// 3. Attach decoded payload directly (already has _id, email, etc.)
req.user = decoded;
next();
  } catch (err) {
    console.log(err.message)
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication failed.' });
  }
};

module.exports = authMiddleware;