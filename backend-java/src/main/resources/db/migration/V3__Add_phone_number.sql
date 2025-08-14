-- Add phone_number column to employees table
ALTER TABLE employees ADD COLUMN phone_number VARCHAR
(20) AFTER email;
