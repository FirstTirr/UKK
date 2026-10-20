const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Akses ditolak, butuh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia_ukk');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token tidak valid' });
  }
};

exports.checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Akses ditolak: Privilege tidak sesuai' });
  }
  next();
};