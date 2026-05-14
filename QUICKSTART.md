# RecyclePay - Quick Start 🚀

Get RecyclePay running in **5 minutes**!

---

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase account created
- [ ] Code editor (VS Code recommended)

---

## 5-Minute Setup

### 1. Install Dependencies (1 min)

```bash
npm install
```

### 2. Set Up Supabase (2 min)

1. Go to [supabase.com](https://supabase.com) → Create Project
2. Go to SQL Editor → New Query
3. Copy/paste everything from `supabase/schema.sql`
4. Click "Run" ✅

### 3. Configure Environment (1 min)

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
```

Get these from Supabase: **Settings → API**

### 4. Run the App (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## Test the App (Without Raspberry Pi)

### Step 1: Create a User
1. Go to homepage
2. Enter phone: `+2348012345678`
3. Click "View Dashboard"

### Step 2: Start a Session
1. Go to `http://localhost:3000/bin/001`
2. Enter same phone number
3. Click "Start Recycling"
4. You should see "Bin is Ready!"

### Step 3: Simulate Bottle Verification

Open a **new terminal** and run:

```bash
curl -X POST http://localhost:3000/api/recycle-success \
  -H "Content-Type: application/json" \
  -d "{\"bin_id\":\"001\"}"
```

**Result**: 
- ✅ Success modal appears
- ✅ Balance increases to ₦10
- ✅ Transaction appears in history

---

## Common Issues

### Issue: Can't connect to Supabase
**Fix**: 
1. Check `.env.local` has correct URL and key
2. Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: SQL errors in Supabase
**Fix**: Run this first to clean up:
```sql
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS active_sessions CASCADE;
DROP TABLE IF EXISTS bins CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```
Then re-run `supabase/schema.sql`

### Issue: Real-time not working
**Fix**: In Supabase, go to **Database → Replication** → Enable all tables

---

## File Structure (What You Need to Know)

```
recycle-pay/
├── app/
│   ├── api/              ← Backend endpoints
│   ├── bin/[id]/         ← Bin scan page
│   ├── dashboard/[phone]/ ← User dashboard
│   └── page.tsx          ← Homepage
├── components/           ← Reusable UI
├── lib/                  ← Supabase & Squad clients
├── supabase/
│   └── schema.sql        ← DATABASE SCHEMA (RUN THIS!)
└── .env.local            ← YOUR CREDENTIALS
```

---

## Key URLs

- **Homepage**: `http://localhost:3000`
- **Bin 001**: `http://localhost:3000/bin/001`
- **Dashboard**: `http://localhost:3000/dashboard/+2348012345678`
- **API Test**: `http://localhost:3000/api/users/register`

---

## Next Steps

✅ **Working locally?** Great! Now:

1. Read [`SETUP.md`](../SETUP.md) for detailed config
2. Read [`docs/RASPBERRY_PI_SETUP.md`](docs/RASPBERRY_PI_SETUP.md) for Pi integration
3. Deploy to Vercel for production

---

## Deploy to Production

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# Deploy to Vercel
vercel deploy --prod
```

Add environment variables in Vercel dashboard!

---

## Need Help?

- **Full Docs**: [`README.md`](../README.md)
- **Setup Guide**: [`SETUP.md`](../SETUP.md)
- **Pi Setup**: [`docs/RASPBERRY_PI_SETUP.md`](docs/RASPBERRY_PI_SETUP.md)
- **Project Summary**: [`docs/PROJECT_SUMMARY.md`](docs/PROJECT_SUMMARY.md)

---

**You're all set! Start recycling and earning! 🌍♻️💰**
