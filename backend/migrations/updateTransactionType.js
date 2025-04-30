const sequelize = require('../config/db');

async function updateTransactionType() {
  try {
    // Add the new type to the ENUM
    await sequelize.query(`ALTER TYPE enum_transactions_type ADD VALUE IF NOT EXISTS 'system'`);
    console.log('Transaction type ENUM updated successfully');
  } catch (error) {
    console.error('Error updating transaction type ENUM:', error);
  }
}

updateTransactionType();