const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Zod validation errors
    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: 'Validation error',
            details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
    }

    // Prisma unique constraint
    if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        return res.status(409).json({ error: `Duplicate value: ${field} already exists` });
    }

    // Prisma not found
    if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Record not found' });
    }

    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
};

module.exports = errorHandler;
