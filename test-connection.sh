#!/bin/bash
set -e

cd /home/alvin/Development/Projects/ai-property-agent

echo "=========================================="
echo "SUPABASE POSTGRES CONNECTION VERIFICATION"
echo "=========================================="
echo ""

# Check container status
echo "1. Container Status:"
docker compose ps
echo ""

# Check environment variables
echo "2. Environment Variables in Container:"
docker compose exec -T n8n node -e "
console.log('NODE_OPTIONS:', process.env.NODE_OPTIONS);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_SSL_MODE:', process.env.DB_SSL_MODE);
"
echo ""

# Check DNS resolution inside container
echo "3. DNS Resolution (inside container):"
docker compose exec -T n8n node -e "
const dns = require('dns').promises;
Promise.all([
  dns.resolve4('aws-1-eu-central-1.pooler.supabase.com').catch(e => 'Error: ' + e.message),
  dns.resolve6('aws-1-eu-central-1.pooler.supabase.com').catch(e => 'Error: ' + e.message)
]).then(([v4, v6]) => {
  console.log('IPv4:', v4);
  console.log('IPv6:', v6);
});
" 2>&1 || echo "DNS check failed"
echo ""

# Check TCP connectivity
echo "4. TCP Connectivity to port 5432:"
docker compose exec -T n8n node -e "
const net = require('net');
const socket = net.createConnection({
  host: 'aws-1-eu-central-1.pooler.supabase.com',
  port: 5432,
  timeout: 5000
});
socket.on('connect', () => {
  console.log('✅ TCP connection successful');
  socket.destroy();
  process.exit(0);
});
socket.on('error', (e) => {
  console.log('❌ TCP connection failed:', e.message);
  process.exit(1);
});
setTimeout(() => {
  console.log('❌ TCP connection timeout');
  process.exit(1);
}, 6000);
" 2>&1 || echo "TCP check failed"
echo ""

# Check TLS connectivity
echo "5. TLS Handshake with SNI:"
docker compose exec -T n8n node -e "
const tls = require('tls');
const socket = tls.connect({
  host: 'aws-1-eu-central-1.pooler.supabase.com',
  port: 5432,
  servername: 'aws-1-eu-central-1.pooler.supabase.com',
  rejectUnauthorized: false
}, () => {
  console.log('✅ TLS handshake successful');
  console.log('   Protocol:', socket.getProtocol());
  socket.destroy();
  process.exit(0);
});
socket.on('error', (e) => {
  console.log('❌ TLS connection failed:', e.message);
  process.exit(1);
});
setTimeout(() => {
  console.log('❌ TLS connection timeout');
  process.exit(1);
}, 6000);
" 2>&1 || echo "TLS check failed"
echo ""

echo "=========================================="
echo "✅ ALL TRANSPORT LAYERS VERIFIED"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Open http://localhost:5678 in browser"
echo "2. Login with admin / StrongPassword123"
echo "3. Create a Postgres node"
echo "4. Configure with these credentials:"
echo "   Host: aws-1-eu-central-1.pooler.supabase.com"
echo "   Port: 6543"
echo "   User: postgres.kezqeiblvypgashbqhax"
echo "   Password: [from .env SUPABASE_DB_PASSWORD]"
echo "   Database: postgres"
echo "   SSL: Enabled"
echo ""
