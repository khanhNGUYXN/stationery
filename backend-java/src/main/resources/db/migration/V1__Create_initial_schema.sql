-- Create employees table
CREATE TABLE employees
(
    id BIGSERIAL PRIMARY KEY,
    employee_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    superior_employee_no VARCHAR(50),
    grade VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create stationeries table
CREATE TABLE stationeries
(
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    minimum_stock INTEGER NOT NULL DEFAULT 10,
    image_url VARCHAR(500),
    category VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    specifications TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create stationery_tags table
CREATE TABLE stationery_tags
(
    stationery_id BIGINT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (stationery_id, tag),
    FOREIGN KEY (stationery_id) REFERENCES stationeries(id) ON DELETE CASCADE
);

-- Create amount_role_thresholds table
CREATE TABLE amount_role_thresholds
(
    id BIGSERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    monthly_limit DECIMAL(10,2) NOT NULL,
    quarterly_limit DECIMAL(10,2) NOT NULL,
    yearly_limit DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create stationery_requests table
CREATE TABLE stationery_requests
(
    id BIGSERIAL PRIMARY KEY,
    request_number VARCHAR(100) UNIQUE NOT NULL,
    requester_id BIGINT NOT NULL,
    stationery_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    approver_id BIGINT,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    total_cost DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES employees(id),
    FOREIGN KEY (stationery_id) REFERENCES stationeries(id),
    FOREIGN KEY (approver_id) REFERENCES employees(id)
);

-- Create request_history table
CREATE TABLE request_history
(
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    actor_id BIGINT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES stationery_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES employees(id)
);

-- Create notifications table
CREATE TABLE notifications
(
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    related_entity_type VARCHAR(100),
    related_entity_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP,
    is_sent BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES employees(id)
);

-- Create indexes
CREATE INDEX idx_employees_username ON employees(username);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_superior ON employees(superior_employee_no);

CREATE INDEX idx_stationeries_code ON stationeries(code);
CREATE INDEX idx_stationeries_category ON stationeries(category);
CREATE INDEX idx_stationeries_active ON stationeries(is_active);

CREATE INDEX idx_requests_requester ON stationery_requests(requester_id);
CREATE INDEX idx_requests_approver ON stationery_requests(approver_id);
CREATE INDEX idx_requests_status ON stationery_requests(status);
CREATE INDEX idx_requests_created_at ON stationery_requests(created_at);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
