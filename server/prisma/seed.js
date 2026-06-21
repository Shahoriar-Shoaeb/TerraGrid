const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TerraGrid database...');

  // ─── Users ───────────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('Admin@123', 12);
  const managerPass = await bcrypt.hash('Manager@123', 12);

  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@terragrid.com' },
    update: {},
    create: { name: 'Alex Mercer', email: 'admin@terragrid.com', password: adminPass, role: 'ADMIN' },
  });
  const admin2 = await prisma.user.upsert({
    where: { email: 'sarah.admin@terragrid.com' },
    update: {},
    create: { name: 'Sarah Chen', email: 'sarah.admin@terragrid.com', password: adminPass, role: 'ADMIN' },
  });
  const mgr1 = await prisma.user.upsert({
    where: { email: 'manager@terragrid.com' },
    update: {},
    create: { name: 'James Riley', email: 'manager@terragrid.com', password: managerPass, role: 'MANAGER' },
  });
  const mgr2 = await prisma.user.upsert({
    where: { email: 'priya.manager@terragrid.com' },
    update: {},
    create: { name: 'Priya Sharma', email: 'priya.manager@terragrid.com', password: managerPass, role: 'MANAGER' },
  });
  const mgr3 = await prisma.user.upsert({
    where: { email: 'omar.k@terragrid.com' },
    update: {},
    create: { name: 'Omar Khan', email: 'omar.k@terragrid.com', password: managerPass, role: 'MANAGER' },
  });

  console.log('✅ Users seeded');

  // ─── Warehouses ──────────────────────────────────────────────────────────
  const wh1 = await prisma.warehouse.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Central Hub', location: 'Dallas, TX', type: 'STANDARD' },
  });
  const wh2 = await prisma.warehouse.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'CryoStore East', location: 'Boston, MA', type: 'COLD_STORAGE', minTemp: 2, maxTemp: 8 },
  });
  const wh3 = await prisma.warehouse.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: 'Pacific Logistics', location: 'Los Angeles, CA', type: 'HIGH_THROUGHPUT' },
  });

  console.log('✅ Warehouses seeded');

  // ─── Inventory Items ─────────────────────────────────────────────────────
  const itemData = [
    { sku: 'MED-INST-001', name: 'Surgical Scalpel Set', category: 'Medical Instruments', isTempSensitive: false, shelfLifeDays: 3650 },
    { sku: 'VAC-BIO-002', name: 'mRNA Vaccine Vials', category: 'Vaccines', isTempSensitive: true, shelfLifeDays: 180 },
    { sku: 'PPE-GLV-003', name: 'Nitrile Gloves (Box/100)', category: 'PPE', isTempSensitive: false, shelfLifeDays: 1825 },
    { sku: 'LAB-REA-004', name: 'PCR Reagent Kit', category: 'Lab Reagents', isTempSensitive: true, shelfLifeDays: 365 },
    { sku: 'DIAG-TST-005', name: 'Rapid Antigen Test Kit', category: 'Diagnostics', isTempSensitive: false, shelfLifeDays: 730 },
    { sku: 'MED-INF-006', name: 'IV Saline Solution 500ml', category: 'Infusion Fluids', isTempSensitive: false, shelfLifeDays: 1095 },
    { sku: 'BIO-PLK-007', name: 'Platelet Concentrate', category: 'Blood Products', isTempSensitive: true, shelfLifeDays: 5 },
    { sku: 'SURG-SUP-008', name: 'Sterile Gauze Pads (50pk)', category: 'Surgical Supplies', isTempSensitive: false, shelfLifeDays: 3650 },
    { sku: 'PHARM-ABX-009', name: 'Amoxicillin 500mg Caps', category: 'Pharmaceuticals', isTempSensitive: false, shelfLifeDays: 730 },
    { sku: 'INS-PEN-010', name: 'Insulin Pens (Refrigerated)', category: 'Diabetes Care', isTempSensitive: true, shelfLifeDays: 90 },
  ];

  const items = [];
  for (const data of itemData) {
    const item = await prisma.inventoryItem.upsert({
      where: { sku: data.sku },
      update: {},
      create: data,
    });
    items.push(item);
  }

  console.log('✅ Inventory items seeded');

  // ─── Stock Levels ─────────────────────────────────────────────────────────
  // wh1 (Standard) — no temp-sensitive items
  // wh2 (Cold Storage) — can hold temp-sensitive
  // wh3 (High-Throughput Standard) — no temp-sensitive
  const stockMap = [
    // Central Hub (wh1) - standard items only
    { warehouseId: wh1.id, itemId: items[0].id, quantity: 320 },
    { warehouseId: wh1.id, itemId: items[2].id, quantity: 1500 },
    { warehouseId: wh1.id, itemId: items[4].id, quantity: 800 },
    { warehouseId: wh1.id, itemId: items[5].id, quantity: 2000 },
    { warehouseId: wh1.id, itemId: items[7].id, quantity: 450 },
    { warehouseId: wh1.id, itemId: items[8].id, quantity: 600 },
    // CryoStore East (wh2) - cold storage
    { warehouseId: wh2.id, itemId: items[1].id, quantity: 4500 },
    { warehouseId: wh2.id, itemId: items[3].id, quantity: 120 },
    { warehouseId: wh2.id, itemId: items[6].id, quantity: 80 },
    { warehouseId: wh2.id, itemId: items[9].id, quantity: 350 },
    { warehouseId: wh2.id, itemId: items[0].id, quantity: 50 },
    // Pacific Logistics (wh3) - high throughput
    { warehouseId: wh3.id, itemId: items[0].id, quantity: 200 },
    { warehouseId: wh3.id, itemId: items[2].id, quantity: 3000 },
    { warehouseId: wh3.id, itemId: items[4].id, quantity: 1200 },
    { warehouseId: wh3.id, itemId: items[5].id, quantity: 5000 },
    { warehouseId: wh3.id, itemId: items[7].id, quantity: 750 },
    { warehouseId: wh3.id, itemId: items[8].id, quantity: 1100 },
  ];

  for (const sl of stockMap) {
    await prisma.stockLevel.upsert({
      where: { warehouseId_itemId: { warehouseId: sl.warehouseId, itemId: sl.itemId } },
      update: {},
      create: { ...sl, reservedQty: 0 },
    });
  }

  console.log('✅ Stock levels seeded');

  // ─── Stock Movements (last 7 days) ───────────────────────────────────────
  const now = new Date();
  const day = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const movements = [
    { itemId: items[0].id, warehouseId: wh1.id, movementType: 'ADD', quantity: 100, userId: admin1.id, timestamp: day(6), notes: 'Initial stock replenishment' },
    { itemId: items[1].id, warehouseId: wh2.id, movementType: 'ADD', quantity: 500, userId: mgr1.id, timestamp: day(6), notes: 'New vaccine batch received' },
    { itemId: items[2].id, warehouseId: wh1.id, movementType: 'ADD', quantity: 400, userId: mgr2.id, timestamp: day(5), notes: 'PPE restock' },
    { itemId: items[4].id, warehouseId: wh3.id, movementType: 'ADD', quantity: 300, userId: mgr3.id, timestamp: day(5), notes: 'Test kit bulk order' },
    { itemId: items[5].id, warehouseId: wh1.id, movementType: 'REMOVE', quantity: 200, userId: mgr1.id, timestamp: day(5), notes: 'Hospital order dispatch' },
    { itemId: items[0].id, warehouseId: wh1.id, movementType: 'TRANSFER_OUT', quantity: 50, userId: admin1.id, fromWarehouseId: wh1.id, toWarehouseId: wh3.id, timestamp: day(4), notes: 'Transfer to Pacific' },
    { itemId: items[0].id, warehouseId: wh3.id, movementType: 'TRANSFER_IN', quantity: 50, userId: admin1.id, fromWarehouseId: wh1.id, toWarehouseId: wh3.id, timestamp: day(4), notes: 'Transfer from Central Hub' },
    { itemId: items[6].id, warehouseId: wh2.id, movementType: 'ADD', quantity: 80, userId: admin2.id, timestamp: day(4), notes: 'Emergency platelet shipment' },
    { itemId: items[9].id, warehouseId: wh2.id, movementType: 'ADD', quantity: 150, userId: mgr1.id, timestamp: day(3), notes: 'Insulin restock Q2' },
    { itemId: items[3].id, warehouseId: wh2.id, movementType: 'REMOVE', quantity: 30, userId: mgr2.id, timestamp: day(3), notes: 'Lab order fulfillment' },
    { itemId: items[8].id, warehouseId: wh1.id, movementType: 'ADD', quantity: 200, userId: mgr3.id, timestamp: day(3), notes: 'Antibiotic bulk purchase' },
    { itemId: items[2].id, warehouseId: wh3.id, movementType: 'ADD', quantity: 1000, userId: mgr1.id, timestamp: day(2), notes: 'Gloves bulk shipment' },
    { itemId: items[5].id, warehouseId: wh3.id, movementType: 'REMOVE', quantity: 500, userId: admin1.id, timestamp: day(2), notes: 'Regional hospital supply' },
    { itemId: items[7].id, warehouseId: wh1.id, movementType: 'ADD', quantity: 150, userId: mgr2.id, timestamp: day(2), notes: 'Surgical supply delivery' },
    { itemId: items[4].id, warehouseId: wh3.id, movementType: 'TRANSFER_OUT', quantity: 200, userId: admin2.id, fromWarehouseId: wh3.id, toWarehouseId: wh1.id, timestamp: day(1), notes: 'Rebalance test kits' },
    { itemId: items[4].id, warehouseId: wh1.id, movementType: 'TRANSFER_IN', quantity: 200, userId: admin2.id, fromWarehouseId: wh3.id, toWarehouseId: wh1.id, timestamp: day(1), notes: 'Rebalance test kits' },
    { itemId: items[1].id, warehouseId: wh2.id, movementType: 'REMOVE', quantity: 100, userId: mgr1.id, timestamp: day(1), notes: 'Clinic vaccine distribution' },
    { itemId: items[0].id, warehouseId: wh3.id, movementType: 'ADD', quantity: 100, userId: mgr3.id, timestamp: day(0), notes: 'Scalpel set replenishment' },
    { itemId: items[8].id, warehouseId: wh3.id, movementType: 'ADD', quantity: 300, userId: mgr2.id, timestamp: day(0), notes: 'Pharmacy chain order' },
    { itemId: items[6].id, warehouseId: wh2.id, movementType: 'REMOVE', quantity: 20, userId: admin1.id, timestamp: day(0), notes: 'Surgery center order' },
  ];

  for (const mv of movements) {
    await prisma.stockMovement.create({ data: mv });
  }

  console.log('✅ Stock movements seeded');
  console.log('\n🎉 TerraGrid database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('  Admin:   admin@terragrid.com   / Admin@123');
  console.log('  Admin:   sarah.admin@terragrid.com / Admin@123');
  console.log('  Manager: manager@terragrid.com  / Manager@123');
  console.log('  Manager: priya.manager@terragrid.com / Manager@123');
  console.log('  Manager: omar.k@terragrid.com   / Manager@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
