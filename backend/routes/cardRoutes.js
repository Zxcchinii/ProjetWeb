const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardControllers'); 
const { authenticate } = require('../middlewares/auth');

// Make sure these match exactly what's in cardControllers.js
router.get('/cards', authenticate, cardController.getUserCards);
router.post('/cards', authenticate, cardController.createCard);
router.patch('/cards/:id/status', authenticate, cardController.updateCardStatus);
router.patch('/cards/:id/limit', authenticate, cardController.updateCardLimit);
router.delete('/cards/:id', authenticate, cardController.deleteCard); // Fixed: added '/cards/'

module.exports = router;