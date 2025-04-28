const Transaction = require('../models/Accounts/Transaction');
const Account = require('../models/Accounts/Account');
const { Op } = require('sequelize');

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