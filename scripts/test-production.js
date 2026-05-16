#!/usr/bin/env node

/**
 * RecyclePay - Production Test Script
 * 
 * This script tests the deployed RecyclePay application on Vercel.
 * It simulates the Raspberry Pi behavior against the production API.
 * 
 * Usage: node scripts/test-production.js [bin_id] [success_rate]
 * Example: node scripts/test-production.js 001        (always accept)
 * Example: node scripts/test-production.js 001 0.7    (70% success rate)
 * Example: node scripts/test-production.js 001 0      (always reject)
 */

// Load environment variables from .ENV
require('dotenv').config({ path: '.ENV' });

const https = require('https');

// Configuration
const BIN_ID = process.argv[2] || '001';
const SUCCESS_RATE = parseFloat(process.argv[3] ?? 1.0); // Default 100% success
const API_URL = 'https://aliens-squad.vercel.app';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const POLL_INTERVAL = 2000; // 2 seconds
const VERIFICATION_DELAY = 3000; // 3 seconds to "verify" bottle

console.log('🤖 RecyclePay Production Test Script');
console.log('=====================================');
console.log(`📍 Monitoring Bin: ${BIN_ID}`);
console.log(`🔗 API URL: ${API_URL}`);
console.log(`🎯 Success Rate: ${(SUCCESS_RATE * 100).toFixed(0)}%`);
console.log(`⏱️  Polling every ${POLL_INTERVAL / 1000}s\n`);

// Check for active session with status='waiting' only
async function checkForSession() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/active_sessions?bin_id=eq.${BIN_ID}&status=eq.waiting&select=*`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });

    const sessions = await response.json();
    return sessions.length > 0 ? sessions[0] : null;
  } catch (error) {
    console.error('❌ Error checking session:', error.message);
    return null;
  }
}

// Simulate bottle verification
async function verifyBottle(binId) {
  console.log('📸 Capturing image...');
  await sleep(1000);
  
  console.log('🤖 Sending to Gemini AI for verification...');
  await sleep(VERIFICATION_DELAY);
  
  // Simulate AI verification based on SUCCESS_RATE
  const isValid = Math.random() < SUCCESS_RATE;
  console.log(isValid ? '✅ Bottle verified!' : '❌ Invalid item detected');
  
  return isValid;
}

// Notify backend of recycling result (success or failure)
async function notifyResult(binId, success) {
  try {
    if (success) {
      console.log('💰 Processing reward...');
    } else {
      console.log('🚫 Processing rejection...');
    }
    
    const response = await fetch(`${API_URL}/api/recycle-success`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bin_id: binId, success }),
    });

    const result = await response.json();
    
    if (response.ok) {
      if (success) {
        console.log(`🎉 Success! ₦${result.data.amount} credited to ${result.data.user_phone}`);
        console.log(`💵 New balance: ₦${result.data.new_balance}\n`);
      } else {
        console.log(`❌ Item rejected for user ${result.data.user_phone}\n`);
      }
      return true;
    } else {
      console.error('❌ Failed to process result:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error notifying backend:', error.message);
    return false;
  }
}

// Helper function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main loop
async function mainLoop() {
  console.log(`🟢 Bin ${BIN_ID} is IDLE. Waiting for user...\n`);
  
  let wasActive = false;

  while (true) {
    const session = await checkForSession();
    
    if (session && !wasActive) {
      wasActive = true;
      console.log(`\n✅ User ${session.user_phone} checked in!`);
      console.log('🚪 Opening door...');
      console.log('📹 Camera activated');
      console.log('⏳ Waiting for bottle...\n');
      
      // Simulate user inserting bottle after a delay
      await sleep(2000);
      
      console.log('🔔 Item detected!');
      const isValid = await verifyBottle(BIN_ID);
      
      console.log('🚪 Closing door...');
      await notifyResult(BIN_ID, isValid);
      console.log(`🟢 Bin ${BIN_ID} is IDLE again\n`);
      wasActive = false;
    } else if (!session && wasActive) {
      // Session was deleted externally
      wasActive = false;
      console.log('⚠️  Session ended');
      console.log(`🟢 Bin ${BIN_ID} is IDLE again\n`);
    }
    
    await sleep(POLL_INTERVAL);
  }
}

// Start the simulator
mainLoop().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
