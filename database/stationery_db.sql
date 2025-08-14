-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 14, 2025 at 07:22 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `stationery_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `amount_role_thresholds`
--

CREATE TABLE `amount_role_thresholds` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role` enum('ENGINEER','MANAGER','BUSINESS_MANAGER','MANAGING_DIRECTOR') NOT NULL,
  `monthly_limit` decimal(10,2) NOT NULL,
  `quarterly_limit` decimal(10,2) NOT NULL,
  `yearly_limit` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `amount_role_thresholds`
--

INSERT INTO `amount_role_thresholds` (`id`, `role`, `monthly_limit`, `quarterly_limit`, `yearly_limit`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'ENGINEER', 500.00, 1500.00, 5000.00, 'Engineer limits', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51'),
(2, 'MANAGER', 1000.00, 3000.00, 10000.00, 'Manager limits', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51'),
(3, 'BUSINESS_MANAGER', 2000.00, 6000.00, 20000.00, 'Business Manager limits', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51'),
(4, 'MANAGING_DIRECTOR', 5000.00, 15000.00, 50000.00, 'MD limits', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_no` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('EMPLOYEE','MANAGER','SUPER_ADMIN') NOT NULL,
  `email` varchar(255) NOT NULL,
  `superior_employee_no` varchar(50) DEFAULT NULL,
  `grade` varchar(50) NOT NULL,
  `location` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `approval_status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `phone_number` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `employee_no`, `name`, `role`, `email`, `superior_employee_no`, `grade`, `location`, `username`, `password_hash`, `is_active`, `approval_status`, `created_at`, `updated_at`, `phone_number`) VALUES
(1, 'EMP001', 'Employee User', 'EMPLOYEE', 'test.employee.2024@hmt.com', 'EMP002', 'L3', 'HCM', 'engineer', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'APPROVED', '2025-08-13 10:50:51', '2025-08-14 10:16:00', NULL),
(2, 'EMP002', 'Manager User', 'MANAGER', 'test.manager.2024@hmt.com', 'EMP003', 'L4', 'HCM', 'manager', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'APPROVED', '2025-08-13 10:50:51', '2025-08-14 10:16:00', NULL),
(3, 'EMP003', 'Super Admin User', 'MANAGER', 'test.admin.2024@hmt.com', 'EMP004', 'L5', 'HCM', 'bm', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'APPROVED', '2025-08-13 10:50:51', '2025-08-14 03:22:17', NULL),
(4, 'EMP004', 'Alice Managing Director', 'MANAGER', 'md@hmt.com', NULL, 'L6', 'HCM', 'md', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'APPROVED', '2025-08-13 10:50:51', '2025-08-14 03:22:12', NULL),
(11, 'EMP300', 'Khanh Nguyen', 'SUPER_ADMIN', 'admin.new@hmt.com', NULL, 'L6', 'Ho Chi Minh', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'APPROVED', '2025-08-13 23:17:03', '2025-08-14 03:51:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `recipient_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('REQUEST_CREATED','REQUEST_APPROVED','REQUEST_REJECTED','REQUEST_CANCELED','REQUEST_WITHDRAWN','PASSWORD_CHANGED','SYSTEM_ANNOUNCEMENT') NOT NULL,
  `related_entity_type` varchar(100) DEFAULT NULL,
  `related_entity_id` bigint(20) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `is_sent` tinyint(1) NOT NULL DEFAULT 0,
  `sent_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `recipient_id`, `title`, `message`, `type`, `related_entity_type`, `related_entity_id`, `is_read`, `read_at`, `is_sent`, `sent_at`, `created_at`) VALUES
(1, 3, 'New Stationery Request', 'You have a new stationery request from Mary Manager for Blue Ballpoint Pen', 'REQUEST_CREATED', 'StationeryRequest', 1, 0, NULL, 0, NULL, '2025-08-13 06:16:57'),
(2, 3, 'New Stationery Request', 'You have a new stationery request from Mary Manager for Black Gel Pen', 'REQUEST_CREATED', 'StationeryRequest', 2, 0, NULL, 0, NULL, '2025-08-13 06:51:30'),
(3, 2, 'New Stationery Request', 'You have a new stationery request from John Engineer for Blue Ballpoint Pen', 'REQUEST_CREATED', 'StationeryRequest', 3, 0, NULL, 0, NULL, '2025-08-13 06:57:39'),
(4, 1, 'Request Approved', 'Your request for Blue Ballpoint Pen has been approved', 'REQUEST_APPROVED', 'StationeryRequest', 3, 0, NULL, 0, NULL, '2025-08-13 07:12:20'),
(5, 3, 'New Stationery Request', 'You have a new stationery request from Mary Manager for Blue Ballpoint Pen', 'REQUEST_CREATED', 'StationeryRequest', 4, 0, NULL, 0, NULL, '2025-08-13 07:56:39'),
(6, 2, 'New Stationery Request', 'You have a new stationery request from Employee User for Blue Ballpoint Pen', 'REQUEST_CREATED', 'StationeryRequest', 5, 0, NULL, 0, NULL, '2025-08-14 02:33:57'),
(7, 1, 'Request Approved', 'Your request for Blue Ballpoint Pen has been approved', 'REQUEST_APPROVED', 'StationeryRequest', 5, 0, NULL, 0, NULL, '2025-08-14 02:38:54');

-- --------------------------------------------------------

--
-- Table structure for table `request_history`
--

CREATE TABLE `request_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `actor_id` bigint(20) UNSIGNED NOT NULL,
  `previous_status` enum('DRAFT','SUBMITTED','APPROVED','REJECTED','CANCELED','WITHDRAWN') DEFAULT NULL,
  `new_status` enum('DRAFT','SUBMITTED','APPROVED','REJECTED','CANCELED','WITHDRAWN') DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `request_history`
--

INSERT INTO `request_history` (`id`, `request_id`, `action`, `description`, `actor_id`, `previous_status`, `new_status`, `created_at`) VALUES
(6, 5, 'REQUEST_CREATED', 'Request created', 1, NULL, NULL, '2025-08-14 02:33:57'),
(7, 5, 'REQUEST_APPROVED', NULL, 11, NULL, NULL, '2025-08-14 02:38:54');

-- --------------------------------------------------------

--
-- Table structure for table `stationeries`
--

CREATE TABLE `stationeries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `cost` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL,
  `minimum_stock` int(11) NOT NULL DEFAULT 10,
  `image_url` varchar(500) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `specifications` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stationeries`
--

INSERT INTO `stationeries` (`id`, `code`, `name`, `description`, `cost`, `stock_quantity`, `minimum_stock`, `image_url`, `category`, `brand`, `model`, `specifications`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'PEN001', 'Blue Ballpoint Pen', 'High-quality blue ballpoint pen', 2.50, 492, 50, NULL, 'Writing', 'Bic', 'Cristal', 'Blue ink, 1.0mm tip', 1, '2025-08-13 10:50:51', '2025-08-14 02:38:54'),
(2, 'PEN002', 'Black Gel Pen', 'Smooth black gel pen', 3.00, 300, 30, NULL, 'Writing', 'Pilot', 'G2', 'Black ink, 0.7mm', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51'),
(3, 'PEN003', 'Red Marker', 'Permanent red marker', 1.50, 200, 20, NULL, 'Writing', 'Sharpie', 'Fine', 'Red ink', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51'),
(4, 'PAPER001', 'A4 White Paper', 'Premium A4, 80gsm', 0.05, 10000, 1000, NULL, 'Paper', 'Double A', 'A4', '80gsm white', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51'),
(5, 'PAPER002', 'Sticky Notes', '3x3 yellow sticky notes', 0.02, 5000, 500, NULL, 'Paper', 'Post-it', '3x3', 'Yellow, 100 sheets', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51'),
(6, 'STAPLER001', 'Desktop Stapler', 'Heavy-duty stapler', 15.00, 50, 5, NULL, 'Office Supplies', 'Swingline', '747', '20-sheet', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51'),
(7, 'SCISSORS001', 'Office Scissors', '8-inch scissors', 12.00, 30, 3, NULL, 'Office Supplies', 'Fiskars', '8-inch', 'Stainless steel', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51'),
(8, 'TAPE001', 'Scotch Tape', 'Transparent tape', 2.00, 200, 20, NULL, 'Office Supplies', '3M', 'Scotch', '1-inch width', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51'),
(9, 'NOTEBOOK001', 'Spiral Notebook', 'A4 spiral notebook, 100 pages', 8.00, 100, 10, NULL, 'Paper', 'Oxford', 'A4', 'Lined, spiral', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51'),
(10, 'HIGHLIGHTER001', 'Yellow Highlighter', 'Fluorescent yellow', 1.00, 150, 15, NULL, 'Writing', 'Stabilo', 'Boss', 'Yellow ink', 1, '2025-08-13 10:50:51', '2025-08-13 10:50:51');

-- --------------------------------------------------------

--
-- Table structure for table `stationery_requests`
--

CREATE TABLE `stationery_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_number` varchar(100) NOT NULL,
  `requester_id` bigint(20) UNSIGNED NOT NULL,
  `stationery_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `to_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('DRAFT','SUBMITTED','APPROVED','REJECTED','CANCELED','WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
  `approver_id` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stationery_requests`
--

INSERT INTO `stationery_requests` (`id`, `request_number`, `requester_id`, `stationery_id`, `quantity`, `to_date`, `reason`, `status`, `approver_id`, `approved_at`, `rejection_reason`, `total_cost`, `created_at`, `updated_at`) VALUES
(5, 'REQ-1755138837508', 1, 1, 6, '2025-09-06', 'ssssss', 'APPROVED', 2, '2025-08-14 02:38:54', NULL, 15.00, '2025-08-14 02:33:57', '2025-08-14 02:38:54');

-- --------------------------------------------------------

--
-- Table structure for table `stationery_tags`
--

CREATE TABLE `stationery_tags` (
  `stationery_id` bigint(20) UNSIGNED NOT NULL,
  `tag` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stationery_tags`
--

INSERT INTO `stationery_tags` (`stationery_id`, `tag`) VALUES
(1, 'ballpoint'),
(1, 'blue'),
(1, 'pen'),
(2, 'black'),
(2, 'gel'),
(2, 'pen'),
(3, 'marker'),
(3, 'permanent'),
(3, 'red'),
(4, 'a4'),
(4, 'paper'),
(4, 'white');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `amount_role_thresholds`
--
ALTER TABLE `amount_role_thresholds`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_threshold_role` (`role`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_employees_employee_no` (`employee_no`),
  ADD UNIQUE KEY `uk_employees_email` (`email`),
  ADD UNIQUE KEY `uk_employees_username` (`username`),
  ADD KEY `idx_employees_role` (`role`),
  ADD KEY `idx_employees_superior` (`superior_employee_no`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_recipient` (`recipient_id`),
  ADD KEY `idx_notifications_is_read` (`is_read`),
  ADD KEY `idx_notifications_created_at` (`created_at`);

--
-- Indexes for table `request_history`
--
ALTER TABLE `request_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_history_request` (`request_id`),
  ADD KEY `idx_history_actor` (`actor_id`);

--
-- Indexes for table `stationeries`
--
ALTER TABLE `stationeries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_stationeries_code` (`code`),
  ADD KEY `idx_stationeries_category` (`category`),
  ADD KEY `idx_stationeries_active` (`is_active`);

--
-- Indexes for table `stationery_requests`
--
ALTER TABLE `stationery_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_requests_number` (`request_number`),
  ADD KEY `idx_requests_requester` (`requester_id`),
  ADD KEY `idx_requests_approver` (`approver_id`),
  ADD KEY `idx_requests_status` (`status`),
  ADD KEY `idx_requests_created_at` (`created_at`),
  ADD KEY `fk_requests_stationery` (`stationery_id`);

--
-- Indexes for table `stationery_tags`
--
ALTER TABLE `stationery_tags`
  ADD PRIMARY KEY (`stationery_id`,`tag`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `amount_role_thresholds`
--
ALTER TABLE `amount_role_thresholds`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `request_history`
--
ALTER TABLE `request_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `stationeries`
--
ALTER TABLE `stationeries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `stationery_requests`
--
ALTER TABLE `stationery_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `request_history`
--
ALTER TABLE `request_history`
  ADD CONSTRAINT `fk_history_actor` FOREIGN KEY (`actor_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_history_request` FOREIGN KEY (`request_id`) REFERENCES `stationery_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stationery_requests`
--
ALTER TABLE `stationery_requests`
  ADD CONSTRAINT `fk_requests_approver` FOREIGN KEY (`approver_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_requests_requester` FOREIGN KEY (`requester_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_requests_stationery` FOREIGN KEY (`stationery_id`) REFERENCES `stationeries` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `stationery_tags`
--
ALTER TABLE `stationery_tags`
  ADD CONSTRAINT `fk_tags_stationery` FOREIGN KEY (`stationery_id`) REFERENCES `stationeries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
