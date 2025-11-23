# Test Plan - Notification System

## Overview
This document describes the test strategy and test cases for the CPS714 Notification System. The system handles sending individual notifications and broadcasting announcements via EMAIL and SMS channels.

## Test Strategy
- **Framework**: Jest with TypeScript support
- **Approach**: Unit testing with mocked dependencies
- **Coverage**: Application logic, infrastructure providers, API helpers, and input validation
- **Run Tests**: `npm test`
- **Coverage Report**: `npm run test:coverage`

## Test Environment
- All external services (Sendgrid, Twilio) are mocked
- Tests run independently with no side effects
- Each test suite uses `beforeEach` to reset mocks

---

## Test Cases by Component

### 1. Application Layer - sendNotification

**File**: `src/application/sendNotification.test.ts`
**Purpose**: Tests the core notification sending logic

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| SN-01 | Send email successfully | EMAIL status is SENT with valid ID, emailProvider.send called with correct params |
| SN-02 | Send SMS successfully | SMS status is SENT with valid ID, smsProvider.send called with correct params |
| SN-03 | Send both EMAIL and SMS | Both channels return SENT status, both providers called |
| SN-04 | Skip EMAIL when no email provided | EMAIL status is SKIPPED with reason, SMS sends normally |
| SN-05 | Skip SMS when no phone provided | SMS status is SKIPPED with reason, EMAIL sends normally |
| SN-06 | Handle email send failure | EMAIL status is FAILED with error message, error logged |
| SN-07 | Handle SMS send failure | SMS status is FAILED with error message, error logged |
| SN-08 | Throw validation error for invalid input | Promise rejects with VALIDATION_ERROR |

**Key Behaviors Tested**:
- Message formatting before sending
- Multi-channel support
- Graceful degradation (one channel fails, other succeeds)
- Error handling and logging

---

### 2. Application Layer - validatePayload

**File**: `src/application/validatePayload.test.ts`
**Purpose**: Tests input validation for notifications and broadcasts

#### 2.1 Notification Input Validation

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| VN-01 | Valid notification input | No error thrown |
| VN-02 | Input is not an object (null, string) | Throws VALIDATION_ERROR |
| VN-03 | Missing recipient field | Throws error: "recipient is required" |
| VN-04 | Recipient with no email or phone | Throws error: "at least email or phone" |
| VN-05 | Valid input with only email | No error thrown |
| VN-06 | Valid input with only phone | No error thrown |
| VN-07 | Missing channels field | Throws error: "channels array is required" |
| VN-08 | Empty channels array | Throws error: "channels array is required" |
| VN-09 | Missing template field | Throws error: "template is required" |

#### 2.2 Broadcast Input Validation

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| VB-01 | Valid broadcast input | No error thrown |
| VB-02 | Input is not an object | Throws VALIDATION_ERROR |
| VB-03 | Empty message string | Throws error: "message cannot be empty" |
| VB-04 | Message with only whitespace | Throws error: "message cannot be empty" |
| VB-05 | Missing channels field | Throws error: "at least one channel" |
| VB-06 | Empty channels array | Throws error: "at least one channel" |
| VB-07 | Missing audience field | Throws error: "audience segment is required" |
| VB-08 | Audience without segment | Throws error: "audience segment is required" |
| VB-09 | Valid input with dryRun flag | No error thrown |

---

### 3. Infrastructure Layer - messageFormatter

**File**: `src/infrastructure/messageFormatter.test.ts`
**Purpose**: Tests template variable substitution and message formatting

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| MF-01 | Replace single variable | "Hello {{name}}" becomes "Hello John!" |
| MF-02 | Replace multiple variables | All variables correctly substituted |
| MF-03 | Replace same variable multiple times | Variable replaced in all occurrences |
| MF-04 | Extract subject for EMAIL | Subject extracted from variables, included in result |
| MF-05 | Default subject for EMAIL | Uses "Notification" when subject not provided |
| MF-06 | Subject ignored for SMS | Subject not included in SMS result |
| MF-07 | Handle empty variables object | Returns plain text unchanged |

**Key Behaviors Tested**:
- Template syntax: `{{variableName}}`
- Channel-specific formatting (EMAIL vs SMS)
- Subject handling

---

### 4. Infrastructure Layer - emailProvider

**File**: `src/infrastructure/emailProvider.test.ts`
**Purpose**: Tests Sendgrid email provider (currently mocked)

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| EP-01 | Send email | Returns mock ID in format "mock-email-{timestamp}" |
| EP-02 | Log email send attempt | Logs recipient email and subject |
| EP-03 | Include correlationId in log | Correlation ID appears in log when provided |
| EP-04 | Generate unique IDs | Each send generates different ID |

**Note**: Currently using mock implementation. Real Sendgrid integration pending.

---

### 5. Infrastructure Layer - smsProvider

**File**: `src/infrastructure/smsProvider.test.ts`
**Purpose**: Tests Twilio SMS provider (currently mocked)

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| SP-01 | Send SMS | Returns mock ID in format "mock-sms-{timestamp}" |
| SP-02 | Log SMS send attempt | Logs recipient phone and message body |
| SP-03 | Include correlationId in log | Correlation ID appears in log when provided |
| SP-04 | Generate unique IDs | Each send generates different ID |

**Note**: Currently using mock implementation. Real Twilio integration pending.

---

### 6. Infrastructure Layer - logger

**File**: `src/infrastructure/logger.test.ts`
**Purpose**: Tests logging functionality

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| LG-01 | Log info message | Console.log called with [INFO] prefix, timestamp, and message |
| LG-02 | Log error message | Console.error called with [ERROR] prefix, timestamp, and message |

**Log Format**: `[LEVEL] YYYY-MM-DDTHH:mm:ss - message`

---

### 7. API Layer - apiHelpers

**File**: `src/pages/api/_utils/apiHelpers.test.ts`
**Purpose**: Tests common API utilities

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| AH-01 | Set service header | X-Service header set to "Fithub" |
| AH-02 | Validate matching HTTP method | Returns true, no response sent |
| AH-03 | Validate non-matching method | Returns false, sends 405 METHOD_NOT_ALLOWED |
| AH-04 | Handle validation error | Sends 400 with error message |
| AH-05 | Handle TOO_MANY_TARGETS error | Sends 413 with error message |
| AH-06 | Handle other errors | Sends 500 with error message |
| AH-07 | Handle unknown error | Sends 500 with "UNKNOWN_ERROR" |

**Key Behaviors Tested**:
- HTTP method validation
- Error code to HTTP status mapping
- Service header injection

---

### 8. API Layer - auth

**File**: `src/pages/api/_utils/auth.test.ts`
**Purpose**: Tests authentication and request metadata extraction

#### 8.1 HMAC Verification

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| AU-01 | Valid HMAC signature | Returns true |
| AU-02 | Invalid HMAC signature | Returns false |
| AU-03 | Missing timestamp header | Returns false |
| AU-04 | Missing signature header | Returns false |
| AU-05 | HMAC secret not configured | Returns false |
| AU-06 | Different body content | Correctly verifies different payloads |

#### 8.2 API Key Validation

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| AU-07 | Valid API key | Returns true |
| AU-08 | Invalid API key | Returns false |
| AU-09 | Missing API key header | Returns false |
| AU-10 | API key not configured | Returns false |

#### 8.3 Authentication Middleware

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| AU-11 | Valid HMAC when configured | Returns true, no response sent |
| AU-12 | Invalid HMAC | Returns false, sends 401 BAD_SIGNATURE |
| AU-13 | Fallback to API key | Uses API key when HMAC not configured |
| AU-14 | Invalid API key | Returns false, sends 401 UNAUTHORIZED |

#### 8.4 Metadata Extraction

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| AU-15 | Extract correlation ID from headers | Returns provided correlation ID |
| AU-16 | Generate correlation ID if not provided | Returns auto-generated UUID |
| AU-17 | Extract idempotency key | Returns idempotency key when provided |
| AU-18 | Idempotency key not provided | Returns undefined for idempotency key |
| AU-19 | Extract both IDs | Returns both correlation ID and idempotency key |

---

### 9. Application Layer - broadcastAnnouncement

**File**: `src/application/broadcastAnnouncement.test.ts`
**Purpose**: Tests broadcast announcement logic and batch processing

#### 9.1 Dry Run Mode

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| BA-01 | Return sample without sending | Returns sample and target count, no sends |
| BA-02 | Limit sample size to 10 | Sample array limited to 10 recipients |
| BA-03 | Respect max recipients in dry run | Stops at max recipients limit |

#### 9.2 Sending Broadcasts

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| BA-04 | Send email to all members | All members receive email |
| BA-05 | Send SMS to all members | All members receive SMS |
| BA-06 | Send both EMAIL and SMS | Both channels sent to all members |
| BA-07 | Skip members without contact info | Members without required contact method skipped |
| BA-08 | Handle send failures gracefully | Failed sends tracked, others continue |
| BA-09 | Track multiple failure reasons | All failure types counted separately |
| BA-10 | Process in batches and log progress | Progress logged at intervals, completion logged |
| BA-11 | Respect max recipients limit | Stops sending at configured max |
| BA-12 | Throw validation error for invalid input | Rejects invalid broadcast input |

---

### 10. Application Layer - batchHelpers

**File**: `src/application/_utils/batchHelpers.test.ts`
**Purpose**: Tests batch result aggregation utilities

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| BH-01 | Aggregate successful promise results | Correctly sums email and SMS counts |
| BH-02 | Track failure reasons from errors | Counts each failure type |
| BH-03 | Ignore rejected promises | Only counts fulfilled promises |
| BH-04 | Handle empty results array | Returns zero counts |
| BH-05 | Accumulate across multiple calls | Correctly accumulates repeated failures |
| BH-06 | Handle mixed successful and failed sends | Counts sends and failures separately |

---

## Test Coverage Summary

| Component | Test Cases | Coverage Focus |
|-----------|-----------|----------------|
| sendNotification | 8 | Business logic, error handling |
| validatePayload | 16 | Input validation, edge cases |
| messageFormatter | 7 | Template processing |
| emailProvider | 4 | Mock email sending |
| smsProvider | 4 | Mock SMS sending |
| logger | 2 | Log formatting |
| apiHelpers | 7 | API utilities, error mapping |
| auth | 19 | HMAC, API key, metadata extraction |
| broadcastAnnouncement | 14 | Broadcast logic, batch processing |
| batchHelpers | 6 | Result aggregation |
| **TOTAL** | **87** | |

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npx jest sendNotification.test.ts
```

## Test Gaps & Future Work

**Integration Tests Needed**:
- API endpoint tests (POST /api/notifications/send)
- API endpoint tests (POST /api/announcements/broadcast)
- Member directory client integration

**System Tests Needed**:
- Real Sendgrid integration tests (when implemented)
- Real Twilio integration tests (when implemented)
- End-to-end workflow tests
- Performance tests for broadcast to large audiences

**Additional Unit Tests to Consider**:
- Configuration loading tests
- API endpoint handler tests

## Dependencies

All tests use mocked dependencies to ensure:
- Fast execution
- No external service calls
- Predictable results
- No API costs during testing

External services mocked:
- Sendgrid email API
- Twilio SMS API
- Member directory service
- Console logging
