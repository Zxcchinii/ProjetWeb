const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roleAuth');
const { Op } = require('sequelize');
const User = require('../models/Accounts/User');
const Account = require('../models/Accounts/Account');
const Card = require('../models/Accounts/Card');
const Transaction = require('../models/Accounts/Transaction');

// middleware employé/admin
const employeeAuth = [ authenticate, requireRole(['employe','admin']) ];

// -- Clients CRUD --
router.get('/clients', employeeAuth, async (req,res) => {
  const { search } = req.query;
  const where = { role: 'client' };
  if (search) where[Op.or] = [
    { first_name: { [Op.iLike]: `%${search}%` } },
    { last_name:  { [Op.iLike]: `%${search}%` } },
    { email:      { [Op.iLike]: `%${search}%` } }
  ];
  const clients = await User.findAll({ where, attributes: { exclude:['password_hash'] } });
  res.json(clients);
});
router.get('/clients/:id', employeeAuth, async (req,res) => {
  const u = await User.findByPk(req.params.id, { attributes: { exclude:['password_hash'] } });
  if(!u) return res.status(404).json({ error:'Client introuvable' });
  res.json(u);
});
router.post('/clients', employeeAuth, async (req,res) => {
  try {
    const u = await User.create({ ...req.body, role:'client' });
    res.status(201).json(u);
  } catch(e) { res.status(400).json({ error:e.message }); }
});
router.patch('/clients/:id', employeeAuth, async (req,res) => {
  const u = await User.findByPk(req.params.id);
  if(!u) return res.status(404).end();
  await u.update(req.body);
  res.json(u);
});
router.delete('/clients/:id', employeeAuth, async (req,res) => {
  const u = await User.findByPk(req.params.id);
  if(!u) return res.status(404).end();
  await u.destroy();
  res.status(204).end();
});

// -- Comptes CRUD --
router.get('/accounts', employeeAuth, async (req,res) => {
  res.json(await Account.findAll());
});
router.get('/accounts/:id', employeeAuth, async (req,res) => {
  const a = await Account.findByPk(req.params.id);
  if(!a) return res.status(404).end();
  res.json(a);
});
router.post('/accounts', employeeAuth, async (req,res) => {
  try {
    const a = await Account.create(req.body);
    res.status(201).json(a);
  } catch(e){ res.status(400).json({ error:e.message }); }
});
router.patch('/accounts/:id', employeeAuth, async (req,res) => {
  const a = await Account.findByPk(req.params.id);
  if(!a) return res.status(404).end();
  await a.update(req.body);
  res.json(a);
});
router.delete('/accounts/:id', employeeAuth, async (req,res) => {
  const a = await Account.findByPk(req.params.id);
  if(!a) return res.status(404).end();
  await a.destroy();
  res.status(204).end();
});

// -- Cartes CRUD --
router.get('/cards', employeeAuth, async (req,res) => {
  res.json(await Card.findAll());
});
router.get('/cards/:id', employeeAuth, async (req,res) => {
  const c = await Card.findByPk(req.params.id);
  if(!c) return res.status(404).end();
  res.json(c);
});
router.patch('/cards/:id/status', employeeAuth, async (req,res) => {
  const c = await Card.findByPk(req.params.id);
  if(!c) return res.status(404).end();
  if(!['active','inactive','blocked'].includes(req.body.status))
    return res.status(400).json({ error:'Statut invalide' });
  await c.update({ status:req.body.status });
  res.json(c);
});
router.patch('/cards/:id/limit', employeeAuth, async (req,res) => {
  const c = await Card.findByPk(req.params.id);
  if(!c) return res.status(404).end();
  const l = parseFloat(req.body.daily_limit);
  if(isNaN(l)||l<0) return res.status(400).json({ error:'Plafond invalide' });
  await c.update({ daily_limit:l });
  res.json(c);
});
router.delete('/cards/:id', employeeAuth, async (req,res) => {
  const c = await Card.findByPk(req.params.id);
  if(!c) return res.status(404).end();
  await c.destroy();
  res.status(204).end();
});

// -- Transactions CRUD --
router.get('/transactions', employeeAuth, async (req,res) => {
  res.json(await Transaction.findAll());
});
router.get('/transactions/:id', employeeAuth, async (req,res) => {
  const t = await Transaction.findByPk(req.params.id);
  if(!t) return res.status(404).end();
  res.json(t);
});
router.delete('/transactions/:id', employeeAuth, async (req,res) => {
  const t = await Transaction.findByPk(req.params.id);
  if(!t) return res.status(404).end();
  await t.destroy();
  res.status(204).end();
});

module.exports = router;