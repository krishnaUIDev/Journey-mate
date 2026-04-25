-- Migration: Journey Utilities Expansion
-- Created: 2026-04-25
-- Description: Supports Expense Splitting, Post-Journey Reviews, and Emergency Vault.

-- 1. Collaborative Expenses
CREATE TABLE IF NOT EXISTS journey_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    payer_id TEXT NOT NULL, -- Clerk User ID
    payer_name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Post-Journey Reviews
CREATE TABLE IF NOT EXISTS journey_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL,
    reviewee_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(journey_id, reviewer_id, reviewee_id)
);

-- 3. Emergency Security Vault
CREATE TABLE IF NOT EXISTS journey_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    relation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
