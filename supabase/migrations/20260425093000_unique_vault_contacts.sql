-- Migration: Unique Vault Contacts
-- Cleanup duplicates before enforcing that each participant can only have one emergency contact per journey.

DELETE FROM journey_emergency_contacts
WHERE id NOT IN (
    SELECT DISTINCT ON (journey_id, user_id) id
    FROM journey_emergency_contacts
    ORDER BY journey_id, user_id, created_at DESC
);

ALTER TABLE journey_emergency_contacts 
ADD CONSTRAINT unique_participant_contact UNIQUE (journey_id, user_id);
