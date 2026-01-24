-- Add koko_transaction_id column to orders table
-- Run this SQL script in your database to add the column for tracking Koko payment transactions

ALTER TABLE orders
ADD COLUMN koko_transaction_id VARCHAR(255) DEFAULT NULL;

-- Add index for faster queries
ALTER TABLE orders
ADD INDEX idx_koko_transaction_id (koko_transaction_id);

-- Optional: Add comment to describe the column
-- ALTER TABLE orders MODIFY COLUMN koko_transaction_id VARCHAR(255)
-- COMMENT 'Koko Payment transaction ID for tracking';
