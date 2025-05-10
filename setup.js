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
    // Le reste du code de configuration PostgreSQL...
    const dbConfig = {
      host: 'localhost',
      port: 5432,
      database: 'banquerupt',
      username: 'postgres',
      password: 'postgres'
    };
  
    // ... [Le reste de votre fonction setupPostgres]
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