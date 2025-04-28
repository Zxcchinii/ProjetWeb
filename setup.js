const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Bootstrapping project setup...');

// Check if package.json exists
if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
  console.log('Creating root package.json...');
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
      "start-frontend": "cd frontend && npm start"
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
console.log('📦 Installing root dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Install backend dependencies + nodemon
console.log('📦 Installing backend dependencies...');
execSync('cd backend && npm install', { stdio: 'inherit' });

// Ensure nodemon is available for backend dev
console.log('🛠 Installing nodemon in backend as devDependency...');
execSync('cd backend && npm install nodemon --save-dev', { stdio: 'inherit' });

// Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
execSync('cd frontend && npm install', { stdio: 'inherit' });

console.log('✅ Setup completed!');