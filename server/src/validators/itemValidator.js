const { z } = require('zod');

const createItemSchema = z.object({
    sku: z.string().min(1).max(50),
    name: z.string().min(1).max(200),
    category: z.string().min(1).max(100),
    isTempSensitive: z.boolean().optional().default(false),
    shelfLifeDays: z.number().int().positive().optional().nullable(),
});

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { createItemSchema, validate };
