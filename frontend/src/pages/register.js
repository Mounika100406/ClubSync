import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clubId, setClubId] = useState("");

  // ================= REGISTER FUNCTION =================

  const handleRegister = async () => {

    // ✅ Validation
    if (!name || !email || !password || !clubId) {
      alert("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {

      const res = await axios.post(
        "http://localhost:5000/register",
        {
          name,
          email,
          password,
          club_id: clubId   // ✅ IMPORTANT FIX
        }
      );

      alert(res.data.message);

      if (res.data.message === "Admin Registered Successfully") {

        // Clear fields
        setName("");
        setEmail("");
        setPassword("");
        setClubId("");

        // Redirect
        navigate("/");
      }

    } catch (error) {

      console.log(error);

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Registration Failed");
      }

    }

  };

  // ================= UI =================

  return (

    <div style={{ textAlign: "center", marginTop: "100px" }}>

      <h2>Club Admin Registration</h2>

      <input
        type="text"
        placeholder="Enter Club Name"
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

      {/* ✅ NEW FIELD */}
      <input
        type="text"
        placeholder="Enter Club ID"
        value={clubId}
        onChange={(e) => setClubId(e.target.value)}
      />

      <br /><br />

      <button onClick={handleRegister}>
        Register
      </button>

      <br /><br />

      <button onClick={() => navigate("/")}>
        Back to Login
      </button>

    </div>

  );

}

export default Register;