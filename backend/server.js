const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const nodemailer = require("nodemailer");
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* =====================================================
        POSTGRESQL CONNECTION (RENDER DB)
===================================================== */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/* =====================================================
        ROOT ROUTE
===================================================== */

app.get("/", (req, res) => {
  res.send("Server running successfully 🚀");
});

/* =====================================================
                ADMIN SECTION
===================================================== */

// ADMIN REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO admins (name,email,password) VALUES ($1,$2,$3)",
      [name, email, hashedPassword]
    );

    res.json({ message: "Admin Registered Successfully" });

  } catch (err) {
    console.log(err);
    res.json({ message: "Error registering admin" });
  }
});

// ADMIN LOGIN
app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const result = await pool.query(
      "SELECT * FROM admins WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.json({ message: "Admin Not Found" });

    const admin = result.rows[0];

    const match = await bcrypt.compare(password, admin.password);

    if (!match)
      return res.json({ message: "Wrong Password" });

    res.json({
      message: "Login Success",
      admin: {
        id: admin.id,
        name: admin.name
      }
    });

  } catch (err) {
    console.log(err);
    res.json({ message: "Error logging in" });
  }

});

// CREATE EVENT
app.post("/create-event", async (req, res) => {

  const {
    title,
    description,
    date,
    location,
    start_time,
    registration_deadline,
    max_students,
    admin_id
  } = req.body;

  try {

    await pool.query(
      `INSERT INTO events 
      (title,description,date,location,start_time,registration_deadline,max_students,admin_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [title, description, date, location, start_time, registration_deadline, max_students, admin_id]
    );

    res.json({ message: "Event Created Successfully" });

  } catch (err) {
    console.log(err);
    res.json({ message: "Error creating event" });
  }

});

// ADMIN EVENTS
app.get("/events/:adminId", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT events.*, COUNT(registrations.id) AS registration_count
       FROM events
       LEFT JOIN registrations ON events.id = registrations.event_id
       WHERE admin_id=$1
       GROUP BY events.id`,
      [req.params.adminId]
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.json([]);
  }

});

// DELETE EVENT
app.delete("/delete-event/:id", async (req, res) => {

  try {

    await pool.query("DELETE FROM registrations WHERE event_id=$1", [req.params.id]);
    await pool.query("DELETE FROM events WHERE id=$1", [req.params.id]);

    res.json({ message: "Event Deleted Successfully" });

  } catch (err) {
    console.log(err);
    res.json({ message: "Error deleting event" });
  }

});

// UPDATE EVENT
app.put("/update-event/:id", async (req, res) => {

  const { title, description, date, location, start_time, registration_deadline } = req.body;

  try {

    await pool.query(
      `UPDATE events SET title=$1,description=$2,date=$3,location=$4,start_time=$5,registration_deadline=$6 WHERE id=$7`,
      [title, description, date, location, start_time, registration_deadline, req.params.id]
    );

    res.json({ message: "Event Updated Successfully" });

  } catch (err) {
    console.log(err);
    res.json({ message: "Error updating event" });
  }

});

/* =====================================================
                STUDENT SECTION
===================================================== */

// STUDENT REGISTER
app.post("/student-register", async (req, res) => {

  const { name, email, password, phone, branch, section } = req.body;

  try {

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO students (name,email,password,phone,branch,section)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [name, email, hashedPassword, phone, branch, section]
    );

    res.json({ message: "Student Registered Successfully" });

  } catch (err) {
    console.log(err);
    res.json({ message: "Error registering student" });
  }

});

// STUDENT LOGIN
app.post("/student-login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const result = await pool.query(
      "SELECT * FROM students WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.json({ message: "Student Not Found" });

    const student = result.rows[0];

    const match = await bcrypt.compare(password, student.password);

    if (!match)
      return res.json({ message: "Wrong Password" });

    res.json({
      message: "Login Success",
      student: {
        id: student.id,
        name: student.name
      }
    });

  } catch (err) {
    console.log(err);
    res.json({ message: "Error logging in" });
  }

});

// REGISTER EVENT
app.post("/register-event", async (req, res) => {

  const { student_id, event_id } = req.body;

  try {

    const exists = await pool.query(
      "SELECT * FROM registrations WHERE student_id=$1 AND event_id=$2",
      [student_id, event_id]
    );

    if (exists.rows.length > 0)
      return res.json({ message: "Already Registered" });

    await pool.query(
      "INSERT INTO registrations (student_id,event_id) VALUES ($1,$2)",
      [student_id, event_id]
    );

    res.json({ message: "Registered Successfully" });

  } catch (err) {
    console.log(err);
    res.json({ message: "Error registering" });
  }

});

// STUDENT EVENTS
app.get("/student-events", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT events.*, admins.name AS admin_name,
       COUNT(registrations.id) AS registration_count
       FROM events
       JOIN admins ON events.admin_id = admins.id
       LEFT JOIN registrations ON events.id = registrations.event_id
       GROUP BY events.id
       ORDER BY events.date ASC`
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.json([]);
  }

});

// MY EVENTS
app.get("/my-events/:studentId", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT events.*, admins.name AS admin_name
       FROM registrations
       JOIN events ON registrations.event_id = events.id
       JOIN admins ON events.admin_id = admins.id
       WHERE registrations.student_id=$1`,
      [req.params.studentId]
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.json([]);
  }

});

/* =====================================================
                SERVER START
===================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});