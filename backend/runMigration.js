const Transaction = require('./models/Accounts/Transaction');

async function createTransactionsTable() {
  try {
    await Transaction.sync({ force: true });
    console.log('Transactions table created successfully');
  } catch (error) {
    console.error('Error creating transactions table:', error);
  }
}

createTransactionsTable();