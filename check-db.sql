USE stationery_db;

-- Kiểm tra employees
SELECT id, employee_no, name, username
FROM employees;

-- Kiểm tra stationery_requests
SELECT
    id,
    request_number,
    requester_id,
    stationery_id,
    quantity,
    status,
    created_at
FROM stationery_requests
ORDER BY created_at DESC 
LIMIT 5;

-- Kiểm tra stationeries
SELECT id
, code, name, stock_quantity FROM stationeries LIMIT 5;
