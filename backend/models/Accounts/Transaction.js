const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Account = require('./Account');

const Transaction = sequelize.define('Transaction', {
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'completed'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'transactions',
  timestamps: false
});

// Define relationships
Transaction.belongsTo(Account, { as: 'fromAccount', foreignKey: 'from_account' });
Transaction.belongsTo(Account, { as: 'toAccount', foreignKey: 'to_account' });

module.exports = Transaction;

// Add these routes to adminRoutes.js
const Transaction = require('../models/Accounts/Transaction');

// Get all transactions 
router.get('/transactions', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        { model: Account, as: 'fromAccount' },
        { model: Account, as: 'toAccount' }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
  }
});

// Cancel a pending transaction
router.put('/transactions/:id/cancel', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Seules les transactions en attente peuvent être annulées' });
    }
    
    transaction.status = 'cancelled';
    await transaction.save();
    
    res.json({ message: 'Transaction annulée avec succès', transaction });
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation de la transaction' });
  }
});