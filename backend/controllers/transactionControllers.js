const Transaction = require('../models/Accounts/Transaction');  // Importation du modèle de transactions
const Account = require('../models/Accounts/Account');          // Importation du modèle de comptes
const { Op } = require('sequelize');                           // Importation des opérateurs Sequelize pour les requêtes complexes
const sequelize = require('../config/db');                     // Importation de l'instance Sequelize pour les transactions DB

/**
 * Récupère les transactions de l'utilisateur connecté
 * Route: GET /api/transactions
 */
exports.getUserTransactions = async (req, res) => {
  try {
    // Récupère tous les comptes appartenant à l'utilisateur
    const accounts = await Account.findAll({
      where: { user_id: req.userId },
      attributes: ['id']  // Sélectionne uniquement les IDs des comptes
    });
    
    // Si l'utilisateur n'a pas de comptes, renvoie un tableau vide
    if (!accounts.length) {
      return res.json([]);
    }
    
    // Extrait les IDs des comptes dans un tableau
    const accountIds = accounts.map(account => account.id);
    
    // Récupère toutes les transactions impliquant les comptes de l'utilisateur
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { from_account: { [Op.in]: accountIds } },  // Transactions sortantes
          { to_account: { [Op.in]: accountIds } }     // Transactions entrantes
        ]
      },
      include: [
        { model: Account, as: 'fromAccount' },  // Inclusion des détails du compte source
        { model: Account, as: 'toAccount' }     // Inclusion des détails du compte destinataire
      ],
      order: [['created_at', 'DESC']],  // Tri par date de création (plus récent d'abord)
      limit: 50                         // Limite à 50 transactions
    });
    
    // Renvoie les transactions au format JSON
    res.json(transactions);
  } catch (error) {
    // Gestion des erreurs avec journalisation
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
  }
};

/**
 * Crée une nouvelle transaction (virement)
 * Route: POST /api/transactions
 * Utilise une transaction SQL pour garantir l'intégrité des données
 */
exports.createTransaction = async (req, res) => {
  // Démarre une transaction SQL pour assurer l'atomicité
  const t = await sequelize.transaction(); 
  
  try {
    // Récupère et valide les données de la requête
    const { amount, description, account_number_from, account_number_to } = req.body;
    const numAmount = parseFloat(amount);
    
    // Vérifie que le montant est un nombre positif
    if (isNaN(numAmount) || numAmount <= 0) {
      await t.rollback();  // Annule la transaction si montant invalide
      return res.status(400).json({ error: 'Montant invalide' });
    }
    
    // Recherche le compte source par son numéro et vérifie qu'il appartient à l'utilisateur
    const sourceAccount = await Account.findOne({ 
      where: { account_number: account_number_from, user_id: req.userId },
      transaction: t
    });
    
    // Vérifie que le compte source existe
    if (!sourceAccount) {
      await t.rollback();
      return res.status(404).json({ error: 'Compte source introuvable' });
    }
    
    // Vérifie que le solde est suffisant pour effectuer le virement
    if (parseFloat(sourceAccount.balance) < numAmount) {
      await t.rollback();
      return res.status(400).json({ error: 'Solde insuffisant' });
    }
    
    // Recherche le compte destinataire par son numéro
    const destAccount = await Account.findOne({
      where: { account_number: account_number_to },
      transaction: t
    });
    
    // Vérifie que le compte destinataire existe
    if (!destAccount) {
      await t.rollback();
      return res.status(404).json({ error: 'Compte destinataire introuvable' });
    }
    
    // Calcule les nouveaux soldes après la transaction
    const newSourceBalance = parseFloat(sourceAccount.balance) - numAmount;
    const newDestBalance = parseFloat(destAccount.balance) + numAmount;
    
    // Met à jour les soldes des comptes
    await sourceAccount.update({ balance: newSourceBalance }, { transaction: t });
    await destAccount.update({ balance: newDestBalance }, { transaction: t });
    
    // Crée l'enregistrement de la transaction dans la base de données
    const transaction = await Transaction.create({
      type: 'transfer',                            // Type de transaction (virement)
      amount: numAmount,                           // Montant du virement
      from_account: sourceAccount.id,              // ID du compte source
      to_account: destAccount.id,                  // ID du compte destinataire
      description: description || 'Virement',      // Description (avec valeur par défaut)
      status: 'completed',                         // Statut de la transaction (terminée)
      created_at: new Date()                       // Date de création
    }, { transaction: t });
    
    // Valide la transaction SQL si tout s'est bien passé
    await t.commit();
    
    // Renvoie les détails de la transaction créée
    res.status(201).json({
      id: transaction.id,
      amount: numAmount,
      from_account: sourceAccount.id,
      to_account: destAccount.id,
      status: 'completed'
    });
    
  } catch (error) {
    // En cas d'erreur, annule la transaction SQL
    await t.rollback();
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la transaction' });
  }
};