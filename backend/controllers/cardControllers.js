const bcrypt = require('bcrypt');
const sequelize = require('../config/db');
const Card = require('../models/Accounts/Card');
const Account = require('../models/Accounts/Account');

const SALT_ROUNDS = 10;

// GET /api/cards
// Enhanced getUserCards with more debugging
exports.getUserCards = async (req, res) => {
  try {
    const userId = parseInt(req.userId, 10);
    
    console.log(`Fetching cards for user: ${userId}`);
    console.log('Auth token present:', !!req.headers.authorization);
    
    if (!userId) {
      console.error('No userId provided in request');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Log the Card model to ensure it's properly loaded
    console.log('Card model loaded:', !!Card);
    
    try {
      // Try with more explicit error handling
      const cardCount = await Card.count({
        where: { user_id: userId }
      });
      console.log(`Database has ${cardCount} cards for user ${userId}`);
      
      // Try both naming conventions to see which works
      let cards;
      try {
        cards = await Card.findAll({
          where: { user_id: userId },
          attributes: { exclude: ['pin_hash'] },
          order: [['created_at', 'DESC']]  // Try snake_case first
        });
      } catch (innerErr) {
        console.log('Error with snake_case ordering, trying camelCase:', innerErr.message);
        cards = await Card.findAll({
          where: { user_id: userId },
          attributes: { exclude: ['pin_hash'] },
          order: [['createdAt', 'DESC']]  // Try camelCase second
        });
      }
      
      console.log(`Found ${cards.length} cards for user ${userId}`);
      if (cards.length > 0) {
        console.log('First card details:', JSON.stringify(cards[0]));
      }
      
      res.json(cards);
    } catch (dbErr) {
      console.error('Database operation error:', dbErr.message, dbErr.stack);
      throw dbErr; // Rethrow to be caught by outer try-catch
    }
  } catch (err) {
    console.error('getUserCards error:', err.message, err.stack);
    res.status(500).json({ error: 'Impossible de récupérer les cartes' });
  }
}

// POST /api/cards
exports.createCard = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = parseInt(req.userId, 10);
    const { account_id, card_type, pin } = req.body;
    
    // Validate inputs
    if (!account_id || !card_type || !pin) {
      return res.status(400).json({ error: 'Données incomplètes' });
    }
    
    // Check if pin is 4 digits
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'Le code PIN doit contenir 4 chiffres' });
    }

    const validCardTypes = ['visa', 'mastercard', 'amex'];
    if (!validCardTypes.includes(card_type.toLowerCase())) {
      return res.status(400).json({ error: 'Type de carte invalide' });
    }
    
    // Verify account belongs to user
    const account = await Account.findOne({ 
      where: { id: account_id, user_id: userId },
      transaction: t
    });
    
    if (!account) {
      await t.rollback();
      return res.status(404).json({ error: 'Compte introuvable' });
    }
    
    // Generate card details
    const cardNumber = generateCardNumber(card_type);
    const expirationDate = new Date();
    // Set to last day of the month, 3 years from now
    expirationDate.setFullYear(expirationDate.getFullYear() + 3);
    expirationDate.setDate(1); // First day of month
    expirationDate.setMonth(expirationDate.getMonth() + 1); // Move to first day of next month
    expirationDate.setDate(0); // Back to last day of current month
    expirationDate.setHours(23, 59, 59, 999); // End of day
    const cvv = generateCVV();
    
    // Hash the PIN
    const pin_hash = await bcrypt.hash(pin, SALT_ROUNDS);
    
    // Create the card
    const newCard = await Card.create({
      card_number: cardNumber,
      expiration_date: expirationDate,
      cvv,
      pin_hash,
      card_type,
      status: 'inactive',
      daily_limit: 500.00,
      account_id,
      user_id: userId,
    }, { transaction: t });

    // Add debug logging to check the actual created object
    console.log('Created card object:', JSON.stringify(newCard));

    // Check if user_id and account_id were properly set
    if (newCard.user_id !== userId || newCard.account_id !== account_id) {
      console.error('Card association error - expected values:', { user_id: userId, account_id });
      console.error('Card actual values:', { user_id: newCard.user_id, account_id: newCard.account_id });
      // Force update if needed
      await newCard.update({ user_id: userId, account_id }, { transaction: t });
    }
    
    console.log('Card created successfully, committing transaction...');
    // Commit the transaction
    await t.commit();
    console.log('Transaction committed successfully');
    
    // Return the card without sensitive data
    const cardResponse = newCard.toJSON();
    delete cardResponse.pin_hash;
    
    console.log('Returning new card:', JSON.stringify(cardResponse));
    res.status(201).json(cardResponse);
  } catch (err) {
    console.error("Card creation error:", err);
    console.log('Rolling back transaction due to error');
    await t.rollback();
    res.status(500).json({ error: 'Impossible de créer la carte' });
  }
};

// PATCH /api/cards/:id/status
exports.updateCardStatus = async (req, res) => {
  try {
    const userId = parseInt(req.userId, 10)
    const { id } = req.params;
    const { status } = req.body;
    if (!['active','inactive','blocked'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    const card = await Card.findByPk(id);
    if (!card || card.user_id!==userId) {
      return res.status(404).json({ error: 'Carte introuvable' });
    }
    card.status = status;
    await card.save();
    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur mise à jour statut' });
  }
}

// PATCH /api/cards/:id/limit
exports.updateCardLimit = async (req, res) => {
  try {
    const userId = parseInt(req.userId, 10)
    const { id } = req.params;
    const limit = parseFloat(req.body.daily_limit);
    if (isNaN(limit)||limit<0) {
      return res.status(400).json({ error: 'Plafond invalide' });
    }
    const card = await Card.findByPk(id);
    if (!card||card.user_id!==userId) {
      return res.status(404).json({ error: 'Carte introuvable' });
    }
    card.daily_limit = limit;
    await card.save();
    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur mise à jour plafond' });
  }
}

// Add this method to handle card deletion
exports.deleteCard = async (req, res) => {
  try {
    const t = await sequelize.transaction();
    const userId = parseInt(req.userId, 10);
    const cardId = parseInt(req.params.id, 10);
    
    if (!cardId) {
      await t.rollback();
      return res.status(400).json({ error: 'ID de carte invalide' });
    }
    
    // Check if the card belongs to the user
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
    
    // Delete the card
    await card.destroy({ transaction: t });
    
    await t.commit();
    return res.status(200).json({ 
      success: true, 
      message: 'Carte supprimée avec succès' 
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      success: false,
      error: 'Impossible de supprimer la carte',
      details: err.message
    });
  }
};


// Helper functions
function generateCardNumber(type) {
  // Generate different prefixes based on card type
  let prefix;
  let length;
  
  switch (type.toLowerCase()) {
    case 'visa':
      prefix = '4';
      length = 16;
      break;
    case 'mastercard':
      prefix = '5' + (Math.floor(Math.random() * 5) + 1); // 51-55
      length = 16;
      break;
    case 'amex':
      prefix = '3' + (Math.floor(Math.random() * 2) + 4); // 34 or 37
      length = 15;
      break;
    default:
      prefix = '4';
      length = 16;
  }
  
  // Generate remaining random digits
  let number = prefix;
  for (let i = 0; i < length - prefix.length - 1; i++) {
    number += Math.floor(Math.random() * 10);
  }
  
  // Implement Luhn algorithm for checksum
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
  
  // Calculate check digit
  const checkDigit = (10 - (sum % 10)) % 10;
  return number + checkDigit;
}

function generateCVV() {
  return String(Math.floor(Math.random() * 900) + 100); // 3-digit number between 100-999
}