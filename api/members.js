const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all members
router.get('/', async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT s.Stid as id, s.Sname as name, s.Email, 'Student' as type, 
             d.Deptname as department, i.Lname as library
      FROM STUDENT s
      JOIN DEPARTMENT d ON s.Deptid = d.Deptid
      JOIN Ilibrary i ON d.Lid = i.Lid
    `);

    const [staff] = await db.query(`
      SELECT st.Staid as id, st.Stname as name, st.Email, 'Staff' as type,
             d.Deptname as department, i.Lname as library
      FROM STAFF st
      JOIN DEPARTMENT d ON st.Deptid = d.Deptid
      JOIN Ilibrary i ON d.Lid = i.Lid
    `);

    res.json([...students, ...staff]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const [student] = await db.query(`
      SELECT s.Stid as id, s.Sname as name, s.Email, 'Student' as type, 
             d.Deptname as department, i.Lname as library, m.Memid
      FROM STUDENT s
      JOIN DEPARTMENT d ON s.Deptid = d.Deptid
      JOIN Ilibrary i ON d.Lid = i.Lid
      JOIN Member m ON s.Memid = m.Memid
      WHERE s.Stid = ?
    `, [req.params.id]);

    if (student.length > 0) return res.json(student[0]);

    const [staff] = await db.query(`
      SELECT st.Staid as id, st.Stname as name, st.Email, 'Staff' as type,
             d.Deptname as department, i.Lname as library, m.Memid
      FROM STAFF st
      JOIN DEPARTMENT d ON st.Deptid = d.Deptid
      JOIN Ilibrary i ON d.Lid = i.Lid
      JOIN Member m ON st.Memid = m.Memid
      WHERE st.Staid = ?
    `, [req.params.id]);

    if (staff.length > 0) return res.json(staff[0]);

    res.status(404).json({ error: 'Member not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

module.exports = router;