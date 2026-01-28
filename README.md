# GBP Audit Tool

A comprehensive Google Business Profile audit tool built with Next.js 14+, designed to help businesses optimize their GBP listings for better local search visibility.

## Features

- **Comprehensive Audit Checklist**: 10 categories covering all aspects of GBP optimization
  - Categories (primary/secondary)
  - Company Description
  - Service Areas
  - Business Hours
  - Contact Information
  - Services
  - Products
  - Photos
  - Posts
  - Reviews

- **Scoring System**: Get clear pass/fail/warning status for each check with an overall optimization score

- **Manual Entry Mode**: Enter your GBP data manually (Phase 1-3, before API approval)

- **Future API Integration**: Prepared for automatic data fetch via Google Business Profile API (Phase 4)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Auth**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Cloud Project with OAuth credentials

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd gbp-audit-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/gbp_audit"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google OAuth API
4. Configure the OAuth consent screen
5. Create OAuth 2.0 credentials (Web application)
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env` file

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Login page
│   ├── dashboard/                  # User dashboard
│   ├── audit/
│   │   ├── new/page.tsx            # New audit wizard
│   │   ├── demo/page.tsx           # Demo audit (no auth required)
│   │   └── [locationId]/           # Location audit pages
│   └── api/
│       ├── auth/[...nextauth]/     # NextAuth endpoints
│       ├── locations/              # Location CRUD
│       ├── audit/[locationId]/     # Run/fetch audits
│       └── audits/                 # Audit history
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── AuditChecklist.tsx          # Main checklist component
│   ├── AuditItem.tsx               # Individual check item
│   ├── ScoreCard.tsx               # Score display
│   ├── LocationSelector.tsx        # Location picker
│   └── ProfileEntryForm.tsx        # Manual data entry
├── lib/
│   ├── auth.ts                     # NextAuth config
│   ├── prisma.ts                   # Prisma client
│   ├── audit-checks.ts             # Audit logic
│   └── utils.ts                    # Utility functions
└── types/
    └── audit.ts                    # TypeScript interfaces
```

## Implementation Phases

### Phase 1-3: Manual Entry Mode (Current)
- Complete UI/UX
- Manual GBP data entry
- Full audit functionality
- Report generation

### Phase 4: Google API Integration (Future)
- Requires Google Business Profile API approval
- Automatic data population
- Real-time sync

### Phase 5: Advanced Features (Future)
- Multi-location bulk audits
- Historical comparisons
- Team collaboration

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run linting
npm run lint

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

## Deployment

The app is designed for deployment on Railway (app + PostgreSQL) but can be deployed to any platform that supports Next.js:

- Vercel
- Railway
- Render
- AWS
- Google Cloud Run

## License

MIT
