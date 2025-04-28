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

// Add these if missing
Transaction.belongsTo(Account, { as: 'fromAccount', foreignKey: 'from_account' });
Transaction.belongsTo(Account, { as: 'toAccount', foreignKey: 'to_account' });

module.exports = Transaction;