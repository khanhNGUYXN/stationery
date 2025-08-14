-- Migration script to convert from 4 roles to 3 roles
-- Run this after updating the application

USE stationery_db;

-- 1. Update employee roles
UPDATE employees SET role = 'EMPLOYEE' WHERE role = 'ENGINEER';
UPDATE employees SET role = 'SUPER_ADMIN' WHERE role IN ('BUSINESS_MANAGER', 'MANAGING_DIRECTOR');

-- 2. Update amount role thresholds
-- First, delete old thresholds
DELETE FROM amount_role_thresholds WHERE role IN ('ENGINEER', 'BUSINESS_MANAGER', 'MANAGING_DIRECTOR');

-- Then insert new thresholds
INSERT INTO amount_role_thresholds
    (role, monthly_limit, quarterly_limit, yearly_limit, description, is_active, created_at, updated_at)
VALUES
    ('EMPLOYEE', 500.00, 1500.00, 5000.00, 'Employee limits', 1, NOW(), NOW()),
    ('SUPER_ADMIN', 5000.00, 15000.00, 50000.00, 'Super Admin limits', 1, NOW(), NOW());

-- 3. Update existing employees to new structure
UPDATE employees SET 
  name = 'John Employee',
  email = 'employee@hmt.com',
  username = 'employee'
WHERE employee_no = 'EMP001';

UPDATE employees SET 
  name = 'Alice Super Admin',
  email = 'admin@hmt.com',
  username = 'admin',
  superior_employee_no = NULL
WHERE employee_no = 'EMP003';

-- 4. Remove EMP004 (old MD) if exists
DELETE FROM employees WHERE employee_no = 'EMP004';

-- 5. Update superior relationships
UPDATE employees SET superior_employee_no = 'EMP003' WHERE employee_no = 'EMP002';

-- Verify the changes
SELECT employee_no, name, role, email, username
FROM employees
ORDER BY employee_no;
SELECT role, monthly_limit, quarterly_limit, yearly_limit
FROM amount_role_thresholds
ORDER BY role;
