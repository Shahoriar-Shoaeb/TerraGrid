const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const includeStockSummary = {
    stockLevels: {
        include: { item: { select: { id: true, sku: true, name: true } } },
    },
};

const getAll = async (req, res, next) => {
    try {
        const warehouses = await prisma.warehouse.findMany({
            include: {
                stockLevels: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        // Compute total stock per warehouse
        const result = warehouses.map((wh) => ({
            ...wh,
            totalStock: wh.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0),
        }));
        res.json(result);
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const warehouse = await prisma.warehouse.findUnique({
            where: { id },
            include: {
                stockLevels: {
                    include: {
                        item: true,
                    },
                    orderBy: { updatedAt: 'desc' },
                },
            },
        });
        if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });
        res.json({
            ...warehouse,
            totalStock: warehouse.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0),
        });
    } catch (err) {
        next(err);
    }
};

const getStock = async (req, res, next) => {
    try {
        const warehouseId = parseInt(req.params.id);
        const stockLevels = await prisma.stockLevel.findMany({
            where: { warehouseId },
            include: { item: true },
            orderBy: { updatedAt: 'desc' },
        });
        res.json(stockLevels);
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const { name, location, type, minTemp, maxTemp } = req.body;
        const warehouse = await prisma.warehouse.create({
            data: { name, location, type, minTemp, maxTemp },
        });
        res.status(201).json(warehouse);
    } catch (err) {
        next(err);
    }
};

module.exports = { getAll, getById, getStock, create };
