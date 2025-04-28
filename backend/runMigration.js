const { Sequelize } = require('sequelize');
const sequelize = require('./config/db');
const migration = require('./migrations/20250428200258-create-cards-table');

async function runMigration() {
  try {
    console.log('Starting migration...');
    // Run the migration
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();