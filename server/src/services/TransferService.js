const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TransferService {
    /**
     * Atomically transfer stock between warehouses.
     * Uses Prisma interactive transaction with optimistic locking.
     */
    static async transfer({ itemId, fromWarehouseId, toWarehouseId, quantity, userId, notes }) {
        return await prisma.$transaction(async (tx) => {
            // 1. Fetch item to check cold storage requirement
            const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
            if (!item) throw Object.assign(new Error('Item not found'), { status: 404 });

            // 2. Fetch destination warehouse to validate cold storage rule
            const destWarehouse = await tx.warehouse.findUnique({ where: { id: toWarehouseId } });
            if (!destWarehouse) throw Object.assign(new Error('Destination warehouse not found'), { status: 404 });

            if (item.isTempSensitive && destWarehouse.type !== 'COLD_STORAGE') {
                throw Object.assign(
                    new Error(`Temperature-sensitive item "${item.name}" can only be transferred to Cold Storage warehouses`),
                    { status: 422 }
                );
            }

            // 3. Lock and fetch source stock level (optimistic locking via version)
            const sourceStock = await tx.stockLevel.findUnique({
                where: { warehouseId_itemId: { warehouseId: fromWarehouseId, itemId } },
            });
            if (!sourceStock) {
                throw Object.assign(new Error('No stock found in source warehouse for this item'), { status: 404 });
            }

            const available = sourceStock.quantity - sourceStock.reservedQty;
            if (available < quantity) {
                throw Object.assign(
                    new Error(`Insufficient stock. Available: ${available}, Requested: ${quantity}`),
                    { status: 422 }
                );
            }

            // 4. Decrement source stock (optimistic locking on version)
            const updatedSource = await tx.stockLevel.updateMany({
                where: {
                    warehouseId: fromWarehouseId,
                    itemId,
                    version: sourceStock.version,
                },
                data: {
                    quantity: { decrement: quantity },
                    version: { increment: 1 },
                },
            });

            if (updatedSource.count === 0) {
                throw Object.assign(new Error('Concurrent update detected, please retry'), { status: 409 });
            }

            // 5. Upsert destination stock level
            await tx.stockLevel.upsert({
                where: { warehouseId_itemId: { warehouseId: toWarehouseId, itemId } },
                update: { quantity: { increment: quantity }, version: { increment: 1 } },
                create: { warehouseId: toWarehouseId, itemId, quantity, reservedQty: 0 },
            });

            // 6. Create TRANSFER_OUT movement log
            const movOut = await tx.stockMovement.create({
                data: {
                    itemId,
                    warehouseId: fromWarehouseId,
                    fromWarehouseId,
                    toWarehouseId,
                    movementType: 'TRANSFER_OUT',
                    quantity,
                    userId,
                    notes: notes || `Transfer to warehouse #${toWarehouseId}`,
                },
                include: { item: true, warehouse: true, fromWarehouse: true, toWarehouse: true, user: { select: { id: true, name: true, email: true, role: true } } },
            });

            // 7. Create TRANSFER_IN movement log
            const movIn = await tx.stockMovement.create({
                data: {
                    itemId,
                    warehouseId: toWarehouseId,
                    fromWarehouseId,
                    toWarehouseId,
                    movementType: 'TRANSFER_IN',
                    quantity,
                    userId,
                    notes: notes || `Transfer from warehouse #${fromWarehouseId}`,
                },
                include: { item: true, warehouse: true, fromWarehouse: true, toWarehouse: true, user: { select: { id: true, name: true, email: true, role: true } } },
            });

            return { transferOut: movOut, transferIn: movIn };
        });
    }
}

module.exports = TransferService;
