import React, { useState } from "react";
import axios from "axios";

function Login() {

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  /* ================= ADMIN LOGIN ================= */

  const adminLogin = async () => {

    try {

      const res = await axios.post("https://clubsync-8i0l.onrender.com/login", {
        email: adminEmail,
        password: adminPassword
      });

      alert(res.data.message);

      if (res.data.message === "Login Success") {

        localStorage.setItem("role", "admin");
        localStorage.setItem("userId", res.data.admin.id);
        localStorage.setItem("username", res.data.admin.name);

        window.location.href = "/dashboard";
      }

    } catch (error) {

      alert("Admin Login Failed");

    }

  };

  /* ================= STUDENT LOGIN ================= */

  const studentLogin = async () => {

    try {

      const res = await axios.post("https://clubsync-8i0l.onrender.com/student-login", {
        email: studentEmail,
        password: studentPassword
      });

      alert(res.data.message);

      if (res.data.message === "Login Success") {

        localStorage.setItem("role", "student");
        localStorage.setItem("userId", res.data.student.id);
        localStorage.setItem("username", res.data.student.name);

        window.location.href = "/student-dashboard";

      }

    } catch (error) {

      alert("Student Login Failed");

    }

  };

  /* ================= UI ================= */

  return (

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "50px",
        marginTop: "100px",
        fontFamily: "Arial"
      }}
    >

      {/* ADMIN LOGIN */}

      <div
        style={{
          border: "1px solid #ccc",
          padding: "30px",
          borderRadius: "10px",
          width: "300px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
      >

        <h2>Admin Login</h2>

        <input
          placeholder="Admin Email"
          onChange={(e) => setAdminEmail(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "10px" }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setAdminPassword(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "10px" }}
        />

        <button
          onClick={adminLogin}
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "8px",
            background: "green",
            color: "white",
            border: "none",
            borderRadius: "5px"
          }}
        >
          Login
        </button>

        <br /><br />

        <button
          onClick={() => window.location.href = "/register"}
          style={{
            width: "100%",
            padding: "8px"
          }}
        >
          Club Admin Register
        </button>

      </div>

      {/* STUDENT LOGIN */}

      <div
        style={{
          border: "1px solid #ccc",
          padding: "30px",
          borderRadius: "10px",
          width: "300px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
      >

        <h2>Student Login</h2>

        <input
          placeholder="Student Email"
          onChange={(e) => setStudentEmail(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "10px" }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setStudentPassword(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "10px" }}
        />

        <button
          onClick={studentLogin}
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "8px",
            background: "green",
            color: "white",
            border: "none",
            borderRadius: "5px"
          }}
        >
          Login
        </button>

        <br /><br />

        <button
          onClick={() => window.location.href = "/student-register"}
          style={{
            width: "100%",
            padding: "8px"
          }}
        >
          Student Register
        </button>

      </div>

    </div>

  );

}

export default Login;