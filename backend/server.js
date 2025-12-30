require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const { Pool } = require("pg");
const path = require("path");

const app = express();
app.use(express.json());
app.use("/admin", express.static(path.join(__dirname, "public")));
app.use(helmet({ contentSecurityPolicy: false }));

// UI backoffice
app.use("/admin", express.static(path.join(__dirname, "public")));

// DB
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Auth admin ultra simple
function requireAdmin(req, res, next) {
  const key = req.header("x-admin-key");
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

// Health
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

/** STORE (public) **/
app.get("/store/products", async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, description, price, image_url, is_active, created_at
     FROM products
     WHERE is_active = true
     ORDER BY created_at DESC`
  );
  res.json(rows);
});

app.post("/store/orders", async (req, res) => {
  const { customer_name, phone, address, note, items } = req.body || {};
  if (!customer_name || !phone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderRes = await client.query(
      `INSERT INTO orders (customer_name, phone, address, note)
       VALUES ($1,$2,$3,$4)
       RETURNING id`,
      [customer_name, phone, address ?? null, note ?? null]
    );
    const orderId = orderRes.rows[0].id;

    for (const it of items) {
      if (!it.product_id || !it.quantity || it.quantity <= 0) throw new Error("invalid_item");
      const prodRes = await client.query(
        "SELECT id, price FROM products WHERE id=$1 AND is_active=true",
        [it.product_id]
      );
      if (prodRes.rowCount === 0) throw new Error("product_not_found");

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1,$2,$3,$4)`,
        [orderId, it.product_id, it.quantity, prodRes.rows[0].price]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ order_id: orderId });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: e.message || "order_failed" });
  } finally {
    client.release();
  }
});

/** ADMIN (protected) **/
app.get("/admin/api/products", requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, description, price, image_url, is_active, created_at
     FROM products
     ORDER BY created_at DESC`
  );
  res.json(rows);
});

app.post("/admin/api/products", requireAdmin, async (req, res) => {
  const { name, description, price, image_url, is_active } = req.body || {};
  if (!name || price == null) return res.status(400).json({ error: "name_and_price_required" });

  const { rows } = await pool.query(
    `INSERT INTO products (name, description, price, image_url, is_active)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [
      name,
      description ?? null,
      Number(price),
      image_url ?? null,
      is_active === false ? false : true,
    ]
  );
  res.status(201).json(rows[0]);
});

app.put("/admin/api/products/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, is_active } = req.body || {};

  const { rows } = await pool.query(
    `UPDATE products
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         price = COALESCE($4, price),
         image_url = COALESCE($5, image_url),
         is_active = COALESCE($6, is_active)
     WHERE id = $1
     RETURNING *`,
    [
      id,
      name ?? null,
      description ?? null,
      price != null ? Number(price) : null,
      image_url ?? null,
      is_active != null ? Boolean(is_active) : null,
    ]
  );

  if (rows.length === 0) return res.status(404).json({ error: "not_found" });
  res.json(rows[0]);
});

app.delete("/admin/api/products/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  const { rowCount } = await pool.query(
    "UPDATE products SET is_active=false WHERE id=$1",
    [id]
  );

  if (rowCount === 0) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true, soft_deleted: true });
});


app.get("/admin/api/orders", requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT o.id, o.customer_name, o.phone, o.address, o.note, o.status, o.created_at,
            COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     GROUP BY o.id
     ORDER BY o.created_at DESC`
  );
  res.json(rows);
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`Backend running on :${port}`));


// Dashboard stats
app.get("/admin/api/stats", requireAdmin, async (_req, res) => {
  const [prod, pending, total, today] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS n FROM products WHERE is_active=true"),
    pool.query("SELECT COUNT(*)::int AS n FROM orders WHERE status='pending'"),
    pool.query(`
      SELECT COALESCE(SUM(oi.quantity * oi.unit_price), 0)::numeric(12,2) AS total
      FROM order_items oi
    `),
    pool.query(`
      SELECT COUNT(*)::int AS n
      FROM orders
      WHERE created_at >= date_trunc('day', NOW())
    `),
  ]);

  res.json({
    active_products: prod.rows[0].n,
    pending_orders: pending.rows[0].n,
    total_revenue: total.rows[0].total,
    orders_today: today.rows[0].n,
  });
});

// Latest orders
app.get("/admin/api/orders/latest", requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT o.id, o.customer_name, o.phone, o.status, o.created_at,
           COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT 10
  `);

  res.json(rows);
});

app.put("/admin/api/orders/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  const allowed = ["pending", "confirmed", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "invalid_status", allowed });
  }

  const { rowCount } = await pool.query(
    "UPDATE orders SET status=$1 WHERE id=$2",
    [status, id]
  );

  if (rowCount === 0) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});

app.get("/admin/api/orders/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  // 1) order
  const orderRes = await pool.query(
    "SELECT id, customer_name, phone, address, note, status, created_at FROM orders WHERE id=$1",
    [id]
  );
  if (orderRes.rowCount === 0) return res.status(404).json({ error: "not_found" });

  // 2) items + product name
  const itemsRes = await pool.query(
    `
    SELECT
      oi.id,
      oi.product_id,
      p.name AS product_name,
      oi.quantity,
      oi.unit_price,
      (oi.quantity * oi.unit_price) AS line_total
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = $1
    ORDER BY p.name ASC
    `,
    [id]
  );

  const items = itemsRes.rows;
  const total = items.reduce((acc, x) => acc + Number(x.line_total), 0);

  res.json({
    order: orderRes.rows[0],
    items,
    total: total.toFixed(2),
  });
});
