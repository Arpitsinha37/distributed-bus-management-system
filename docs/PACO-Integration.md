# PACO Payment Gateway Integration Documentation

This document describes the integration of the PACO payment gateway within the Distributed Bus Management System (formerly New Road Travels).

## Overview
The PACO gateway allows users to make payments via the PACO mobile application or web portal. The integration relies on a server-to-server webhook callback for payment confirmation and a redirect flow for user authorization.

## Endpoints
1. **Initiate Payment:** `POST /api/payment/paco/initiate`
2. **Callback / Webhook:** `POST /api/payment/paco/callback`

## Data Flow
1. **Initiation:** When a user selects PACO as their payment method, the frontend calls the initiate endpoint.
2. **Gateway Redirect:** The backend generates a secure transaction ID, saves the payment record in the database as `pending`, and redirects the user to the PACO payment URL with a callback parameter.
3. **User Action:** The user completes the payment on the PACO site.
4. **Callback Notification:** PACO servers send a POST request to the webhook callback endpoint with the transaction status.
5. **Finalization:** The backend verifies the signature, updates the payment record to `completed`, and confirms the bus ticket booking with the operator.

## Security Considerations
- All callback requests from PACO are verified using an HMAC SHA256 signature using the `PACO_API_SECRET` stored in the environment variables.
- Duplicate transaction IDs are rejected to prevent replay attacks.
- Payments are matched strictly by `transactionId`.
