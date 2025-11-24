# CPS714 Notification System - Team 6

Multi-channel notification service supporting email and SMS delivery with a clean 3-layer architecture.

## Features

- **Multi-channel delivery**: Send to email, SMS, or both simultaneously
- **Template variables**: Dynamic content with `{{variable}}` syntax
- **Broadcast announcements**: Send to user segments with batch processing
- **Live integrations**: Real SendGrid (email) and Twilio (SMS) APIs
- **API authentication**: Secure endpoints with API key validation
- **Dry-run mode**: Preview broadcast recipients before sending

## Architecture

**Layer 1 - API** (`src/pages/api/`)
- HTTP endpoints and request handling
- Authentication and validation
- Error response formatting

**Layer 2 - Application** (`src/application/`)
- Business logic and orchestration
- Multi-channel coordination
- Batch processing (15 per batch, max 1000 recipients)

**Layer 3 - Infrastructure** (`src/infrastructure/`)
- SendGrid email integration
- Twilio SMS integration
- Template formatting and logging

## Quick Start

**1. Install dependencies**
```bash
npm install
```

**2. Configure environment**
```bash
cp .env.example .env
# Add your SendGrid and Twilio credentials to .env
```

**3. Run the server**
```bash
npm run dev
```

Server starts at `http://localhost:3000`

**4. Test with Postman**
- Import `CPS714-Notification-System.postman_collection.json`
- Update collection variables (baseUrl, testEmail, testPhone)
- Run tests

## API Endpoints

**Send Notification**
```
POST /api/notifications/send
Headers: x-api-key: <your-key>

{
  "recipient": { "email": "user@example.com", "phone": "+1234567890" },
  "channels": ["EMAIL", "SMS"],
  "template": "Hi {{name}}! Order {{id}} confirmed.",
  "variables": { "name": "John", "id": "123", "subject": "Order Confirmed" }
}
```

**Broadcast Announcement**
```
POST /api/announcements/broadcast
Headers: x-api-key: <your-key>

{
  "message": "System maintenance tonight at 11 PM.",
  "channels": ["EMAIL"],
  "audience": { "segment": "all-members" },
  "dryRun": false
}
```

**Health Check**
```
GET /api/_health
```

## Testing

**Run unit tests**
```bash
npm test
```

**Run with coverage**
```bash
npm run test:coverage
```

## Configuration

Required environment variables in `.env`:

```env
API_KEY=test-api-key-12345
SENDGRID_API_KEY=SG.your-key-here
SENDGRID_FROM_EMAIL=your-email@example.com
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-token-here
TWILIO_FROM_NUMBER=+1234567890
```

## Project Structure

```
src/
├── pages/api/          # Layer 1: API endpoints
├── application/        # Layer 2: Business logic
├── infrastructure/     # Layer 3: External integrations
└── shared/            # Config and types

docs/
├── INTEGRATION_GUIDE.md
├── USER_GUIDE.md
└── test-plan.md
```

## Tech Stack

- **Framework**: Next.js with TypeScript
- **Email**: SendGrid API
- **SMS**: Twilio API
- **Testing**: Jest
- **API Testing**: Postman


