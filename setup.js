const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const os = require('os');

console.log(chalk.blue('🚀 Bootstrapping project setup...'));

// Get platform
const platform = os.platform();
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

// Check if package.json exists
if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
  console.log(chalk.green('Creating root package.json...'));
  const packageJson = {
    "name": "banque-rupt",
    "version": "1.0.0",
    "description": "Banking application with Next.js frontend and Express backend",
    "scripts": {
      "postinstall": "node setup.js",
      "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install",
      "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
      "dev:backend": "cd backend && npm run dev",
      "dev:frontend": "cd frontend && npm run dev",
      "build": "cd frontend && npm run build",
      "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
      "start:backend": "cd backend && npm start",
      "start:frontend": "cd frontend && npm start"
    },
    "dependencies": {
      "concurrently": "^8.2.0",
      "inquirer": "^8.2.5",
      "chalk": "^4.1.2"
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

// Install root dependencies
console.log(chalk.green('📦 Installing root dependencies...'));
execSync('npm install', { stdio: 'inherit' });

// Install backend dependencies + nodemon
console.log(chalk.green('📦 Installing backend dependencies...'));
execSync('cd backend && npm install', { stdio: 'inherit' });

// Ensure nodemon is available for backend dev
console.log(chalk.green('🛠 Installing nodemon in backend as devDependency...'));
execSync('cd backend && npm install nodemon --save-dev', { stdio: 'inherit' });

// Install frontend dependencies
console.log(chalk.green('📦 Installing frontend dependencies...'));
execSync('cd frontend && npm install', { stdio: 'inherit' });

// PostgreSQL setup
async function setupPostgres() {
  const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'banquerupt',
    username: 'postgres',
    password: 'postgres'
  };

  try {
    console.log(chalk.blue('🐘 Checking PostgreSQL installation...'));
    
    // Check if PostgreSQL is installed
    let postgresInstalled = false;
    try {
      if (isWindows) {
        execSync('where psql', { stdio: 'ignore' });
      } else {
        execSync('which psql', { stdio: 'ignore' });
      }
      postgresInstalled = true;
      console.log(chalk.green('✅ PostgreSQL is already installed.'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ PostgreSQL is not installed.'));
    }
    
    if (!postgresInstalled) {
      const { installPg } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installPg',
          message: 'PostgreSQL is required. Would you like to install it now?',
          default: true,
        },
      ]);
      
      if (!installPg) {
        console.log(chalk.yellow('⚠️ PostgreSQL installation skipped. You will need to install it manually.'));
        return;
      }
      
      console.log(chalk.blue('🔄 Installing PostgreSQL...'));
      
      if (isWindows) {
        console.log(chalk.yellow('⚠️ On Windows, we recommend downloading the installer from https://www.postgresql.org/download/windows/'));
        console.log(chalk.yellow('⚠️ Please install PostgreSQL manually and then run this script again.'));
        return;
      } else if (isMac) {
        execSync('brew install postgresql@14', { stdio: 'inherit' });
        execSync('brew services start postgresql@14', { stdio: 'inherit' });
      } else if (isLinux) {
        execSync('sudo apt-get update', { stdio: 'inherit' });
        execSync('sudo apt-get install -y postgresql postgresql-contrib', { stdio: 'inherit' });
        execSync('sudo systemctl start postgresql', { stdio: 'inherit' });
        execSync('sudo systemctl enable postgresql', { stdio: 'inherit' });
      }
      
      console.log(chalk.green('✅ PostgreSQL installed successfully.'));
    }
    
    // Configure PostgreSQL
    console.log(chalk.blue('🔄 Configuring PostgreSQL...'));
    
    // Customize database settings
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'database',
        message: 'Database name:',
        default: dbConfig.database,
      },
      {
        type: 'input',
        name: 'username',
        message: 'Database username:',
        default: dbConfig.username,
      },
      {
        type: 'password',
        name: 'password',
        message: 'Database password:',
        default: dbConfig.password,
      },
      {
        type: 'input',
        name: 'port',
        message: 'Database port:',
        default: dbConfig.port.toString(),
      },
    ]);
    
    dbConfig.database = answers.database;
    dbConfig.username = answers.username;
    dbConfig.password = answers.password;
    dbConfig.port = parseInt(answers.port);
    
    // Create SQL script
    const sqlFilePath = path.join(__dirname, 'setup_db.sql');
    const sqlContent = `
-- Create database
CREATE DATABASE ${dbConfig.database};

-- Connect to the database
\\c ${dbConfig.database};

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (these are minimal examples, expand as needed)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  account_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  card_number VARCHAR(50) UNIQUE NOT NULL,
  account_id INTEGER REFERENCES accounts(id),
  expiry_date DATE NOT NULL,
  cvv VARCHAR(3) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  from_account INTEGER REFERENCES accounts(id),
  to_account INTEGER REFERENCES accounts(id),
  description TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin user (password: adminPassword123)
INSERT INTO users (email, password_hash, first_name, last_name, role) 
VALUES ('admin@banque.fr', '$2b$10$3euPcmQFCiblsZeEu5s7p.9MQICjYh0M5ghzGkJ5JfpK/bMTmf082', 'Admin', 'System', 'admin');
`;

    fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');
    console.log(chalk.green(`✅ SQL setup script created at ${sqlFilePath}`));
    
    console.log(chalk.blue('🔄 Attempting to create database and tables...'));
    try {
      if (isWindows) {
        execSync(`psql -U ${dbConfig.username} -c "SELECT 1"`, { stdio: 'ignore' });
      } else {
        execSync(`PGPASSWORD="${dbConfig.password}" psql -U ${dbConfig.username} -c "SELECT 1"`, { stdio: 'ignore' });
      }
      
      let psqlCommand;
      if (isWindows) {
        console.log(chalk.yellow('⚠️ On Windows, you may need to enter your PostgreSQL password in the prompt.'));
        psqlCommand = `psql -U ${dbConfig.username} -f "${sqlFilePath}"`;
      } else {
        psqlCommand = `PGPASSWORD="${dbConfig.password}" psql -U ${dbConfig.username} -f "${sqlFilePath}"`;
      }
      
      try {
        execSync(psqlCommand, { stdio: 'inherit' });
        console.log(chalk.green('✅ Database and tables created successfully.'));
      } catch (err) {
        console.log(chalk.red('❌ Error creating database and tables. You might need to run the SQL script manually.'));
        console.log(chalk.yellow(`Run: psql -U ${dbConfig.username} -f "${sqlFilePath}"`));
      }
    } catch (err) {
      console.log(chalk.red('❌ Could not connect to PostgreSQL. Please check if the service is running.'));
      console.log(chalk.yellow('You will need to run the SQL script manually after ensuring PostgreSQL is running.'));
    }
    
    // Create .env file
    const envFilePath = path.join(__dirname, 'backend', '.env');
    const envContent = `
# Database settings
DB_HOST=${dbConfig.host}
DB_PORT=${dbConfig.port}
DB_NAME=${dbConfig.database}
DB_USER=${dbConfig.username}
DB_PASSWORD=${dbConfig.password}

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Server settings
PORT=5000
`;

    fs.writeFileSync(envFilePath, envContent, 'utf8');
    console.log(chalk.green(`✅ Environment file created at ${envFilePath}`));
    
    // Create database config file
    const dbConfigPath = path.join(__dirname, 'backend', 'config', 'db.js');
    if (!fs.existsSync(path.dirname(dbConfigPath))) {
      fs.mkdirSync(path.dirname(dbConfigPath), { recursive: true });
    }
    
    const dbJsContent = `
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
      timestamps: false
    }
  }
);

// Test and authenticate database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
  }
})();

module.exports = sequelize;
`;
    
    fs.writeFileSync(dbConfigPath, dbJsContent, 'utf8');
    console.log(chalk.green(`✅ Database configuration file created at ${dbConfigPath}`));
    
  } catch (error) {
    console.error(chalk.red('❌ Error during PostgreSQL setup:'), error.message);
  }
}

// Run PostgreSQL setup
setupPostgres()
  .then(() => {
    console.log(chalk.green('✅ Setup completed successfully!'));
  })
  .catch((error) => {
    console.error(chalk.red('❌ Setup failed:'), error);
  });