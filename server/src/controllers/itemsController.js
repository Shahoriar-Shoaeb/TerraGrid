const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res, next) => {
    try {
        const { search, category } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { sku: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) where.category = category;

        const items = await prisma.inventoryItem.findMany({
            where,
            include: {
                stockLevels: {
                    include: { warehouse: { select: { id: true, name: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(items);
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const item = await prisma.inventoryItem.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                stockLevels: { include: { warehouse: true } },
            },
        });
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const { sku, name, category, isTempSensitive, shelfLifeDays } = req.body;
        const item = await prisma.inventoryItem.create({
            data: { sku, name, category, isTempSensitive: isTempSensitive ?? false, shelfLifeDays },
        });
        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
};

const getCategories = async (req, res, next) => {
    try {
        const grouped = await prisma.inventoryItem.groupBy({
            by: ['category'],
            _count: { _all: true },
        });
        res.json(grouped.map((g) => ({ category: g.category, count: g._count._all })));
    } catch (err) {
        next(err);
    }
};

module.exports = { getAll, getById, create, getCategories };
