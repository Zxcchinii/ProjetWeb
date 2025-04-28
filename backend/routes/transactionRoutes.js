const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const transactionController = require('../controllers/transactionControllers');

// Get user transactions
router.get('/', authenticate, transactionController.getUserTransactions);

// Other transaction routes...

module.exports = router;