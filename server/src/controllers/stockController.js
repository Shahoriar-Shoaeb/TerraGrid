const { PrismaClient } = require('@prisma/client');
const TransferService = require('../services/TransferService');
const prisma = new PrismaClient();

const movementInclude = {
    item: { select: { id: true, sku: true, name: true } },
    warehouse: { select: { id: true, name: true } },
    fromWarehouse: { select: { id: true, name: true } },
    toWarehouse: { select: { id: true, name: true } },
    user: { select: { id: true, name: true, email: true } },
};

const addStock = async (req, res, next) => {
    try {
        const { warehouseId, itemId, quantity, notes } = req.body;

        await prisma.stockLevel.upsert({
            where: { warehouseId_itemId: { warehouseId, itemId } },
            update: { quantity: { increment: quantity }, version: { increment: 1 } },
            create: { warehouseId, itemId, quantity, reservedQty: 0 },
        });

        const movement = await prisma.stockMovement.create({
            data: { itemId, warehouseId, movementType: 'ADD', quantity, userId: req.user.id, notes },
            include: movementInclude,
        });

        res.status(201).json({ message: 'Stock added successfully', movement });
    } catch (err) {
        next(err);
    }
};

const removeStock = async (req, res, next) => {
    try {
        const { warehouseId, itemId, quantity, notes } = req.body;

        const stock = await prisma.stockLevel.findUnique({
            where: { warehouseId_itemId: { warehouseId, itemId } },
        });
        if (!stock) return res.status(404).json({ error: 'Stock not found for this item/warehouse' });

        const available = stock.quantity - stock.reservedQty;
        if (available < quantity) {
            return res.status(422).json({ error: `Insufficient stock. Available: ${available}, Requested: ${quantity}` });
        }

        await prisma.stockLevel.update({
            where: { warehouseId_itemId: { warehouseId, itemId } },
            data: { quantity: { decrement: quantity }, version: { increment: 1 } },
        });

        const movement = await prisma.stockMovement.create({
            data: { itemId, warehouseId, movementType: 'REMOVE', quantity, userId: req.user.id, notes },
            include: movementInclude,
        });

        res.status(201).json({ message: 'Stock removed successfully', movement });
    } catch (err) {
        next(err);
    }
};

const transferStock = async (req, res, next) => {
    try {
        const { itemId, fromWarehouseId, toWarehouseId, quantity, notes } = req.body;
        const result = await TransferService.transfer({
            itemId, fromWarehouseId, toWarehouseId, quantity, userId: req.user.id, notes,
        });
        res.status(201).json({ message: 'Transfer completed successfully', ...result });
    } catch (err) {
        next(err);
    }
};

module.exports = { addStock, removeStock, transferStock };
