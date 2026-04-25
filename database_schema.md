# Journey-Mate Database Schema Reference

This document provides a visualization of the data architecture supporting the Journey-Mate platform.

## Entity Relationship Diagram

```mermaid
erDiagram
    JOURNEYS ||--o{ JOURNEY_REQUESTS : "manages"
    JOURNEYS ||--o{ JOURNEY_MESSAGES : "contains"
    JOURNEYS ||--o{ JOURNEY_EXPENSES : "tracks"
    JOURNEYS ||--o{ JOURNEY_REVIEWS : "collects"
    JOURNEYS ||--o{ JOURNEY_EMERGENCY_CONTACTS : "secures"

    JOURNEYS {
        uuid id PK
        text user_id "Clerk Owner ID"
        text origin
        text destination
        date date
        text flight_number
        text description
        numeric user_rating
        boolean user_verified
        timestamp created_at
    }

    JOURNEY_REQUESTS {
        uuid id PK
        uuid journey_id FK
        text requester_id "Clerk User ID"
        text requester_name
        text status "pending | accepted | rejected"
        numeric compatibility_score
        text compatibility_reason
        timestamp created_at
    }

    JOURNEY_MESSAGES {
        uuid id PK
        uuid journey_id FK
        text sender_id "Clerk User ID"
        text sender_name
        text content
        boolean is_system "System notification flag"
        timestamp created_at
    }

    JOURNEY_EXPENSES {
        uuid id PK
        uuid journey_id FK
        text payer_id "Clerk User ID"
        decimal amount
        text description
        boolean is_settlement "True for peer-to-peer payments"
        text receiver_id "Clerk Recipient ID"
        timestamp created_at
    }

    JOURNEY_REVIEWS {
        uuid id PK
        uuid journey_id FK
        text reviewer_id "Clerk User ID"
        text reviewee_id "Clerk User ID"
        integer rating "1-5"
        text comment
        timestamp created_at
    }

    JOURNEY_EMERGENCY_CONTACTS {
        uuid id PK
        uuid journey_id FK
        text user_id "Clerk User ID"
        text contact_name
        text contact_phone
        text relation
        timestamp expires_at "T+24h after landing"
        timestamp created_at
    }
```

## Relationship Logic

1.  **Centralized Architecture**: The `journeys` table acts as the primary anchor for all collaborative features. All utility data is tied to a specific journey via `journey_id`.
2.  **External Identity**: High-level identity (User Profiles) is managed by **Clerk**. The local database stores Clerk IDs (`user_id`, `payer_id`, etc.) to facilitate data attribution without duplicating the entire auth profile.
3.  **Lifecycle Management**: 
    - **Requests** manage participant entry.
    - **Messages** and **Expenses** provide real-time collaboration.
    - **Vault** provides time-gated security (automatic expiration).
    - **Reviews** ensure long-term trust and safety.
