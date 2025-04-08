const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// --- Simple Session & Role Middleware ---
// NOTE: In a real app, use express-session or JWT for proper session management and auth.
app.use((req, res, next) => {
    // Simulate attaching role based on a (very insecure) header or query param for demo
    // In a real app, this would come from a verified session/token
    req.userRole = req.headers['x-user-role'] || 'guest'; // Default to guest if no role header
    next();
});

function checkAdminRole(req, res, next) {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
}
// --- End Middleware ---

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',     // Your MySQL username
    password: '91689168',  // Your MySQL password
    database: 'SIULibrary', // Your database name
    port: 3306
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Helper function to safely handle SQL queries
function escapeObject(obj) {
    const escaped = {};
    for (const [key, value] of Object.entries(obj)) {
        escaped[key] = connection.escape(value);
    }
    return escaped;
}

// === API Routes ===

// --- Table Schema --- 
app.get('/api/schema/:tableName', (req, res) => {
    const tableName = connection.escapeId(req.params.tableName);
    // Query INFORMATION_SCHEMA (adjust db name if needed)
    const query = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${connection.config.database}' AND TABLE_NAME = ${tableName.replace(/`/g, "'")}`;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching schema:', err);
            res.status(500).json({ error: 'Error fetching table schema' });
            return;
        }
        if (results.length === 0) {
             res.status(404).json({ error: 'Table not found or no columns' });
             return;
        }
        const columns = results.map(row => row.COLUMN_NAME);
        res.json({ columns });
    });
});

// --- General Table Data (Read for all, Write for Admin) ---
// Get table data (Accessible by all logged-in users)
app.get('/api/table/:tableName', (req, res) => {
    if (req.userRole === 'guest') return res.status(401).json({ error: 'Unauthorized' }); // Basic check

    const tableName = connection.escapeId(req.params.tableName);
    const query = `SELECT * FROM ${tableName}`;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Error fetching table data' });
            return;
        }
        res.json(results);
    });
});

// Add record to table (Admin Only)
app.post('/api/table/:tableName', checkAdminRole, (req, res) => { // Added checkAdminRole middleware
    const tableName = connection.escapeId(req.params.tableName);
    const data = escapeObject(req.body);
    
    const fields = Object.keys(data).map(connection.escapeId).join(', ');
    const values = Object.values(data).join(', '); // Already escaped by escapeObject
    
    const query = `INSERT INTO ${tableName} (${fields}) VALUES (${values})`;
    
    connection.query(query, (err, result) => {
        if (err) {
            console.error('Error adding record:', err);
            res.status(500).json({ error: 'Error adding record' });
            return;
        }
        res.json({ message: 'Record added successfully', id: result.insertId });
    });
});

// Update record in table (Admin Only - Assuming primary key is always named 'id')
// Note: This needs improvement if primary keys have different names
app.put('/api/table/:tableName', checkAdminRole, (req, res) => { // Added checkAdminRole middleware
    const tableName = connection.escapeId(req.params.tableName);
    // Find primary key (simple assumption, might need a more robust way)
    const primaryKey = Object.keys(req.body).find(key => key.toLowerCase().includes('id')) || 'id'; // Guess PK
    const pkValue = connection.escape(req.body[primaryKey]);

    if (!pkValue || pkValue.toLowerCase() === 'null') {
         return res.status(400).json({ error: 'Primary key value is required for update.' });
    }

    const dataToUpdate = { ...req.body };
    delete dataToUpdate[primaryKey]; // Don't include PK in SET clause
    const escapedData = escapeObject(dataToUpdate);
    
    const updates = Object.entries(escapedData)
        .map(([key, value]) => `${connection.escapeId(key)} = ${value}`)
        .join(', ');

    if (!updates) {
        return res.status(400).json({ error: 'No fields provided for update.' });
    }
    
    const query = `UPDATE ${tableName} SET ${updates} WHERE ${connection.escapeId(primaryKey)} = ${pkValue}`;
    
    connection.query(query, (err, result) => {
        if (err) {
            console.error('Error updating record:', err);
            res.status(500).json({ error: 'Error updating record' });
            return;
        }
        if (result.affectedRows === 0) {
             return res.status(404).json({ error: 'Record not found for update.' });
        }
        res.json({ message: 'Record updated successfully' });
    });
});

// Delete record from table (Admin Only)
app.delete('/api/table/:tableName', checkAdminRole, (req, res) => { // Added checkAdminRole middleware
    const tableName = connection.escapeId(req.params.tableName);
    const conditions = Object.entries(escapeObject(req.body))
        .map(([key, value]) => `${connection.escapeId(key)} = ${value}`)
        .join(' AND ');

    if (!conditions) {
        return res.status(400).json({ error: 'No conditions provided for delete.' });
    }
    
    const query = `DELETE FROM ${tableName} WHERE ${conditions}`;
    
    connection.query(query, (err, result) => {
        if (err) {
            console.error('Error deleting record:', err);
            res.status(500).json({ error: 'Error deleting record' });
            return;
        }
         if (result.affectedRows === 0) {
             return res.status(404).json({ error: 'Record not found for deletion.' });
        }
        res.json({ message: 'Record deleted successfully' });
    });
});

// --- Book Specific Routes (For User Role) ---
app.get('/api/books/browse', (req, res) => {
    if (req.userRole === 'guest') return res.status(401).json({ error: 'Unauthorized' });

    // Select relevant book details for browsing - Using provided columns
    const query = `
        SELECT Bid, Bname, Price, Lid 
        FROM BOOKS 
        ORDER BY Bname;
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching books for browsing:', err);
            res.status(500).json({ error: 'Error fetching books' });
            return;
        }
        // Renaming Bname to Title for frontend consistency
        const formattedBooks = results.map(book => ({
            Bid: book.Bid,
            Title: book.Bname, // Rename Bname to Title
            Price: book.Price,
            Lid: book.Lid,
            // Add other fields like Category/Author here if you join tables later
            // Availability: 'Available' // Keep dummy availability for now
        }));
        res.json(formattedBooks);
    });
});

// --- Issue Book (For User Role - Basic Implementation) ---
app.post('/api/books/issue', (req, res) => {
    if (req.userRole === 'guest') return res.status(401).json({ error: 'Unauthorized' });
    if (req.userRole === 'admin') return res.status(403).json({ error: 'Admins cannot issue books via this interface.' });

    const { bookId, userId, issueDate, dueDate } = req.body; // Get dates from body

    if (!bookId || !userId || !issueDate || !dueDate) { // Check for dates
        return res.status(400).json({ error: 'Book ID, User ID, Issue Date, and Due Date are required.' });
    }
    
    // Basic date validation (server-side)
    const issueDt = new Date(issueDate);
    const dueDt = new Date(dueDate);
    if (isNaN(issueDt.getTime()) || isNaN(dueDt.getTime()) || dueDt <= issueDt) {
        return res.status(400).json({ error: 'Invalid dates provided.' });
    }

    // TODO: 
    // 1. Verify User ID
    // 2. Check Availability (using bookId)
    // 3. Check User Limits
    // 4. Create ISSUE Record (using bookId, verified userId, issueDate, dueDate)
    //    - `INSERT INTO ISSUE (Bid, Issued_to_Uid, Issue_date, Due_date) VALUES (?, ?, ?, ?)`
    // 5. Decrement Copies?
    // 6. Error Handling

    console.log(`Placeholder: Issuing book ${bookId} to user ${userId} from ${issueDate} to ${dueDate}`);
    res.json({ message: `Book ID ${bookId} issued successfully from ${issueDate} to ${dueDate} (Placeholder)` }); 
});

// --- Get Detailed Book Info (For User Role) ---
app.get('/api/books/details/:bookId', (req, res) => {
    if (req.userRole === 'guest') return res.status(401).json({ error: 'Unauthorized' });

    const bookId = connection.escape(req.params.bookId);
    if (!bookId) {
        return res.status(400).json({ error: 'Book ID is required.' });
    }

    // Example Query: Joins BOOKS, AUTHOR (via Writes), PUBLISHER, Noofcopies
    const query = `
        SELECT 
            b.Bid, b.Bname, b.Price, b.Lid, 
            GROUP_CONCAT(DISTINCT a.Aname SEPARATOR ', ') AS Authors, 
            p.Pname AS Publisher,
            nc.No_copies AS TotalCopies 
        FROM BOOKS b
        LEFT JOIN Writes w ON b.Bid = w.Bid
        LEFT JOIN AUTHOR a ON w.Aid = a.Aid
        LEFT JOIN PUBLISHER p ON b.Pid = p.Pid
        LEFT JOIN Noofcopies nc ON b.Bid = nc.Bid
        WHERE b.Bid = ${bookId}
        GROUP BY b.Bid, p.Pname, nc.No_copies;
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error(`Error fetching details for book ${req.params.bookId}:`, err);
            res.status(500).json({ error: 'Error fetching book details' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Book not found' });
            return;
        }
        // TODO: Calculate Available Copies
        const bookDetails = results[0];
        bookDetails.AvailableCopies = bookDetails.TotalCopies || 0; // Placeholder
        
        res.json(bookDetails);
    });
});

// --- Predefined Queries (Accessible by all logged-in users) ---
app.get('/api/execute-query/:queryId', (req, res) => {
    // Rigorous role check
    if (req.userRole !== 'admin' && req.userRole !== 'user') {
        return res.status(401).json({ error: 'Unauthorized: Login required' });
    }

    const queryId = req.params.queryId;
    let sqlQueryString;

    // Check if user role tries to run admin-only query
    if (queryId === '10' && req.userRole !== 'admin') {
        console.warn(`Role [${req.userRole}] attempted forbidden query ID: ${queryId}`);
        return res.status(403).json({ error: 'Forbidden: Query not allowed for your role.' });
    }

    // Map ID to SQL
    switch (queryId) {
        case '1': sqlQueryString = "SELECT * FROM Ilibrary WHERE city = 'Pune'"; break;
        case '2': sqlQueryString = "SELECT Institute_name FROM DEPARTMENT WHERE Deptname = 'CS'"; break;
        case '3': sqlQueryString = "SELECT * FROM BOOKS WHERE Price BETWEEN 800 AND 12000"; break;
        case '4': sqlQueryString = "SELECT * FROM Employee WHERE Salary <= 50000"; break;
        case '5': sqlQueryString = "SELECT * FROM SELLER WHERE SIname LIKE '%ta'"; break;
        case '6': sqlQueryString = "SELECT * FROM Ilibrary WHERE Area IS NULL"; break;
        case '7': sqlQueryString = "SELECT * FROM STAFF WHERE Stname NOT LIKE 'A%'"; break;
        case '8': sqlQueryString = "SELECT * FROM Ilibrary WHERE city = 'Bangalore'"; break;
        case '9': sqlQueryString = "SELECT * FROM STUDENT WHERE Deptid IN (SELECT Deptid FROM DEPARTMENT WHERE Deptname = 'Civil')"; break;
        case '10': sqlQueryString = "DELETE FROM PURCHASE WHERE YEAR(Date) = 2016"; break;
        default:
            console.error(`Invalid query ID requested: ${queryId}`);
            return res.status(400).json({ error: 'Invalid query ID' });
    }

    // Log before executing
    console.log(`[${new Date().toISOString()}] Role: ${req.userRole} | Executing Query ID ${queryId}:`);
    console.log(`SQL: ${sqlQueryString}`);

    // Execute the query
    connection.query(sqlQueryString, (err, results) => {
        if (err) {
            // Log detailed error
            console.error(`[${new Date().toISOString()}] Database error for Query ID ${queryId}:`);
            console.error(`SQL attempted: ${sqlQueryString}`);
            console.error('Error details:', err);
            // Send back a generic error but include details for debugging
            return res.status(500).json({ 
                error: 'Database error during query execution.', 
                details: err.code // Send code like ER_NO_SUCH_TABLE etc.
            });
        }
        
        // Log success
        console.log(`[${new Date().toISOString()}] Query ID ${queryId} executed successfully.`);
        if(results.affectedRows !== undefined) {
             console.log(`Affected rows: ${results.affectedRows}`);
        } else {
             console.log(`Rows returned: ${results.length}`);
        }
        
        // Send results back
        res.json(results);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});