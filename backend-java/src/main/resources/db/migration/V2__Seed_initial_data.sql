-- Seed employees
INSERT INTO employees
    (employee_no, name, role, email, superior_employee_no, grade, location, username, password_hash)
VALUES
    ('EMP001', 'John Engineer', 'ENGINEER', 'engineer@hmt.com', 'EMP002', 'L3', 'Ho Chi Minh', 'engineer', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    -- password123
    ('EMP002', 'Mary Manager', 'MANAGER', 'manager@hmt.com', 'EMP003', 'L4', 'Ho Chi Minh', 'manager', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    -- password123
    ('EMP003', 'Bob Business Manager', 'BUSINESS_MANAGER', 'bm@hmt.com', 'EMP004', 'L5', 'Ho Chi Minh', 'bm', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    -- password123
    ('EMP004', 'Alice Managing Director', 'MANAGING_DIRECTOR', 'md@hmt.com', NULL, 'L6', 'Ho Chi Minh', 'md', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    -- password123
    ('EMP005', 'David Developer', 'ENGINEER', 'david@hmt.com', 'EMP002', 'L3', 'Ho Chi Minh', 'david', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    -- password123
    ('EMP006', 'Sarah Senior', 'ENGINEER', 'sarah@hmt.com', 'EMP002', 'L4', 'Ho Chi Minh', 'sarah', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    -- password123
    ('EMP007', 'Tom Team Lead', 'MANAGER', 'tom@hmt.com', 'EMP003', 'L4', 'Ho Chi Minh', 'tom', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    -- password123
    ('EMP008', 'Lisa Lead', 'MANAGER', 'lisa@hmt.com', 'EMP003', 'L4', 'Ho Chi Minh', 'lisa', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    -- password123
    ('EMP009', 'Frank Finance', 'BUSINESS_MANAGER', 'frank@hmt.com', 'EMP004', 'L5', 'Ho Chi Minh', 'frank', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    -- password123
    ('EMP010', 'Grace General', 'BUSINESS_MANAGER', 'grace@hmt.com', 'EMP004', 'L5', 'Ho Chi Minh', 'grace', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
-- password123

-- Seed amount role thresholds
INSERT INTO amount_role_thresholds
    (role, monthly_limit, quarterly_limit, yearly_limit, description)
VALUES
    ('ENGINEER', 500.00, 1500.00, 5000.00, 'Engineer spending limits'),
    ('MANAGER', 1000.00, 3000.00, 10000.00, 'Manager spending limits'),
    ('BUSINESS_MANAGER', 2000.00, 6000.00, 20000.00, 'Business Manager spending limits'),
    ('MANAGING_DIRECTOR', 5000.00, 15000.00, 50000.00, 'Managing Director spending limits');

-- Seed stationeries
INSERT INTO stationeries
    (code, name, description, cost, stock_quantity, minimum_stock, image_url, category, brand, model, specifications)
VALUES
    ('PEN001', 'Blue Ballpoint Pen', 'High-quality blue ballpoint pen for daily use', 2.50, 500, 50, 'https://example.com/pen1.jpg', 'Writing', 'Bic', 'Cristal', 'Blue ink, 1.0mm tip'),
    ('PEN002', 'Black Gel Pen', 'Smooth writing black gel pen', 3.00, 300, 30, 'https://example.com/pen2.jpg', 'Writing', 'Pilot', 'G2', 'Black ink, 0.7mm tip'),
    ('PEN003', 'Red Marker', 'Permanent red marker for highlighting', 1.50, 200, 20, 'https://example.com/marker1.jpg', 'Writing', 'Sharpie', 'Fine Point', 'Red ink, permanent'),
    ('PAPER001', 'A4 White Paper', 'Premium A4 white paper, 80gsm', 0.05, 10000, 1000, 'https://example.com/paper1.jpg', 'Paper', 'Double A', 'A4', '80gsm, white, 500 sheets'),
    ('PAPER002', 'Sticky Notes', 'Yellow sticky notes, 3x3 inches', 0.02, 5000, 500, 'https://example.com/sticky1.jpg', 'Paper', 'Post-it', '3x3', 'Yellow, 100 sheets per pad'),
    ('STAPLER001', 'Desktop Stapler', 'Heavy-duty desktop stapler', 15.00, 50, 5, 'https://example.com/stapler1.jpg', 'Office Supplies', 'Swingline', '747', '20-sheet capacity'),
    ('SCISSORS001', 'Office Scissors', 'Sharp office scissors, 8-inch', 12.00, 30, 3, 'https://example.com/scissors1.jpg', 'Office Supplies', 'Fiskars', '8-inch', 'Stainless steel, 8-inch blade'),
    ('TAPE001', 'Scotch Tape', 'Transparent adhesive tape', 2.00, 200, 20, 'https://example.com/tape1.jpg', 'Office Supplies', '3M', 'Scotch', 'Transparent, 1-inch width'),
    ('NOTEBOOK001', 'Spiral Notebook', 'A4 spiral notebook, 100 pages', 8.00, 100, 10, 'https://example.com/notebook1.jpg', 'Paper', 'Oxford', 'A4', '100 pages, lined, spiral bound'),
    ('HIGHLIGHTER001', 'Yellow Highlighter', 'Fluorescent yellow highlighter', 1.00, 150, 15, 'https://example.com/highlighter1.jpg', 'Writing', 'Stabilo', 'Boss', 'Yellow, fluorescent ink'),
    ('CLIPBOARD001', 'A4 Clipboard', 'Plastic A4 clipboard with clip', 5.00, 80, 8, 'https://example.com/clipboard1.jpg', 'Office Supplies', 'Office Depot', 'A4', 'Plastic, A4 size, metal clip'),
    ('PENCIL001', 'HB Pencil', 'Standard HB graphite pencil', 0.50, 1000, 100, 'https://example.com/pencil1.jpg', 'Writing', 'Faber-Castell', 'HB', 'HB graphite, wooden'),
    ('ERASER001', 'White Eraser', 'Soft white eraser', 0.75, 300, 30, 'https://example.com/eraser1.jpg', 'Writing', 'Pentel', 'Hi-Polymer', 'White, soft, dust-free'),
    ('RULER001', '30cm Ruler', 'Plastic 30cm ruler', 1.50, 200, 20, 'https://example.com/ruler1.jpg', 'Office Supplies', 'Staedtler', '30cm', 'Plastic, 30cm, metric scale'),
    ('CALCULATOR001', 'Basic Calculator', 'Basic desktop calculator', 25.00, 40, 4, 'https://example.com/calculator1.jpg', 'Electronics', 'Casio', 'MS-80B', 'Basic functions, LCD display'),
    ('DESK_LAMP001', 'LED Desk Lamp', 'Adjustable LED desk lamp', 45.00, 25, 3, 'https://example.com/lamp1.jpg', 'Electronics', 'Philips', 'LED Desk', 'LED, adjustable, energy efficient'),
    ('MOUSE001', 'Wireless Mouse', 'Optical wireless mouse', 35.00, 60, 6, 'https://example.com/mouse1.jpg', 'Electronics', 'Logitech', 'M185', 'Wireless, optical, 12-month battery'),
    ('KEYBOARD001', 'USB Keyboard', 'Standard USB keyboard', 40.00, 45, 5, 'https://example.com/keyboard1.jpg', 'Electronics', 'Microsoft', 'Wired 600', 'USB, standard layout, spill-resistant'),
    ('MONITOR001', '24-inch Monitor', '24-inch LED monitor', 200.00, 15, 2, 'https://example.com/monitor1.jpg', 'Electronics', 'Dell', 'P2419H', '24-inch, 1920x1080, LED'),
    ('CHAIR001', 'Office Chair', 'Ergonomic office chair', 150.00, 20, 2, 'https://example.com/chair1.jpg', 'Furniture', 'IKEA', 'Markus', 'Ergonomic, adjustable, mesh back');

-- Insert tags separately
INSERT INTO stationery_tags
    (stationery_id, tag)
VALUES
    (1, 'pen'),
    (1, 'blue'),
    (1, 'ballpoint'),
    (2, 'pen'),
    (2, 'black'),
    (2, 'gel'),
    (3, 'marker'),
    (3, 'red'),
    (3, 'permanent'),
    (4, 'paper'),
    (4, 'a4'),
    (4, 'white'),
    (5, 'sticky'),
    (5, 'notes'),
    (5, 'yellow'),
    (6, 'stapler'),
    (6, 'desktop'),
    (6, 'heavy-duty'),
    (7, 'scissors'),
    (7, 'office'),
    (7, 'sharp'),
    (8, 'tape'),
    (8, 'transparent'),
    (8, 'adhesive'),
    (9, 'notebook'),
    (9, 'spiral'),
    (9, 'lined'),
    (10, 'highlighter'),
    (10, 'yellow'),
    (10, 'fluorescent'),
    (11, 'clipboard'),
    (11, 'a4'),
    (11, 'plastic'),
    (12, 'pencil'),
    (12, 'hb'),
    (12, 'graphite'),
    (13, 'eraser'),
    (13, 'white'),
    (13, 'soft'),
    (14, 'ruler'),
    (14, '30cm'),
    (14, 'plastic'),
    (15, 'calculator'),
    (15, 'basic'),
    (15, 'desktop'),
    (16, 'lamp'),
    (16, 'led'),
    (16, 'adjustable'),
    (17, 'mouse'),
    (17, 'wireless'),
    (17, 'optical'),
    (18, 'keyboard'),
    (18, 'usb'),
    (18, 'standard'),
    (19, 'monitor'),
    (19, '24-inch'),
    (19, 'led'),
    (20, 'chair'),
    (20, 'ergonomic'),
    (20, 'adjustable');
