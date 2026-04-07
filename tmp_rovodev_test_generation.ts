
/**
 * Arkan Generation Endpoint Tester
 * Use this script to verify the standard and RAG generation endpoints on your local server.
 * 
 * Usage:
 * 1. Set your AUTH_TOKEN and PROJECT_ID.
 * 2. Run: npx ts-node tmp_rovodev_test_generation.ts
 */

const PROJECT_ID = '0ebe43e3-3e4b-4cbc-9ca9-c78db032d314';
const BASE_URL = 'http://localhost:9002';
let AUTH_TOKEN = '';

async function login() {
  console.log('--- Logging in ---');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@arkan.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    if (response.status !== 200) {
        throw new Error(`Login failed: ${JSON.stringify(data)}`);
    }

    // In Next.js App Router, the token might be in the cookie header or returned in data
    // For this test, we expect the controller to return a token or we extract from cookies
    // Note: If using cookies, we need to pass them in subsequent requests.
    // For simplicity, let's assume the session is handled via the __session cookie if we're on the same domain
    // Or we manually extract the token if provided.
    
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
        const match = setCookie.match(/__session=([^;]+)/);
        if (match) {
            AUTH_TOKEN = match[1];
            console.log('Login successful, token acquired.');
            return;
        }
    }
    
    console.log('Login response received, but __session cookie not found. Check server response.');
  } catch (error: any) {
    console.error('Login Error:', error.message);
  }
}

async function testEndpoint(endpoint: string, payload: any) {
  console.log(`\n--- Testing ${endpoint} ---`);
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Cookie': `__session=${AUTH_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response Summary:', typeof data === 'string' ? data.substring(0, 100) : JSON.stringify(data).substring(0, 150) + '...');
  } catch (error: any) {
    console.error(`Error testing ${endpoint}:`, error.message);
  }
}

async function runTests() {
  await login();
  
  if (!AUTH_TOKEN) {
    console.error('Error: Authentication failed. Cannot proceed with tests.');
    return;
  }

  // 1. Test Standard Section Generation
  await testEndpoint('/api/generate/section', {
    projectId: PROJECT_ID,
    sectionToGenerate: 'Introduction',
    prompt: 'Write a brief introduction about Artificial Intelligence.',
    guidelines: ['Use academic tone', 'Keep it under 200 words']
  });

  // 2. Test RAG-enhanced Section Generation
  await testEndpoint('/api/generate/section-rag', {
    projectId: PROJECT_ID,
    sectionToGenerate: 'Introduction',
    prompt: 'Synthesize a section about AI based on the attached project sources.',
    guidelines: ['Cite sources where appropriate']
  });

  // 3. Test Standard Chapter Generation
  await testEndpoint('/api/generate/chapter', {
    projectId: PROJECT_ID,
    chapterTitle: 'Future of AI',
    sectionInstructions: [
      {
        title: 'Neural Networks',
        prompt: 'Explain the concept of neural networks.',
        guidelines: [],
        instructionText: 'Standard instruction',
        context: ''
      }
    ]
  });

  // 4. Test RAG-enhanced Chapter Generation
  await testEndpoint('/api/generate/chapter-rag', {
    projectId: PROJECT_ID,
    chapterTitle: 'RAG Chapter Test',
    sectionInstructions: [
      {
        title: 'Neural Networks with RAG',
        prompt: 'Explain neural networks using project sources.',
        guidelines: [],
        instructionText: 'RAG instruction',
        context: ''
      }
    ]
  });
}

runTests();
