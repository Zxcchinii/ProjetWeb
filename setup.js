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
    let isPostgresInstalled = false;
    try {
      if (isWindows) {
        console.log(chalk.yellow('Vérification du service PostgreSQL...'));
        execSync('sc query postgresql-x64-14', { stdio: 'ignore' });
        isPostgresInstalled = true;
      } else if (isMac) {
        console.log(chalk.yellow('Vérification de PostgreSQL sur macOS...'));
        execSync('brew services list | grep postgresql', { stdio: 'ignore' });
        isPostgresInstalled = true;
      } else if (isLinux) {
        console.log(chalk.yellow('Vérification de PostgreSQL sur Linux...'));
        execSync('service postgresql status', { stdio: 'ignore' });
        isPostgresInstalled = true;
      }
    } catch (error) {
      console.log(chalk.yellow('PostgreSQL n\'est pas installé ou n\'est pas en cours d\'exécution.'));
      isPostgresInstalled = false;
    }
    
    // Installer PostgreSQL si nécessaire
    if (!isPostgresInstalled) {
      console.log(chalk.blue('Installation de PostgreSQL...'));
      
      if (isWindows) {
        // Télécharger l'installateur PostgreSQL pour Windows
        console.log(chalk.yellow('Téléchargement de PostgreSQL pour Windows...'));
        const downloadDir = path.join(os.tmpdir(), 'postgresql-installer');
        if (!fs.existsSync(downloadDir)) {
          fs.mkdirSync(downloadDir, { recursive: true });
        }
        
        const installerPath = path.join(downloadDir, 'postgresql-14.7-1-windows-x64.exe');
        
        if (!fs.existsSync(installerPath)) {
          console.log(chalk.yellow('Téléchargement en cours... (cela peut prendre quelques minutes)'));
          execSync(
            'powershell -Command "Invoke-WebRequest -Uri https://get.enterprisedb.com/postgresql/postgresql-14.7-1-windows-x64.exe -OutFile \\"' + 
            installerPath + '\\"\"', 
            { stdio: 'inherit' }
          );
        }
        
        // Installation silencieuse avec les paramètres par défaut
        console.log(chalk.yellow('Installation de PostgreSQL (mode silencieux)...'));
        console.log(chalk.red('ATTENTION: Une fenêtre d\'installation va s\'ouvrir. Suivez les instructions à l\'écran.'));
        console.log(chalk.yellow('Utilisez les valeurs par défaut et définissez le mot de passe "postgres" pour l\'utilisateur postgres.'));
        
        try {
          execSync(
            installerPath + 
            ' --mode unattended --unattendedmodeui minimal' +
            ' --superpassword postgres' +
            ' --servicename postgresql-x64-14' +
            ' --servicepassword postgres' +
            ' --serverport 5432',
            { stdio: 'inherit' }
          );
          
          console.log(chalk.green('PostgreSQL a été installé avec succès!'));
          console.log(chalk.yellow('Démarrage du service PostgreSQL...'));
          execSync('net start postgresql-x64-14', { stdio: 'inherit' });
          
        } catch (installError) {
          console.error(chalk.red('Erreur lors de l\'installation de PostgreSQL:'), installError);
          console.log(chalk.yellow('Veuillez installer PostgreSQL manuellement:'));
          console.log(chalk.yellow('1. Téléchargez PostgreSQL 14 à partir de https://www.enterprisedb.com/downloads/postgres-postgresql-downloads'));
          console.log(chalk.yellow('2. Exécutez l\'installateur et suivez les instructions'));
          console.log(chalk.yellow('3. Utilisez "postgres" comme mot de passe pour l\'utilisateur postgres'));
          console.log(chalk.yellow('4. Assurez-vous que le service PostgreSQL est en cours d\'exécution'));
          return;
        }
      } else if (isMac) {
        console.log(chalk.yellow('Installation de PostgreSQL sur macOS via Homebrew...'));
        console.log(chalk.yellow('Exécutez: brew install postgresql@14 && brew services start postgresql@14'));
        return;
      } else if (isLinux) {
        if (fs.existsSync('/etc/arch-release')) {
          console.log(chalk.yellow('Installation de PostgreSQL sur Arch Linux...'));
          console.log(chalk.yellow('Exécutez: sudo pacman -S postgresql && sudo systemctl start postgresql'));
        } else {
          console.log(chalk.yellow('Installation de PostgreSQL sur Linux (Debian/Ubuntu)...'));
          console.log(chalk.yellow('Exécutez: sudo apt-get update && sudo apt-get install postgresql postgresql-contrib'));
        }
        return;
      }
    }
    
    // Attendre un peu pour s'assurer que PostgreSQL est prêt
    console.log(chalk.yellow('Attente du démarrage complet de PostgreSQL...'));
    await new Promise(resolve => setTimeout(resolve, 5000));
    
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
      
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        account_id INTEGER REFERENCES accounts(id),
        card_number VARCHAR(19) NOT NULL UNIQUE,
        card_type VARCHAR(20) NOT NULL,
        expiration_date TIMESTAMP NOT NULL,
        cvv VARCHAR(4) NOT NULL,
        pin_hash VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'inactive',
        daily_limit DECIMAL(10, 2) DEFAULT 500.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        from_account INTEGER REFERENCES accounts(id),
        to_account INTEGER REFERENCES accounts(id),
        description TEXT,
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Création d'un admin par défaut
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ('admin@example.com', '$2b$10$3YKqfEYAGQFl.cZc5QTJIe0Pz4s/2vI5QEwM2rsMXU5rZ.QTnKFcC', 'Admin', 'User', 'admin')
      ON CONFLICT (email) DO NOTHING;
    \`;
    
    try {
      fs.writeFileSync('schema.sql', schemaSQL);
      execSync(\`psql -U \${dbConfig.username} -d \${dbConfig.database} -f schema.sql\`, { stdio: 'inherit' });
      
      // Créer le fichier .env pour le backend
      console.log(chalk.blue('Configuration du fichier .env...'));
      const envContent = \`
DB_HOST=localhost
DB_PORT=5432
DB_NAME=\${dbConfig.database}
DB_USER=\${dbConfig.username}
DB_PASSWORD=\${dbConfig.password}
JWT_SECRET=votre_secret_jwt_ultra_securise_a_changer_en_production
COOKIE_SECRET=un_autre_secret_pour_les_cookies
\`;
      fs.writeFileSync('./backend/.env', envContent);
      
    } catch (error) {
      console.error(chalk.red('Erreur lors de la configuration de la base de données:'), error);
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