const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const User = require('./User');
const Account = require('./Account');

const Card = sequelize.define('Card', {
  card_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  expiration_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  cvv: {
    type: DataTypes.STRING(3),
    allowNull: false
  },
  pin_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  card_type: {
    type: DataTypes.ENUM('visa', 'mastercard', 'amex'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'blocked'),
    defaultValue: 'inactive'
  },
  daily_limit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 500.00,
    get() {
      // Convert string to number when retrieving from database
      const value = this.getDataValue('daily_limit');
      return value === null ? null : parseFloat(value);
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'cards',
  timestamps: false
});

// Define relationships
Card.belongsTo(User, { foreignKey: 'user_id' });
Card.belongsTo(Account, { foreignKey: 'account_id' });
User.hasMany(Card, { foreignKey: 'user_id' });
Account.hasMany(Card, { foreignKey: 'account_id' });

module.exports = Card;