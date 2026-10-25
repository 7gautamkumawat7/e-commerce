import autocannon from 'autocannon';
import http from 'http';
import { createApp } from '../../src/app.js';
import { initDb, closeDb } from '../../src/db/connection.js';
import { seedDatabase } from '../../src/db/seed.js';

async function runBenchmarks() {
  process.env.USE_EMBEDDED_POSTGRES = 'true';
  await initDb();
  await seedDatabase();

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5099, () => resolve());
  });

  console.log('\n======================================================');
  console.log('⚡ STARTING REAL AUTOCANNON BENCHMARK LOAD TESTS');
  console.log('Target: http://127.0.0.1:5099');
  console.log('======================================================\n');

  try {
    // Benchmark 1: Liveness Health Probe
    console.log('📊 Benchmark 1: GET /health (10 connections, 5 seconds)...');
    const healthResult = await autocannon({
      url: 'http://127.0.0.1:5099/health',
      connections: 10,
      duration: 5
    });

    console.log('\n--- GET /health Results ---');
    console.log(`Req/Sec (Avg):   ${healthResult.requests.average.toFixed(1)}`);
    console.log(`Latency (p50):   ${healthResult.latency.p50} ms`);
    console.log(`Latency (p95):   ${healthResult.latency.p97_5 || healthResult.latency.p99} ms`);
    console.log(`Latency (p99):   ${healthResult.latency.p99} ms`);
    console.log(`Total Requests:  ${healthResult.requests.total}`);
    console.log(`Error Rate:      ${((healthResult.errors / (healthResult.requests.total || 1)) * 100).toFixed(2)}%`);

    // Benchmark 2: Product Catalog (Database Query + Serialization)
    console.log('\n📊 Benchmark 2: GET /api/products (10 connections, 5 seconds)...');
    const productResult = await autocannon({
      url: 'http://127.0.0.1:5099/api/products',
      connections: 10,
      duration: 5
    });

    console.log('\n--- GET /api/products Results ---');
    console.log(`Req/Sec (Avg):   ${productResult.requests.average.toFixed(1)}`);
    console.log(`Latency (p50):   ${productResult.latency.p50} ms`);
    console.log(`Latency (p95):   ${productResult.latency.p97_5 || productResult.latency.p99} ms`);
    console.log(`Latency (p99):   ${productResult.latency.p99} ms`);
    console.log(`Total Requests:  ${productResult.requests.total}`);
    console.log(`Error Rate:      ${((productResult.errors / (productResult.requests.total || 1)) * 100).toFixed(2)}%`);

    console.log('\n======================================================');
    console.log('✅ BENCHMARKS COMPLETED SUCCESSFULLY');
    console.log('======================================================\n');
  } finally {
    server.close();
    await closeDb();
  }
}

runBenchmarks().catch(console.error);
