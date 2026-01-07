# API Contracts

## Overview
This document outlines the API contracts for the BUG Social Media Agency landing page.

## Endpoints

### 1. Lead Generation (Freebie)
- **URL**: `/api/leads`
- **Method**: `POST`
- **Description**: Collects email addresses from the "1-Page Business Checklist" form.
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  - `200 OK`: `{ "message": "Lead captured successfully", "id": "uuid" }`
  - `400 Bad Request`: Validation error.

### 2. Order Creation (Mock Payment)
- **URL**: `/api/orders`
- **Method**: `POST`
- **Description**: Records a purchase intent (mock payment).
- **Request Body**:
  ```json
  {
    "tier": "Standard VIP",
    "amount": 150,
    "email": "optional_user@example.com" 
  }
  ```
- **Response**:
  - `200 OK`: `{ "message": "Order processed", "order_id": "uuid", "download_url": "..." }`

## Data Models (MongoDB)

### Lead
- `id`: String (UUID)
- `email`: String
- `created_at`: DateTime

### Order
- `id`: String (UUID)
- `tier`: String
- `amount`: Number
- `status`: String ("completed" - since it's mock)
- `created_at`: DateTime
