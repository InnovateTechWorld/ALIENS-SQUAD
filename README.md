# RecyclePay 🌍♻️

**Get Paid to Recycle** - Turn your plastic waste into instant cash with AI-powered smart recycling bins.

A Next.js web application that serves as the digital nervous system for RecyclePay's smart recycling ecosystem. Users scan QR codes on bins, deposit recyclable items verified by Gemini AI on Raspberry Pi, and earn instant NGN rewards.

---

## 🚀 Features

- **🔐 User Authentication**: Phone-based registration with virtual wallet creation
- **📱 QR Code Scanning**: Instant bin access via static QR codes
- **💰 Real-Time Rewards**: Live balance updates using Supabase real-time subscriptions
- **🤖 AI Integration**: Backend API for Raspberry Pi + Gemini Flash verification
- **💳 Squad API Integration**: Virtual account (NUBAN) generation and payouts
- **📊 Dashboard**: Track earnings, transaction history, and environmental impact
- **⚡ Session Management**: Secure bin check-in/check-out with expiration

---

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   User's    │  Scans  │   Next.js    │ Watches │  Raspberry  │
│   Phone     │────────>│   Web App    │<────────│     Pi      │
│             │         │  (Cloud)     │         │   (Edge)    │
└─────────────┘         └──────┬───────┘         └──────┬──────┘
                               │                        │
                               │ ┌──────────────┐       │
                               ├─│   Supabase   │───────┤
                               │ │  (Database)  │       │
                               │ └──────────────┘       │
                               │                        │
                               │ ┌──────────────┐       │
                               └─│   Squad API  │       │
                                 │  (Payments)  │       │
                                 └──────────────┘       │
                                                        │
                                               ┌────────▼────────┐
                                               │  Gemini Flash   │
                                               │  (AI Vision)    │
                                               └─────────────────┘
```

---

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + Real-time)
- **Payment**: Squad API (Nigerian payments)
- **UI Components**: Custom components with Lucide React icons
- **QR Codes**: qrcode.react

---

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Squad API account ([squadco.com](https://squadco.com)) - optional for demo

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd recycle-pay
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from [`supabase/schema.sql`](supabase/schema.sql)
3. Copy your project URL and anon key from **Settings > API**

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Squad API Configuration (Optional for demo)
SQUAD_SECRET_KEY=your_squad_secret_key
SQUAD_API_URL=https://sandbox-api-d.squadco.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Usage Flow

### For Users

1. **Visit Homepage**: Go to `http://localhost:3000`
2. **Scan Bin QR**: Click on any available bin to see its QR code
3. **Start Session**: Enter your phone number and click "Start Recycling"
4. **Insert Bottle**: The Raspberry Pi's camera verifies the item using Gemini AI
5. **Get Paid**: Receive ₦10 instantly, visible on your dashboard

### For Raspberry Pi

The Pi should call this endpoint when a bottle is verified:

```bash
POST /api/recycle-success
Content-Type: application/json

{
  "bin_id": "001"
}
```

---

## 🗂️ Project Structure

```
recycle-pay/
├── app/
│   ├── api/                      # Backend API routes
│   │   ├── recycle-success/      # Raspberry Pi webhook
│   │   ├── sessions/             # Session management
│   │   └── users/                # User CRUD operations
│   ├── bin/[id]/                 # Bin QR scan page (dynamic route)
│   ├── dashboard/[phone]/        # User dashboard (dynamic route)
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Homepage
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── QRCode.tsx
│   ├── StatsCard.tsx             # Dashboard statistics
│   └── TransactionList.tsx       # Transaction history
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── squad.ts                  # Squad API wrapper
│   └── utils.ts                  # Utility functions
├── types/
│   └── database.ts               # TypeScript types for Supabase
├── supabase/
│   └── schema.sql                # Database schema
├── .env.example                  # Environment template
└── README.md                     # This file
```

---

## 🔑 Key API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/register` | POST | Register a new user |
| `/api/users/[phone]` | GET | Get user details and transactions |
| `/api/sessions/start` | POST | Start a recycling session at a bin |
| `/api/recycle-success` | POST | Process bottle verification (called by Pi) |

---

## 📊 Database Schema

### Tables

- **users**: User profiles and wallet balances
- **bins**: Physical bin locations and status
- **active_sessions**: Current user-bin connections
- **transactions**: Complete payment history

See [`supabase/schema.sql`](supabase/schema.sql) for full details.

---

## 🎯 Hackathon Demo Script

### The Flow

1. **Start the Pi Script**: It will say "Bin is idle."
2. **Open Your Phone**: Go to the URL or scan the static QR code
3. **Click "Start"**: The Pi wakes up instantly because it sees the row in Supabase!
4. **Show the Bottle**: Gemini verifies it
5. **Watch the Money**: Your Next.js dashboard shows the balance jump by ₦10

### Quick Test (Without Pi)

You can simulate the Pi by manually calling the API:

```bash
# 1. Start a session (from browser at /bin/001)
# 2. Then run this command:

curl -X POST http://localhost:3000/api/recycle-success \
  -H "Content-Type: application/json" \
  -d '{"bin_id":"001"}'
```

The dashboard will update in real-time!

---

## 🔐 Security Notes

**⚠️ Demo Configuration**: This codebase includes open RLS policies for rapid development. 

**For Production**:
- Implement proper Row Level Security policies in Supabase
- Add authentication middleware to API routes
- Validate Pi requests with API keys
- Use environment-specific Squad API keys
- Enable CORS restrictions

---

## 🚀 Deployment

### Deploy to Vercel

```bash
npm run build
vercel deploy --prod
```

Set environment variables in Vercel dashboard.

### Update Environment

Don't forget to update `NEXT_PUBLIC_APP_URL` to your production domain!

---

## 🤝 Contributing

This is a hackathon project. For improvements:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **Supabase**: Real-time database and auth
- **Squad**: Nigerian payment infrastructure
- **Google Gemini**: AI vision for bottle verification
- **Next.js**: The React framework for production

---

## 📧 Contact

For questions or demo requests, reach out to the RecyclePay team.

**Built with 💚 for a sustainable future**
