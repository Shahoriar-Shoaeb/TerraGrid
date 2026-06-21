const express = require('express');
const router = express.Router();
const { login, logout, me } = require('../controllers/authController');
const { loginSchema, validate } = require('../validators/authValidator');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);

module.exports = router;
