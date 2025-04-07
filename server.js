const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db'); // Add this line

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); 

app.get('/api/libraries', async (req, res) => {
  try {
    const [libraries] = await db.query('SELECT Lid, Lname FROM Ilibrary');
    res.json(libraries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch libraries' });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const [departments] = await db.query('SELECT Deptid, Deptname FROM DEPARTMENT');
    res.json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// API Routes
const booksRouter = require('./api/books.js');
const membersRouter = require('./api/members.js');
app.use('/api/books', booksRouter);
app.use('/api/members', membersRouter);

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});