const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'employee_management',
  dateStrings: true
});

// Home route
app.get('/', (req, res) => {
  res.send('Employee Management System API is running!');
});

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const [employees] = await db.query(
      `SELECT id, name, email, phone, department, position,
      DATE_FORMAT(joining_date, '%Y-%m-%d') AS joining_date
      FROM employees ORDER BY id DESC`
    );

    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load employees.' });
  }
});

// Add employee
app.post('/api/employees', async (req, res) => {
  try {
    const { name, email, phone, department, position, joining_date } = req.body;

    if (!name || !email || !phone || !department || !position || !joining_date) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    const [result] = await db.execute(
      `INSERT INTO employees
      (name, email, phone, department, position, joining_date)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim(),
        phone.trim(),
        department,
        position.trim(),
        joining_date
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Employee saved successfully!'
    });
  } catch (error) {
    console.error(error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'This email address is already registered.'
      });
    }

    res.status(500).json({ message: 'Unable to save employee.' });
  }
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { name, email, phone, department, position, joining_date } = req.body;

    if (!name || !email || !phone || !department || !position || !joining_date) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    const [result] = await db.execute(
      `UPDATE employees
      SET name = ?, email = ?, phone = ?, department = ?,
      position = ?, joining_date = ?
      WHERE id = ?`,
      [
        name.trim(),
        email.trim(),
        phone.trim(),
        department,
        position.trim(),
        joining_date,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      const [rows] = await db.execute(
        'SELECT id FROM employees WHERE id = ?',
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Employee not found.' });
      }
    }

    res.json({ message: 'Employee updated successfully.' });
  } catch (error) {
    console.error(error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'This email address is already registered.'
      });
    }

    res.status(500).json({ message: 'Unable to update employee.' });
  }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM employees WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    res.json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete employee.' });
  }
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});