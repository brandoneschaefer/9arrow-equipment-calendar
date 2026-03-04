# Getting Started Checklist

Complete these steps to launch your Equipment Calendar system.

## ✅ Pre-Setup Requirements

- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed or Docker installed
- [ ] HubSpot account created
- [ ] Git configured

## ✅ Step 1: Initial Setup (5 minutes)

```bash
# Clone the repository (if not already done)
git clone <your-repo> 9arrow-equipment-calendar
cd 9arrow-equipment-calendar

# Install dependencies
npm install

# Wait for installation to complete
```

**Expected:** No errors, successful installation of ~200 packages

## ✅ Step 2: Database Setup (5 minutes)

### Option A: Docker (Easiest)
```bash
docker compose up -d
# Starts PostgreSQL automatically
# Database: equipment_calendar
# User: equipment_user
# Password: equipment_password
```

### Option B: Manual PostgreSQL

```bash
# Create database
createdb equipment_calendar

# Note your connection string:
# postgresql://username:password@localhost:5432/equipment_calendar
```

**Expected:** Database accessible on localhost:5432

## ✅ Step 3: Environment Configuration (5 minutes)

```bash
# Copy template
cp .env.example .env.local

# Edit the file
nano .env.local  # or use your editor

# Or do it programmatically:
cat > .env.local << EOF
DATABASE_URL="postgresql://equipment_user:equipment_password@localhost:5432/equipment_calendar"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
HUBSPOT_PRIVATE_APP_TOKEN="your-token-here-optional-for-now"
EOF
```

**Required values:**
- ✅ DATABASE_URL - PostgreSQL connection string
- ✅ NEXTAUTH_URL - Should be http://localhost:3000 for dev
- ✅ NEXTAUTH_SECRET - Generate new one (shown in commands above)
- ⚠️ HUBSPOT_PRIVATE_APP_TOKEN - Optional, add later for sync

## ✅ Step 4: Database Migration (5 minutes)

```bash
# Create all tables
npm run db:migrate

# When prompted for migration name, choose:
# "create_schema" or just accept default

# Generate Prisma client
npm run db:generate
```

**Expected Output:**
```
✔ Created migration/xxx_create_schema

Prisma client generated
```

## ✅ Step 5: Seed Sample Data (2 minutes)

```bash
npm run db:seed
```

**Expected Output:**
```
✅ Equipment created: [5 item names]
✅ Sample user created: customer@example.com

✨ Database seeded successfully!
```

**Sample Data Created:**
- 5 equipment items
- 1 test user: customer@example.com / TestPassword123!

## ✅ Step 6: Start Development Server (2 minutes)

```bash
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.x
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 3.2s
```

## ✅ Step 7: Verify Application

Open http://localhost:3000 in your browser

### Check These:
1. **Home Page Loads**
   - [ ] See "Equipment Calendar" heading
   - [ ] See "Sign In" and "Create Account" buttons

2. **Test Login**
   - [ ] Click "Sign In"
   - [ ] Enter: customer@example.com
   - [ ] Password: TestPassword123!
   - [ ] Should redirect to calendar

3. **Calendar View**
   - [ ] See equipment list
   - [ ] See "New Reservation" button
   - [ ] See "No reservations" message

4. **Test Signup** (Optional)
   - [ ] Click "Create Account"
   - [ ] Fill in name, email, password
   - [ ] Account created
   - [ ] Can login with new account

5. **Create Reservation**
   - [ ] Click "New Reservation"
   - [ ] Select equipment
   - [ ] Enter company name
   - [ ] Enter contact name
   - [ ] Set check-in/out dates
   - [ ] Click "Create Reservation"
   - [ ] Should appear in calendar

**Expected:** Application running, all features working

## ✅ Step 8: (Optional) Setup HubSpot

### Get Your HubSpot Token:
1. Go to https://app.hubspot.com
2. Click Settings (gear icon) → Integrations → Private apps
3. Create new private app with scopes:
   - `crm.objects.deals.create`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
   - `crm.objects.contacts.read`
   - `crm.objects.companies.read`

### Add to Your System:
```bash
# Edit .env.local
nano .env.local

# Add line:
HUBSPOT_PRIVATE_APP_TOKEN=pat-xxxxxxxxxxxxxxxxxxxx

# Restart server (Ctrl+C and npm run dev)
```

### Verify HubSpot Sync:
- [ ] Create a new reservation
- [ ] Go to HubSpot → Deals
- [ ] Should see new deal with format: "CompanyName - Equipment Rental"
- [ ] Deal should have check-in/check-out dates

## ✅ Step 9: Common Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start              # Start production server

# Database
npm run db:migrate     # Run migrations
npm run db:generate    # Generate Prisma client
npm run db:seed        # Load sample data
npm run db:studio      # Open GUI database viewer (requires browser)

# Code Quality
npm run lint           # Check code style
```

## 📋 Troubleshooting

### "Cannot connect to database"
```bash
# Check Docker is running
docker ps
# Should show: equipment-calendar-db

# Or verify manual PostgreSQL is running
psql -U equipment_user -d equipment_calendar -c "SELECT 1;"
```

### "NEXTAUTH_SECRET not set"
```bash
# Generate and add to .env.local
openssl rand -base64 32
# Copy output and add to NEXTAUTH_SECRET in .env.local
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 already in use"
```bash
# Use different port
npm run dev -- -p 3001
# Access at http://localhost:3001
```

### "HubSpot sync not working"
1. Verify token in .env.local
2. Restart server (Ctrl+C, npm run dev)
3. Check browser console for errors
4. Verify HubSpot app has required scopes

## ✅ First Success Checklist

After completing these steps, you should have:

- [ ] ✅ All dependencies installed
- [ ] ✅ PostgreSQL database running
- [ ] ✅ Environment variables configured
- [ ] ✅ Database tables created
- [ ] ✅ Sample data loaded
- [ ] ✅ Dev server running
- [ ] ✅ Can login with test account
- [ ] ✅ Can view equipment in calendar
- [ ] ✅ Can create reservations
- [ ] ✅ UI is responsive and working

## 🎯 What's Next?

1. **Explore the Code**
   - Look at `app/calendar/page.tsx` for main UI
   - Check `app/api/` for backend logic
   - Review `lib/hubspot.ts` for integrations

2. **Customize**
   - Edit equipment list in `prisma/seed.ts`
   - Update colors in `tailwind.config.js`
   - Add your company logo

3. **Deploy**
   - Read DEPLOYMENT.md when ready
   - Choose Vercel, AWS, or Railway
   - Set up production database

4. **Enhance**
   - Add email notifications
   - Implement file uploads
   - Add reporting features

## 📞 Need Help?

Check these files in order:
1. QUICKSTART.md - Fast 5-minute setup
2. README.md - Complete documentation
3. ARCHITECTURE.md - System design
4. FEATURES.md - Feature breakdown

## ⏱️ Expected Timeline

| Step | Time | Status |
|------|------|--------|
| Install dependencies | 5 min | ✅ |
| Setup Database | 5 min | ✅ |
| Environment config | 5 min | ✅ |
| Database migration | 5 min | ✅ |
| Seed sample data | 2 min | ✅ |
| Start server | 2 min | ✅ |
| Verify everything | 5 min | ✅ |
| **Total** | **~30 minutes** | **✅** |

---

**You're all set! 🚀 Your Equipment Calendar is ready to use.**

Once you complete these steps, your system will be:
- ✅ Running locally
- ✅ Fully functional
- ✅ Ready for testing
- ✅ Ready for deployment

Happy renting!
