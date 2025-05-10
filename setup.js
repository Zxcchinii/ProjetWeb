const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 Bootstrapping project setup...');

// Fonction d'installation des dépendances
function ensureDependencies() {
  console.log('📦 Vérification des dépendances de setup...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('📝 Création du package.json initial...');
    const initialPackage = {
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
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(initialPackage, null, 2));
  }

  console.log('📥 Installation des dépendances...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('✅ Dépendances installées, relancement du script setup...');
  
  // Redémarrer le script avec les dépendances installées
  const setupPath = path.join(__dirname, 'setup-main.js');
  
  // Créer le fichier setup-main.js avec le contenu principal
  fs.writeFileSync(setupPath, getMainSetupScript());
  
  // Exécuter le script principal avec les dépendances maintenant disponibles
  execSync(`node ${setupPath}`, { stdio: 'inherit' });
}

// Cette fonction retourne le contenu principal du script setup
function getMainSetupScript() {
  return `
  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  const inquirer = require('inquirer');
  const chalk = require('chalk');
  const os = require('os');
  
  console.log(chalk.blue('🚀 Démarrage de la configuration du projet...'));
  
  // Get platform
  const platform = os.platform();
  const isWindows = platform === 'win32';
  const isMac = platform === 'darwin';
  const isLinux = platform === 'linux';
  
  // Install dependencies
  console.log(chalk.green('📦 Installation des dépendances backend...'));
  execSync('cd backend && npm install', { stdio: 'inherit' });
  
  // Ensure nodemon is available for backend dev
  console.log(chalk.green('🛠 Installation de nodemon pour le développement backend...'));
  execSync('cd backend && npm install nodemon --save-dev', { stdio: 'inherit' });
  
  // Install frontend dependencies
  console.log(chalk.green('📦 Installation des dépendances frontend...'));
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  // PostgreSQL setup (rest of your original setup.js code)
  async function setupPostgres() {
    console.log(chalk.blue('🐘 Configuration de PostgreSQL...'));
    
    const dbConfig = {
      host: 'localhost',
      port: 5432,
      database: 'banquerupt',
      username: 'postgres',
      password: 'postgres'
    };
    
    // Vérifier si PostgreSQL est installé et en cours d'exécution
    try {
      if (isWindows) {
        console.log(chalk.yellow('Vérification du service PostgreSQL...'));
        execSync('sc query postgresql-x64-14', { stdio: 'ignore' });
      } else if (isMac) {
        console.log(chalk.yellow('Vérification de PostgreSQL sur macOS...'));
        execSync('brew services list | grep postgresql', { stdio: 'ignore' });
      } else if (isLinux) {
        console.log(chalk.yellow('Vérification de PostgreSQL sur Linux...'));
        execSync('service postgresql status', { stdio: 'ignore' });
      }
    } catch (error) {
      console.error(chalk.red('PostgreSQL ne semble pas être installé ou en cours d\'exécution.'));
      console.log(chalk.yellow('Veuillez installer PostgreSQL et le démarrer avant de continuer.'));
      return;
    }
    
    // Créer la base de données
    console.log(chalk.blue('Création de la base de données...'));
    try {
      execSync(\`psql -U \${dbConfig.username} -c "CREATE DATABASE \${dbConfig.database}"\`, { stdio: 'ignore' });
    } catch (error) {
      console.log(chalk.yellow('La base de données existe peut-être déjà, tentative de connexion...'));
    }
    
    // Créer les tables et le schéma
    console.log(chalk.blue('Création des tables...'));
    const schemaSQL = \`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'client',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        account_number VARCHAR(30) NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Autres tables nécessaires
    \`;
    
    try {
      fs.writeFileSync('schema.sql', schemaSQL);
      execSync(\`psql -U \${dbConfig.username} -d \${dbConfig.database} -f schema.sql\`, { stdio: 'inherit' });
    } catch (error) {
      console.error(chalk.red('Erreur lors de la création du schéma de la base de données.'), error);
    }
  }
  
  // Run PostgreSQL setup
  setupPostgres()
    .then(() => {
      console.log(chalk.green('✅ Configuration terminée avec succès!'));
    })
    .catch((error) => {
      console.error(chalk.red('❌ Échec de la configuration:'), error);
    });
  `;
}

// Lancer la vérification des dépendances
ensureDependencies();