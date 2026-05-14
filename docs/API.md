# API Documentation

Complete API reference for RecyclePay backend endpoints.

---

## Base URL

**Local Development**: `http://localhost:3000`  
**Production**: `https://your-domain.com`

---

## Authentication

Currently, no authentication is required (demo mode). In production, implement API keys or JWT tokens.

---

## Endpoints

### 1. User Registration

Register a new user or return existing user.

**Endpoint**: `POST /api/users/register`

**Request Body**:
```json
{
  "phone": "+2348012345678",
  "name": "John Doe"  // optional
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "phone": "+2348012345678",
    "name": "John Doe",
    "balance": 0,
    "virtual_account_number": null,
    "created_at": "2026-05-14T11:00:00Z",
    "updated_at": "2026-05-14T11:00:00Z"
  }
}
```

**Error** (400/500):
```json
{
  "error": "Phone number is required"
}
```

---

### 2. Get User Details

Fetch user profile and recent transactions.

**Endpoint**: `GET /api/users/[phone]`

**Path Parameters**:
- `phone`: User's phone number (URL encoded)

**Example**: `GET /api/users/%2B2348012345678`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+2348012345678",
      "name": "John Doe",
      "balance": 50,
      "virtual_account_number": null,
      "created_at": "2026-05-14T11:00:00Z",
      "updated_at": "2026-05-14T11:00:00Z"
    },
    "transactions": [
      {
        "id": "uuid",
        "user_phone": "+2348012345678",
        "bin_id": "001",
        "amount": 10,
        "type": "recycle",
        "status": "completed",
        "metadata": {
          "balance_before": 40,
          "balance_after": 50
        },
        "created_at": "2026-05-14T11:00:00Z"
      }
    ]
  }
}
```

**Error** (404):
```json
{
  "error": "User not found"
}
```

---

### 3. Start Session

Start a recycling session at a specific bin.

**Endpoint**: `POST /api/sessions/start`

**Request Body**:
```json
{
  "bin_id": "001",
  "user_phone": "+2348012345678"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Session started successfully",
  "data": {
    "id": "uuid",
    "bin_id": "001",
    "user_phone": "+2348012345678",
    "started_at": "2026-05-14T11:00:00Z",
    "expires_at": "2026-05-14T11:05:00Z"
  }
}
```

**Error** (400):
```json
{
  "error": "bin_id and user_phone are required"
}
```

**Error** (404):
```json
{
  "error": "Bin not found"
}
```

**Error** (409):
```json
{
  "error": "Bin is currently in use by another user"
}
```

---

### 4. Recycle Success (Raspberry Pi Webhook)

Process a successful bottle verification and reward the user.

**Endpoint**: `POST /api/recycle-success`

**Request Body**:
```json
{
  "bin_id": "001"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment Processed",
  "data": {
    "amount": 10,
    "new_balance": 50,
    "user_phone": "+2348012345678"
  }
}
```

**Error** (400):
```json
{
  "error": "No active user for this bin"
}
```

**Error** (404):
```json
{
  "error": "User not found"
}
```

**Error** (500):
```json
{
  "error": "Failed to update balance"
}
```

---

## Real-Time Events (Supabase)

The app uses Supabase real-time subscriptions for live updates.

### User Balance Updates

**Channel**: `user-updates`  
**Table**: `users`  
**Event**: `UPDATE`

**Payload**:
```javascript
{
  event: 'UPDATE',
  new: {
    id: 'uuid',
    phone: '+2348012345678',
    balance: 50,
    // ... other fields
  },
  old: {
    balance: 40,
    // ... other fields
  }
}
```

### New Transactions

**Channel**: `user-updates`  
**Table**: `transactions`  
**Event**: `INSERT`

**Payload**:
```javascript
{
  event: 'INSERT',
  new: {
    id: 'uuid',
    user_phone: '+2348012345678',
    amount: 10,
    type: 'recycle',
    status: 'completed',
    // ... other fields
  }
}
```

### Session Completion

**Channel**: `session-updates`  
**Table**: `active_sessions`  
**Event**: `DELETE`

**Payload**:
```javascript
{
  event: 'DELETE',
  old: {
    id: 'uuid',
    bin_id: '001',
    user_phone: '+2348012345678',
    // ... other fields
  }
}
```

---

## Error Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 400 | Bad Request | Missing required fields |
| 404 | Not Found | User or bin doesn't exist |
| 409 | Conflict | Bin already in use |
| 500 | Server Error | Database or API failure |

---

## Rate Limiting

Currently no rate limiting implemented. For production:
- Implement rate limiting per IP
- Add API key authentication
- Monitor for abuse patterns

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+2348012345678","name":"John Doe"}'
```

### Get User Details
```bash
curl http://localhost:3000/api/users/%2B2348012345678
```

### Start Session
```bash
curl -X POST http://localhost:3000/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{"bin_id":"001","user_phone":"+2348012345678"}'
```

### Simulate Bottle Success
```bash
curl -X POST http://localhost:3000/api/recycle-success \
  -H "Content-Type: application/json" \
  -d '{"bin_id":"001"}'
```

---

## Webhooks

### Raspberry Pi Integration

The Pi should call `/api/recycle-success` when:
1. User has active session
2. Camera captures image
3. Gemini AI verifies bottle is valid
4. Door closes

**Example Python Code**:
```python
import requests

def notify_backend(bin_id):
    response = requests.post(
        'https://your-app.com/api/recycle-success',
        json={'bin_id': bin_id},
        headers={'Content-Type': 'application/json'}
    )
    return response.json()
```

---

## Database Schema

See [`supabase/schema.sql`](../supabase/schema.sql) for complete schema.

**Key Tables**:
- `users`: User profiles and balances
- `bins`: Physical bin information
- `active_sessions`: Current user-bin connections
- `transactions`: Payment history

---

## Future API Endpoints

Planned for Phase 2:

- `POST /api/withdrawal` - Withdraw funds to bank
- `GET /api/leaderboard` - Top recyclers
- `GET /api/bins/nearby` - Find bins near location
- `POST /api/referral` - Invite friends
- `GET /api/stats/global` - Platform-wide statistics

---

**For more details, see the main documentation files.**
