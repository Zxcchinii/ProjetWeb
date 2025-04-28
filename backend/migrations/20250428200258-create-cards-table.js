module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cards', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      card_number: Sequelize.STRING,
      expiration_date: Sequelize.DATE,
      cvv: Sequelize.STRING,
      card_type: Sequelize.STRING,
      status: Sequelize.STRING,
      daily_limit: Sequelize.DECIMAL(10, 2),
      pin_hash: Sequelize.STRING,
      account_id: {
        type: Sequelize.INTEGER,
        references: { model: 'accounts', key: 'id' }
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('cards');
  }
};