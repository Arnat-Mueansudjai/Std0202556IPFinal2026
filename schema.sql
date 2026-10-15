-- SQL Script for Database: ip_std6730202556
-- Tables: ArMuean_Employees and ArMuean_User

-- 1. Table: ArMuean_Employees
CREATE TABLE IF NOT EXISTS `ArMuean_Employees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `position` VARCHAR(100) NOT NULL,
  `status` ENUM('Active', 'On Leave') NOT NULL DEFAULT 'Active',
  `salary` DECIMAL(10, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (กรณีมีตาราง employees อยู่เดิม ให้เปลี่ยนชื่อ)
-- RENAME TABLE `employees` TO `ArMuean_Employees`;

-- Mock Data for ArMuean_Employees (6 รายการ)
INSERT INTO `ArMuean_Employees` (`name`, `position`, `status`, `salary`) VALUES
('John Doe', 'Software Engineer', 'Active', 45000.00),
('Jane Smith', 'Senior Developer', 'Active', 65000.00),
('Somchai Prasert', 'HR Specialist', 'On Leave', 32000.00),
('Suda Jaidee', 'Junior Developer', 'Active', 25000.00),
('Wichai Raksa', 'Engineering Manager', 'Active', 85000.00),
('Nattaporn Boonmee', 'Intern Programmer', 'Active', 18000.00)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 2. Table: ArMuean_User (สำหรับระบบ Login แบ่งระดับสิทธิ์ Admin / HR / Staff)
CREATE TABLE IF NOT EXISTS `ArMuean_User` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'hr', 'staff') NOT NULL DEFAULT 'staff',
  `name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users Data: 6 รายการ (ครบตามเกณฑ์ตัวอย่างข้อมูลอย่างน้อย 5 รายการ)
INSERT INTO `ArMuean_User` (`username`, `password`, `role`, `name`) VALUES
('admin', 'password123', 'admin', 'System Administrator'),
('admin2', 'admin123', 'admin', 'Deputy Administrator'),
('hr_user', 'hr123', 'hr', 'HR Manager'),
('hr_specialist', 'hr123', 'hr', 'HR Specialist'),
('staff', 'staff123', 'staff', 'General Staff'),
('staff_viewer', 'staff123', 'staff', 'Junior Staff')
ON DUPLICATE KEY UPDATE `password` = VALUES(`password`), `role` = VALUES(`role`), `name` = VALUES(`name`);
