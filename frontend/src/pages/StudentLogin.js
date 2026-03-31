import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StudentLogin() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {

      const res = await axios.post(
        "https://clubsync-8i0l.onrender.com/student-login",
        {
          email,
          password
        }
      );

      alert(res.data.message);

      if (res.data.message === "Login Success") {

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "student");
        localStorage.setItem("userId", res.data.student.id);

        navigate("/student-dashboard");

      }

    } catch (error) {

      alert("Login Failed");

    }

  };

  return (

    <div className="container">

      <h2>Student Login</h2>

      <input
        type="email"
        placeholder="Enter Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Enter Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>
        Login
      </button>

      <br /><br />

      {/* REGISTER BUTTON FOR NEW STUDENTS */}

      <p>New Student?</p>

      <button onClick={() => navigate("/student-register")}>
        Register Here
      </button>

      <br /><br />

      <button onClick={() => navigate("/")}>
        Back to Main Login
      </button>

    </div>

  );

}

export default StudentLogin;