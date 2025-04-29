const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roleAuth');
const User = require('../models/Accounts/User');
const Account = require('../models/Accounts/Account');
const Transaction = require('../models/Accounts/Transaction');
const sequelize = require('../config/db');

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

// ---- ACCOUNT MANAGEMENT ----
// Get all accounts
router.get('/accounts', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const accounts = await Account.findAll({
      include: [{ model: User, attributes: ['email', 'first_name', 'last_name'] }]
    });
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des comptes' });
  }
});

// Get specific account
router.get('/accounts/:id', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['email', 'first_name', 'last_name'] }]
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Compte introuvable' });
    }
    
    res.json(account);
  } catch (error) {
    console.error('Error fetching account details:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails du compte' });
  }
});

// Credit route with improved error handling
router.post('/accounts/:id/credit', authenticate, requireRole(['admin']), async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { amount } = req.body;
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Montant invalide' });
    }
    
    const account = await Account.findByPk(req.params.id, { transaction: t });
    
    if (!account) {
      await t.rollback();
      return res.status(404).json({ error: 'Compte introuvable' });
    }
    
    // Update balance
    const newBalance = parseFloat(account.balance) + numAmount;
    await account.update({ balance: newBalance }, { transaction: t });
    
    // Create transaction record with explicit field names
    await Transaction.create({
      type: 'deposit',
      amount: numAmount,
      to_account: account.id,
      from_account: null, // Explicit null for deposits from admin
      description: 'Dépôt administratif',
      status: 'completed',
      created_at: new Date()
    }, { transaction: t });
    
    await t.commit();
    
    res.json({ 
      success: true, 
      message: `${numAmount.toFixed(2)}€ ajouté au compte`,
      newBalance: newBalance.toFixed(2)
    });
    
  } catch (error) {
    await t.rollback();
    console.error('Error crediting account:', error);
    res.status(500).json({ error: 'Erreur lors du crédit du compte', details: error.message });
  }
});

// Remove money from account
router.post('/accounts/:id/debit', authenticate, requireRole(['admin']), async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { amount } = req.body;
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Montant invalide' });
    }
    
    const account = await Account.findByPk(req.params.id, { transaction: t });
    
    if (!account) {
      await t.rollback();
      return res.status(404).json({ error: 'Compte introuvable' });
    }
    
    // Check sufficient funds
    if (parseFloat(account.balance) < numAmount) {
      await t.rollback();
      return res.status(400).json({ error: 'Solde insuffisant' });
    }
    
    // Update balance
    const newBalance = parseFloat(account.balance) - numAmount;
    await account.update({ balance: newBalance }, { transaction: t });
    
    // Create transaction record
    await Transaction.create({
      type: 'withdrawal',
      amount: numAmount,
      from_account: account.id,
      to_account: null, // Explicit null for withdrawals to admin
      description: 'Retrait administratif',
      status: 'completed',
      created_at: new Date()
    }, { transaction: t });
    
    await t.commit();
    
    res.json({ 
      success: true, 
      message: `${numAmount.toFixed(2)}€ retiré du compte`,
      newBalance: newBalance.toFixed(2)
    });
    
  } catch (error) {
    await t.rollback();
    console.error('Error debiting account:', error);
    res.status(500).json({ error: 'Erreur lors du débit du compte' });
  }
});

// Delete account
router.delete('/accounts/:id', authenticate, requireRole(['admin']), async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const account = await Account.findByPk(req.params.id, { transaction: t });
    
    if (!account) {
      await t.rollback();
      return res.status(404).json({ error: 'Compte introuvable' });
    }
    
    // Optional: Check if account has transactions
    const transactionCount = await Transaction.count({
      where: {
        [sequelize.Op.or]: [
          { from_account: account.id },
          { to_account: account.id }
        ]
      },
      transaction: t
    });
    
    if (transactionCount > 0) {
      await t.rollback();
      return res.status(400).json({ 
        error: 'Ce compte possède des transactions. Suppression impossible.' 
      });
    }
    
    // Delete account
    await account.destroy({ transaction: t });
    
    await t.commit();
    res.json({ success: true, message: 'Compte supprimé avec succès' });
    
  } catch (error) {
    await t.rollback();
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
  }
});

module.exports = router;