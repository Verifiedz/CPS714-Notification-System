# Notification System - User Guide

## Overview

The Notification System is a multi-channel communication service that sends notifications via EMAIL and SMS. It supports both individual notifications and broadcast announcements to user segments.

**Key Features:**
- Multi-channel delivery (EMAIL, SMS, or both)
- Template-based messages with variable substitution
- Broadcast to user segments with dry run preview
- API Key authentication
- Comprehensive error handling and validation

---

## Quick Start

### 1. Installation

```bash
# Install dependencies
npm install

# Set up environment variables (copy and edit)
cp .env.example .env

# Run tests to verify setup
npm test

# Start the server
npm run dev
```

### 2. Configuration

Create a `.env` file with your credentials:

```env
# Authentication
API_KEY=your-api-key-here

# Email Provider (Sendgrid)
SENDGRID_API_KEY=your-sendgrid-key

# SMS Provider (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+1234567890

# Member Directory
MEMBER_DIRECTORY_URL=http://your-member-directory-url

# Settings
MAX_RECIPIENTS=1000
```

---

## API Endpoints

### Send Individual Notification

**Endpoint:** `POST /api/notifications/send`

**Use Case:** Send a personalized notification to a single recipient via EMAIL, SMS, or both.

**Request Headers:**
```
Content-Type: application/json
X-API-Key: <your-api-key>
X-Correlation-Id: optional-correlation-id
```

**Request Body:**
```json
{
  "recipient": {
    "email": "user@example.com",
    "phone": "+1234567890"
  },
  "template": "Hi {{name}}, your order #{{orderId}} is ready!",
  "variables": {
    "name": "John",
    "orderId": "12345"
  },
  "channels": ["EMAIL", "SMS"]
}
```

**Response (200 OK):**
```json
{
  "requestId": "correlation-id",
  "results": {
    "EMAIL": {
      "status": "SENT",
      "id": "msg-email-123"
    },
    "SMS": {
      "status": "SENT",
      "id": "msg-sms-456"
    }
  }
}
```

**Field Descriptions:**
- `recipient.email`: Email address (optional if phone provided)
- `recipient.phone`: Phone number in E.164 format (optional if email provided)
- `template`: Message text with `{{variable}}` placeholders
- `variables`: Key-value pairs to substitute in template
- `channels`: Array of channels - `["EMAIL"]`, `["SMS"]`, or `["EMAIL", "SMS"]`

---

### Broadcast Announcement

**Endpoint:** `POST /api/announcements/broadcast`

**Use Case:** Send the same message to all members in a target segment.

**Request Headers:**
```
Content-Type: application/json
X-API-Key: <your-api-key>
```

**Request Body:**
```json
{
  "message": "Flash sale! 30% off all items this weekend.",
  "audience": {
    "segment": "premium-users"
  },
  "channels": ["EMAIL"],
  "dryRun": true
}
```

**Response (200 OK - Dry Run):**
```json
{
  "requestId": "correlation-id",
  "dryRun": true,
  "targets": 150,
  "sample": [
    { "email": "user1@example.com", "phone": "+1111111111" },
    { "email": "user2@example.com" },
    { "phone": "+2222222222" }
  ]
}
```

**Response (200 OK - Actual Send):**
```json
{
  "requestId": "correlation-id",
  "emailSent": 120,
  "smsSent": 0,
  "failureReasons": {
    "NO_EMAIL": 30
  }
}
```

**Field Descriptions:**
- `message`: Plain text message (no template variables)
- `audience.segment`: Target user segment identifier
- `channels`: Which channels to use for broadcast
- `dryRun`: If `true`, returns preview without sending (optional)

---

## Authentication

The system uses API Key authentication.

**Header:**
```
X-API-Key: your-api-key
```

---

## Template Variables

Use `{{variableName}}` syntax in templates. Variables are replaced with actual values before sending.

**Example:**
```
Template: "Hello {{firstName}}, your balance is {{amount}}."
Variables: { "firstName": "Jane", "amount": "$100" }
Result: "Hello Jane, your balance is $100."
```

**Email Subject:**
For EMAIL channel, include a `subject` variable:
```json
{
  "template": "Your order has shipped!",
  "variables": {
    "subject": "Order Update - Shipment Confirmed"
  }
}
```
If not provided, default subject is "Notification".

---

## Error Handling

### Common Error Responses

**400 Bad Request - Validation Error:**
```json
{
  "error": "VALIDATION_ERROR: recipient is required"
}
```

**401 Unauthorized:**
```json
{
  "error": "UNAUTHORIZED"
}
```


**405 Method Not Allowed:**
```json
{
  "error": "METHOD_NOT_ALLOWED"
}
```

**413 Payload Too Large:**
```json
{
  "error": "TOO_MANY_TARGETS"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error message"
}
```

### Validation Rules

**Send Notification:**
- Must provide either email or phone (or both)
- `template` is required
- `channels` array must not be empty

**Broadcast Announcement:**
- `message` cannot be empty or whitespace-only
- `audience.segment` is required
- `channels` array must not be empty

---

## Channel Behavior

### Graceful Degradation
If a recipient doesn't have the required contact information for a channel, that channel is skipped:

**Example:**
```json
Request: { "channels": ["EMAIL", "SMS"] }
Recipient: { "email": "user@example.com" }  // No phone

Response: {
  "EMAIL": { "status": "SENT", "id": "msg-123" },
  "SMS": { "status": "SKIPPED", "reason": "NO_PHONE" }
}
```

### Error Handling
If one channel fails, the other continues:

```json
{
  "EMAIL": { "status": "FAILED", "error": "Invalid email address" },
  "SMS": { "status": "SENT", "id": "msg-456" }
}
```

---

## Demo Script

Run the interactive demo to see the system in action:

```bash
# Make sure the server is running
npm run dev

# In another terminal, run the demo
node demo.js
```

The demo demonstrates:
1. Sending a multi-channel notification with template variables
2. Broadcasting to a segment with dry run
3. Validation error handling

---

## Testing

```bash
# Run all tests (87 test cases)
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## Troubleshooting

### Server won't start
**Issue:** Port already in use
**Solution:** The server will automatically use the next available port (3001, 3002, etc.)

### Authentication failing
**Issue:** 401 errors
**Solution:**
- Verify `.env` file has correct `API_KEY`
- Ensure the `X-API-Key` header matches the configured key

### No notifications being sent
**Issue:** API returns success but nothing received
**Solution:** The system currently uses mock providers. Real Sendgrid/Twilio integration requires:
1. Valid API credentials in `.env`
2. Implementing actual provider logic in `src/infrastructure/emailProvider.ts` and `src/infrastructure/smsProvider.ts`

### Broadcast stops early
**Issue:** Broadcast doesn't send to all users
**Solution:** Check `MAX_RECIPIENTS` in `.env` - broadcasts are limited to this value for safety

---

## Best Practices

1. **Always use dry run first** when broadcasting to verify your target audience
2. **Include correlation IDs** in requests for easier debugging and tracking
3. **Secure your API Key** - do not commit it to version control
4. **Validate recipient data** before calling the API to avoid validation errors
5. **Handle errors gracefully** - check response status and log failures
6. **Test with small segments** before broadcasting to large audiences

---

## Support

- Check logs in console for detailed error messages
- Review test cases in `src/**/*.test.ts` for usage examples
- See `docs/test-plan.md` for comprehensive test documentation
