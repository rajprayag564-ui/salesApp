-- Demo seed for FMCG Field Sales CRM admin panel
-- Finds auth users by email and creates demo employees, products, retailers,
-- initial stock transactions, and a sample order.
-- Run this in Supabase SQL editor (Project > SQL) as a project admin.

BEGIN;

-- 1) Create employees (admin + agent) if their auth user exists
-- insert admin employee
WITH admin_user AS (
  SELECT id, email FROM auth.users WHERE lower(email) = lower('admin@adm.in')
)
INSERT INTO public.employees (id, name, email, role, is_active)
SELECT u.id, 'Admin User', u.email, 'admin', TRUE
FROM admin_user u
WHERE NOT EXISTS (SELECT 1 FROM public.employees e WHERE e.id = u.id);

-- insert agent employee
WITH agent_user AS (
  SELECT id, email FROM auth.users WHERE lower(email) = lower('test01@e.mp')
)
INSERT INTO public.employees (id, name, email, role, is_active)
SELECT u.id, 'Field Agent', u.email, 'agent', TRUE
FROM agent_user u
WHERE NOT EXISTS (SELECT 1 FROM public.employees e WHERE e.id = u.id);

-- 2) Create sample products if not exists
INSERT INTO public.products (id, name, category, unit, selling_price, current_stock, is_active)
SELECT gen_random_uuid(), p.name, p.category, p.unit, p.selling_price, p.current_stock, TRUE
FROM (VALUES
  ('Amul Butter 500g', 'Dairy', 'piece', 120, 100),
  ('Parle G 400g', 'Biscuits', 'piece', 60, 200),
  ('Coca-Cola 500ml', 'Beverage', 'bottle', 45, 150),
  ('Maggi Noodles 2-pack', 'Noodles', 'piece', 80, 120)
) AS p(name, category, unit, selling_price, current_stock)
WHERE NOT EXISTS (SELECT 1 FROM public.products pr WHERE lower(pr.name) = lower(p.name));

-- 3) Create sample retailers (match actual columns: shop_name, owner_name, phone, area)
INSERT INTO public.retailers (id, shop_name, owner_name, phone, area, is_active)
SELECT gen_random_uuid(), r.shop_name, r.owner_name, r.phone, r.area, TRUE
FROM (VALUES
  ('Shree Kirana', 'Ramesh Kumar', '9876543210', 'MG Road, Block A'),
  ('Sunrise Stores', 'Anita Sharma', '9123456780', 'Central Market'),
  ('Neighborhood Mart', 'Suresh Patel', '9012345678', 'Sector 5')
) AS r(shop_name, owner_name, phone, area)
WHERE NOT EXISTS (SELECT 1 FROM public.retailers rt WHERE lower(rt.shop_name) = lower(r.shop_name));

-- 4) Create initial stock transactions for each product by admin (if admin exists)
WITH admin AS (SELECT id FROM auth.users WHERE lower(email) = lower('admin@adm.in')),
prod_list AS (
  SELECT id, name, current_stock FROM public.products
)
INSERT INTO public.stock_transactions (product_id, agent_id, quantity_change, reason, notes)
SELECT p.id, a.id, p.current_stock, 'initial_stock', 'Initial stock from seed'
FROM prod_list p, admin a
WHERE p.current_stock > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.stock_transactions st WHERE st.product_id = p.id AND st.reason = 'initial_stock'
  );

-- 5) Add a sample order by agent to show order processing and activity feed
-- Create (or reuse) a visit for the agent + retailer, then insert an order referencing it
WITH agent AS (SELECT id FROM auth.users WHERE lower(email) = lower('test01@e.mp')),
some_product AS (SELECT id, selling_price FROM public.products LIMIT 1),
some_retailer AS (SELECT id FROM public.retailers LIMIT 1),
new_visit AS (
  INSERT INTO public.visits (id, agent_id, retailer_id, visited_at, status)
  SELECT gen_random_uuid(), agent.id, some_retailer.id, now(), 'completed'
  FROM agent, some_retailer
  WHERE NOT EXISTS (
    SELECT 1 FROM public.visits v WHERE v.agent_id = agent.id AND v.retailer_id = some_retailer.id
  )
  RETURNING id, agent_id, retailer_id
)
INSERT INTO public.orders (id, agent_id, retailer_id, visit_id, status, created_at)
SELECT
  gen_random_uuid(),
  agent.id,
  some_retailer.id,
  COALESCE(nv.id, (
    SELECT v.id FROM public.visits v WHERE v.agent_id = agent.id AND v.retailer_id = some_retailer.id LIMIT 1
  )),
  'confirmed',
  now()
FROM agent
CROSS JOIN some_product
CROSS JOIN some_retailer
LEFT JOIN new_visit nv ON nv.agent_id = agent.id AND nv.retailer_id = some_retailer.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.orders o WHERE o.agent_id = agent.id AND o.retailer_id = some_retailer.id
);

-- insert an order_item for the last inserted order (if any)
WITH last_order AS (
  SELECT id, agent_id FROM public.orders ORDER BY created_at DESC LIMIT 1
), product AS (
  SELECT id, selling_price FROM public.products LIMIT 1
)
INSERT INTO public.order_items (id, order_id, product_id, quantity, unit_price)
SELECT gen_random_uuid(), lo.id, p.id, 5, p.selling_price
FROM last_order lo, product p
WHERE NOT EXISTS (
  SELECT 1 FROM public.order_items oi WHERE oi.order_id = lo.id AND oi.product_id = p.id
);

COMMIT;

-- Finished seed. If you want more sample rows or specific names/IDs, edit this file.
