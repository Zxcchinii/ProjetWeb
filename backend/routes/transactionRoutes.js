const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const transactionController = require('../controllers/transactionControllers');

// Get user transactions
router.get('/', authenticate, transactionController.getUserTransactions);

// Add this new route for creating transactions
router.post('/', authenticate, transactionController.createTransaction);

module.exports = router;