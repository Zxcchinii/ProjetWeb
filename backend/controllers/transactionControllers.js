const Transaction = require('../models/Accounts/Transaction');
const Account = require('../models/Accounts/Account');
const { Op } = require('sequelize');
const sequelize = require('../config/db'); // Add this line to import sequelize

// Get user transactions
exports.getUserTransactions = async (req, res) => {
  try {
    // Get user's accounts
    const accounts = await Account.findAll({
      where: { user_id: req.userId },
      attributes: ['id']
    });
    
    if (!accounts.length) {
      return res.json([]);
    }
    
    const accountIds = accounts.map(account => account.id);
    
    // Get transactions for these accounts
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { from_account: { [Op.in]: accountIds } },
          { to_account: { [Op.in]: accountIds } }
        ]
      },
      include: [
        { model: Account, as: 'fromAccount' },
        { model: Account, as: 'toAccount' }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  const t = await sequelize.transaction(); // Now sequelize is defined
  
  try {
    const { amount, description, account_number_from, account_number_to } = req.body;
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Montant invalide' });
    }
    
    // Find source account by account number
    const sourceAccount = await Account.findOne({ 
      where: { account_number: account_number_from, user_id: req.userId },
      transaction: t
    });
    
    if (!sourceAccount) {
      await t.rollback();
      return res.status(404).json({ error: 'Compte source introuvable' });
    }
    
    // Check sufficient funds
    if (parseFloat(sourceAccount.balance) < numAmount) {
      await t.rollback();
      return res.status(400).json({ error: 'Solde insuffisant' });
    }
    
    // Find destination account by account number
    const destAccount = await Account.findOne({
      where: { account_number: account_number_to },
      transaction: t
    });
    
    if (!destAccount) {
      await t.rollback();
      return res.status(404).json({ error: 'Compte destinataire introuvable' });
    }
    
    // Update balances
    const newSourceBalance = parseFloat(sourceAccount.balance) - numAmount;
    const newDestBalance = parseFloat(destAccount.balance) + numAmount;
    
    await sourceAccount.update({ balance: newSourceBalance }, { transaction: t });
    await destAccount.update({ balance: newDestBalance }, { transaction: t });
    
    // Create transaction record
    const transaction = await Transaction.create({
      type: 'transfer',
      amount: numAmount,
      from_account: sourceAccount.id,
      to_account: destAccount.id,
      description: description || 'Virement',
      status: 'completed',
      created_at: new Date()
    }, { transaction: t });
    
    await t.commit();
    
    res.status(201).json({
      id: transaction.id,
      amount: numAmount,
      from_account: sourceAccount.id,
      to_account: destAccount.id,
      status: 'completed'
    });
    
  } catch (error) {
    await t.rollback();
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la transaction' });
  }
};