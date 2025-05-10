const bcrypt = require('bcrypt');           // Importation de bcrypt pour le chiffrage des codes PIN
const sequelize = require('../config/db');  // Connexion à la base de données
const Card = require('../models/Accounts/Card');     // Modèle Carte bancaire
const Account = require('../models/Accounts/Account'); // Modèle Compte bancaire

const SALT_ROUNDS = 10;  // Niveau de sécurité pour le hachage des codes PIN

// GET /api/cards
// Récupère toutes les cartes bancaires de l'utilisateur connecté
exports.getUserCards = async (req, res) => {
  try {
    const userId = parseInt(req.userId, 10);
    
    console.log(`Récupération des cartes pour l'utilisateur: ${userId}`);
    console.log('Token d\'authentification présent:', !!req.headers.authorization);
    
    if (!userId) {
      console.error('Aucun ID utilisateur fourni dans la requête');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Vérification que le modèle Card est bien chargé
    console.log('Modèle Card chargé:', !!Card);
    
    try {
      // Comptage des cartes avec gestion d'erreur explicite
      const cardCount = await Card.count({
        where: { user_id: userId }
      });
      console.log(`La base de données contient ${cardCount} cartes pour l'utilisateur ${userId}`);
      
      // Essai des deux conventions de nommage pour voir laquelle fonctionne
      let cards;
      try {
        cards = await Card.findAll({
          where: { user_id: userId },
          attributes: { exclude: ['pin_hash'] },  // Exclusion du hash du PIN pour la sécurité
          order: [['created_at', 'DESC']]  // Essai avec snake_case d'abord
        });
      } catch (innerErr) {
        console.log('Erreur avec l\'ordre snake_case, essai avec camelCase:', innerErr.message);
        cards = await Card.findAll({
          where: { user_id: userId },
          attributes: { exclude: ['pin_hash'] },
          order: [['createdAt', 'DESC']]  // Essai avec camelCase ensuite
        });
      }
      
      console.log(`Trouvé ${cards.length} cartes pour l'utilisateur ${userId}`);
      if (cards.length > 0) {
        console.log('Détails de la première carte:', JSON.stringify(cards[0]));
      }
      
      res.json(cards);  // Renvoie les cartes au format JSON
    } catch (dbErr) {
      console.error('Erreur d\'opération de base de données:', dbErr.message, dbErr.stack);
      throw dbErr; // Relance l'erreur pour être capturée par le try-catch externe
    }
  } catch (err) {
    console.error('Erreur getUserCards:', err.message, err.stack);
    res.status(500).json({ error: 'Impossible de récupérer les cartes' });
  }
}

// POST /api/cards
// Création d'une nouvelle carte bancaire
exports.createCard = async (req, res) => {
  const t = await sequelize.transaction();  // Démarrage d'une transaction
  try {
    const userId = parseInt(req.userId, 10);
    const { account_id, card_type, pin } = req.body;
    
    // Validation des données d'entrée
    if (!account_id || !card_type || !pin) {
      return res.status(400).json({ error: 'Données incomplètes' });
    }
    
    // Vérification que le PIN contient 4 chiffres
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'Le code PIN doit contenir 4 chiffres' });
    }

    // Vérification du type de carte
    const validCardTypes = ['visa', 'mastercard', 'amex'];
    if (!validCardTypes.includes(card_type.toLowerCase())) {
      return res.status(400).json({ error: 'Type de carte invalide' });
    }
    
    // Vérification que le compte appartient à l'utilisateur
    const account = await Account.findOne({ 
      where: { id: account_id, user_id: userId },
      transaction: t
    });
    
    if (!account) {
      await t.rollback();  // Annulation de la transaction
      return res.status(404).json({ error: 'Compte introuvable' });
    }
    
    // Génération des détails de la carte
    const cardNumber = generateCardNumber(card_type);  // Génération du numéro de carte
    const expirationDate = new Date();
    // Configuration de la date d'expiration au dernier jour du mois, dans 3 ans
    expirationDate.setFullYear(expirationDate.getFullYear() + 3);
    expirationDate.setDate(1);  // Premier jour du mois
    expirationDate.setMonth(expirationDate.getMonth() + 1);  // Premier jour du mois suivant
    expirationDate.setDate(0);  // Retour au dernier jour du mois actuel
    expirationDate.setHours(23, 59, 59, 999);  // Fin de journée
    const cvv = generateCVV();  // Génération du code CVV
    
    // Hachage du code PIN
    const pin_hash = await bcrypt.hash(pin, SALT_ROUNDS);
    
    // Création de la carte en base de données
    const newCard = await Card.create({
      card_number: cardNumber,
      expiration_date: expirationDate,
      cvv,
      pin_hash,
      card_type,
      status: 'inactive',  // Statut initial inactif
      daily_limit: 500.00, // Limite quotidienne par défaut
      account_id,
      user_id: userId,
    }, { transaction: t });

    // Journalisation pour débogage
    console.log('Objet carte créé:', JSON.stringify(newCard));

    // Vérification que l'user_id et l'account_id ont été correctement définis
    if (newCard.user_id !== userId || newCard.account_id !== account_id) {
      console.error('Erreur d\'association de carte - valeurs attendues:', { user_id: userId, account_id });
      console.error('Valeurs réelles de la carte:', { user_id: newCard.user_id, account_id: newCard.account_id });
      // Mise à jour forcée si nécessaire
      await newCard.update({ user_id: userId, account_id }, { transaction: t });
    }
    
    console.log('Carte créée avec succès, validation de la transaction...');
    // Validation de la transaction
    await t.commit();
    console.log('Transaction validée avec succès');
    
    // Suppression des données sensibles avant renvoi
    const cardResponse = newCard.toJSON();
    delete cardResponse.pin_hash;
    
    console.log('Renvoi de la nouvelle carte:', JSON.stringify(cardResponse));
    res.status(201).json(cardResponse);
  } catch (err) {
    console.error("Erreur de création de carte:", err);
    console.log('Annulation de la transaction suite à une erreur');
    await t.rollback();  // Annulation de la transaction en cas d'erreur
    res.status(500).json({ error: 'Impossible de créer la carte' });
  }
};

// PATCH /api/cards/:id/status
// Mise à jour du statut d'une carte (actif, inactif, bloqué)
exports.updateCardStatus = async (req, res) => {
  try {
    const userId = parseInt(req.userId, 10)
    const { id } = req.params;
    const { status } = req.body;
    // Vérification que le statut est valide
    if (!['active','inactive','blocked'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    // Recherche et vérification que la carte appartient à l'utilisateur
    const card = await Card.findByPk(id);
    if (!card || card.user_id!==userId) {
      return res.status(404).json({ error: 'Carte introuvable' });
    }
    // Mise à jour du statut
    card.status = status;
    await card.save();
    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur mise à jour statut' });
  }
}

// PATCH /api/cards/:id/limit
// Mise à jour de la limite quotidienne de dépense d'une carte
exports.updateCardLimit = async (req, res) => {
  try {
    const userId = parseInt(req.userId, 10)
    const { id } = req.params;
    const limit = parseFloat(req.body.daily_limit);
    // Validation que la limite est un nombre positif
    if (isNaN(limit)||limit<0) {
      return res.status(400).json({ error: 'Plafond invalide' });
    }
    // Recherche et vérification que la carte appartient à l'utilisateur
    const card = await Card.findByPk(id);
    if (!card||card.user_id!==userId) {
      return res.status(404).json({ error: 'Carte introuvable' });
    }
    // Mise à jour de la limite
    card.daily_limit = limit;
    await card.save();
    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur mise à jour plafond' });
  }
}

// DELETE /api/cards/:id
// Suppression d'une carte bancaire
exports.deleteCard = async (req, res) => {
  try {
    const t = await sequelize.transaction();  // Démarrage d'une transaction
    const userId = parseInt(req.userId, 10);
    const cardId = parseInt(req.params.id, 10);
    
    if (!cardId) {
      await t.rollback();
      return res.status(400).json({ error: 'ID de carte invalide' });
    }
    
    // Vérification que la carte appartient bien à l'utilisateur
    const card = await Card.findOne({
      where: { 
        id: cardId,
        user_id: userId 
      },
      transaction: t
    });
    
    if (!card) {
      await t.rollback();
      return res.status(404).json({ error: 'Carte introuvable' });
    }
    
    // Suppression de la carte
    await card.destroy({ transaction: t });
    
    await t.commit();  // Validation de la transaction
    return res.status(200).json({ 
      success: true, 
      message: 'Carte supprimée avec succès' 
    });
  } catch (err) {
    await t.rollback();  // Annulation en cas d'erreur
    return res.status(500).json({
      success: false,
      error: 'Impossible de supprimer la carte',
      details: err.message
    });
  }
};


// Fonctions utilitaires
// Génère un numéro de carte valide selon l'algorithme de Luhn
function generateCardNumber(type) {
  // Génération des préfixes en fonction du type de carte
  let prefix;
  let length;
  
  switch (type.toLowerCase()) {
    case 'visa':
      prefix = '4';  // Les cartes Visa commencent par 4
      length = 16;
      break;
    case 'mastercard':
      prefix = '5' + (Math.floor(Math.random() * 5) + 1);  // MasterCard: 51-55
      length = 16;
      break;
    case 'amex':
      prefix = '3' + (Math.floor(Math.random() * 2) + 4);  // AmEx: 34 ou 37
      length = 15;
      break;
    default:
      prefix = '4';
      length = 16;
  }
  
  // Génération des chiffres restants aléatoires
  let number = prefix;
  for (let i = 0; i < length - prefix.length - 1; i++) {
    number += Math.floor(Math.random() * 10);
  }
  
  // Implémentation de l'algorithme de Luhn pour le chiffre de vérification
  const digits = number.split('').map(d => parseInt(d));
  let sum = 0;
  let alternate = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  // Calcul du chiffre de vérification
  const checkDigit = (10 - (sum % 10)) % 10;
  return number + checkDigit;
}

// Génère un code CVV aléatoire à 3 chiffres
function generateCVV() {
  return String(Math.floor(Math.random() * 900) + 100);  // Nombre à 3 chiffres entre 100 et 999
}