const sequelize = require('./backend/config/db');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();