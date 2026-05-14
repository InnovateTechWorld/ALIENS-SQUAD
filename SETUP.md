# RecyclePay - Setup Guide

## Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Database schema executed
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Development server running

---

## Step-by-Step Setup

### 1. System Requirements

Ensure you have:
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **Git**: For cloning the repository

Check your versions:
```bash
node --version  # Should be v18+
npm --version   # Should be v9+
```

### 2. Project Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd recycle-pay

# Install dependencies
npm install
```

### 3. Supabase Setup

#### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Name**: RecyclePay
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to Nigeria

#### Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click "Run"
5. You should see "Success. No rows returned" - this is correct!

#### Get API Credentials
1. Go to **Settings > API**
2. Copy these values:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 4. Squad API Setup (Optional)

For demo purposes, you can skip this. The app will work without Squad API by updating balances in the database directly.

To enable real payments:
1. Sign up at [squadco.com](https://squadco.com)
2. Get your **Secret Key** from dashboard
3. Use sandbox API for testing: `https://sandbox-api-d.squadco.com`

### 5. Environment Configuration

Create `.env.local` file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:
```env
# Required - From Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key

# Optional - For real payments
SQUAD_SECRET_KEY=your_squad_secret_key
SQUAD_API_URL=https://sandbox-api-d.squadco.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run the Application

Start the development server:
```bash
npm run dev
```

You should see:
```
  ▲ Next.js 16.2.6
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing the Application

### Test 1: User Registration
1. Go to homepage
2. Enter phone number: `+2348012345678`
3. Click "View Dashboard"
4. You should see your dashboard with ₦0 balance

### Test 2: Bin Session (Manual)
1. Go to `http://localhost:3000/bin/001`
2. Enter the same phone number
3. Click "Start Recycling"
4. You should see "Bin is Ready!" message

### Test 3: Simulate Bottle Verification
Open a new terminal and run:
```bash
curl -X POST http://localhost:3000/api/recycle-success \
  -H "Content-Type: application/json" \
  -d '{"bin_id":"001"}'
```

You should:
- See a success modal on the bin page
- See balance increase to ₦10 on dashboard
- See a new transaction in transaction history

---

## Troubleshooting

### Issue: "Failed to fetch"
**Cause**: Supabase credentials are incorrect
**Solution**: 
1. Double-check `.env.local` file
2. Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: TypeScript errors
**Cause**: Dependencies not fully installed
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Real-time updates not working
**Cause**: Supabase real-time not enabled
**Solution**:
1. In Supabase dashboard, go to **Database > Replication**
2. Enable replication for all tables:
   - users
   - bins
   - active_sessions
   - transactions

### Issue: SQL schema errors
**Cause**: Tables already exist or syntax error
**Solution**:
1. Drop all tables in Supabase SQL Editor:
```sql
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS active_sessions CASCADE;
DROP TABLE IF EXISTS bins CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```
2. Re-run the schema from `supabase/schema.sql`

---

## Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables in Vercel dashboard
6. Deploy!

### Environment Variables for Production

Update these in your hosting platform:
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
SQUAD_SECRET_KEY=your_production_squad_key
SQUAD_API_URL=https://api-d.squadco.com  # Production API
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Raspberry Pi Integration

The Raspberry Pi should be configured to:

1. **Watch for new sessions** in Supabase:
```python
# Pseudo-code
while True:
    session = supabase.table('active_sessions').select('*').eq('bin_id', BIN_ID).execute()
    if session.data:
        print("User checked in! Camera active...")
        # Start camera and Gemini verification
```

2. **Call the API when verified**:
```python
import requests

def notify_success(bin_id):
    requests.post(
        'https://your-app.com/api/recycle-success',
        json={'bin_id': bin_id}
    )
```

---

## Database Backup

To export your data:
```sql
-- In Supabase SQL Editor
COPY (SELECT * FROM users) TO '/tmp/users.csv' WITH CSV HEADER;
COPY (SELECT * FROM transactions) TO '/tmp/transactions.csv' WITH CSV HEADER;
```

---

## Next Steps

- [ ] Set up Raspberry Pi with camera
- [ ] Configure Gemini API for vision
- [ ] Test end-to-end flow with physical bin
- [ ] Configure Squad API for real payments
- [ ] Add withdrawal feature
- [ ] Implement proper authentication
- [ ] Add admin dashboard

---

## Support

For issues, check:
1. [Next.js Documentation](https://nextjs.org/docs)
2. [Supabase Documentation](https://supabase.com/docs)
3. [Squad API Documentation](https://squadco.com/docs)

**Happy Recycling! 🌍♻️**
