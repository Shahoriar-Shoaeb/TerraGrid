const express = require('express');
const router = express.Router();
const { addStock, removeStock, transferStock } = require('../controllers/stockController');
const { addStockSchema, removeStockSchema, transferStockSchema, validate } = require('../validators/stockValidator');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.post('/add', validate(addStockSchema), addStock);
router.post('/remove', validate(removeStockSchema), removeStock);
router.post('/transfer', validate(transferStockSchema), transferStock);

module.exports = router;
