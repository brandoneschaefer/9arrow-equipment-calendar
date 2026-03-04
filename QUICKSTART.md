# Quick Start Guide

Get the Equipment Calendar up and running in 5 minutes.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 12 or higher
- Git

## 1. Clone Repository

```bash
git clone <your-repo-url>
cd 9arrow-equipment-calendar
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Setup PostgreSQL Database

### Option A: Using Docker (Easiest)

```bash
docker compose up -d
```

This starts PostgreSQL on localhost:5432 with:
- Username: `equipment_user`
- Password: `equipment_password`
- Database: `equipment_calendar`

### Option B: Manual PostgreSQL Setup

Create a database:
```bash
createdb equipment_calendar
```

## 4. Environment Configuration

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

**Minimal setup for development:**

```
DATABASE_URL="postgresql://equipment_user:equipment_password@localhost:5432/equipment_calendar"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="supersecretchangethis12345678"
HUBSPOT_PRIVATE_APP_TOKEN="your-hubspot-token-here"
```

Generate a NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 5. Setup Database Schema

```bash
npm run db:migrate
```

This creates all tables based on schema.prisma

## 6. Seed Sample Data

```bash
npm run db:seed
```

Creates:
- 5 sample equipment items
- 1 test user: customer@example.com / TestPassword123!

## 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser

## 8. Login & Test

1. Go to **Sign In** or **Create Account**
2. Or use test account:
   - Email: `customer@example.com`
   - Password: `TestPassword123!`
3. Create a new reservation
4. Verify it appears in the calendar

## Common Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database shell (if using Docker)
docker exec -it equipment-calendar-db psql -U equipment_user -d equipment_calendar

# View database contents
npm run db:studio

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema changes
npm run db:push
```

## Verify Everything Works

Check these endpoints:

```bash
# Home page
curl http://localhost:3000/

# API - Equipment list (requires auth but shows error without it)
curl http://localhost:3000/api/equipment

# Database connection
npm run dev  # Should start without errors
```

## Next Steps

1. **Add Your Equipment**: Modify database or API to add your 5 equipment items
2. **Connect HubSpot**: Add your private app token to sync reservations
3. **Customize UI**: Update colors/branding in components
4. **Deploy**: See DEPLOYMENT.md for production setup

## Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker ps  # Should show equipment-calendar-db

# Restart if needed
docker compose restart postgres
```

### "NEXTAUTH_SECRET must be set"
```bash
# Make sure .env.local has:
NEXTAUTH_SECRET="openssl rand -base64 32"
```

### "Failed to create migration"
```bash
# Reset database (loses data)
npm run db:push -- --accept-data-loss
```

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

## File Structure Quick Reference

```
├── app/            # Next.js pages and API routes
├── components/     # React components
├── lib/            # Utilities (auth, database, HubSpot)
├── prisma/         # Database schema and migrations
└── types/          # TypeScript definitions
```

## Need Help?

1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
3. Check [README.md](./README.md) for full documentation
4. Review API endpoints in `app/api/` directories

## Quick HubSpot Setup

To enable HubSpot sync:

1. Get private app token from HubSpot:
   - Settings → Apps and integrations → Private apps
   - Create new app with scopes:
     - `crm.objects.contacts.read`
     - `crm.objects.deals.create`
     - `crm.objects.deals.read`
     - `crm.objects.deals.write`
     - `crm.objects.companies.read`

2. Add to `.env.local`:
   ```
   HUBSPOT_PRIVATE_APP_TOKEN=pat-your-token-here
   ```

3. Restart server

Now when you create reservations, they'll sync to HubSpot as deals!

---

**Happy renting! 🎉**
