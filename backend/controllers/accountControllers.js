const sequelize = require('../config/db');
const Account = require('../models/Accounts/Account');
const User = require('../models/Accounts/User');

// GET /api/accounts
exports.getUserAccounts = async (req, res) => {
  try {
    const userId = req.userId;
    const accounts = await Account.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
    res.json(accounts);
  } catch (err) {
    console.error('getUserAccounts error:', err);
    res.status(500).json({ error: 'Impossible de récupérer vos comptes' });
  }
};

// GET /api/accounts/:id
exports.getAccountDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const acc = await Account.findByPk(req.params.id);
    if (!acc || acc.user_id !== userId) {
      return res.status(404).json({ error: 'Compte introuvable' });
    }
    res.json(acc);
  } catch (err) {
    console.error('getAccountDetails error:', err);
    res.status(500).json({ error: 'Impossible de charger le compte' });
  }
};

// POST /api/accounts
exports.createAccount = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.userId;
    const { type } = req.body;
    if (!['courant','epargne','entreprise'].includes(type)) {
      await t.rollback();
      return res.status(400).json({ error: 'Type de compte invalide' });
    }
    // Génération d’un numéro unique FR + 16 chiffres
    const account_number = 'FR' + Array.from({ length: 16 },()=>Math.floor(Math.random()*10)).join('');

    const account = await Account.create({
      user_id: userId,
      account_number,
      type,
      balance: 0
    }, { transaction: t });

    await t.commit();
    res.status(201).json(account);
  } catch (err) {
    await t.rollback();
    console.error('createAccount error:', err);
    res.status(500).json({ error: 'Impossible de créer le compte' });
  }
};

// DELETE /api/accounts/:id
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const acc = await Account.findByPk(req.params.id);
    if (!acc || acc.user_id !== userId) {
      return res.status(404).json({ error: 'Compte introuvable' });
    }
    if (parseFloat(acc.balance) !== 0) {
      return res.status(400).json({ error: 'Solde non nul, suppression impossible' });
    }
    await acc.destroy();
    res.status(204).end();
  } catch (err) {
    console.error('deleteAccount error:', err);
    res.status(500).json({ error: 'Impossible de supprimer le compte' });
  }
};