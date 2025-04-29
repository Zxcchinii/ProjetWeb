const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Account = require('./Account');

const Transaction = sequelize.define('Transaction', {
  // Add this field
  type: {
    type: DataTypes.ENUM('transfer', 'deposit', 'withdrawal'),
    allowNull: false,
    defaultValue: 'transfer'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  // The rest of your model...
  from_account: {
    type: DataTypes.INTEGER,
    references: {
      model: 'accounts',
      key: 'id'
    },
    allowNull: true // Allow null for deposits that don't come from an account
  },
  to_account: {
    type: DataTypes.INTEGER,
    references: {
      model: 'accounts',
      key: 'id'
    },
    allowNull: true // Allow null for withdrawals that don't go to an account
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

Transaction.belongsTo(Account, { as: 'fromAccount', foreignKey: 'from_account' });
Transaction.belongsTo(Account, { as: 'toAccount', foreignKey: 'to_account' });

module.exports = Transaction;