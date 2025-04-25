// fichier: backend/routes/accountRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const Account = require('../models/Accounts/Account'); // Fix import

router.get('/', authenticate, async (req, res) => {
  try {
    const accounts = await Account.findAll({ where: { user_id: req.user_id } });
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des comptes' });
  }
});

module.exports = router;