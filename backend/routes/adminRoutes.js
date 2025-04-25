const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roleAuth');
const User = require('../models/Accounts/User');
const Account = require('../models/Accounts/Account');

// Admin dashboard stats
router.get('/dashboard', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const userCount = await User.count();
    const accountCount = await Account.count();
    
    res.json({
      userCount,
      accountCount,
      // Add other relevant stats
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// List all users
router.get('/users', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] } // Never send passwords!
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Get user details including their accounts
router.get('/users/:id', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
      include: Account
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails utilisateur' });
  }
});

module.exports = router;