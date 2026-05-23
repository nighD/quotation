-- =========================================================================
-- SQL Script: Reset User to Free
-- Description: Sets all active subscriptions for the given user email to
--              'expired' and moves their end date to the past.
-- Usage: Replace 'your-email@example.com' with the user's actual email.
-- =========================================================================

UPDATE user_subscriptions 
SET status = 'expired', 
    end_date = NOW() - INTERVAL '1 second'
WHERE user_id IN (
    SELECT id FROM users WHERE email = 'your-email@example.com'
);

-- Optional: Verify the change was applied
SELECT u.email, us.status, us.end_date, sp.name AS plan_name
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE u.email = 'your-email@example.com';
