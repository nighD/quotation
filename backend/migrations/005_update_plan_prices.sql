-- ============================================================
-- Migration: 005_update_plan_prices.sql
-- Description: Update existing subscription plan prices to USD
-- ============================================================

UPDATE subscription_plans SET price = 1.00 WHERE name = 'Monthly Basic';
UPDATE subscription_plans SET price = 500.00 WHERE name = 'Quarterly Pro';
UPDATE subscription_plans SET price = 2500.00 WHERE name = 'Annual Premium';
