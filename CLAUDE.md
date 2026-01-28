# CLAUDE.md - GBP Audit Tool

## Bugs & Solutions

**Problem**: Prisma 7.x requires adapter/accelerateUrl, incompatible with simple setup
**Fix**: Downgraded to Prisma 5.x (`npm install prisma@5 @prisma/client@5`)

**Problem**: Tailwind v4 CSS-based config doesn't support `@apply border-border` syntax
**Fix**: Use `@theme inline` block in globals.css to define CSS variables directly

**Problem**: Next.js dev server lock file prevents restart
**Fix**: Remove `.next/dev/lock` and kill existing processes before restart

## Architecture

- **Auth**: NextAuth.js v5 (beta) with Google OAuth, Prisma adapter
- **Database**: PostgreSQL with Prisma 5.x ORM
- **Styling**: Tailwind v4 with CSS variables in `@theme inline` block
- **Audit Engine**: `src/lib/audit-checks.ts` - 30+ checks across 10 categories, weighted scoring

## Key Decisions

- Phase 1-3 uses manual data entry (GBP API requires Google approval)
- Demo mode at `/audit/demo` works without auth/database for testing
- JSON fields in Prisma store flexible profile data and user inputs
