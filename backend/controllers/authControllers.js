/**
 * Contrôleurs d'authentification
 * Ce fichier gère toutes les fonctionnalités liées à l'authentification des utilisateurs:
 * connexion, inscription et récupération du profil
 */

// Importation des dépendances nécessaires
const jwt = require('jsonwebtoken');        // Pour générer des tokens d'authentification
const bcrypt = require('bcrypt');           // Pour le hachage sécurisé des mots de passe
const User = require('../models/Accounts/User');      // Modèle utilisateur
const Account = require('../models/Accounts/Account'); // Modèle de compte bancaire

/**
 * Fonction de connexion utilisateur
 * Route: POST /api/auth/login
 * @param {object} req - Objet requête Express contenant email et mot de passe
 * @param {object} res - Objet réponse Express
 */
exports.login = async (req, res) => {
  try {
    // Extraction des identifiants depuis le corps de la requête
    const { email, password } = req.body;
    // Recherche de l'utilisateur par son email dans la base de données
    const user = await User.findOne({ where: { email } });
    
    // Vérifie si l'utilisateur existe et si le mot de passe correspond
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      // Si non, renvoie une erreur d'authentification
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    // Génération d'un token JWT valide pour 1 heure
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Envoi du token dans un cookie httpOnly et confirmation du succès
    res.cookie('token', token, { httpOnly: true }).json({ success: true });
  } catch (error) {
    // Journalisation de l'erreur et réponse appropriée
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

/**
 * Récupère les informations de l'utilisateur actuellement connecté
 * Route: GET /api/auth/me
 * Nécessite un token valide dans les cookies
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // Récupère l'utilisateur depuis l'ID stocké dans le token (via middleware d'authentification)
    const user = await User.findByPk(req.userId, {
      // Exclusion du hash du mot de passe pour des raisons de sécurité
      attributes: { exclude: ['password_hash'] }
    });
    
    // Vérifie si l'utilisateur existe toujours
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Renvoie les données utilisateur
    res.json(user);
  } catch (error) {
    // Gestion des erreurs
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
};

/**
 * Inscription d'un nouvel utilisateur
 * Route: POST /api/auth/register
 * Crée un utilisateur et un compte bancaire par défaut
 */
exports.register = async (req, res) => {
  try {
    // Extraction des données d'inscription
    const { email, password, first_name, last_name } = req.body;
    
    // Vérifie si l'email est déjà utilisé
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }
    
    // Hachage sécurisé du mot de passe avec bcrypt
    const password_hash = await bcrypt.hash(password, 10);
    
    // Création de l'utilisateur dans la base de données
    const user = await User.create({
      email,
      password_hash,
      first_name,
      last_name,
      role: 'client' // Attribution du rôle client par défaut
    });
    
    // Création automatique d'un compte courant pour le nouvel utilisateur
    await Account.create({
      user_id: user.id,
      // Génération d'un numéro de compte au format IBAN français simplifié
      account_number: `FR76${Math.floor(Math.random() * 10000000000000000)}`,
      balance: 0, // Solde initial à zéro
      type: 'courant'
    });
    
    // Génération et envoi d'un token pour connecter directement l'utilisateur
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true }).status(201).json({ success: true });
  } catch (error) {
    // Gestion des erreurs d'inscription
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};