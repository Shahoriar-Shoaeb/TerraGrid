const express = require('express');
const router = express.Router();
const { getAll, create, patchUser } = require('../controllers/usersController');
const { createUserSchema, patchRoleSchema, validate } = require('../validators/userValidator');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('ADMIN'));
router.get('/', getAll);
router.post('/', validate(createUserSchema), create);
router.patch('/:id/role', validate(patchRoleSchema), patchUser);

module.exports = router;
