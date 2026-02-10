-- Supabase migration: Initial schema for loyalty app
-- Generated: 2026-02-10

-- 1) Enums
-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create enum types if they don't exist (some PG versions don't support CREATE TYPE IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_tier') THEN
    CREATE TYPE membership_tier AS ENUM ('bronze','silver','gold','platinum');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_type') THEN
    CREATE TYPE offer_type AS ENUM ('weekly','latenight','student','social');
  END IF;
END
$$;

-- 2) Core: user profile (linked to auth.users via uid)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  first_name text,
  phone text,
  points bigint DEFAULT 0,
  visits_in_cycle int DEFAULT 0,
  rewards_available int DEFAULT 0,
  is_registered boolean DEFAULT false,
  member_id text UNIQUE,
  membership_tier membership_tier DEFAULT 'bronze',
  last_visit_date timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_profiles_member_id ON public.profiles(member_id);

-- 3) Locations
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  address text,
  lat double precision,
  lng double precision,
  open_hours jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 4) Cashiers (simple auth/pin store)
CREATE TABLE IF NOT EXISTS public.cashiers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  pin_hash text,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 5) Transactions / purchases
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  cashier_id uuid REFERENCES public.cashiers(id),
  amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'USD',
  items jsonb DEFAULT '[]'::jsonb,
  points_awarded int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

-- 6) Visits (one per scan / visit)
CREATE TABLE IF NOT EXISTS public.visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  cashier_id uuid REFERENCES public.cashiers(id),
  location_id uuid REFERENCES public.locations(id),
  visit_time timestamptz DEFAULT now(),
  points_awarded int DEFAULT 0,
  transaction_id uuid REFERENCES public.transactions(id),
  metadata jsonb DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON public.visits(user_id);


-- 5) Menu items
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name jsonb NOT NULL,
  description jsonb DEFAULT '{}'::jsonb,
  image text,
  badge jsonb DEFAULT '{}'::jsonb,
  price numeric(8,2) NOT NULL,
  is_hidden boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_menu_items_price ON public.menu_items(price);
CREATE INDEX IF NOT EXISTS idx_menu_items_hidden ON public.menu_items(is_hidden);

-- 6) Offers
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title jsonb NOT NULL,
  description jsonb DEFAULT '{}'::jsonb,
  expiry timestamptz,
  type offer_type DEFAULT 'weekly',
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_offers_expiry ON public.offers(expiry);

-- 7) Rewards and redemptions
CREATE TABLE IF NOT EXISTS public.rewards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title jsonb NOT NULL,
  description jsonb DEFAULT '{}'::jsonb,
  points_cost int NOT NULL,
  is_active boolean DEFAULT true,
  expiry timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_id uuid REFERENCES public.rewards(id) ON DELETE RESTRICT,
  user_id uuid REFERENCES public.profiles(id),
  points_spent int NOT NULL,
  redeemed_at timestamptz DEFAULT now(),
  status text DEFAULT 'completed',
  metadata jsonb DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON public.reward_redemptions(user_id);



-- 10) Push tokens for notifications
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  token text NOT NULL,
  platform text,
  last_seen timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens(user_id);

-- 11) Scan logs (qr / cashier scans)
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  cashier_id uuid REFERENCES public.cashiers(id),
  location_id uuid REFERENCES public.locations(id),
  scanned_at timestamptz DEFAULT now(),
  method text,
  success boolean DEFAULT true,
  points_awarded int DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_scan_logs_user_id ON public.scan_logs(user_id);

-- 12) Admin / app settings (JSONB store)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id text PRIMARY KEY DEFAULT 'core',
  settings jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- 13) Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid,
  action text,
  table_name text,
  row_id text,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- 14) Points ledger & history (for expirations and auditability)
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  change int NOT NULL,
  reason text,
  source_type text,
  source_id uuid,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  expired boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_points_ledger_user_id ON public.points_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_expired ON public.points_ledger(expired);

CREATE TABLE IF NOT EXISTS public.points_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  old_points bigint,
  new_points bigint,
  change int,
  reason text,
  actor uuid,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON public.points_history(user_id);

-- 15) Audit trigger function (general purpose)
CREATE OR REPLACE FUNCTION public.audit_row_changes() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  actor uuid := NULL;
  payload jsonb;
  action text := TG_OP;
  row_id text := '';
BEGIN
  -- try to get actor from JWT claims (may be null in system contexts)
  BEGIN
    actor := NULLIF(current_setting('jwt.claims.sub', true), '')::uuid;
  EXCEPTION WHEN others THEN
    actor := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    payload := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    payload := to_jsonb(OLD);
  ELSE
    payload := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  END IF;

  -- determine row id (if table has an 'id' column)
  DECLARE
    row_id text := '';
  BEGIN
    IF TG_OP = 'INSERT' THEN
      row_id := COALESCE(NEW.id::text, '');
    ELSIF TG_OP = 'DELETE' THEN
      row_id := COALESCE(OLD.id::text, '');
    ELSE
      row_id := COALESCE(NEW.id::text, COALESCE(OLD.id::text, ''));
    END IF;
  END;

  INSERT INTO public.audit_logs(actor_id, action, table_name, row_id, payload, created_at)
    VALUES (actor, action, TG_TABLE_NAME, row_id, payload, now());

  RETURN NULL; -- triggers that call this do not need to alter row
END;
$$;

-- Add audit triggers on important tables
DROP TRIGGER IF EXISTS trg_audit_transactions ON public.transactions;
CREATE TRIGGER trg_audit_transactions AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_changes();

DROP TRIGGER IF EXISTS trg_audit_reward_redemptions ON public.reward_redemptions;
CREATE TRIGGER trg_audit_reward_redemptions AFTER INSERT OR UPDATE OR DELETE ON public.reward_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_changes();

DROP TRIGGER IF EXISTS trg_audit_profiles ON public.profiles;
CREATE TRIGGER trg_audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_changes();

-- 16) Cashier pin helpers (use bcrypt via pgcrypto)
CREATE OR REPLACE FUNCTION public.set_cashier_pin(_cashier uuid, _plain text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.cashiers SET pin_hash = crypt(_plain, gen_salt('bf')) WHERE id = _cashier;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_cashier_pin(_cashier uuid, _plain text) RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE ph text;
BEGIN
  SELECT pin_hash INTO ph FROM public.cashiers WHERE id = _cashier;
  IF ph IS NULL THEN RETURN false; END IF;
  RETURN crypt(_plain, ph) = ph;
END;
$$;

-- 17) RLS: transactions, reward_redemptions, cashiers
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transactions' AND policyname = 'transactions_insert_by_staff') THEN
    CREATE POLICY transactions_insert_by_staff ON public.transactions FOR INSERT
      WITH CHECK ( current_setting('jwt.claims.role', true) IN ('cashier','admin','service') );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transactions' AND policyname = 'transactions_select_owner_admin') THEN
    CREATE POLICY transactions_select_owner_admin ON public.transactions FOR SELECT
      USING ( user_id = auth.uid() OR current_setting('jwt.claims.role', true) = 'admin' );
  END IF;
END;
$$;

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reward_redemptions' AND policyname = 'reward_redemptions_self') THEN
    CREATE POLICY reward_redemptions_self ON public.reward_redemptions FOR ALL
      USING ( user_id = auth.uid() )
      WITH CHECK ( user_id = auth.uid() );
  END IF;
END;
$$;

ALTER TABLE public.cashiers ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cashiers' AND policyname = 'cashiers_admin_manage') THEN
    CREATE POLICY cashiers_admin_manage ON public.cashiers FOR ALL
      USING ( current_setting('jwt.claims.role', true) = 'admin' )
      WITH CHECK ( current_setting('jwt.claims.role', true) = 'admin' );
  END IF;
END;
$$;

-- 18) Expire points job (call this daily via scheduler)
CREATE OR REPLACE FUNCTION public.expire_points_job(_months int DEFAULT 12) RETURNS int LANGUAGE plpgsql AS $$
DECLARE
  rec record;
  cutoff timestamptz := now() - (_months || ' months')::interval;
  expired_counter int := 0;
  old_points bigint;
  new_points bigint;
BEGIN
  FOR rec IN SELECT * FROM public.points_ledger WHERE expired = FALSE AND change > 0 AND ((expires_at IS NOT NULL AND expires_at <= now()) OR (created_at <= cutoff))
  LOOP
    SELECT points INTO old_points FROM public.profiles WHERE id = rec.user_id FOR UPDATE;
    new_points := coalesce(old_points,0) - rec.change;

    UPDATE public.profiles SET points = new_points, updated_at = now() WHERE id = rec.user_id;
    UPDATE public.points_ledger SET expired = TRUE WHERE id = rec.id;

    INSERT INTO public.points_history(user_id, old_points, new_points, change, reason, actor, created_at)
      VALUES (rec.user_id, old_points, new_points, -rec.change, 'expired', NULL, now());

    expired_counter := expired_counter + 1;
  END LOOP;

  RETURN expired_counter;
END;
$$;

-- 19) Wire ledger writes into the transaction points flow (replace existing trigger function below)

-- 14) Points awarding & membership tier logic
CREATE OR REPLACE FUNCTION public._calculate_tier(total_points bigint)
RETURNS membership_tier LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF total_points >= 10000 THEN
    RETURN 'platinum';
  ELSIF total_points >= 5000 THEN
    RETURN 'gold';
  ELSIF total_points >= 1000 THEN
    RETURN 'silver';
  ELSE
    RETURN 'bronze';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public._award_points_on_transaction()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  pts int;
  old_points bigint;
  new_points bigint;
BEGIN
  pts := floor(NEW.amount)::int;
  IF pts < 0 THEN pts := 0; END IF;

  UPDATE public.transactions SET points_awarded = pts WHERE id = NEW.id;

  IF NEW.user_id IS NOT NULL THEN
    -- capture old points for history and lock row
    SELECT points INTO old_points FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
    new_points := coalesce(old_points,0) + pts;

    -- write ledger row (default expiry 12 months)
    INSERT INTO public.points_ledger(user_id, change, reason, source_type, source_id, created_at, expires_at)
      VALUES (NEW.user_id, pts, 'transaction', 'transaction', NEW.id, now(), now() + INTERVAL '12 months');

    -- update profile
    UPDATE public.profiles
      SET points = new_points,
          visits_in_cycle = coalesce(visits_in_cycle,0) + 1,
          last_visit_date = now(),
          updated_at = now()
      WHERE id = NEW.user_id;

    -- write history
    INSERT INTO public.points_history(user_id, old_points, new_points, change, reason, actor, created_at)
      VALUES (NEW.user_id, old_points, new_points, pts, 'transaction', NULLIF(current_setting('jwt.claims.sub', true), '')::uuid, now());

    -- insert visit
    INSERT INTO public.visits(user_id, cashier_id, location_id, points_awarded, transaction_id)
      VALUES (NEW.user_id, NEW.cashier_id, NULL, pts, NEW.id);

    -- update membership tier
    UPDATE public.profiles
      SET membership_tier = public._calculate_tier(points)
      WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_points_after_ins ON public.transactions;
CREATE TRIGGER trg_award_points_after_ins
  AFTER INSERT
  ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public._award_points_on_transaction();

-- 15) Reward redemption function (atomic)
CREATE OR REPLACE FUNCTION public.redeem_reward(_user uuid, _reward uuid)
RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE
  cost int;
  cur_points bigint;
  old_points bigint;
  new_points bigint;
BEGIN
  SELECT points_cost INTO cost FROM public.rewards WHERE id = _reward AND is_active;
  IF cost IS NULL THEN
    RAISE EXCEPTION 'Reward not found or not active';
  END IF;

  SELECT points INTO cur_points FROM public.profiles WHERE id = _user FOR UPDATE;
  IF cur_points IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF cur_points < cost THEN
    RETURN false;
  END IF;

  old_points := cur_points;
  new_points := cur_points - cost;

  -- ledger and history
  INSERT INTO public.points_ledger(user_id, change, reason, source_type, source_id, created_at)
    VALUES (_user, -cost, 'redemption', 'reward', _reward, now());

  UPDATE public.profiles SET points = new_points, rewards_available = coalesce(rewards_available,0) + 1, updated_at = now() WHERE id = _user;
  INSERT INTO public.reward_redemptions(reward_id, user_id, points_spent, redeemed_at, status)
    VALUES (_reward, _user, cost, now(), 'completed');

  INSERT INTO public.points_history(user_id, old_points, new_points, change, reason, actor, created_at)
    VALUES (_user, old_points, new_points, -cost, 'redemption', NULLIF(current_setting('jwt.claims.sub', true), '')::uuid, now());

  RETURN true;
END;
$$;

-- 16) Example RLS policy patterns
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_self') THEN
    CREATE POLICY "profiles_self" ON public.profiles
      FOR ALL
      USING ( auth.uid() = id )
      WITH CHECK ( auth.uid() = id );
  END IF;
END;
$$; 

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'offers' AND policyname = 'offers_public_read') THEN
    CREATE POLICY "offers_public_read" ON public.offers FOR SELECT USING (is_active = true);
  END IF;
END;
$$; 

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'menu_items' AND policyname = 'menu_public_read') THEN
    CREATE POLICY "menu_public_read" ON public.menu_items FOR SELECT USING (is_hidden = false);
  END IF;
END;
$$; 

-- Admin policy example: requires JWT claim `role = 'admin'` (adjust as needed)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'offers' AND policyname = 'admin_manage_offers') THEN
    CREATE POLICY "admin_manage_offers" ON public.offers FOR ALL
      USING ( current_setting('jwt.claims.role', true) = 'admin' )
      WITH CHECK ( current_setting('jwt.claims.role', true) = 'admin' );
  END IF;
END;
$$; 

-- 17) Helpful indices for reporting
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON public.transactions(amount);

-- 18) Notes: Add additional policies for transactions, reward_redemptions etc. to enforce rights.

-- End of migration
