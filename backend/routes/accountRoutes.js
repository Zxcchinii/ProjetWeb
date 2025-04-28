const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const ac = require('../controllers/accountControllers');

router.get('/',            authenticate, ac.getUserAccounts);
router.get('/:id',         authenticate, ac.getAccountDetails);
router.post('/',           authenticate, ac.createAccount);
router.delete('/:id',      authenticate, ac.deleteAccount);

module.exports = router;