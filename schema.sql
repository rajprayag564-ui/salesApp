SELECT
  u.id AS auth_user_id,
  u.email AS auth_email,
  e.id AS employee_id,
  e.email AS employee_email,
  e.role,
  e.is_active
FROM auth.users u
LEFT JOIN public.employees e ON e.id = u.id
WHERE lower(u.email) = lower('test01@e.mp');

-- Route assignments
CREATE TABLE IF NOT EXISTS public.route_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.employees (id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES public.retailers (id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (agent_id, retailer_id, assigned_date)
);

ALTER TABLE public.route_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "route_assignments_select" ON public.route_assignments;
CREATE POLICY "route_assignments_select"
  ON public.route_assignments FOR SELECT
  USING (
    agent_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.employees e
      WHERE e.id = auth.uid()
        AND e.role = 'admin'
        AND e.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "route_assignments_insert" ON public.route_assignments;
CREATE POLICY "route_assignments_insert"
  ON public.route_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.employees e
      WHERE e.id = auth.uid()
        AND e.role = 'admin'
        AND e.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "route_assignments_update" ON public.route_assignments;
CREATE POLICY "route_assignments_update"
  ON public.route_assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.employees e
      WHERE e.id = auth.uid()
        AND e.role = 'admin'
        AND e.is_active = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.employees e
      WHERE e.id = auth.uid()
        AND e.role = 'admin'
        AND e.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "route_assignments_delete" ON public.route_assignments;
CREATE POLICY "route_assignments_delete"
  ON public.route_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.employees e
      WHERE e.id = auth.uid()
        AND e.role = 'admin'
        AND e.is_active = TRUE
    )
  );

-- Automatic stock and activity processing for orders
-- Create activity feed table
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  type text NOT NULL,
  payload jsonb NOT NULL
);

-- Function: when an order_item is inserted, record a negative stock transaction
-- and append an activity feed entry. Also update the parent order's total_amount.
CREATE OR REPLACE FUNCTION public.process_order_item() RETURNS trigger AS $$
DECLARE
  ord record;
  prod record;
  line_total numeric := 0;
BEGIN
  -- fetch parent order and product
  SELECT * INTO ord FROM public.orders WHERE id = NEW.order_id;
  SELECT * INTO prod FROM public.products WHERE id = NEW.product_id;

  IF ord IS NULL OR prod IS NULL THEN
    RAISE EXCEPTION 'Missing order or product for order_item %', NEW.id;
  END IF;

  -- compute line total (unit_price * quantity)
  line_total := (NEW.unit_price::numeric) * (NEW.quantity::numeric);

  -- insert a stock transaction (decrement stock)
  INSERT INTO public.stock_transactions (product_id, agent_id, quantity_change, reason, notes)
  VALUES (NEW.product_id, ord.agent_id, -1 * NEW.quantity, 'sale', json_build_object('order_id', NEW.order_id));

  -- increment the order total_amount (use coalesce)
  UPDATE public.orders
  SET total_amount = COALESCE(total_amount, 0) + line_total
  WHERE id = NEW.order_id;

  -- insert into activity_feed for admin dashboard
  INSERT INTO public.activity_feed (type, payload)
  VALUES (
    'order_line',
    jsonb_build_object(
      'order_id', NEW.order_id,
      'agent_id', ord.agent_id,
      'retailer_id', ord.retailer_id,
      'product_id', NEW.product_id,
      'quantity', NEW.quantity,
      'unit_price', NEW.unit_price,
      'line_total', line_total
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on order_items insert
DROP TRIGGER IF EXISTS order_items_after_insert ON public.order_items;
CREATE TRIGGER order_items_after_insert
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.process_order_item();

-- Trigger to record check-ins (attendance) into activity_feed
CREATE OR REPLACE FUNCTION public.process_checkin() RETURNS trigger AS $$
DECLARE
  att record;
BEGIN
  SELECT * INTO att FROM public.attendance WHERE id = NEW.id;
  INSERT INTO public.activity_feed (type, payload)
  VALUES ('checkin', jsonb_build_object('attendance_id', NEW.id, 'agent_id', NEW.agent_id, 'latitude', NEW.latitude, 'longitude', NEW.longitude, 'created_at', NEW.created_at));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS attendance_after_insert ON public.attendance;
CREATE TRIGGER attendance_after_insert
AFTER INSERT ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.process_checkin();
