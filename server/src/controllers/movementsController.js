const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const movementInclude = {
    item: { select: { id: true, sku: true, name: true } },
    warehouse: { select: { id: true, name: true } },
    fromWarehouse: { select: { id: true, name: true } },
    toWarehouse: { select: { id: true, name: true } },
    user: { select: { id: true, name: true, email: true, role: true } },
};

const getMovements = async (req, res, next) => {
    try {
        const { warehouse, item, type, from, to, page = 1, limit = 20 } = req.query;
        const where = {};
        if (warehouse) where.warehouseId = parseInt(warehouse);
        if (item) where.itemId = parseInt(item);
        if (type) where.movementType = type;
        if (from || to) {
            where.timestamp = {};
            if (from) where.timestamp.gte = new Date(from);
            if (to) where.timestamp.lte = new Date(to + 'T23:59:59.999Z');
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [total, movements] = await Promise.all([
            prisma.stockMovement.count({ where }),
            prisma.stockMovement.findMany({
                where,
                include: movementInclude,
                orderBy: { timestamp: 'desc' },
                skip,
                take: parseInt(limit),
            }),
        ]);

        res.json({ total, page: parseInt(page), limit: parseInt(limit), data: movements });
    } catch (err) {
        next(err);
    }
};

const getAudit = async (req, res, next) => {
    try {
        const { from, to, userId, warehouseId, page = 1, limit = 20 } = req.query;
        const where = {};
        if (userId) where.userId = parseInt(userId);
        if (warehouseId) where.warehouseId = parseInt(warehouseId);
        if (from || to) {
            where.timestamp = {};
            if (from) where.timestamp.gte = new Date(from);
            if (to) where.timestamp.lte = new Date(to + 'T23:59:59.999Z');
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [total, logs] = await Promise.all([
            prisma.stockMovement.count({ where }),
            prisma.stockMovement.findMany({
                where,
                include: movementInclude,
                orderBy: { timestamp: 'desc' },
                skip,
                take: parseInt(limit),
            }),
        ]);

        res.json({ total, page: parseInt(page), limit: parseInt(limit), data: logs });
    } catch (err) {
        next(err);
    }
};

const getDashboardStats = async (req, res, next) => {
    try {
        const [totalItems, totalStockResult, lowStockCount, pendingTransfers, recentMovements, warehouseStocks, last7DaysMovements] = await Promise.all([
            prisma.inventoryItem.count(),
            prisma.stockLevel.aggregate({ _sum: { quantity: true } }),
            prisma.stockLevel.count({ where: { quantity: { lte: 100 } } }),
            prisma.stockMovement.count({ where: { movementType: { in: ['TRANSFER_IN', 'TRANSFER_OUT'] } } }),
            prisma.stockMovement.findMany({
                take: 10,
                orderBy: { timestamp: 'desc' },
                include: movementInclude,
            }),
            prisma.warehouse.findMany({
                include: { stockLevels: true },
            }),
            prisma.stockMovement.findMany({
                where: { timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                orderBy: { timestamp: 'asc' },
                select: { timestamp: true, movementType: true, quantity: true },
            }),
        ]);

        const warehouseStockData = warehouseStocks.map((wh) => ({
            name: wh.name,
            totalStock: wh.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0),
        }));

        // build daily movement totals for chart
        const dailyMap = {};
        last7DaysMovements.forEach((mv) => {
            const day = mv.timestamp.toISOString().split('T')[0];
            if (!dailyMap[day]) dailyMap[day] = { date: day, added: 0, removed: 0, transferred: 0 };
            if (mv.movementType === 'ADD') dailyMap[day].added += mv.quantity;
            else if (mv.movementType === 'REMOVE') dailyMap[day].removed += mv.quantity;
            else dailyMap[day].transferred += mv.quantity;
        });
        const dailyMovements = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

        res.json({
            kpi: {
                totalItems,
                totalStock: totalStockResult._sum.quantity || 0,
                lowStockAlerts: lowStockCount,
                pendingTransfers,
            },
            warehouseStockData,
            dailyMovements,
            recentMovements,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getMovements, getAudit, getDashboardStats };
