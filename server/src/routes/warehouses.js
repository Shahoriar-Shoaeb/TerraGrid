const express = require('express');
const router = express.Router();
const { getAll, getById, getStock, create } = require('../controllers/warehousesController');
const { createWarehouseSchema, validate } = require('../validators/warehouseValidator');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.get('/', getAll);
router.get('/:id', getById);
router.get('/:id/stock', getStock);
router.post('/', requireRole('ADMIN'), validate(createWarehouseSchema), create);

module.exports = router;
