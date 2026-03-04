# Deployment Guide

This guide covers deploying the Equipment Calendar Management System to production.

## Pre-Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] HubSpot API token validated
- [ ] HTTPS certificate obtained
- [ ] Backup strategy defined
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Security audit completed

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

Vercel is the official Next.js hosting platform.

#### Setup

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub
   - Import your repository

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     DATABASE_URL=postgresql://user:password@host/dbname
     NEXTAUTH_URL=https://yourdomain.com
     NEXTAUTH_SECRET=<random-secret>
     HUBSPOT_PRIVATE_APP_TOKEN=<token>
     NODE_ENV=production
     ```

4. **Database (Using Vercel Postgres or external)**
   
   **Option A: Vercel Postgres**
   - Add Vercel Postgres integration
   - Will provide DATABASE_URL automatically
   
   **Option B: External PostgreSQL (AWS RDS, Railway, etc.)**
   - Create hosted PostgreSQL instance
   - Set DATABASE_URL in Vercel environment variables

5. **Deploy**
   - Vercel auto-deploys on push to main
   - Or manually deploy via Vercel CLI:
     ```bash
     npm i -g vercel
     vercel
     ```

6. **Run Migrations**
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Option 2: AWS (EC2 + RDS)

#### Setup

1. **Create EC2 Instance**
   ```bash
   # Launch Ubuntu 22.04 LTS t3.medium or larger
   # Create security group allowing HTTP/HTTPS/SSH
   ```

2. **Connect and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   
   # Update system
   sudo apt-get update && sudo apt-get upgrade -y
   
   # Install Node.js
   curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 (process manager)
   sudo npm i -g pm2
   
   # Install Nginx (reverse proxy)
   sudo apt-get install -y nginx
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone <your-repo> /home/ubuntu/equipment-calendar
   cd /home/ubuntu/equipment-calendar
   
   # Install dependencies
   npm ci --omit=dev
   
   # Build
   npm run build
   
   # Setup environment
   cp .env.example .env.local
   # Edit .env.local with production values
   ```

4. **Configure PM2 (Process Manager)**
   ```bash
   pm2 start npm --name "equipment-calendar" -- start
   pm2 startup
   pm2 save
   ```

5. **Setup Nginx**
   ```bash
   sudo nano /etc/nginx/sites-enabled/default
   ```
   
   Replace with:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

7. **Create RDS Database**
   - Use AWS RDS for PostgreSQL 15
   - Multi-AZ for redundancy
   - Set DATABASE_URL

8. **Run Migrations**
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   DATABASE_URL="postgresql://..." npx prisma db seed
   ```

### Option 3: Railway

Simple cloud platform for deploying web apps.

#### Setup

1. **Push to GitHub**
2. **Connect Railway Account**
   - Go to https://railway.app
   - Connect GitHub repo
   
3. **Add PostgreSQL Service**
   - Click "Create Service"
   - Select "PostgreSQL"

4. **Deploy**
   - Railway auto-detects Next.js
   - Configure variables via UI
   - Auto-deploys on push

5. **Run Migrations**
   - Use Railway CLI or SSH to trigger:
   ```bash
   DATABASE_URL="..." npx prisma migrate deploy
   DATABASE_URL="..." npx prisma db seed
   ```

### Option 4: Docker Container Deployment

For self-hosted or Kubernetes deployments.

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
```

#### Build & Deploy

```bash
# Build image
docker build -t equipment-calendar:latest .

# Push to registry
docker tag equipment-calendar:latest myregistry/equipment-calendar:latest
docker push myregistry/equipment-calendar:latest

# Deploy with docker-compose
docker run -d \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -e NEXTAUTH_SECRET="..." \
  -e HUBSPOT_PRIVATE_APP_TOKEN="..." \
  -p 3000:3000 \
  equipment-calendar:latest
```

## Post-Deployment Tasks

### 1. Verify Application

```bash
# Check health endpoint
curl https://yourdomain.com/

# Test login
# Test equipment listing
# Test reservation creation
# Verify HubSpot sync
```

### 2. Setup Monitoring

```bash
# Implement error tracking (Sentry)
npm install @sentry/nextjs

# Add monitoring code to next.config.js
```

### 3. Configure Backups

**Database Backups:**
- AWS RDS: Enable automated backups (daily, 30-day retention)
- Manual backup:
  ```bash
  pg_dump DATABASE_URL > backup.sql
  ```

### 4. Setup Logging

```bash
# Send logs to cloud service (CloudWatch, Datadog, etc.)
# Configure application logging:

// In your Next.js app
console.error('Critical error:', error);
// Will be captured by hosting platform
```

### 5. Security Hardening

- [ ] Enable HTTPS only
- [ ] Set security headers (helmet middleware)
- [ ] Configure CORS appropriately
- [ ] Rate limit API endpoints
- [ ] Regular security updates
- [ ] Use secret scanning

### 6. Performance Optimization

```bash
# Enable image optimization
# Configure CDN for static assets
# Set cache headers appropriately
# Monitor Core Web Vitals
```

## Database Migrations in Production

```bash
# Before deployment
npm run build

# During maintenance window
SAFE_ENV=production npx prisma migrate deploy

# Verify data integrity
npx prisma db execute --stdin < verify.sql
```

## Scaling Considerations

### Horizontal Scaling
- Add multiple app servers behind load balancer
- Use connection pooling (pgBouncer) for database

### Database Scaling
- Read replicas for reporting
- Partitioning for large tables
- Archive old reservations

### Caching
- Redis for session storage
- Cache API responses
- CDN for static content

## Monitoring Commands

```bash
# Check application logs
pm2 logs equipment-calendar

# Check database connections
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Monitor system resources
top
df -h
```

## Troubleshooting

### Application won't start
```bash
pm2 logs equipment-calendar
npm run build
```

### Database connection errors
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check migrations
npx prisma migrate status
```

### HubSpot sync not working
- Verify API token is valid
- Check HubSpot app has required scopes
- Review application logs for errors

## Rollback Plan

```bash
# Previous version from git
git revert <commit-hash>
git push

# Revert database migration
npx prisma migrate resolve --rolled-back <migration-name>

# Or restore from backup
pg_restore -d dbname backup.sql
```

## Performance Targets

- Page Load Time: < 2s
- API Response Time: < 200ms
- Database Query: < 100ms
- Uptime: 99.9%

## Maintenance Schedule

- **Daily**: Check error logs, monitor uptime
- **Weekly**: Review performance metrics
- **Monthly**: Security updates, backups verification
- **Quarterly**: Load testing, capacity planning
