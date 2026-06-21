const express = require('express');
const router = express.Router();
const { getMovements, getAudit, getDashboardStats } = require('../controllers/movementsController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.get('/', getMovements);
router.get('/dashboard', getDashboardStats);
router.get('/audit', requireRole('ADMIN'), getAudit);

module.exports = router;
