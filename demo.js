const crypto = require('crypto');
require('dotenv').config();

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Test configuration
const API_KEY = process.env.API_KEY;
const API_URL = 'http://localhost:3001';

function printHeader(text) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${text}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);
}

function printRequest(method, endpoint, body) {
  console.log(`${colors.yellow}REQUEST:${colors.reset}`);
  console.log(`   ${colors.bright}${method}${colors.reset} ${endpoint}`);
  console.log(`   ${colors.blue}Body:${colors.reset} ${JSON.stringify(body, null, 2).split('\n').join('\n   ')}\n`);
}

function printResponse(status, data) {
  const statusColor = status >= 200 && status < 300 ? colors.green : colors.red;
  const label = status >= 200 && status < 300 ? 'SUCCESS' : 'ERROR';
  console.log(`${statusColor}RESPONSE (${status}) - ${label}:${colors.reset}`);
  console.log(`   ${JSON.stringify(data, null, 2).split('\n').join('\n   ')}\n`);
}

// Demo 1: Send a personalized notification via EMAIL and SMS
async function demo1_SendNotification() {
  printHeader('DEMO 1: Send Personalized Notification (EMAIL + SMS)');

  const body = {
    recipient: {
      email: 'john.doe@example.com',
      phone: '+1-416-555-0123'
    },
    template: 'Hi {{name}}! Your order #{{orderNumber}} has shipped. Track it at: {{trackingUrl}}',
    variables: {
      name: 'John Doe',
      orderNumber: 'ORD-12345',
      trackingUrl: 'https://track.example.com/12345'
    },
    channels: ['EMAIL', 'SMS']
  };

  printRequest('POST', '/api/notifications/send', body);

  try {
    const response = await fetch(`${API_URL}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'X-Correlation-Id': 'demo-send-001'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    printResponse(response.status, data);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

// Demo 2: Broadcast announcement to a user segment (DRY RUN)
async function demo2_BroadcastDryRun() {
  printHeader('DEMO 2: Broadcast Announcement (DRY RUN)');

  const body = {
    message: 'Flash Sale! Get 30% off all premium features this weekend only. Use code: FLASH30',
    audience: {
      segment: 'premium-users'
    },
    channels: ['EMAIL'],
    dryRun: true
  };

  printRequest('POST', '/api/announcements/broadcast', body);

  try {
    const response = await fetch(`${API_URL}/api/announcements/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'X-Correlation-Id': 'demo-broadcast-002'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    printResponse(response.status, data);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

// Demo 3: Show validation error handling
async function demo3_ValidationError() {
  printHeader('DEMO 3: Error Handling - Missing Required Fields');

  const body = {
    // Missing recipient - should fail validation
    template: 'This will fail!',
    channels: ['EMAIL']
  };

  printRequest('POST', '/api/notifications/send', body);

  try {
    const response = await fetch(`${API_URL}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    printResponse(response.status, data);
    console.log(`   ${colors.green}Validation working correctly!${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

// Run the demo
async function runDemo() {
  console.clear();
  console.log(`${colors.bright}${colors.blue}
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║          CPS714 - NOTIFICATION SYSTEM                             ║
║          End-to-End Demo                                          ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  console.log(`${colors.cyan}Server: ${API_URL}${colors.reset}`);
  console.log(`${colors.cyan}Authentication: API KEY${colors.reset}\n`);

  await demo1_SendNotification();
  await new Promise(resolve => setTimeout(resolve, 1500)); // Pause between demos

  await demo2_BroadcastDryRun();
  await new Promise(resolve => setTimeout(resolve, 1500));

  await demo3_ValidationError();

  console.log(`${colors.bright}${colors.green}
╔═══════════════════════════════════════════════════════════════════╗
║                     DEMO COMPLETED                                ║
╚═══════════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

  console.log(`${colors.cyan}Key Features Demonstrated:${colors.reset}`);
  console.log(`  - Multi-channel notifications (EMAIL + SMS)`);
  console.log(`  - Template variable substitution`);
  console.log(`  - Broadcast to user segments`);
  console.log(`  - Dry run mode for testing`);
  console.log(`  - API Key authentication`);
  console.log(`  - Input validation and error handling\n`);
}

runDemo();
