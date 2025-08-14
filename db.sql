-- MySQL schema for Stationery Management System
-- Compatible with MySQL 8.x
-- Run this file in phpMyAdmin or mysql client

-- 0) Database
CREATE DATABASE IF NOT EXISTS `stationery_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `stationery_db`;

-- 1) Drop existing objects (order matters due to FKs)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `request_history`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `stationery_requests`;
DROP TABLE IF EXISTS `stationery_tags`;
DROP TABLE IF EXISTS `stationeries`;
DROP TABLE IF EXISTS `amount_role_thresholds`;
DROP TABLE IF EXISTS `employees`;
SET FOREIGN_KEY_CHECKS = 1;

-- 2) Employees
CREATE TABLE `employees` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_no` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` ENUM('EMPLOYEE','MANAGER','SUPER_ADMIN') NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `superior_employee_no` VARCHAR(50) NULL,
  `grade` VARCHAR(50) NOT NULL,
  `location` VARCHAR(100) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_employees_employee_no` (`employee_no`),
  UNIQUE KEY `uk_employees_email` (`email`),
  UNIQUE KEY `uk_employees_username` (`username`),
  KEY `idx_employees_role` (`role`),
  KEY `idx_employees_superior` (`superior_employee_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) AmountRoleThresholds
CREATE TABLE `amount_role_thresholds` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role` ENUM('EMPLOYEE','MANAGER','SUPER_ADMIN') NOT NULL,
  `monthly_limit` DECIMAL(10,2) NOT NULL,
  `quarterly_limit` DECIMAL(10,2) NOT NULL,
  `yearly_limit` DECIMAL(10,2) NOT NULL,
  `description` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_threshold_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) Stationeries
CREATE TABLE `stationeries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `cost` DECIMAL(10,2) NOT NULL,
  `stock_quantity` INT NOT NULL,
  `minimum_stock` INT NOT NULL DEFAULT 10,
  `image_url` VARCHAR(500) NULL,
  `category` VARCHAR(100) NULL,
  `brand` VARCHAR(100) NULL,
  `model` VARCHAR(100) NULL,
  `specifications` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_stationeries_code` (`code`),
  KEY `idx_stationeries_category` (`category`),
  KEY `idx_stationeries_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5) Stationery Tags (many-to-many-like tagging)
CREATE TABLE `stationery_tags` (
  `stationery_id` BIGINT UNSIGNED NOT NULL,
  `tag` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`stationery_id`,`tag`),
  CONSTRAINT `fk_tags_stationery` FOREIGN KEY (`stationery_id`) REFERENCES `stationeries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6) Stationery Requests
CREATE TABLE `stationery_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_number` VARCHAR(100) NOT NULL,
  `requester_id` BIGINT UNSIGNED NOT NULL,
  `stationery_id` BIGINT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL,
  `to_date` DATE NOT NULL,
  `reason` TEXT NULL,
  `status` ENUM('DRAFT','SUBMITTED','APPROVED','REJECTED','CANCELED','WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
  `approver_id` BIGINT UNSIGNED NULL,
  `approved_at` DATETIME NULL,
  `rejection_reason` TEXT NULL,
  `total_cost` DECIMAL(10,2) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_requests_number` (`request_number`),
  KEY `idx_requests_requester` (`requester_id`),
  KEY `idx_requests_approver` (`approver_id`),
  KEY `idx_requests_status` (`status`),
  KEY `idx_requests_created_at` (`created_at`),
  CONSTRAINT `fk_requests_requester` FOREIGN KEY (`requester_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_requests_stationery` FOREIGN KEY (`stationery_id`) REFERENCES `stationeries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_requests_approver` FOREIGN KEY (`approver_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7) Request History (audit log)
CREATE TABLE `request_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_id` BIGINT UNSIGNED NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `actor_id` BIGINT UNSIGNED NOT NULL,
  `previous_status` ENUM('DRAFT','SUBMITTED','APPROVED','REJECTED','CANCELED','WITHDRAWN') NULL,
  `new_status` ENUM('DRAFT','SUBMITTED','APPROVED','REJECTED','CANCELED','WITHDRAWN') NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_history_request` (`request_id`),
  KEY `idx_history_actor` (`actor_id`),
  CONSTRAINT `fk_history_request` FOREIGN KEY (`request_id`) REFERENCES `stationery_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_history_actor` FOREIGN KEY (`actor_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8) Notifications
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipient_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('REQUEST_CREATED','REQUEST_APPROVED','REQUEST_REJECTED','REQUEST_CANCELED','REQUEST_WITHDRAWN','PASSWORD_CHANGED','SYSTEM_ANNOUNCEMENT') NOT NULL,
  `related_entity_type` VARCHAR(100) NULL,
  `related_entity_id` BIGINT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `read_at` DATETIME NULL,
  `is_sent` TINYINT(1) NOT NULL DEFAULT 0,
  `sent_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_recipient` (`recipient_id`),
  KEY `idx_notifications_is_read` (`is_read`),
  KEY `idx_notifications_created_at` (`created_at`),
  CONSTRAINT `fk_notifications_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9) Seed minimal data
-- Password hash corresponds to plaintext: "password"
INSERT INTO `employees` (`employee_no`,`name`,`role`,`email`,`superior_employee_no`,`grade`,`location`,`username`,`password_hash`,`is_active`,`created_at`,`updated_at`)
VALUES
  ('EMP001','John Employee','EMPLOYEE','employee@hmt.com','EMP002','L3','HCM','employee','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,NOW(),NOW()),
  ('EMP002','Mary Manager','MANAGER','manager@hmt.com','EMP003','L4','HCM','manager','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,NOW(),NOW()),
  ('EMP003','Alice Super Admin','SUPER_ADMIN','admin@hmt.com',NULL,'L6','HCM','admin','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,NOW(),NOW());

INSERT INTO `amount_role_thresholds` (`role`,`monthly_limit`,`quarterly_limit`,`yearly_limit`,`description`,`is_active`,`created_at`,`updated_at`)
VALUES
  ('EMPLOYEE', 500.00, 1500.00, 5000.00, 'Employee limits', 1, NOW(), NOW()),
  ('MANAGER', 1000.00, 3000.00, 10000.00, 'Manager limits', 1, NOW(), NOW()),
  ('SUPER_ADMIN', 5000.00, 15000.00, 50000.00, 'Super Admin limits', 1, NOW(), NOW());

-- Sample stationeries (10 items)
INSERT INTO `stationeries` (`code`,`name`,`description`,`cost`,`stock_quantity`,`minimum_stock`,`image_url`,`category`,`brand`,`model`,`specifications`,`is_active`,`created_at`,`updated_at`)
VALUES
 ('PEN001','Blue Ballpoint Pen','High-quality blue ballpoint pen', 2.50, 500, 50, NULL, 'Writing', 'Bic', 'Cristal', 'Blue ink, 1.0mm tip', 1, NOW(), NOW()),
 ('PEN002','Black Gel Pen','Smooth black gel pen', 3.00, 300, 30, NULL, 'Writing', 'Pilot', 'G2', 'Black ink, 0.7mm', 1, NOW(), NOW()),
 ('PEN003','Red Marker','Permanent red marker', 1.50, 200, 20, NULL, 'Writing', 'Sharpie', 'Fine', 'Red ink', 1, NOW(), NOW()),
 ('PAPER001','A4 White Paper','Premium A4, 80gsm', 0.05, 10000, 1000, NULL, 'Paper', 'Double A', 'A4', '80gsm white', 1, NOW(), NOW()),
 ('PAPER002','Sticky Notes','3x3 yellow sticky notes', 0.02, 5000, 500, NULL, 'Paper', 'Post-it', '3x3', 'Yellow, 100 sheets', 1, NOW(), NOW()),
 ('STAPLER001','Desktop Stapler','Heavy-duty stapler', 15.00, 50, 5, NULL, 'Office Supplies', 'Swingline', '747', '20-sheet', 1, NOW(), NOW()),
 ('SCISSORS001','Office Scissors','8-inch scissors', 12.00, 30, 3, NULL, 'Office Supplies', 'Fiskars', '8-inch', 'Stainless steel', 1, NOW(), NOW()),
 ('TAPE001','Scotch Tape','Transparent tape', 2.00, 200, 20, NULL, 'Office Supplies', '3M', 'Scotch', '1-inch width', 1, NOW(), NOW()),
 ('NOTEBOOK001','Spiral Notebook','A4 spiral notebook, 100 pages', 8.00, 100, 10, NULL, 'Paper', 'Oxford', 'A4', 'Lined, spiral', 1, NOW(), NOW()),
 ('HIGHLIGHTER001','Yellow Highlighter','Fluorescent yellow', 1.00, 150, 15, NULL, 'Writing', 'Stabilo', 'Boss', 'Yellow ink', 1, NOW(), NOW());

-- Tags for first few items
INSERT INTO `stationery_tags` (`stationery_id`,`tag`) VALUES
 (1,'pen'),(1,'blue'),(1,'ballpoint'),
 (2,'pen'),(2,'black'),(2,'gel'),
 (3,'marker'),(3,'red'),(3,'permanent'),
 (4,'paper'),(4,'a4'),(4,'white');

-- Done
