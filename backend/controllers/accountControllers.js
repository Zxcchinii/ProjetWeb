/**
 * Contrôleurs pour la gestion des comptes bancaires
 * Ce fichier contient toutes les fonctions pour manipuler les comptes utilisateurs
 */

// Importation des dépendances
const sequelize = require('../config/db');       // Connexion à la base de données
const Account = require('../models/Accounts/Account');  // Modèle de compte bancaire
const User = require('../models/Accounts/User');        // Modèle d'utilisateur

/**
 * Récupère tous les comptes d'un utilisateur connecté
 * Route: GET /api/accounts
 */
exports.getUserAccounts = async (req, res) => {
  try {
    // Récupère l'ID de l'utilisateur depuis le token d'authentification
    const userId = req.userId;
    // Recherche tous les comptes associés à l'utilisateur, triés par date de création
    const accounts = await Account.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
    // Renvoie les comptes au format JSON
    res.json(accounts);
  } catch (err) {
    // Gestion des erreurs avec journalisation
    console.error('getUserAccounts error:', err);
    res.status(500).json({ error: 'Impossible de récupérer vos comptes' });
  }
};

/**
 * Récupère les détails d'un compte spécifique
 * Route: GET /api/accounts/:id
 */
exports.getAccountDetails = async (req, res) => {
  try {
    const userId = req.userId;
    // Recherche le compte par son ID
    const acc = await Account.findByPk(req.params.id);
    // Vérifie que le compte existe et appartient bien à l'utilisateur
    if (!acc || acc.user_id !== userId) {
      return res.status(404).json({ error: 'Compte introuvable' });
    }
    // Renvoie les détails du compte
    res.json(acc);
  } catch (err) {
    console.error('getAccountDetails error:', err);
    res.status(500).json({ error: 'Impossible de charger le compte' });
  }
};

/**
 * Crée un nouveau compte bancaire
 * Route: POST /api/accounts
 * Utilise une transaction pour garantir l'intégrité des données
 */
exports.createAccount = async (req, res) => {
  // Démarre une transaction pour assurer l'atomicité de l'opération
  const t = await sequelize.transaction();
  try {
    const userId = req.userId;
    const { type } = req.body;
    // Validation du type de compte
    if (!['courant','epargne','entreprise'].includes(type)) {
      await t.rollback(); // Annule la transaction en cas d'erreur
      return res.status(400).json({ error: 'Type de compte invalide' });
    }
    // Génération d'un numéro de compte au format IBAN français
    const account_number = 'FR' + Array.from({ length: 16 },()=>Math.floor(Math.random()*10)).join('');

    // Création du compte dans la base de données
    const account = await Account.create({
      user_id: userId,
      account_number,
      type,
      balance: 0 // Solde initial à zéro
    }, { transaction: t });

    // Valide la transaction si tout s'est bien passé
    await t.commit();
    // Renvoie le compte créé avec un statut 201 (Created)
    res.status(201).json(account);
  } catch (err) {
    // En cas d'erreur, annule la transaction
    await t.rollback();
    console.error('createAccount error:', err);
    res.status(500).json({ error: 'Impossible de créer le compte' });
  }
};

/**
 * Supprime un compte bancaire
 * Route: DELETE /api/accounts/:id
 * Conditions: le compte doit appartenir à l'utilisateur et avoir un solde de 0
 */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    // Recherche le compte par son ID
    const acc = await Account.findByPk(req.params.id);
    // Vérifie que le compte existe et appartient à l'utilisateur
    if (!acc || acc.user_id !== userId) {
      return res.status(404).json({ error: 'Compte introuvable' });
    }
    // Vérifie que le solde est à zéro avant suppression
    if (parseFloat(acc.balance) !== 0) {
      return res.status(400).json({ error: 'Solde non nul, suppression impossible' });
    }
    // Supprime le compte
    await acc.destroy();
    // Retourne un statut 204 (No Content) pour indiquer le succès sans contenu
    res.status(204).end();
  } catch (err) {
    console.error('deleteAccount error:', err);
    res.status(500).json({ error: 'Impossible de supprimer le compte' });
  }
};