const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Dynamic table API endpoint
app.get('/api/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const [rows] = await db.query(`SELECT * FROM ${tableName}`);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to fetch data from ${req.params.tableName}` });
  }
});

// Dynamic table by ID endpoint
app.get('/api/tables/:tableName/:id', async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const [rows] = await db.query(`SELECT * FROM ${tableName} WHERE ${getPrimaryKey(tableName)} = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to fetch record from ${tableName}` });
  }
});

// Helper function to determine primary key
function getPrimaryKey(tableName) {
  switch(tableName) {
    case 'STUDENT': return 'Stid';
    case 'STAFF': return 'Staid';
    case 'BOOKS': return 'Bid';
    case 'DEPARTMENT': return 'Deptid';
    case 'Ilibrary': return 'Lid';
    case 'AUTHOR': return 'Aid';
    case 'PUBLISHER': return 'Pid';
    case 'WRITES': return 'Wid';
    case 'SELLER': return 'Sid';
    case 'PURCHASE': return 'Purchaseid';
    case 'AUTHOR_SPECIALIZATION': return 'ASid';
    case 'ISSUE': return 'Issueid';
    case 'SELLS': return 'Sellsid';
    case 'EMPLOYEE': return 'Eid';
    // Add other tables as needed
    default: return `${tableName.toLowerCase()}_id`; // Fallback
  }
}

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
