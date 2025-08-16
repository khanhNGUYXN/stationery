-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 15, 2025 at 10:54 AM
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

-- --------------------------------------------------------

--
-- Table structure for table `request_items`
--

CREATE TABLE `request_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_id` bigint(20) UNSIGNED NOT NULL,
  `stationery_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `total_cost` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `monthly_limit` decimal(10,2) DEFAULT NULL,
  `quarterly_limit` decimal(10,2) DEFAULT NULL,
  `yearly_limit` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stationery_requests`
--

CREATE TABLE `stationery_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_number` varchar(100) NOT NULL,
  `requester_id` bigint(20) UNSIGNED NOT NULL,
  `to_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `item_count` int(11) NOT NULL DEFAULT 0,
  `status` enum('DRAFT','SUBMITTED','APPROVED','REJECTED','CANCELED','WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
  `approver_id` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stationery_tags`
--

CREATE TABLE `stationery_tags` (
  `stationery_id` bigint(20) UNSIGNED NOT NULL,
  `tag` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Indexes for table `request_items`
--
ALTER TABLE `request_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_request_id` (`request_id`),
  ADD KEY `idx_stationery_id` (`stationery_id`);

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
  ADD KEY `idx_requests_created_at` (`created_at`);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `request_history`
--
ALTER TABLE `request_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `request_items`
--
ALTER TABLE `request_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stationeries`
--
ALTER TABLE `stationeries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stationery_requests`
--
ALTER TABLE `stationery_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `request_items`
--
ALTER TABLE `request_items`
  ADD CONSTRAINT `request_items_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `stationery_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `request_items_ibfk_2` FOREIGN KEY (`stationery_id`) REFERENCES `stationeries` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stationery_requests`
--
ALTER TABLE `stationery_requests`
  ADD CONSTRAINT `fk_requests_approver` FOREIGN KEY (`approver_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_requests_requester` FOREIGN KEY (`requester_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `stationery_tags`
--
ALTER TABLE `stationery_tags`
  ADD CONSTRAINT `fk_tags_stationery` FOREIGN KEY (`stationery_id`) REFERENCES `stationeries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
