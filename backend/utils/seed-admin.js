require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('./models/Accounts/User');
const sequelize = require('./config/db');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@banque.fr' } });
    
    if (existingAdmin) {
      console.log('✅ Admin already exists');
      return;
    }
    
    // Create admin user
    const passwordHash = await bcrypt.hash('adminPassword123', 10);
    await User.create({
      email: 'admin@banque.fr',
      password_hash: passwordHash,
      first_name: 'Admin',
      last_name: 'System',
      role: 'admin'
    });
    
    console.log('✅ Admin user created successfully');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await sequelize.close();
  }
}

createAdmin();