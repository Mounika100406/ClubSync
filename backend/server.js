const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const nodemailer = require("nodemailer");
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* =====================================================
        MYSQL CONNECTION
===================================================== */

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

/* =====================================================
        MAIL CONFIG
===================================================== */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
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

    db.query(
      "INSERT INTO admins (name,email,password) VALUES (?,?,?)",
      [name, email, hashedPassword],
      (err) => {
        if (err) return res.json({ message: "Error registering admin" });
        res.json({ message: "Admin Registered Successfully" });
      }
    );
  } catch {
    res.json({ message: "Server Error" });
  }
});

// ADMIN LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM admins WHERE email=?", [email], async (err, results) => {
    if (results.length === 0)
      return res.json({ message: "Admin Not Found" });

    const match = await bcrypt.compare(password, results[0].password);

    if (!match)
      return res.json({ message: "Wrong Password" });

    res.json({
      message: "Login Success",
      admin: {
        id: results[0].id,
        name: results[0].name
      }
    });
  });
});

// CREATE EVENT
app.post("/create-event", (req, res) => {
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

  db.query(
    `INSERT INTO events 
    (title,description,date,location,start_time,registration_deadline,max_students,admin_id)
    VALUES (?,?,?,?,?,?,?,?)`,
    [title, description, date, location, start_time, registration_deadline, max_students, admin_id],
    (err) => {
      if (err) return res.json({ message: "Error creating event" });
      res.json({ message: "Event Created Successfully" });
    }
  );
});

// ADMIN EVENTS
app.get("/events/:adminId", (req, res) => {
  db.query(
    `SELECT events.*, COUNT(registrations.id) AS registration_count
     FROM events
     LEFT JOIN registrations ON events.id = registrations.event_id
     WHERE admin_id=?
     GROUP BY events.id`,
    [req.params.adminId],
    (err, results) => res.json(results)
  );
});

// DELETE EVENT
app.delete("/delete-event/:id", (req, res) => {
  db.query("DELETE FROM registrations WHERE event_id=?", [req.params.id], () => {
    db.query("DELETE FROM events WHERE id=?", [req.params.id], () => {
      res.json({ message: "Event Deleted Successfully" });
    });
  });
});

// UPDATE EVENT
app.put("/update-event/:id", (req, res) => {
  const { title, description, date, location, start_time, registration_deadline } = req.body;

  db.query(
    `UPDATE events SET title=?,description=?,date=?,location=?,start_time=?,registration_deadline=? WHERE id=?`,
    [title, description, date, location, start_time, registration_deadline, req.params.id],
    () => res.json({ message: "Event Updated Successfully" })
  );
});

// STUDENTS LIST
app.get("/event-students/:eventId", (req, res) => {
  db.query(
    `SELECT students.name,students.email,students.phone,students.branch,students.section
     FROM registrations
     JOIN students ON registrations.student_id = students.id
     WHERE registrations.event_id=?`,
    [req.params.eventId],
    (err, results) => res.json(results)
  );
});

/* =====================================================
                STUDENT SECTION
===================================================== */

// STUDENT REGISTER
app.post("/student-register", async (req, res) => {
  const { name, email, password, phone, branch, section } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    `INSERT INTO students (name,email,password,phone,branch,section)
     VALUES (?,?,?,?,?,?)`,
    [name, email, hashedPassword, phone, branch, section],
    () => res.json({ message: "Student Registered Successfully" })
  );
});

// STUDENT LOGIN
app.post("/student-login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM students WHERE email=?", [email], async (err, results) => {
    if (results.length === 0)
      return res.json({ message: "Student Not Found" });

    const match = await bcrypt.compare(password, results[0].password);

    if (!match)
      return res.json({ message: "Wrong Password" });

    res.json({
      message: "Login Success",
      student: {
        id: results[0].id,
        name: results[0].name
      }
    });
  });
});

// REGISTER EVENT
app.post("/register-event", (req, res) => {
  const { student_id, event_id } = req.body;

  db.query(
    "SELECT * FROM registrations WHERE student_id=? AND event_id=?",
    [student_id, event_id],
    (err, result) => {
      if (result.length > 0)
        return res.json({ message: "Already Registered" });

      db.query(
        "SELECT COUNT(*) AS total FROM registrations WHERE event_id=?",
        [event_id],
        (err, countResult) => {

          db.query(
            "SELECT max_students FROM events WHERE id=?",
            [event_id],
            (err, eventResult) => {

              if (countResult[0].total >= eventResult[0].max_students)
                return res.json({ message: "Event Full" });

              db.query(
                "INSERT INTO registrations (student_id,event_id) VALUES (?,?)",
                [student_id, event_id],
                () => res.json({ message: "Registered Successfully" })
              );
            }
          );
        }
      );
    }
  );
});

// STUDENT EVENTS
app.get("/student-events", (req, res) => {
  db.query(
    `SELECT events.*, admins.name AS admin_name,
     COUNT(registrations.id) AS registration_count
     FROM events
     JOIN admins ON events.admin_id = admins.id
     LEFT JOIN registrations ON events.id = registrations.event_id
     WHERE events.date >= CURDATE()
     GROUP BY events.id
     ORDER BY events.date ASC`,
    (err, results) => res.json(results)
  );
});

// GET REGISTERED EVENTS FOR A STUDENT
app.get("/my-events/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  db.query(
    `SELECT events.*, admins.name AS admin_name
     FROM registrations
     JOIN events ON registrations.event_id = events.id
     JOIN admins ON events.admin_id = admins.id
     WHERE registrations.student_id = ?
     ORDER BY events.date ASC`,
    [studentId],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ message: "Error fetching events" });
      }
      res.json(results);
    }
  );
});

/* =====================================================
                DOWNLOAD SECTION
===================================================== */

// EXCEL
app.get("/download-excel/:eventId", async (req, res) => {
  db.query(
    `SELECT * FROM students JOIN registrations 
     ON students.id = registrations.student_id WHERE event_id=?`,
    [req.params.eventId],
    async (err, results) => {

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Students");

      sheet.columns = [
        { header: "Name", key: "name" },
        { header: "Email", key: "email" }
      ];

      results.forEach(r => sheet.addRow(r));

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    }
  );
});

// PDF
app.get("/download-pdf/:eventId", (req, res) => {
  db.query(
    `SELECT * FROM students JOIN registrations 
     ON students.id = registrations.student_id WHERE event_id=?`,
    [req.params.eventId],
    (err, results) => {

      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      doc.pipe(res);

      results.forEach(s => doc.text(`${s.name} - ${s.email}`));
      doc.end();
    }
  );
});

/* =====================================================
                SERVER START
===================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});