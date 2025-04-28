const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const authController = require('../controllers/authControllers');

router.post('/login', authController.login);
router.post('/logout', (req, res) => {
  res.clearCookie('token').json({ success: true });
});
router.get('/me', authenticate, authController.getCurrentUser);
// ADD THIS LINE 👇
router.post('/register', authController.register);

module.exports = router;