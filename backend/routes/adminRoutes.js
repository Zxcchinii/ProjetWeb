const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roleAuth');
// Fix the import path for User
const User = require('../models/Accounts/User');
const Account = require('../models/Accounts/Account');
const Transaction = require('../models/Accounts/Transaction');
const sequelize = require('../config/db'); // Add this import

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

// List all transactions
router.get('/transactions', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        { model: Account, as: 'fromAccount' },
        { model: Account, as: 'toAccount' }
      ],
      order: [['created_at', 'DESC']],
      limit: 200
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
  }
});

// Cancel a transaction
router.post('/transactions/:id/cancel', authenticate, requireRole(['admin']), async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findByPk(transactionId, { transaction: t });
    
    if (!transaction) {
      await t.rollback();
      return res.status(404).json({ error: 'Transaction introuvable' });
    }
    
    if (transaction.status === 'cancelled') {
      await t.rollback();
      return res.status(400).json({ error: 'Cette transaction est déjà annulée' });
    }
    
    // For completed transfers, we need to reverse the money flow
    if (transaction.status === 'completed' && transaction.type === 'transfer') {
      // Get source and destination accounts
      const sourceAccount = transaction.from_account ? 
        await Account.findByPk(transaction.from_account, { transaction: t }) : null;
      
      const destAccount = transaction.to_account ? 
        await Account.findByPk(transaction.to_account, { transaction: t }) : null;
      
      if (sourceAccount && destAccount) {
        // Return money to source account
        const newSourceBalance = parseFloat(sourceAccount.balance) + parseFloat(transaction.amount);
        await sourceAccount.update({ balance: newSourceBalance }, { transaction: t });
        
        // Remove money from destination account
        const newDestBalance = parseFloat(destAccount.balance) - parseFloat(transaction.amount);
        
        // Check if destination has enough funds to reverse
        if (newDestBalance < 0) {
          await t.rollback();
          return res.status(400).json({ 
            error: 'Le compte destinataire a un solde insuffisant pour annuler cette transaction'
          });
        }
        
        await destAccount.update({ balance: newDestBalance }, { transaction: t });
      } else if (transaction.type === 'deposit' && destAccount) {
        // For deposits, remove the money from destination account
        const newDestBalance = parseFloat(destAccount.balance) - parseFloat(transaction.amount);
        
        if (newDestBalance < 0) {
          await t.rollback();
          return res.status(400).json({ error: 'Solde insuffisant pour annuler ce dépôt' });
        }
        
        await destAccount.update({ balance: newDestBalance }, { transaction: t });
      } else if (transaction.type === 'withdrawal' && sourceAccount) {
        // For withdrawals, add the money back to source account
        const newSourceBalance = parseFloat(sourceAccount.balance) + parseFloat(transaction.amount);
        await sourceAccount.update({ balance: newSourceBalance }, { transaction: t });
      }
    }
    
    // Update transaction status to cancelled
    await transaction.update({ status: 'cancelled' }, { transaction: t });
    
    // Create an audit record
    await Transaction.create({
      type: 'transfer', // Change from 'system' to an existing type
      amount: transaction.amount,
      from_account: transaction.to_account,
      to_account: transaction.from_account,
      description: `Annulation administrative de la transaction #${transaction.id}`,
      status: 'completed',
      created_at: new Date()
    }, { transaction: t });
    
    await t.commit();
    
    res.json({ 
      success: true, 
      message: 'Transaction annulée avec succès'
    });
    
  } catch (error) {
    await t.rollback();
    console.error('Error cancelling transaction:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'annulation de la transaction',
      details: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    await user.destroy();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// Promote user to admin
router.put('/users/:id/promote', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    user.role = 'admin';
    await user.save();
    
    res.json({ message: 'Utilisateur promu administrateur avec succès', user });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    res.status(500).json({ error: 'Erreur lors de la promotion de l\'utilisateur' });
  }
});

module.exports = router;