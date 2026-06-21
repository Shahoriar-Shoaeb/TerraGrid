const { z } = require('zod');

const createWarehouseSchema = z.object({
    name: z.string().min(1).max(100),
    location: z.string().min(1).max(200),
    type: z.enum(['STANDARD', 'COLD_STORAGE', 'HIGH_THROUGHPUT']),
    minTemp: z.number().optional().nullable(),
    maxTemp: z.number().optional().nullable(),
}).refine((data) => {
    if (data.type === 'COLD_STORAGE') {
        return data.minTemp != null && data.maxTemp != null;
    }
    return true;
}, { message: 'Cold storage requires minTemp and maxTemp', path: ['minTemp'] });

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { createWarehouseSchema, validate };
