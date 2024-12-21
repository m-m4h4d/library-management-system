CREATE DATABASE library_management;
USE library_management;

CREATE TABLE books (
id INT AUTO_INCREMENT PRIMARY KEY,
title VARCHAR(255) NOT NULL,
author VARCHAR(255) NOT NULL,
genre VARCHAR(100),
year INT,
available BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role ENUM('admin', 'member') DEFAULT 'member'
);

CREATE TABLE transactions (
id INT AUTO_INCREMENT PRIMARY KEY,
book_id INT NOT NULL,
user_id INT NOT NULL,
borrow_date DATE NOT NULL,
return_date DATE,
status ENUM('borrowed', 'returned') DEFAULT 'borrowed',
FOREIGN KEY (book_id) REFERENCES books(id),
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);