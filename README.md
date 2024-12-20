# Library Management System

A basic web-based Library Management System built using Node.js, Express.js, MySQL, and EJS for templating. This application allows users to manage books, borrow and return books, and provides user roles (admin and member) with varying permissions.

---

## Features

- **User Authentication and Authorization**

  - User registration and login system with password encryption using `bcryptjs`.
  - Admin and Member roles with different access levels.

- **Book Management**

  - Admins can add, edit, delete, and import books in bulk.
  - Members can view and borrow books.

- **Borrowing System**

  - Members can borrow available books and return them when done.
  - Tracks borrowing and returning transactions.

- **Responsive Views**
  - Built using EJS templates for dynamic and reusable views.

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- A MySQL database.

### Steps

1. Clone this repository:

   ```bash
   git clone https://github.com/aniket-thapa/library-management-system.git
   cd library-management-system
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the database:

   - Run the following SQL script to set up the database:

     ```sql
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
     ```

   - Update `db.js` with your database credentials:
     ```javascript
     const pool = mysql.createPool({
       host: 'your-database-host',
       user: 'your-database-username',
       password: 'your-database-password',
       database: 'library_management',
     });
     ```

4. Start the server:

   ```bash
   npm start
   ```

5. Access the application in your browser at [http://localhost:3000](http://localhost:3000).

---

## Usage

### User Roles

- **Admin**:
  - Manage books (add, edit, delete, import, status).
  - View books.
- **Member**:
  - Browse books.
  - See his borrowed and returned books.

---

## Contributing

Contributions are welcome! Please follow the standard GitHub workflow:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

---

## Authors

- **Khalil Ahmed**
- **Aniket Thapa**

---

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
