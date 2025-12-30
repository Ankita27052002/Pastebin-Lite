#!/usr/bin/env node

// Simple test script to verify API endpoints
import fetch from 'node-fetch';

const BASE_URL = process.env.BASE_URL;

if (!BASE_URL) {
  console.error('❌ BASE_URL environment variable is required');
  process.exit(1);
}

async function runTests() {
  console.log('🧪 Starting API tests...\n');

  try {
    // Test 1: Health check
    console.log('Test 1: Health check');
    const healthRes = await fetch(`${BASE_URL}/api/healthz`);
    const healthData = await healthRes.json();
    console.log('✓ Health check:', healthData);
    console.log('');

    // Test 2: Create a paste
    console.log('Test 2: Create a paste');
    const createRes = await fetch(`${BASE_URL}/api/pastes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Hello, this is a test paste!',
        ttl_seconds: 300,
        max_views: 3
      })
    });
    const createData = await createRes.json();
    console.log('✓ Created paste:', createData);
    console.log('');

    // Test 3: Fetch the paste
    console.log('Test 3: Fetch the paste');
    const fetchRes = await fetch(`${BASE_URL}/api/pastes/${createData.id}`);
    const fetchData = await fetchRes.json();
    console.log('✓ Fetched paste:', fetchData);
    console.log('');

    // Test 4: Create paste with invalid data
    console.log('Test 4: Create paste with invalid data');
    const invalidRes = await fetch(`${BASE_URL}/api/pastes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '',
        ttl_seconds: -1
      })
    });
    const invalidData = await invalidRes.json();
    console.log('✓ Invalid paste error:', invalidData);
    console.log('');

    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
