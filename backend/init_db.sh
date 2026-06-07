#!/bin/bash
# Database initialization script for MySQL

# Create database
mysql -u root -pShiva@56 -e "CREATE DATABASE IF NOT EXISTS resume_screening CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create user
mysql -u root -pShiva@56 -e "CREATE USER IF NOT EXISTS 'recruit_user'@'localhost' IDENTIFIED BY 'recruit_pass'; GRANT ALL PRIVILEGES ON resume_screening.* TO 'recruit_user'@'localhost'; FLUSH PRIVILEGES;"

echo "Database initialized successfully"
