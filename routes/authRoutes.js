const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
// Lets the SPA double-check a token still maps to a live user after refresh / tab reopen.
router.get('/me', authenticate, authController.me);

module.exports = router;
