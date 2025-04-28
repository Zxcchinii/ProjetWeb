const User = require('../models/Accounts/User');

exports.requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.userId); // Ensure this uses req.userId not req.user_id
      
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ error: 'Erreur d\'autorisation' });
    }
  };
};