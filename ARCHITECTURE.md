# Architecture Overview

## System Design

The Equipment Calendar Management System follows a modern full-stack architecture with clear separation of concerns.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────────────────────────────────────────┐     │
│   │  React Components (Next.js App Router)          │     │
│   ├──────────────────────────────────────────────────┤     │
│   │  • Login/Register Pages                         │     │
│   │  • Calendar View                                │     │
│   │  • Reservation Forms                            │     │
│   └──────────────────────────────────────────────────┘     │
│                          │                                  │
│                          ▼                                  │
│   ┌──────────────────────────────────────────────────┐     │
│   │      Next.js Client (TailwindCSS)               │     │
│   │  • Session Management (NextAuth)                │     │
│   │  • API Client Calls                             │     │
│   └──────────────────────────────────────────────────┘     │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP/HTTPS
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              Next.js Server & API Layer                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────┐     │
│  │  API Routes (/app/api/*)                         │     │
│  ├───────────────────────────────────────────────────┤     │
│  │  • Authentication ([...nextauth]/route.ts)      │     │
│  │  • Equipment Management (equipment/route.ts)    │     │
│  │  • Reservation CRUD (reservations/route.ts)     │     │
│  │  • HubSpot Sync                                  │     │
│  └───────────────────────────────────────────────────┘     │
│                          │                                  │
│          ┌───────────────┼───────────────┐                 │
│          ▼               ▼               ▼                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │  Prisma ORM  │ │  Auth Logic  │ │  HubSpot Lib │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
     ┌─────────────┐            ┌──────────────────┐
     │ PostgreSQL  │            │   HubSpot API    │
     │  Database   │            └──────────────────┘
     └─────────────┘
```

## Component Breakdown

### 1. **Frontend Layer**
- **Authentication Pages**: Login & Registration with NextAuth integration
- **Calendar View**: Main dashboard showing equipment reservations
- **Forms**: Equipment reservation creation/editing forms
- **Styling**: TailwindCSS for responsive UI

### 2. **Backend API Layer**
- **Auth Routes**: User registration and NextAuth endpoints
- **Equipment Routes**: CRUD operations for equipment items
- **Reservation Routes**: Full CRUD for reservations with:
  - Permission checking (users can only see their own reservations)
  - HubSpot sync on create/update
  - Automatic deal creation

### 3. **Authentication & Security**
- **NextAuth.js**: Session-based authentication
- **Middleware**: Route protection for /calendar and API endpoints
- **Password**: bcryptjs hashing for secure storage

### 4. **Database Layer**
- **Prisma ORM**: Type-safe database access
- **Models**: Users, Equipment, Reservations with proper relationships
- **Indexes**: Optimized queries on frequently searched fields

### 5. **External Integrations**
- **HubSpot API**: 
  - Creates deals when reservations are made
  - Syncs updates when reservations are modified
  - Retrieves contact and company information

## Data Flow

### Reservation Creation Flow
```
1. User fills reservation form
   │
2. Submit to POST /api/reservations
   │
3. Validate user authentication
   │
4. Create Reservation in Database
   │
5. Sync to HubSpot:
   - Create Deal with equipment info
   - Set check-in/check-out dates
   - Store deal ID in database
   │
6. Return reservation to client
   │
7. Update calendar view
```

### User Registration Flow
```
1. User submits email & password to /register page
   │
2. POST /api/auth/register
   │
3. Hash password with bcryptjs
   │
4. Create user record in database
   │
5. Redirect to login page
   │
6. User can now login with credentials
```

## File Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── auth/register/route.ts
│   │   ├── equipment/route.ts
│   │   └── reservations/[id]/route.ts
│   ├── calendar/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── page.tsx (home)
│   ├── globals.css
│   └── layout.tsx
├── components/
│   └── providers/
│       └── auth-provider.tsx
├── lib/
│   ├── auth.ts (NextAuth config)
│   ├── prisma.ts (Prisma client)
│   └── hubspot.ts (HubSpot API client)
├── prisma/
│   ├── schema.prisma (database schema)
│   └── seed.ts (initial data)
├── middleware.ts (route protection)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── docker-compose.yml
```

## Database Schema

### Users Table
```
id (PK)
email (UNIQUE)
password (hashed)
name
hubspotId (optional)
createdAt
updatedAt
```

### Equipment Table
```
id (PK)
name
hubspotId (optional)
status (available|rented|maintenance)
createdAt
updatedAt
```

### Reservations Table
```
id (PK)
equipmentId (FK)
userId (FK)
companyName
contactName
contactEmail
contactPhone
checkInTime
checkOutTime
notes
hubspotDealId (optional)
createdAt
updatedAt
```

## Security Considerations

1. **Authentication**: NextAuth handles session management securely
2. **Database**: Prisma prevents SQL injection
3. **Passwords**: bcryptjs with salt rounds = 10
4. **Environment Variables**: Sensitive data in .env.local (not version controlled)
5. **API Rate Limiting**: Implement in production
6. **CORS**: Configure for your domain
7. **Input Validation**: Validate all user inputs server-side

## Performance Optimizations

1. **Database Indexes**: 
   - equipmentId, userId, checkInTime, checkOutTime
2. **Prisma Caching**: Connection pooling included
3. **Next.js**: 
   - Server-side rendering where appropriate
   - Image optimization (if used)
   - Code splitting
4. **API Caching**: Implement cache headers as needed

## Scalability Considerations

1. **Database**: PostgreSQL can handle thousands of concurrent connections
2. **API**: Stateless design allows horizontal scaling
3. **Sessions**: Consider Redis for distributed session storage in production
4. **HubSpot Sync**: Implement queue system (Bull/Bee-Q) for reliability
5. **File Upload**: Use cloud storage (S3, Azure Blob) for documents

## Monitoring & Logging

Implement:
- Error tracking (Sentry)
- Performance monitoring (New Relic, Datadog)
- API logging
- Database query logging (enabled in development)
- HubSpot sync audit trail
