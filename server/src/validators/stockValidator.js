const { z } = require('zod');

const addStockSchema = z.object({
    warehouseId: z.number().int().positive(),
    itemId: z.number().int().positive(),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    notes: z.string().optional(),
});

const removeStockSchema = z.object({
    warehouseId: z.number().int().positive(),
    itemId: z.number().int().positive(),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    notes: z.string().optional(),
});

const transferStockSchema = z.object({
    itemId: z.number().int().positive(),
    fromWarehouseId: z.number().int().positive(),
    toWarehouseId: z.number().int().positive(),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    notes: z.string().optional(),
}).refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
    message: 'Source and destination warehouses must be different',
    path: ['toWarehouseId'],
});

const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { addStockSchema, removeStockSchema, transferStockSchema, validate };
