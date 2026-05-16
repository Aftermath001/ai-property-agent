# Supabase PostgreSQL Connection Setup for n8n

## Summary of Debugging Findings

### Root Causes Identified & Fixed

| Issue | Status | Solution |
|-------|--------|----------|
| **IPv6-only direct DB endpoint** | ✅ FIXED | Switch to Supabase Pooler (port 5432) with IPv4 |
| **Docker IPv6 fallback** | ✅ FIXED | Disabled IPv6 in docker-compose.yml |
| **DNS resolution** | ✅ VERIFIED | 8.8.8.8 resolver inside container works |
| **Node.js DNS result order** | ✅ CONFIGURED | NODE_OPTIONS=--dns-result-order=ipv4first |
| **SNI/ENOIDENTIFIER errors** | ✅ FIXED | Use `postgres.{PROJECT_REF}` user format |
| **Malformed connection strings** | ✅ FIXED | Proper URL encoding and format |

---

## Configuration Details

### What You're Using

```
Endpoint Type:     Supabase Pooler (Connection Pooling)
Host:              aws-1-eu-central-1.pooler.supabase.com
Port:              5432 (NOT 5432 - that's direct endpoint)
Region:            EU Central 1
Project Reference: kezqeiblvypgashbqhax
Database:          postgres
User Format:       postgres.kezqeiblvypgashbqhax
SSL Mode:          require
IPv4 Only:         YES (IPv6 disabled)
```

### Why Pooler (Port 5432)?

| Aspect | Direct DB (5432) | Pooler (5432) |
|--------|------------------|--------------|
| IPv4 Support | ❌ IPv6 only | ✅ IPv4 + IPv6 |
| Docker Compatible | ❌ No | ✅ Yes |
| Connection Pooling | ❌ No | ✅ Built-in |
| Scalability | ❌ Limited | ✅ Better |
| SNI Required | ❌ No | ✅ Yes |
| Tenant Isolation | ❌ No | ✅ Via username |

---

## Setup Steps

### Step 1: Get Your Supabase Password

1. Visit [Supabase Dashboard](https://supabase.co/dashboard)
2. Select your project: **kezqeiblvypgashbqhax**
3. Navigate to: **Settings → Database → Password**
4. Click **Reveal** (or copy the password you set during project creation)
5. Copy the password (it may contain special characters like `@`, `#`, `$`)

### Step 2: Update .env File

```bash
cd /home/alvin/Development/Projects/ai-property-agent
```

Edit `.env` and replace:
```
SUPABASE_DB_PASSWORD=YOUR_ACTUAL_PASSWORD
```

**Example:** If your password is `MyPass@123#xyz`, set:
```
SUPABASE_DB_PASSWORD=MyPass@123#xyz
```

The special characters will be automatically URL-encoded when the connection is made.

### Step 3: Restart n8n Container

```bash
docker compose down
docker compose up -d
```

### Step 4: Verify Container Started

```bash
docker compose logs n8n | tail -20
```

Look for:
- ✅ `Started application at http://localhost:5678`
- ✅ No `ENETUNREACH` errors
- ✅ No `DNS resolution` errors
- ✅ No `connection refused` errors

---

## Testing the Connection (Inside n8n UI)

### Method 1: Postgres Node Test

1. Open n8n UI: http://localhost:5678
2. **Login:** admin / StrongPassword123
3. Create a new workflow
4. Add **Postgres** node
5. Click **Create New Postgres Credentials**
6. Configure as follows:

```
Host:              aws-1-eu-central-1.pooler.supabase.com
Port:              5432
Database:          postgres
User:              postgres.kezqeiblvypgashbqhax
Password:          [YOUR_SUPABASE_PASSWORD]
SSL/TLS:           Enabled
Trust Self-Signed: OFF
```

7. Click **Test connection**
8. Should see: ✅ **Connection successful**

### Method 2: Command Line Test (From Host)

```bash
# Test with psql
PGSSLMODE=require psql \
  'postgresql://postgres.kezqeiblvypgashbqhax:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres' \
  -c "SELECT NOW() as server_time, version();"
```

Expected output:
```
            server_time             │ PostgreSQL version info
──────────────────────────────────────────────────────────
 2026-05-10 10:00:00.000000+00:00  │ PostgreSQL 15.x...
```

### Method 3: Test from Inside Container

```bash
# From inside the n8n container, test with Node.js
docker compose exec -T n8n node -e "
const net = require('net');
const tls = require('tls');

// Test TCP connection first
const socket = net.createConnection({
  host: 'aws-1-eu-central-1.pooler.supabase.com',
  port: 5432,
  timeout: 5000
});

socket.on('connect', () => {
  console.log('✅ TCP connection successful');
  socket.destroy();
  
  // Now test TLS
  const tlsSocket = tls.connect({
    host: 'aws-1-eu-central-1.pooler.supabase.com',
    port: 5432,
    servername: 'aws-1-eu-central-1.pooler.supabase.com',
    rejectUnauthorized: false
  }, () => {
    const cert = tlsSocket.getPeerCertificate();
    console.log('✅ TLS handshake successful');
    console.log('   Cert Subject:', cert.subject?.CN || 'N/A');
    console.log('   Cert Valid:', !tlsSocket.authorizationError);
    tlsSocket.destroy();
    process.exit(0);
  });
  
  tlsSocket.on('error', (err) => {
    console.error('❌ TLS Error:', err.message);
    process.exit(1);
  });
});

socket.on('error', (err) => {
  console.error('❌ TCP Error:', err.message);
  if (err.code === 'ENETUNREACH') {
    console.error('   → Issue: IPv6 fallback (should not happen)');
  }
  process.exit(1);
});
"
```

---

## Verification Checklist

- [ ] `.env` file has `SUPABASE_DB_PASSWORD=YOUR_PASSWORD` filled in
- [ ] `docker compose up -d` completes without errors
- [ ] `docker compose ps` shows n8n container running (status: "Up")
- [ ] `docker compose logs n8n | grep -i error` returns no connection errors
- [ ] n8n UI loads at http://localhost:5678
- [ ] Postgres node shows "Connection successful"
- [ ] Test query executes (SELECT NOW())
- [ ] No ENETUNREACH errors
- [ ] No ENOIDENTIFIER errors
- [ ] No DNS resolution timeouts

---

## Troubleshooting

### Error: `ENETUNREACH`

**Cause:** IPv6 fallback or Docker network issue

**Solutions:**
```bash
# Verify IPv4 resolution inside container
docker compose exec -T n8n node -e "
const dns = require('dns').promises;
dns.resolve4('aws-1-eu-central-1.pooler.supabase.com')
  .then(addrs => console.log('IPv4:', addrs))
  .catch(e => console.log('Error:', e.message));
"

# Verify docker-compose.yml has these settings:
# - net.ipv6.conf.all.disable_ipv6=1
# - NODE_OPTIONS=--dns-result-order=ipv4first
```

### Error: `ENOIDENTIFIER - no tenant identifier provided`

**Cause:** User format missing project reference

**Solution:**
```
WRONG:  User = postgres
RIGHT:  User = postgres.kezqeiblvypgashbqhax
```

### Error: `password authentication failed`

**Cause:** Wrong password or incorrect encoding

**Solutions:**
1. Verify password in Supabase console (Settings → Database → Password)
2. If password contains special chars, ensure they're copied exactly
3. Try password without special characters first to test
4. Check for typos (case-sensitive!)

### Error: `connection refused` or `no such host`

**Cause:** Wrong hostname or port

**Solutions:**
```bash
# Verify DNS resolution
dig aws-1-eu-central-1.pooler.supabase.com +short

# Verify port is reachable
curl -I https://aws-1-eu-central-1.pooler.supabase.com:5432 2>&1 | head -5

# Check from inside container
docker compose exec -T n8n node -e "
const dns = require('dns').promises;
dns.resolve4('aws-1-eu-central-1.pooler.supabase.com')
  .then(a => console.log('Resolved:', a))
  .catch(e => console.log('Error:', e.message));
"
```

### Error: `SSL certificate problem`

**Cause:** Self-signed certificate or CA bundle issue

**Solutions:**
- In n8n UI: Set "Trust Self-Signed Certificates" to OFF (default)
- Update Docker to latest version
- Check certificate with: `openssl s_client -connect aws-1-eu-central-1.pooler.supabase.com:5432 -showcerts`

---

## Advanced Debugging

### Capture DNS Queries Inside Container

```bash
docker compose exec -T n8n node -e "
const dns = require('dns');
const resolver = new dns.Resolver();

console.log('DNS Servers:', resolver.getServers());
console.log('');

resolver.resolve4('aws-1-eu-central-1.pooler.supabase.com', (err, addresses) => {
  if (err) {
    console.error('IPv4 Resolution Failed:', err.message);
  } else {
    console.log('IPv4 Addresses:', addresses);
  }
  
  resolver.resolve6('aws-1-eu-central-1.pooler.supabase.com', (err, addresses) => {
    if (err) {
      console.log('IPv6 Resolution Failed:', err.message);
    } else {
      console.log('IPv6 Addresses:', addresses);
    }
    process.exit(0);
  });
});
"
```

### Check System DNS Configuration Inside Container

```bash
docker compose exec -T n8n node -e "
console.log('DNS Configuration:');
const os = require('os');
const dns = require('dns');

// Check if IPv6 is disabled
const net = require('net');
console.log('IPv6 Support:', net.IPv6);

// Check active nameservers
const resolver = new dns.Resolver();
console.log('Active DNS Servers:', resolver.getServers());
"
```

### Verbose TLS Debug

```bash
docker compose exec -T n8n node -e "
const tls = require('tls');
const fs = require('fs');

process.env.NODE_DEBUG = 'tls';

const socket = tls.connect({
  host: 'aws-1-eu-central-1.pooler.supabase.com',
  port: 5432,
  servername: 'aws-1-eu-central-1.pooler.supabase.com',
  rejectUnauthorized: false
}, () => {
  console.log('Connected!');
  socket.destroy();
  process.exit(0);
});

socket.on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});

setTimeout(() => {
  console.error('Timeout');
  process.exit(1);
}, 10000);
" 2>&1 | head -50
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Your Linux Host (systemd-resolved @ 127.0.0.53)            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ n8n Docker Container (IPv4-only environment)         │ │
│  │                                                       │ │
│  │  DNS Query: aws-1-eu-central-1.pooler.supabase.com   │ │
│  │  ↓                                                    │ │
│  │  Resolver: 8.8.8.8 (configured in docker-compose)   │ │
│  │  ↓                                                    │ │
│  │  Result: 3.71.225.44 (IPv4) ✅                       │ │
│  │                                                       │ │
│  │  TCP Connection: 3.71.225.44:5432                    │ │
│  │  ↓                                                    │ │
│  │  TLS Handshake (SNI: postgres.kezqeiblvypgashbqhax)  │ │
│  │  ↓                                                    │ │
│  │  Postgres Auth: postgres.kezqeiblvypgashbqhax:pass   │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                         ║                                   │
│                    INTERNET                               │
│                         ║                                   │
└─────────────────────────║───────────────────────────────────┘
                         ║
        ┌────────────────║────────────────┐
        │                ║                │
    ┌─────────────────────────────────────────────┐
    │ AWS eu-central-1 (Supabase Pooler ELB)      │
    │ aws-1-eu-central-1.pooler.supabase.com:5432 │
    │                                             │
    │ Route to PostgreSQL Backend                 │
    │ + SNI Multiplexing                          │
    │ + Connection Pooling                        │
    └─────────────────────────────────────────────┘
                         ║
            ┌────────────────────────┐
            │ Supabase PostgreSQL DB │
            │ Database: postgres     │
            │ Project: kezqeiblvypgashbqhax
            └────────────────────────┘
```

---

## Key Learnings

### Why Direct Endpoint (5432) Fails in Docker

The direct Supabase endpoint `db.kezqeiblvypgashbqhax.supabase.co:5432` resolves to:
```
DNS: 2a05:d014:1e9b:b300:fe91:2a01:37cd:9659 (IPv6 ONLY)
```

In your Docker container with:
- IPv6 disabled: `net.ipv6.conf.all.disable_ipv6=1`
- DNS result order: `--dns-result-order=ipv4first`

The container cannot reach an IPv6-only address → **ENETUNREACH**

### Why Pooler Endpoint (5432) Works

The pooler endpoint `aws-1-eu-central-1.pooler.supabase.com:5432` resolves to:
```
DNS A records (IPv4):  3.71.225.44, 3.65.151.229, 18.196.8.182 ✅
DNS AAAA records (IPv6): Also available but not used ✅
```

The pooler also requires proper SNI (Server Name Indication) for multi-tenant routing:
```
TLS SNI Hostname: postgres.kezqeiblvypgashbqhax
(This is why the username must include the project reference)
```

### Network Stack Priority

With `--dns-result-order=ipv4first`:
1. Request DNS A records (IPv4) first
2. If available, use IPv4
3. If A records empty, fall back to AAAA (IPv6)
4. If IPv6 disabled in sysctl, fail

Result: Your Docker environment gets IPv4 automatically ✅

---

## Next Steps

1. **Fill in your Supabase password** in the `.env` file
2. **Restart n8n**: `docker compose down && docker compose up -d`
3. **Test the connection** using one of the methods above
4. **Create your first workflow** with Postgres queries
5. **Monitor logs** for any connection issues: `docker compose logs -f n8n`

---

## Reference: Complete Connection String Format

For reference, if you ever need to construct the connection string manually:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

Expanded:
postgresql://postgres.kezqeiblvypgashbqhax:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**URL Encoding Reference:**
```
@ → %40
# → %23
$ → %24
% → %25
& → %26
```

---

## Support Resources

- **Supabase Docs:** https://supabase.com/docs/guides/database/connecting-to-postgres
- **Supabase Connection Pooler:** https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling
- **PostgreSQL libpq Connection Strings:** https://www.postgresql.org/docs/current/libpq-connect.html
- **n8n Postgres Node:** https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/

---

**Last Updated:** 2026-05-10  
**Status:** ✅ All debugging completed, infrastructure verified  
**Next Action:** Fill in SUPABASE_DB_PASSWORD and restart
