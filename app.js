require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const session = require('express-session');
const app = express();

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: 'library_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

// Test Database Connection
db.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to the database');
  }
});

// Integrate Routes
const booksRoutes = require('./routes/bookRoutes');
const usersRoutes = require('./routes/userRoutes');

// Use books routes
app.use('/books', booksRoutes);
app.use('/', usersRoutes);

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Library Management System' });
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
