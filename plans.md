# GBP Audit Tool - Implementation Plan

## Status: PAUSED

Core audit functionality complete. Pausing to revisit later.

---

## Phase 1: Project Setup
- [x] Initialize Next.js 14 project with TypeScript
- [x] Set up Tailwind CSS and shadcn/ui
- [x] Set up Prisma with PostgreSQL schema
- [x] Create basic layout and navigation
- [x] Configure NextAuth.js with Google OAuth

## Phase 2: Audit Engine & Checklist UI
- [x] Define audit checklist data model
- [x] Build checklist interface with all 10 categories
- [x] Implement scoring system (pass/fail/warning/manual-review)
- [x] Create manual data entry forms for GBP profile data
- [x] Build audit results view with actionable items

## Phase 3: Reports & History
- [x] Store audit results in database
- [ ] Historical audit comparison (show score trends over time)
- [ ] Export to PDF/CSV
- [x] Dashboard with audit summaries

## Phase 4: Google API Integration (After Approval)
- [ ] Configure NextAuth.js with GBP scopes
- [ ] Implement GBP API client wrapper (`src/lib/google-api.ts`)
- [ ] Auto-populate audit data from API
- [ ] Replace manual entry with live data fetch

## Phase 5: Advanced Features
- [ ] **Competitor Comparison** (NEW)
  - [ ] Manual competitor entry form
  - [ ] Google Places API integration for basic competitor data
  - [ ] Side-by-side comparison dashboard
  - [ ] Gap analysis (reviews, photos, rating differences)
- [ ] Heat map/grid scan integration (BrightLocal API or similar)
- [ ] Multi-location bulk audits
- [ ] Scheduled recurring audits
- [ ] Team collaboration features

## Current Blockers

- **Google OAuth**: Requires credentials configured in `.env` (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- **Database**: Requires PostgreSQL running and DATABASE_URL configured
- **GBP API**: Requires Google approval (Phase 4 blocker)

## Next Steps

1. Set up PostgreSQL database and run migrations
2. Configure Google OAuth credentials for auth
3. Implement competitor comparison feature (Places API + manual entry)
4. Add export functionality (PDF/CSV)
