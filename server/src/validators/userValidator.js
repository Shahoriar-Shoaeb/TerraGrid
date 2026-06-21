const { z } = require('zod');

const createUserSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['MANAGER', 'ADMIN']).default('MANAGER'),
});

const patchRoleSchema = z.object({
    role: z.enum(['MANAGER', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
});

const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { createUserSchema, patchRoleSchema, validate };
