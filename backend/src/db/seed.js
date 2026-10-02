const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Demo seeding is disabled in production');
    await pool.end();
    process.exitCode = 1;
    return;
  }

  const demoAdminPassword = process.env.DEMO_ADMIN_PASSWORD;
  if (!demoAdminPassword || demoAdminPassword.length < 12) {
    console.error('Set DEMO_ADMIN_PASSWORD to a value of at least 12 characters before seeding');
    await pool.end();
    process.exitCode = 1;
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(schema);

    const passwordHash = await bcrypt.hash(demoAdminPassword, 12);
    await client.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING`,
      ['admin1', 'admin1@smartinventory.local', passwordHash, 'ADMIN'],
    );

    await client.query(
      `INSERT INTO warehouses (code, name, location, capacity_units) VALUES
       ('WH-NORTH', 'North Distribution Center', 'Chicago, IL', 12000),
       ('WH-SOUTH', 'South Fulfillment Hub', 'Austin, TX', 8500)
       ON CONFLICT (code) DO NOTHING`,
    );

    await client.query(
      `INSERT INTO suppliers (code, name, email, phone, address) VALUES
       ('SUP-NOVA', 'Nova Office Supply', 'orders@nova.example', '+1-312-555-0142', 'Chicago, IL'),
       ('SUP-ORBIT', 'Orbit Components', 'sales@orbit.example', '+1-512-555-0187', 'Austin, TX'),
       ('SUP-CEDAR', 'Cedar Packaging Co.', 'hello@cedar.example', '+1-414-555-0116', 'Milwaukee, WI')
       ON CONFLICT (code) DO NOTHING`,
    );

    await client.query(
      `INSERT INTO products (sku, name, category, unit_price, reorder_level) VALUES
       ('SKU-1001', 'Wireless Barcode Scanner', 'Equipment', 89.99, 12),
       ('SKU-1002', 'Thermal Shipping Labels', 'Packaging', 24.50, 30),
       ('SKU-1003', 'Heavy-Duty Storage Tote', 'Storage', 18.75, 20),
       ('SKU-1004', 'USB-C Docking Station', 'Electronics', 129.00, 8),
       ('SKU-1005', 'Inventory Tag Roll', 'Supplies', 11.25, 25),
       ('SKU-1006', 'Packing Tape Case', 'Packaging', 32.00, 15)
       ON CONFLICT (sku) DO NOTHING`,
    );

    await client.query(
      `INSERT INTO inventory (product_id, warehouse_id, quantity)
       SELECT products.id, warehouses.id, sample.quantity
       FROM (VALUES
         ('SKU-1001', 'WH-NORTH', 24), ('SKU-1001', 'WH-SOUTH', 9),
         ('SKU-1002', 'WH-NORTH', 74), ('SKU-1002', 'WH-SOUTH', 28),
         ('SKU-1003', 'WH-NORTH', 16), ('SKU-1003', 'WH-SOUTH', 31),
         ('SKU-1004', 'WH-NORTH', 7), ('SKU-1004', 'WH-SOUTH', 11),
         ('SKU-1005', 'WH-NORTH', 42), ('SKU-1005', 'WH-SOUTH', 19),
         ('SKU-1006', 'WH-NORTH', 21), ('SKU-1006', 'WH-SOUTH', 14)
       ) AS sample(sku, warehouse_code, quantity)
       JOIN products ON products.sku = sample.sku
       JOIN warehouses ON warehouses.code = sample.warehouse_code
       ON CONFLICT (product_id, warehouse_id) DO NOTHING`,
    );

    await client.query(
      `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference, notes, created_at)
       SELECT products.id, warehouses.id, sample.movement_type, sample.quantity, sample.reference, sample.notes, NOW() - sample.age
       FROM (VALUES
         ('SKU-1001', 'WH-NORTH', 'IN', 12, 'DEMO-MOV-001', 'Initial receiving', INTERVAL '4 days'),
         ('SKU-1002', 'WH-SOUTH', 'OUT', 8, 'DEMO-MOV-002', 'Order fulfillment', INTERVAL '3 days'),
         ('SKU-1003', 'WH-NORTH', 'IN', 20, 'DEMO-MOV-003', 'Supplier delivery', INTERVAL '2 days'),
         ('SKU-1004', 'WH-NORTH', 'OUT', 3, 'DEMO-MOV-004', 'Equipment allocation', INTERVAL '1 day'),
         ('SKU-1005', 'WH-SOUTH', 'IN', 15, 'DEMO-MOV-005', 'Cycle count update', INTERVAL '5 hours')
       ) AS sample(sku, warehouse_code, movement_type, quantity, reference, notes, age)
       JOIN products ON products.sku = sample.sku
       JOIN warehouses ON warehouses.code = sample.warehouse_code
       ON CONFLICT (reference) DO NOTHING`,
    );

    await client.query(
      `INSERT INTO purchase_orders (order_number, supplier_id, warehouse_id, status, ordered_at, expected_at)
       SELECT sample.order_number, suppliers.id, warehouses.id, sample.status, CURRENT_DATE - sample.ordered_days, CURRENT_DATE + sample.expected_days
       FROM (VALUES
         ('PO-DEMO-1001', 'SUP-NOVA', 'WH-NORTH', 'SENT', 2, 5),
         ('PO-DEMO-1002', 'SUP-ORBIT', 'WH-SOUTH', 'PARTIALLY_RECEIVED', 6, 1)
       ) AS sample(order_number, supplier_code, warehouse_code, status, ordered_days, expected_days)
       JOIN suppliers ON suppliers.code = sample.supplier_code
       JOIN warehouses ON warehouses.code = sample.warehouse_code
       ON CONFLICT (order_number) DO NOTHING`,
    );

    await client.query(
      `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_cost)
       SELECT orders.id, products.id, sample.quantity, sample.unit_cost
       FROM (VALUES
         ('PO-DEMO-1001', 'SKU-1001', 10, 79.00),
         ('PO-DEMO-1001', 'SKU-1002', 40, 20.00),
         ('PO-DEMO-1002', 'SKU-1004', 6, 112.00),
         ('PO-DEMO-1002', 'SKU-1006', 18, 27.50)
       ) AS sample(order_number, sku, quantity, unit_cost)
       JOIN purchase_orders AS orders ON orders.order_number = sample.order_number
       JOIN products ON products.sku = sample.sku
       ON CONFLICT (purchase_order_id, product_id) DO NOTHING`,
    );

    await client.query('COMMIT');
    console.log('Demo schema and sample data seeded. Admin username: admin1');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Demo seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();