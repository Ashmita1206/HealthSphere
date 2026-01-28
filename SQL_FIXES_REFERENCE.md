# Quick SQL Reference - All Migration Commands

Run these SQL commands in Supabase SQL Editor to fix all schema issues.

## 1. Add Missing Columns to donors Table

```sql
ALTER TABLE public.donors
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'temporarily_unavailable')),
ADD COLUMN IF NOT EXISTS notes TEXT;
```

## 2. Add Missing frequency Column to reminders Table

```sql
ALTER TABLE public.reminders
ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'daily';

-- Also add updated_at trigger if missing
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

## 3. Create emergency_alerts Table

```sql
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'responded', 'resolved')),
  response_notes TEXT,
  responder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own emergency alerts" ON public.emergency_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create emergency alerts" ON public.emergency_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency alerts" ON public.emergency_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Add trigger
CREATE TRIGGER update_emergency_alerts_updated_at
  BEFORE UPDATE ON public.emergency_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

## 4. Create user_preferences Table

```sql
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  emergency_alert_email BOOLEAN DEFAULT true,
  emergency_alert_sms BOOLEAN DEFAULT true,
  share_location_on_sos BOOLEAN DEFAULT true,
  trusted_contacts TEXT[] DEFAULT '{}',
  auto_contact_emergency BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add trigger
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

## Verify All Tables Exist

```sql
-- Check all required tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'medicines', 'appointments', 'reports', 'donors',
                    'donation_requests', 'reminders', 'emergency_contacts',
                    'chat_messages', 'emergency_alerts', 'user_preferences')
ORDER BY table_name;
```

## Verify All Required Columns Exist

```sql
-- Check donors table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'donors'
ORDER BY ordinal_position;

-- Check reminders table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'reminders'
ORDER BY ordinal_position;

-- Check emergency_alerts table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'emergency_alerts'
ORDER BY ordinal_position;
```

## Refresh Schema Cache (if needed)

After running migrations:

1. Wait 5-10 seconds for Supabase to refresh schema cache
2. Or manually refresh: Go to Supabase Dashboard → SQL Editor → Settings → Schema Verification

## Test Data (Optional)

```sql
-- Insert test emergency alert
INSERT INTO public.emergency_alerts (
  user_id,
  latitude,
  longitude,
  status
) VALUES (
  'YOUR_USER_UUID_HERE',
  40.7128,  -- New York latitude
  -74.0060, -- New York longitude
  'active'
);

-- Insert test user preference
INSERT INTO public.user_preferences (
  user_id,
  emergency_alert_email,
  emergency_alert_sms,
  share_location_on_sos
) VALUES (
  'YOUR_USER_UUID_HERE',
  true,
  true,
  true
);
```

---

**Important Notes:**

- Replace `YOUR_USER_UUID_HERE` with actual user IDs from auth.users table
- Ensure RLS is enabled on all tables for security
- Test migrations in staging environment first
- Backup database before applying schema changes
