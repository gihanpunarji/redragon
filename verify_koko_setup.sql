-- Run this to verify Koko payment method exists
SELECT * FROM payment_methods WHERE method_name = 'koko_payment';

-- If the above returns no results, run this to create it:
INSERT INTO payment_methods (method_name, display_name, percentage, is_active, created_at)
VALUES ('koko_payment', 'Koko: Buy Now Pay Later', 14.00, 1, NOW());

-- Verify it was created:
SELECT * FROM payment_methods WHERE method_name = 'koko_payment';
