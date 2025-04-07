const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all books
router.get('/', async (req, res) => {
  try {
    const [books] = await db.query(`
      SELECT b.Bid, b.Bname, b.Price, i.Lname as Library
      FROM BOOKS b
      LEFT JOIN Ilibrary i ON b.Lid = i.Lid
    `);
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const [book] = await db.query(`
      SELECT b.*, i.Lname as Library 
      FROM BOOKS b
      LEFT JOIN Ilibrary i ON b.Lid = i.Lid
      WHERE b.Bid = ?
    `, [req.params.id]);
    
    if (book.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(book[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Add new book
router.post('/', async (req, res) => {
  try {
    const { Bname, Price, Lid } = req.body;
    const [result] = await db.query(
      'INSERT INTO BOOKS (Bname, Price, Lid) VALUES (?, ?, ?)',
      [Bname, Price, Lid]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// Update book
router.put('/:id', async (req, res) => {
  try {
    const { Bname, Price, Lid } = req.body;
    const [result] = await db.query(
      'UPDATE BOOKS SET Bname = ?, Price = ?, Lid = ? WHERE Bid = ?',
      [Bname, Price, Lid, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM BOOKS WHERE Bid = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;