// fichier: backend/middlewares/auth.js
const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Accès non autorisé' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user_id = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};