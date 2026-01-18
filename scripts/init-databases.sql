-- DBA Portal Database Initialization Script
-- This script creates all required databases for the microservices

-- Create databases
CREATE DATABASE IF NOT EXISTS vibe_auth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS vibe_revenue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS vibe_hr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS vibe_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS vibe_marketing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS vibe_clinic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to vibe user
GRANT ALL PRIVILEGES ON vibe_auth.* TO 'vibe'@'%';
GRANT ALL PRIVILEGES ON vibe_revenue.* TO 'vibe'@'%';
GRANT ALL PRIVILEGES ON vibe_hr.* TO 'vibe'@'%';
GRANT ALL PRIVILEGES ON vibe_inventory.* TO 'vibe'@'%';
GRANT ALL PRIVILEGES ON vibe_marketing.* TO 'vibe'@'%';
GRANT ALL PRIVILEGES ON vibe_clinic.* TO 'vibe'@'%';

FLUSH PRIVILEGES;

-- Log completion
SELECT 'All databases created successfully!' AS status;
