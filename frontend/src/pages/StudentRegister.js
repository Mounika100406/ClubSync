import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StudentRegister() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");

  // ================= REGISTER FUNCTION =================

  const handleRegister = async () => {

    if (!name || !email || !password || !phone || !branch || !section) {
      alert("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {

      const res = await axios.post(
        "https://clubsync-8i0l.onrender.com/student-register",
        {
          name,
          email,
          password,
          phone,
          branch,
          section
        }
      );

      alert(res.data.message);

      if (res.data.message === "Student Registered Successfully") {

        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setBranch("");
        setSection("");

        // Redirect to login
        navigate("/student-login");
      }

    } catch (error) {

      console.log(error);
      alert("Registration Failed");

    }

  };

  // ================= UI =================

  return (

    <div style={{ textAlign: "center", marginTop: "100px" }}>

      <h2>Student Registration</h2>

      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Enter Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Enter Branch (CSE / ECE / IT)"
        value={branch}
        onChange={(e) => setBranch(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Enter Section (A / B / C)"
        value={section}
        onChange={(e) => setSection(e.target.value)}
      />

      <br /><br />

      <button onClick={handleRegister}>
        Register
      </button>

      <br /><br />

      <button onClick={() => navigate("/student-login")}>
        Go to Student Login
      </button>

      <br /><br />

      <button onClick={() => navigate("/")}>
        Back to Main Login
      </button>

    </div>

  );

}

export default StudentRegister;

