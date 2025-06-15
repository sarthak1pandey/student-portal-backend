import sql from 'mssql';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectToDB } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Student Portal API Running');
});

app.post('/register', async (req, res) => {
  const { name, email, course } = req.body;
  try {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('name', sql.VarChar, name)
      .input('email', sql.VarChar, email)
      .input('course', sql.VarChar, course)
      .query('INSERT INTO Students (Name, Email, Course) VALUES (@name, @email, @course)');
    res.json({ success: true, message: 'Student registered' });
  } catch (err) {
    console.error("Registration error:", err); // ✅ log full error
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/students', async (req, res) => {
  try {
    const pool = await connectToDB();
    const result = await pool.request().query('SELECT * FROM Students');
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Update student
app.put('/students/:id', async (req, res) => {
  const { name, email, course } = req.body;
  const { id } = req.params;
  try {
    const pool = await connectToDB();
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.VarChar, name)
      .input('email', sql.VarChar, email)
      .input('course', sql.VarChar, course)
      .query('UPDATE Students SET Name = @name, Email = @email, Course = @course WHERE ID = @id');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student
app.delete('/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await connectToDB();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Students WHERE ID = @id');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
