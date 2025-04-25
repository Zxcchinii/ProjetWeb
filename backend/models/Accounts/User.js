const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const User = sequelize.define('User', {
  email: { 
    type: DataTypes.STRING, 
    unique: true,
    allowNull: false
  },
  password_hash: { 
    type: DataTypes.STRING,
    allowNull: false
  },
  first_name: { 
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: { 
    type: DataTypes.STRING,
    allowNull: false
  },
  role: { 
    type: DataTypes.ENUM('client', 'employe', 'admin'), 
    defaultValue: 'client',
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;