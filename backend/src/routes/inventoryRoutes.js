const express = require('express');
const { randomUUID } = require('node:crypto');
const db = require('../config/db');
const { authMiddleware, requireRoles } = require('../middleware/authMiddleware');
const { successResponse } = require('../utils/response');

const router = express.Router();
router.use(authMiddleware);

const queryRoute = (query) => async (req, res, next) => {
  try {
    return res.json(successResponse(await query()));
  } catch (error) {
    return next(error);
  }
};

router.post('/products', requireRoles('ADMIN', 'MANAGER'), async (req, res, next) => {
  const sku = String(req.body.sku || '').trim().toUpperCase();
  const name = String(req.body.name || '').trim();
  const category = String(req.body.category || '').trim();
  const unitPrice = Number(req.body.unitPrice);
  const reorderLevel = Number(req.body.reorderLevel);
  const initialQuantity = Number(req.body.initialQuantity || 0);
  const warehouseCode = String(req.body.warehouseCode || '').trim();

  if (!sku || !name || !category || !Number.isFinite(unitPrice) || unitPrice < 0 ||
      !Number.isInteger(reorderLevel) || reorderLevel < 0 ||
      !Number.isInteger(initialQuantity) || initialQuantity < 0 ||
      (initialQuantity > 0 && !warehouseCode)) {
    return res.status(400).json(errorResponse('Enter valid product details and a warehouse for opening stock'));
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO products (sku, name, category, unit_price, reorder_level)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, sku, name`,
      [sku, name, category, unitPrice, reorderLevel],
    );
    const product = rows[0];

    if (initialQuantity > 0) {
      const warehouseResult = await client.query('SELECT id FROM warehouses WHERE code = $1', [warehouseCode]);
      if (!warehouseResult.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(400).json(errorResponse('Select a valid warehouse'));
      }

      const warehouseId = warehouseResult.rows[0].id;
      await client.query(
        'INSERT INTO inventory (product_id, warehouse_id, quantity) VALUES ($1, $2, $3)',
        [product.id, warehouseId, initialQuantity],
      );
      await client.query(
        `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference, notes)
         VALUES ($1, $2, 'IN', $3, $4, 'Opening stock')`,
        [product.id, warehouseId, initialQuantity, `OPEN-${randomUUID()}`],
      );
    }

    await client.query('COMMIT');
    return res.status(201).json(successResponse(product, 'Product created'));
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json(errorResponse('A product with this SKU already exists'));
    }
    return next(error);
  } finally {
    client.release();
  }
});

router.post('/suppliers', requireRoles('ADMIN', 'MANAGER'), async (req, res, next) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').trim();
  const address = String(req.body.address || '').trim();

  if (!code || !name || !/^\S+@\S+\.\S+$/.test(email) || !phone || !address) {
    return res.status(400).json(errorResponse('Enter a code, name, valid email, phone, and address'));
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO suppliers (code, name, email, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING code, name, email, phone, address`,
      [code, name, email, phone, address],
    );
    return res.status(201).json(successResponse(rows[0], 'Supplier created'));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json(errorResponse('A supplier with this code or email already exists'));
    }
    return next(error);
  }
});

router.post('/stock', requireRoles('ADMIN', 'MANAGER'), async (req, res, next) => {
  const sku = String(req.body.sku || '').trim().toUpperCase();
  const warehouseCode = String(req.body.warehouseCode || '').trim();
  const movementType = String(req.body.movementType || '').trim().toUpperCase();
  const quantity = Number(req.body.quantity);
  const notes = String(req.body.notes || '').trim();

  if (!sku || !warehouseCode || !['IN', 'OUT'].includes(movementType) ||
      !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json(errorResponse('Select a product and warehouse, then enter a positive whole-number quantity'));
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const [{ rows: products }, { rows: warehouses }] = await Promise.all([
      client.query('SELECT id FROM products WHERE sku = $1', [sku]),
      client.query('SELECT id FROM warehouses WHERE code = $1', [warehouseCode]),
    ]);

    if (!products[0] || !warehouses[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json(errorResponse('Product or warehouse not found'));
    }

    const productId = products[0].id;
    const warehouseId = warehouses[0].id;

    if (movementType === 'IN') {
      await client.query(
        `INSERT INTO inventory (product_id, warehouse_id, quantity) VALUES ($1, $2, $3)
         ON CONFLICT (product_id, warehouse_id)
         DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity`,
        [productId, warehouseId, quantity],
      );
    } else {
      const update = await client.query(
        `UPDATE inventory SET quantity = quantity - $3
         WHERE product_id = $1 AND warehouse_id = $2 AND quantity >= $3
         RETURNING quantity`,
        [productId, warehouseId, quantity],
      );
      if (!update.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(409).json(errorResponse('Insufficient stock for this stock-out'));
      }
    }

    const reference = `STK-${randomUUID().slice(0, 8).toUpperCase()}`;
    await client.query(
      `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [productId, warehouseId, movementType, quantity, reference, notes],
    );
    await client.query('COMMIT');
    return res.status(201).json(successResponse({ reference, movementType, quantity }, 'Stock movement recorded'));
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
});

router.get(
  '/dashboard',
  queryRoute(async () => {
    const [{ rows: totals }, { rows: movements }] = await Promise.all([
      db.query(
        `SELECT COUNT(DISTINCT products.id)::int AS total_products,
                COALESCE(SUM(inventory.quantity), 0)::int AS total_stock_quantity,
                COUNT(*) FILTER (WHERE inventory.quantity <= products.reorder_level)::int AS low_stock_alerts
         FROM products
         LEFT JOIN inventory ON inventory.product_id = products.id`,
      ),
      db.query(
        `SELECT movements.reference, movements.movement_type, movements.quantity, movements.created_at,
                products.name AS product_name, warehouses.name AS warehouse_name
         FROM stock_movements AS movements
         JOIN products ON products.id = movements.product_id
         JOIN warehouses ON warehouses.id = movements.warehouse_id
         ORDER BY movements.created_at DESC
         LIMIT 6`,
      ),
    ]);

    return { totals: totals[0], movements };
  }),
);

router.get(
  '/products',
  queryRoute(async () => {
    const { rows } = await db.query(
      `SELECT products.sku, products.name, products.category, products.unit_price,
              products.reorder_level, warehouses.name AS warehouse_name,
              COALESCE(inventory.quantity, 0)::int AS quantity
       FROM products
       LEFT JOIN inventory ON inventory.product_id = products.id
       LEFT JOIN warehouses ON warehouses.id = inventory.warehouse_id
       ORDER BY products.name, warehouses.name`,
    );
    return rows;
  }),
);

router.get(
  '/suppliers',
  queryRoute(async () => {
    const { rows } = await db.query('SELECT code, name, email, phone, address FROM suppliers ORDER BY name');
    return rows;
  }),
);

router.get(
  '/warehouses',
  queryRoute(async () => {
    const { rows } = await db.query(
      `SELECT warehouses.code, warehouses.name, warehouses.location, warehouses.capacity_units,
              COALESCE(SUM(inventory.quantity), 0)::int AS used_units
       FROM warehouses
       LEFT JOIN inventory ON inventory.warehouse_id = warehouses.id
       GROUP BY warehouses.id
       ORDER BY warehouses.name`,
    );
    return rows;
  }),
);

router.get(
  '/stock',
  queryRoute(async () => {
    const { rows } = await db.query(
      `SELECT movements.reference, movements.movement_type, movements.quantity,
              movements.notes, movements.created_at, products.name AS product_name,
              warehouses.name AS warehouse_name
       FROM stock_movements AS movements
       JOIN products ON products.id = movements.product_id
       JOIN warehouses ON warehouses.id = movements.warehouse_id
       ORDER BY movements.created_at DESC`,
    );
    return rows;
  }),
);

router.get(
  '/purchase-orders',
  queryRoute(async () => {
    const { rows } = await db.query(
      `SELECT orders.order_number, orders.status, orders.ordered_at, orders.expected_at,
              suppliers.name AS supplier_name, warehouses.name AS warehouse_name,
              COALESCE(SUM(items.quantity * items.unit_cost), 0)::numeric(12, 2) AS total
       FROM purchase_orders AS orders
       JOIN suppliers ON suppliers.id = orders.supplier_id
       JOIN warehouses ON warehouses.id = orders.warehouse_id
       LEFT JOIN purchase_order_items AS items ON items.purchase_order_id = orders.id
       GROUP BY orders.id, suppliers.name, warehouses.name
       ORDER BY orders.ordered_at DESC`,
    );
    return rows;
  }),
);

router.get(
  '/reports',
  queryRoute(async () => {
    const [{ rows: summary }, { rows: categories }] = await Promise.all([
      db.query(
        `SELECT COALESCE(SUM(inventory.quantity * products.unit_price), 0)::numeric(14, 2) AS inventory_value,
                COUNT(*) FILTER (WHERE inventory.quantity <= products.reorder_level)::int AS low_stock_products,
                (SELECT COUNT(*)::int FROM stock_movements) AS movement_count
         FROM products
         LEFT JOIN inventory ON inventory.product_id = products.id`,
      ),
      db.query(
        `SELECT products.category, COALESCE(SUM(inventory.quantity), 0)::int AS quantity
         FROM products
         LEFT JOIN inventory ON inventory.product_id = products.id
         GROUP BY products.category
         ORDER BY products.category`,
      ),
    ]);

    return { summary: summary[0], categories };
  }),
);

module.exports = router;