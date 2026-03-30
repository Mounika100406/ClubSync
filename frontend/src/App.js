import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import StudentDashboard from "./pages/StudentDashboard";

function App() {

  return (

    <Router>

      <Routes>

        {/* Admin */}

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Student */}

        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />

      </Routes>

    </Router>

  );

}

export default App;