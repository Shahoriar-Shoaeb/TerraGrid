const express = require('express');
const router = express.Router();
const { getAll, getById, create, getCategories } = require('../controllers/itemsController');
const { createItemSchema, validate } = require('../validators/itemValidator');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getAll);
router.get('/categories', getCategories);
router.get('/:id', getById);
router.post('/', validate(createItemSchema), create);

module.exports = router;
