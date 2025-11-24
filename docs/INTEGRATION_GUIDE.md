# Notification System Integration Guide

This guide explains how the Booking System, Payment System, and Admin Dashboard should integrate with the Notification Service.

## Authentication

All API requests must include the `x-api-key` header.

```bash
x-api-key: <YOUR_SHARED_API_KEY>
```

*Note: Ensure this key is stored in your `.env` file and NOT committed to source control.*

---

## 1. Booking System Integration (Class Confirmations)

**Use Case**: Send a confirmation email/SMS when a user books a class.

**Endpoint**: `POST /api/notifications/send`

**Request Body**:
```json
{
  "recipient": {
    "email": "user@example.com",
    "phone": "+15550199" // Optional, for SMS
  },
  "channels": ["EMAIL"], // Add "SMS" if phone is provided
  "template": "Booking Confirmed: {{className}} on {{date}} at {{time}}.",
  "variables": {
    "className": "Yoga Flow",
    "date": "2023-11-25",
    "time": "10:00 AM",
    "subject": "Your Class Confirmation" // Required for Email Subject
  }
}
```

**Code Snippet (Node.js/Next.js)**:
```javascript
async function sendBookingConfirmation(user, classDetails) {
  try {
    const response = await fetch('http://localhost:3000/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NOTIFICATION_API_KEY
      },
      body: JSON.stringify({
        recipient: { 
          email: user.email,
          phone: user.phone 
        },
        channels: ['EMAIL'],
        template: 'Booking Confirmed: {{className}} on {{date}} at {{time}}.',
        variables: {
          className: classDetails.name,
          date: classDetails.date,
          time: classDetails.time,
          subject: 'Booking Confirmation'
        }
      })
    });

    if (!response.ok) {
      console.error('Failed to send notification:', await response.text());
    }
  } catch (error) {
    console.error('Notification service error:', error);
  }
}
```

---

## 2. Payment System Integration (Receipts)

**Use Case**: Send a receipt email when a payment is successful.

**Endpoint**: `POST /api/notifications/send`

**Request Body**:
```json
{
  "recipient": { "email": "user@example.com" },
  "channels": ["EMAIL"],
  "template": "Payment of ${{amount}} received. Transaction ID: {{txnId}}.",
  "variables": {
    "amount": "45.00",
    "txnId": "TXN-12345",
    "subject": "Payment Receipt"
  }
}
```

**Code Snippet (Node.js/Next.js)**:
```javascript
async function sendPaymentReceipt(user, amount, txnId) {
  try {
    const response = await fetch('http://localhost:3000/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NOTIFICATION_API_KEY
      },
      body: JSON.stringify({
        recipient: { email: user.email },
        channels: ['EMAIL'],
        template: 'Payment of ${{amount}} received. Transaction ID: {{txnId}}.',
        variables: {
          amount: amount.toFixed(2),
          txnId: txnId,
          subject: 'Payment Receipt'
        }
      })
    });
  } catch (error) {
    console.error('Notification service error:', error);
  }
}
```

---

## 3. Admin Dashboard Integration (Announcements)

**Use Case**: Broadcast a message to ALL members (e.g., "Pool closed").

**Endpoint**: `POST /api/announcements/broadcast`

**Request Body**:
```json
{
  "message": "NOTICE: The pool will be closed for maintenance this Sunday.",
  "channels": ["EMAIL", "SMS"],
  "audience": {
    "segment": "all-members"
  }
}
```

**Code Snippet (Node.js/Next.js)**:
```javascript
async function broadcastAnnouncement(message) {
  try {
    const response = await fetch('http://localhost:3000/api/announcements/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NOTIFICATION_API_KEY
      },
      body: JSON.stringify({
        message: message,
        channels: ['EMAIL', 'SMS'],
        audience: { segment: 'all-members' }
      })
    });
    
    const result = await response.json();
    console.log(`Sent to ${result.sent.EMAIL} emails and ${result.sent.SMS} phones.`);
  } catch (error) {
    console.error('Broadcast error:', error);
  }
}
```
