# RecyclePay Testing Guide

## Overview
This guide explains how to test the RecyclePay system including both successful and failed bottle verification scenarios.

## Running the Raspberry Pi Simulator

The simulator script allows you to test the complete flow from user check-in to reward processing.

### Basic Usage

```bash
# Always accept bottles (100% success rate)
node scripts/simulate-pi.js 001

# Custom success rate (70% success, 30% failure)
node scripts/simulate-pi.js 001 0.7

# Always reject bottles (0% success rate)
node scripts/simulate-pi.js 001 0
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `bin_id` | The bin ID to monitor | `001` |
| `success_rate` | Probability of successful verification (0.0 to 1.0) | `1.0` (100%) |

## Testing Flow

### 1. User Registration
1. Open the app at `http://localhost:3000`
2. Enter name and phone number (e.g., `+2348087986853`)
3. Click "Sign In"
4. System creates Squad virtual account

### 2. Bin Activation
1. From dashboard, click "Scan QR Code"
2. Enter bin ID manually (e.g., `001`) or scan QR code
3. Monitor page opens showing "Bin Ready" state
4. Active session created in database

### 3. Run Simulator
```bash
# Terminal 1: Run Next.js dev server
npm run dev

# Terminal 2: Run simulator
node scripts/simulate-pi.js 001
```

The simulator will:
1. Poll for active sessions every 2 seconds
2. Detect when user checks in
3. Simulate 3-second AI verification
4. Accept or reject based on success rate
5. Update session status and balance

### 4. Frontend Updates

#### Success Scenario
- Session status changes to `'success'`
- Frontend shows green success screen
- Displays earned amount (₦10)
- Updates user balance
- Shows "View Dashboard" button

#### Failure Scenario
- Session status changes to `'failed'`
- Frontend shows red rejection screen
- Explains possible reasons
- Shows "Try Again" and "Back to Dashboard" buttons
- No balance change

## Database Status Flow

```
waiting → verifying → success → [session deleted]
waiting → verifying → failed → [session deleted]
```

## Testing Scenarios

### Scenario 1: Successful Recycling
```bash
node scripts/simulate-pi.js 001
```
**Expected:**
- ✅ Bottle verified
- ₦10 credited to user
- Success screen appears within 2 seconds
- Balance updates on dashboard

### Scenario 2: Failed Verification
```bash
node scripts/simulate-pi.js 001 0
```
**Expected:**
- ❌ Item rejected
- No balance change
- Failure screen with reasons
- Option to try again

### Scenario 3: Mixed Results (70% Success)
```bash
node scripts/simulate-pi.js 001 0.7
```
**Expected:**
- 70% chance of success per attempt
- Different outcomes for different bottles
- Proper handling of both cases

## Real-time Updates

The system uses two mechanisms for real-time updates:

1. **Supabase Real-time Subscriptions**
   - Listens for UPDATE events on `active_sessions` table
   - Triggers when status changes to 'success' or 'failed'

2. **Polling Fallback**
   - Polls database every 2 seconds
   - Ensures updates even if WebSocket fails
   - Provides reliable user experience

## Debugging

### Enable Console Logging
All real-time events are logged to browser console with `[Monitor]` prefix:
```
[Monitor] Setting up real-time listener for bin: 001
[Monitor] Polling for session status...
[Monitor] Current session status: success
[Monitor] Success detected!
```

### Check Database
View active sessions:
```sql
SELECT * FROM active_sessions WHERE bin_id = '001';
```

View transactions:
```sql
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;
```

Check user balance:
```sql
SELECT phone, name, balance FROM users;
```

## Running the Migration

Before testing success/failure, run the database migration:

```sql
-- In Supabase SQL Editor, run:
-- supabase/migration-add-status.sql
```

This adds the `status` column to `active_sessions` table.

## Production Deployment

### Raspberry Pi Setup
1. Install Node.js on Raspberry Pi
2. Clone repository
3. Install dependencies: `npm install`
4. Set environment variables in `.env`
5. Run simulator: `node scripts/simulate-pi.js 001`

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Troubleshooting

### Frontend not updating
1. Check browser console for `[Monitor]` logs
2. Verify polling is running every 2 seconds
3. Check Supabase real-time subscription status
4. Ensure session exists in database

### Simulator not detecting session
1. Verify environment variables loaded
2. Check bin_id matches active session
3. Confirm Supabase credentials correct
4. Check network connectivity

### Balance not updating
1. Verify transaction recorded in database
2. Check `/api/recycle-success` API logs
3. Ensure user exists in database
4. Refresh dashboard page

## API Endpoints

### Start Session
```bash
POST /api/sessions/start
Body: { "bin_id": "001", "user_phone": "+2348087986853" }
```

### Process Result
```bash
POST /api/recycle-success
Body: { "bin_id": "001", "success": true }
```

## Next Steps

1. Integrate real Gemini AI for bottle verification
2. Add camera capture on Raspberry Pi
3. Implement actual Squad API transfers
4. Add session expiration handling
5. Implement withdrawal feature
