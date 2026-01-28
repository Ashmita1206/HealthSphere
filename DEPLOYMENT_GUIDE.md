# Production Deployment Guide - HealthSphere Error Fixes

## Overview

This guide walks you through deploying all 6 error fixes to production. Total estimated time: **15-20 minutes**.

---

## Prerequisites

- [ ] Access to Supabase project
- [ ] Git configured with deployment branch
- [ ] Staging environment tested successfully
- [ ] Database backup created
- [ ] Team notification sent

---

## Step 1: Apply Database Migrations (5 minutes)

### Option A: Automatic Migration (Recommended)

Your migration file is located at:

```
supabase/migrations/20260124163244_202992f3-423b-49c1-9946-7609b8afb989.sql
```

**In Supabase Cloud:**

1. Go to **Database** → **Migrations**
2. Verify the migration file appears
3. Click "Deploy" or it will auto-deploy with your app

**In Supabase Local (if using):**

```bash
supabase db push
```

### Option B: Manual SQL Execution

If auto-migration doesn't work:

1. Go to **SQL Editor** in Supabase dashboard
2. Copy the following SQL commands from `SQL_FIXES_REFERENCE.md`:
   - Add missing columns to donors
   - Add frequency to reminders
   - Create emergency_alerts table
   - Create user_preferences table
3. Execute each command individually
4. Verify success messages

**Verification Query:**

```sql
-- Run in SQL Editor to verify all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN (
  'profiles', 'medicines', 'appointments', 'reports',
  'donors', 'donation_requests', 'reminders',
  'emergency_contacts', 'chat_messages',
  'emergency_alerts', 'user_preferences'
);
```

**Expected Result:** 11 rows (all tables present)

---

## Step 2: Deploy Frontend Code (5 minutes)

### Via Git/GitHub

```bash
# 1. Ensure all changes are committed
git status

# 2. Push to main branch (or your deployment branch)
git push origin main

# 3. If using automated deployment (Netlify, Vercel, etc.)
# - Wait for deployment to complete
# - Check deployment logs

# 4. Verify deployment
# - Production URL should load without errors
```

### Via Manual Build

```bash
# 1. Install dependencies
npm install
# or
bun install

# 2. Build for production
npm run build
# or
bun run build

# 3. Test build locally
npm run preview

# 4. Deploy to hosting (varies by platform)
# Example for Vercel:
vercel --prod
```

---

## Step 3: Test All Features (5 minutes)

### Feature Test Checklist

#### Test 1: Donor Registration

```
1. Navigate to: /blood-organ
2. Click "Register as Donor"
3. Fill form:
   - Blood Type: Select "O+"
   - Willing to Donate: Select "Both Blood & Organ"
   - Organ Type: Select "Heart"
4. Click "Register as Donor"
✅ Expected: Success toast message
❌ Issue: Check browser console for errors
```

#### Test 2: Request Blood/Organ

```
1. On same page, click "Request Blood/Organ"
2. Fill form:
   - Blood Type: Select "Not Applicable"
   - Organ Type: Select "Liver"
   - Urgency: Select "Urgent"
   - Medical Reason: Enter text
3. Click "Submit Request"
✅ Expected: Success toast message
❌ Issue: Check if select dropdown causes errors
```

#### Test 3: Create Reminder

```
1. Navigate to: /reminders
2. Click "Add Reminder"
3. Fill form:
   - Title: "Take Blood Pressure Medicine"
   - Type: "Medication"
   - Time: "09:00"
   - Frequency: "Daily"
4. Click "Create Reminder"
✅ Expected: Reminder appears in list
❌ Issue: Check Supabase logs for column errors
```

#### Test 4: Emergency SOS

```
1. Navigate to: /emergency
2. Click "Get Current Location" first
3. When location loads, click red SOS button
4. Wait 5 seconds
✅ Expected: "SOS ACTIVATED" message, button returns to normal
❌ Issue: Check if emergency_alerts table exists
```

#### Test 5: Update Profile

```
1. Navigate to: /profile
2. See new modern UI with:
   - Health Score card at top
   - Avatar section with change button
   - Better organized form fields
3. Update a field (e.g., full name)
4. Click "Save Changes"
✅ Expected: Success message, changes persist
❌ Issue: Check if profile table has all columns
```

#### Test 6: ChatBot Scroll

```
1. Click chat bubble (bottom-right)
2. Send several messages rapidly
3. Send messages that generate long responses
✅ Expected: Messages auto-scroll to bottom
❌ Issue: Check browser console for scroll errors
```

---

## Step 4: Verify No Errors (2 minutes)

### Browser Console

```javascript
// Open DevTools (F12)
// Check Console tab for any JavaScript errors
// Should see no red error messages
```

### Supabase Logs

```
1. Go to Supabase Dashboard
2. Click "Database" → "Webhooks" or "Logs"
3. Check for any error messages
4. Look for failed INSERT/UPDATE operations
```

### User Feedback

```
- Monitor error reports from users
- Set up error tracking (Sentry, etc.)
- Check error logs every 5 minutes for first 30 minutes
```

---

## Step 5: Performance Check (2 minutes)

### Load Times

```bash
# In browser DevTools
1. Open Network tab
2. Refresh page
3. Check:
   - Page load < 3 seconds ✅
   - No failed requests ✅
   - CSS/JS sizes reasonable ✅
```

### Database Performance

```sql
-- Run in Supabase SQL Editor
-- Check slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;
```

---

## Rollback Plan

If critical issues arise:

### Immediate Rollback (Database)

```sql
-- Revert migration
ALTER TABLE public.donors DROP COLUMN IF EXISTS status;
ALTER TABLE public.donors DROP COLUMN IF EXISTS notes;
ALTER TABLE public.reminders DROP COLUMN IF EXISTS frequency;
DROP TABLE IF EXISTS public.emergency_alerts;
DROP TABLE IF EXISTS public.user_preferences;
```

### Code Rollback

```bash
# If using Git
git revert <commit-hash>
git push origin main

# If using deployment service
# Revert to previous deployment version
```

### Notification

- Inform team of rollback
- Document what failed
- Plan retry deployment
- Investigate root cause

---

## Post-Deployment Checklist

- [ ] All tests pass
- [ ] No console errors
- [ ] Supabase logs clean
- [ ] Users report no issues
- [ ] Performance metrics normal
- [ ] Email notifications sent to team
- [ ] Documentation updated
- [ ] Monitor for 24 hours

---

## Timeline & Monitoring

### First 5 Minutes

- Monitor Supabase error logs
- Check browser error tracking
- Verify database migrations applied

### First Hour

- Monitor all 6 features with real users
- Check performance metrics
- Be ready to rollback if needed

### First 24 Hours

- Continue monitoring
- Collect user feedback
- Log any issues
- Document lessons learned

---

## Common Issues & Solutions

### Issue: "Could not find column X"

**Solution:**

- Wait 10 seconds for Supabase schema cache refresh
- Go to Supabase > Database > Schema > Verify
- Hard refresh browser (Ctrl+Shift+R)

### Issue: "Table does not exist"

**Solution:**

- Check migration executed successfully
- Run verification query in SQL Editor
- Check table creation SQL syntax

### Issue: "RLS policy violation"

**Solution:**

- Verify user is logged in
- Check RLS policies allow the operation
- Ensure user_id matches auth.users.id

### Issue: "Select dropdown error"

**Solution:**

- Clear browser cache
- Hard refresh page
- Check no empty string values in SelectItem

### Issue: "ChatBot doesn't scroll"

**Solution:**

- Hard refresh page (Ctrl+Shift+R)
- Check browser console for errors
- Try in different browser

---

## Success Indicators

✅ **Deployment Successful** When:

- All 6 features work without errors
- No console JavaScript errors
- Supabase logs show no failures
- Users can complete actions
- Performance metrics stable

---

## Post-Deployment Review

After 24 hours of production, review:

1. **Stability**: Any recurring errors?
2. **Performance**: Load times normal?
3. **User Feedback**: Any complaints?
4. **Metrics**: Database query times good?
5. **Logs**: Any warnings or issues?

---

## Support Contacts

- **Database Issues**: Supabase Support
- **Frontend Issues**: Check GitHub Issues
- **Performance Issues**: Review Supabase metrics
- **User Issues**: Customer support team

---

## Version Info

- **Migration Version**: 20260124163244
- **Frontend Changes**: BloodOrgan, Reminders, Emergency, Profile, ChatBot
- **Database Changes**: +3 tables, +2 columns, +4 RLS policies
- **Estimated Downtime**: 0 minutes (zero-downtime deployment)

---

**Deployment Date**: January 28, 2026  
**Estimated Duration**: 15-20 minutes  
**Risk Level**: Low (backwards compatible)  
**Rollback Difficulty**: Easy

---

## Final Checklist Before Clicking Deploy

- [ ] Created database backup
- [ ] Tested in staging environment
- [ ] Verified all 6 errors are fixed
- [ ] Team notified of deployment
- [ ] Rollback plan documented
- [ ] Error monitoring configured
- [ ] All git commits pushed
- [ ] No uncommitted changes

🚀 **Ready to deploy!**
