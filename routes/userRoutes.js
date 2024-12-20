const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const flash = require('connect-flash');
const router = express.Router();
const db = require('../db');

// Middleware for sessions
router.use(
  session({
    secret: 'library_secret',
    resave: false,
    saveUninitialized: true,
  })
);
router.use(flash());

// Render register page
router.get('/register', (req, res) => {
  res.render('users/register', { title: 'Register' });
});

// Registration
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role || 'member'],
    (err, results) => {
      if (err) {
        req.flash('error', 'Error creating user');
        return res.redirect('/register');
      }
      req.flash('success', 'User registered successfully');
      res.redirect('/login');
    }
  );
});

// Render login page
router.get('/login', (req, res) => {
  res.render('users/login', { title: 'Login' });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, results) => {
      if (err || results.length === 0) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }

      req.session.user = user;
      res.redirect('/dashboard');
    }
  );
});

// Render dashboard
router.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('dashboard', { title: 'Dashboard', user: req.session.user });
});

// Logout user
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
