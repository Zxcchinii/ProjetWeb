require('dotenv').config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin',
  database: process.env.DB_NAME || 'postgres',
  logging: false // Set to console.log to see SQL queries
});

module.exports = sequelize;