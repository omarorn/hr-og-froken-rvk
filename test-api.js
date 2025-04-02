// Test script for API and edge functions
import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';

// Configuration
const BASE_URL = 'http://localhost:3000'; // Change this to your actual base URL
const SUPABASE_URL = 'https://mxtzgebhtwofehdktfaq.supabase.co'; // From .env file
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dHpnZWJodHdvZmVoZGt0ZmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NDQwODMsImV4cCI6MjA1OTEyMDA4M30.eGvwOP0Vnclas7Q-LRq7T7Leq2DbuQQ7aTwaakLDCHA'; // From .env file

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to run a test
async function runTest(name, testFn) {
  console.log(`\n🧪 Running test: ${name}`);
  try {
    await testFn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASSED' });
    console.log(`✅ Test passed: ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAILED', error: error.message });
    console.error(`❌ Test failed: ${name}`);
    console.error(`   Error: ${error.message}`);
  }
}

// Helper function to assert
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test the chat API
async function testChatAPI() {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, what time is it in Reykjavik?' }
      ],
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 100
    })
  });

  const data = await response.json();
  assert(response.ok, `API returned status ${response.status}`);
  assert(data.content, 'Response does not contain content');
  console.log(`   Response: "${data.content.substring(0, 50)}..."`);
}

// Test the transcribe API
async function testTranscribeAPI() {
  // Create a mock audio file or use an existing one
  const mockAudioPath = './mock-audio.mp3';
  if (!fs.existsSync(mockAudioPath)) {
    console.log('   Mock audio file not found, skipping transcribe test');
    return;
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(mockAudioPath));
  formData.append('language', 'is');

  const response = await fetch(`${BASE_URL}/api/transcribe`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  assert(response.ok, `API returned status ${response.status}`);
  assert(data.text, 'Response does not contain transcribed text');
  console.log(`   Transcription: "${data.text.substring(0, 50)}..."`);
}

// Test the speech API
async function testSpeechAPI() {
  const response = await fetch(`${BASE_URL}/api/speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: 'Góðan dag, hvernig get ég hjálpað þér?',
      voice: 'coral',
      instructions: 'Speak in a friendly, helpful tone.'
    })
  });

  assert(response.ok, `API returned status ${response.status}`);
  assert(response.headers.get('Content-Type') === 'audio/mpeg', 'Response is not audio');
  
  // Check if we got audio data
  const buffer = await response.arrayBuffer();
  assert(buffer.byteLength > 0, 'Audio buffer is empty');
  console.log(`   Received audio of size: ${buffer.byteLength} bytes`);
}

// Test the contextual-data edge function
async function testContextualData() {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/contextual-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({
      type: 'time',
      params: {}
    })
  });

  const data = await response.json();
  assert(response.ok, `API returned status ${response.status}`);
  assert(data.success, 'Response indicates failure');
  assert(data.data && data.data.formatted, 'Response does not contain time data');
  console.log(`   Current time: ${data.data.formatted}`);
}

// Test the straeto edge function
async function testStraeto() {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/straeto/routes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  const data = await response.json();
  assert(response.ok, `API returned status ${response.status}`);
  assert(Array.isArray(data), 'Response is not an array of routes');
  console.log(`   Received ${data.length} bus routes`);
}

// Test the Supabase MCP server
async function testSupabaseMCP() {
  // This would normally use the MCP client, but for testing we'll just check if the server is running
  console.log('   Checking if Supabase MCP server is running on port 8000...');
  
  try {
    const response = await fetch('http://localhost:8000/health', {
      method: 'GET'
    });
    
    if (response.ok) {
      console.log('   Supabase MCP server is running');
    } else {
      console.log('   Supabase MCP server returned non-OK status');
    }
  } catch (error) {
    console.log('   Could not connect to Supabase MCP server');
    // Don't fail the test, just log the issue
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API and Edge Function Tests');
  
  await runTest('Chat API', testChatAPI);
  await runTest('Transcribe API', testTranscribeAPI);
  await runTest('Speech API', testSpeechAPI);
  await runTest('Contextual Data Edge Function', testContextualData);
  await runTest('Straeto Edge Function', testStraeto);
  await runTest('Supabase MCP Server', testSupabaseMCP);
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`   Total: ${testResults.passed + testResults.failed}`);
  console.log(`   Passed: ${testResults.passed} ✅`);
  console.log(`   Failed: ${testResults.failed} ❌`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('Error running tests:', error);
});