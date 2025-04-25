const User = require('../models/Accounts/User');

exports.requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      // User ID was set by the authenticate middleware
      const user = await User.findByPk(req.user_id);
      
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
      
      // Add full user object to request for convenience
      req.user = user;
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ error: 'Erreur d\'autorisation' });
    }
  };
};