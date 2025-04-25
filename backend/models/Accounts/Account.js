const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const User = require('./User');

const Account = sequelize.define('Account', {
  account_number: {
    type: DataTypes.STRING(34),
    unique: true,
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  type: {
    type: DataTypes.ENUM('courant', 'epargne', 'entreprise'),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'accounts',
  timestamps: false
});

// Define relationship
Account.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Account, { foreignKey: 'user_id' });

module.exports = Account;