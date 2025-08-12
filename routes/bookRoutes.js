const express = require('express');
const db = require('../db');
const router = express.Router();

// List all books
router.get('/', (req, res) => {
  const user = req.session.user; // Get the logged-in user from the session
  if (!user) {
    return res.redirect('/login');
  }
  db.query('SELECT * FROM books', (err, results) => {
    if (err) {
      return res.status(500).send('Error retrieving books');
    }
    res.render('books/list', {
      title: 'Books List',
      books: results,
      user: user,
    });
  });
});

// Show form to add a book
router.get('/add', (req, res) => {
  const user = req.session.user; // Get the logged-in user from the session
  if (!user) {
    return res.redirect('/login');
  }
  if (user.role !== 'admin') {
    return res.redirect('/dashboard');
  }
  res.render('books/add', { title: 'Add New Book' });
});

// Handle adding a book
router.post('/add', (req, res) => {
  const { title, author, genre, year } = req.body;
  const available = req.body.available ? true : false;
  db.query(
    'INSERT INTO books (title, author, genre, year, available) VALUES (?, ?, ?, ?, ?)',
    [title, author, genre, year, available],
    (err) => {
      if (err) {
        return res.status(500).send('Error adding book');
      }
      res.redirect('/books');
    }
  );
});

// Show form to edit a book
router.get('/edit/:id', (req, res) => {
  const user = req.session.user; // Get the logged-in user from the session
  if (!user) {
    return res.redirect('/login');
  }
  const bookId = req.params.id;
  db.query('SELECT * FROM books WHERE id = ?', [bookId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('Book not found');
    }
    res.render('books/edit', { title: 'Edit Book', book: results[0] });
  });
});

// Handle editing a book
router.post('/edit/:id', (req, res) => {
  const bookId = req.params.id;
  const { title, author, genre, year } = req.body;
  const available = req.body.available ? true : false;
  db.query(
    'UPDATE books SET title = ?, author = ?, genre = ?, year = ?, available = ? WHERE id = ?',
    [title, author, genre, year, available, bookId],
    (err) => {
      if (err) {
        return res.status(500).send('Error updating book');
      }
      res.redirect('/books');
    }
  );
});

// Handle deleting a book
router.get('/delete/:id', (req, res) => {
  const user = req.session.user; // Get the logged-in user from the session
  if (!user) {
    return res.redirect('/login');
  }
  const bookId = req.params.id;
  db.query(
    'DELETE FROM books WHERE id = ? AND available = TRUE',
    [bookId],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error deleting book');
      }
      if (results.affectedRows > 0) {
        console.log('Book deleted successfully.');
      } else {
        console.log(
          'Book cannot be deleted. It might not be available or borrowed.'
        );
      }
      res.redirect('/books');
    }
  );
});

// Borrow Route
router.post('/borrow/:bookId', (req, res) => {
  const bookId = req.params.bookId;
  const { userId, userName } = req.body;
  const borrowDate = new Date();

  // Validate request inputs
  if (!userId || !userName) {
    return res.status(400).send('Invalid request. All fields are required.');
  }

  // Check if the user exists with the provided details
  db.query(
    'SELECT id FROM users WHERE id = ? AND name = ?',
    [userId, userName],
    (err, userResult) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal server error.');
      }

      if (userResult.length === 0) {
        return res.status(404).send('User not found or details do not match.');
      }

      // Insert transaction
      db.query(
        'INSERT INTO transactions (book_id, user_id, borrow_date) VALUES (?, ?, ?)',
        [bookId, userId, borrowDate],
        (err, transactionResult) => {
          if (err) {
            console.error('Error inserting transaction:', err);
            return res.status(500).send('Failed to borrow the book.');
          }

          // Update the book's availability
          db.query(
            'UPDATE books SET available = FALSE WHERE id = ? AND available = TRUE',
            [bookId],
            (err, updateResult) => {
              if (err) {
                console.error('Error updating book status:', err);
                return res
                  .status(500)
                  .send('Error updating book availability.');
              }

              if (updateResult.affectedRows === 0) {
                return res
                  .status(400)
                  .send('Book is not available or already borrowed.');
              }

              res.status(200).send('Book borrowed successfully.');
            }
          );
        }
      );
    }
  );
});

// Return Book Routes
router.post('/return/:bookId', (req, res) => {
  const bookId = req.params.bookId;
  const { userId, userName } = req.body;
  const returnDate = new Date();

  // Validate request inputs
  if (!userId || !userName) {
    return res.status(400).send('Invalid request. All fields are required.');
  }

  // Check if the user exists with the provided details
  db.query(
    'SELECT id FROM users WHERE id = ? AND name = ?',
    [userId, userName],
    (err, userResult) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal server error.');
      }

      if (userResult.length === 0) {
        return res.status(404).send('User not found or details do not match.');
      }

      // Insert transaction
      db.query(
        'UPDATE transactions SET return_date = ?, status = "returned" WHERE user_id = ? AND book_id = ?',
        [returnDate, userId, bookId],
        (err, transactionUpdateResult) => {
          if (err) {
            console.error('Error updating transaction:', err);
            return res.status(500).send('Failed to return the book.');
          }

          // Update the book's availability
          db.query(
            'UPDATE books SET available = TRUE WHERE id = ? AND available = FALSE',
            [bookId],
            (err, bookUpdateResult) => {
              if (err) {
                console.error('Error updating book status:', err);
                return res
                  .status(500)
                  .send('Error updating book availability.');
              }

              if (bookUpdateResult.affectedRows === 0) {
                return res
                  .status(400)
                  .send('Book is not available or already returned.');
              }

              res.status(200).send('Book returned successfully.');
            }
          );
        }
      );
    }
  );
});

// List borrowed books to user
// Route to fetch all borrowed books for a specific user
router.get('/borrowed', (req, res) => {
  const user = req.session.user; // Get the logged-in user from the session
  if (!user) {
    return res.redirect('/login');
  }
  const userId = user.id;

  // Query to fetch borrowed books for the user
  const query = `
    SELECT 
      books.id AS book_id, 
      books.title, 
      books.author, 
      books.genre, 
      books.year, 
      transactions.borrow_date, 
      transactions.return_date, 
      transactions.status
    FROM 
      transactions
    INNER JOIN 
      books 
    ON 
      transactions.book_id = books.id
    WHERE 
      transactions.user_id = ?;
  `;

  // Execute the query
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Internal server error.');
    }

    if (results.length === 0) {
      return res.status(404).send('No borrowed books found for this user.');
    }

    // res.status(200).json(results); // Send the borrowed books as JSON
    res.status(200).render('books/borrow-list', {
      title: 'My Borrowed List',
      books: results,
    });
  });
});

// Import CSV Books
router.get('/import', (req, res) => {
  const user = req.session.user; // Get the logged-in user from the session
  if (!user) {
    return res.redirect('/login');
  }
  if (user.role !== 'admin') {
    return res.redirect('/dashboard');
  }
  res.render('books/import-books', { title: 'Import CSV Books' });
});

router.post('/import', (req, res) => {
  const user = req.session.user; // Get the logged-in user from the session
  if (!user || user.role !== 'admin') {
    return res.redirect('/login');
  }

  const books = req.body;

  console.log(books);

  // Insert books into the database
  const values = books.map(
    (book) =>
      `('${book.title}', '${book.author}', '${book.genre}', ${book.year}, ${book.available})`
  );
  const query = `INSERT INTO books (title, author, genre, year, available) VALUES ${values.join(
    ', '
  )}`;

  db.query(query, (err) => {
    if (err) {
      console.error('Error inserting books:', err);
      return res.status(500).send('Error importing books.');
    }

    res.json({ message: 'Books imported successfully' });
  });
});

module.exports = router;
