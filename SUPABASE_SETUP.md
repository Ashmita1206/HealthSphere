# Supabase Setup Guide for HealthSphere

This guide walks you through setting up the Supabase backend for HealthSphere.

---

## Prerequisites

- A Supabase account (free at https://app.supabase.com)
- The Supabase CLI (optional, for running migrations locally)

---

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click **New Project**
3. Choose a name, database password, and region
4. Wait for the project to initialize (2-3 minutes)
5. Copy your **Project URL** and **Publishable/Anon Key** and save them in `.env` as:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## Step 2: Create Database Tables

Go to the **SQL Editor** in your Supabase dashboard and run the following SQL to create all required tables:

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  gender TEXT,
  blood_type TEXT,
  address TEXT,
  health_score INTEGER DEFAULT 75,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Medicines Table

```sql
CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  is_active BOOLEAN DEFAULT true,
  adherence_rate INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Appointments Table

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  specialty TEXT,
  hospital TEXT,
  appointment_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Reminders Table

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reminder_type TEXT DEFAULT 'medication',
  time TEXT NOT NULL,
  frequency TEXT DEFAULT 'daily',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Reports Table

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_path TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chat Messages Table

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  risk_level TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Step 3: Enable Row Level Security (RLS)

RLS ensures users can only see and modify their own data. Go to **Authentication > Policies** in the Supabase dashboard and enable RLS for each table.

### Example RLS Policy for `profiles` table

**Policy 1: Users can view their own profile**

```sql
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
```

**Policy 2: Users can update their own profile**

```sql
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

**Policy 3: Auto-insert user profile on signup**

```sql
CREATE POLICY "Auto-insert user profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Apply similar policies for other tables

For each of `medicines`, `appointments`, `reminders`, `reports`, and `chat_messages`:

- **SELECT**: `auth.uid() = user_id`
- **INSERT**: `auth.uid() = user_id`
- **UPDATE**: `auth.uid() = user_id`
- **DELETE**: `auth.uid() = user_id`

---

## Step 4: Create a Storage Bucket for Reports

1. Go to **Storage** in the Supabase dashboard
2. Click **New Bucket**
3. Name it `reports`
4. Set it to **Private** (not public)
5. Click **Create Bucket**

### Set RLS policies for the `reports` bucket

Go to **Storage > Policies** and add:

**Policy 1: Users can upload to their folder**

```sql
CREATE POLICY "Users can upload reports" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Policy 2: Users can read their own reports**

```sql
CREATE POLICY "Users can read own reports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Policy 3: Users can delete their own reports**

```sql
CREATE POLICY "Users can delete own reports" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Step 5: Set Up the AI Chat Edge Function

1. Go to **Edge Functions** in the Supabase dashboard
2. Click **Create a new function** named `health-chat`
3. Copy the code from `supabase/functions/health-chat/index.ts` into the editor
4. Set the environment variable `LOVABLE_API_KEY` with your AI gateway API key
5. Deploy the function

---

## Step 6: Enable Realtime (for Reminders)

The `Reminders.tsx` page uses Supabase Realtime to listen for changes. Go to **Replication > Publication settings** and ensure the `reminders` table is included in the realtime publication.

---

## Step 7: Test the Setup

1. Run the frontend locally:
   ```bash
   npm run dev
   ```

2. Register a new account at http://localhost:5173/auth/register
3. Navigate to the Dashboard and test features:
   - Profile: Update your name, blood type, etc.
   - Medicines: Add a medicine
   - Reminders: Create a reminder (should see realtime update)
   - Appointments: Book an appointment
   - Reports: Upload a test PDF or image
   - Chat: Ask the health assistant a question (if `LOVABLE_API_KEY` is set)

---

## Troubleshooting

- **Auth errors**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are correct.
- **RLS blocking writes**: Ensure RLS policies are enabled and have INSERT permissions for the user.
- **Storage bucket errors**: Check bucket name is `reports` and policies are set correctly.
- **Chat not working**: Verify `LOVABLE_API_KEY` is set in the Edge Function environment.

---

## Next Steps

- Add custom domain (optional, Supabase allows free custom domains)
- Set up backups and monitoring (Supabase provides built-in options)
- Configure email templates for password resets and confirmations
- Consider adding more granular RLS policies for production
