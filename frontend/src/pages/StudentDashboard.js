import React, { useEffect, useState } from "react";
import axios from "axios";

function StudentDashboard() {

  const username = localStorage.getItem("username");
  const studentId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  /* ================= PROTECT DASHBOARD ================= */

  useEffect(() => {

    if (!studentId || role !== "student") {
      window.location.href = "/";
      return;
    }

    fetchEvents();
    fetchMyEvents();

  }, []);

  /* ================= FETCH EVENTS ================= */

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/student-events");
      const data = res.data || [];

      setEvents(data);
      setFilteredEvents(data);

    } catch (error) {
      console.log(error);
    }
  };

  /* ================= FETCH MY EVENTS ================= */

  const fetchMyEvents = async () => {
    try {

      // ✅ FIXED API NAME HERE
      const res = await axios.get(
        `http://localhost:5000/my-events/${studentId}`
      );

      const today = new Date();

      const validEvents = (res.data || []).filter(
        (event) => new Date(event.date) >= today
      );

      setMyEvents(validEvents);

    } catch (error) {
      console.log(error);
    }
  };

  /* ================= REGISTER EVENT ================= */

  const registerEvent = async (eventId) => {
    try {

      const res = await axios.post(
        "http://localhost:5000/register-event",
        {
          student_id: studentId,
          event_id: eventId
        }
      );

      alert(res.data.message);

      // ✅ refresh UI
      fetchEvents();
      fetchMyEvents();

    } catch (error) {
      console.log(error);
    }
  };

  /* ================= CANCEL REGISTRATION ================= */

  const cancelRegistration = async (eventId) => {
    try {

      await axios.delete(
        "http://localhost:5000/cancel-registration",
        {
          data: {
            student_id: studentId,
            event_id: eventId
          }
        }
      );

      alert("Registration Cancelled");

      fetchEvents();
      fetchMyEvents();

    } catch (error) {
      console.log(error);
    }
  };

  /* ================= EVENT STATUS ================= */

  const getStatus = (date) => {
    const today = new Date();
    return new Date(date) >= today ? "Upcoming" : "Completed";
  };

  /* ================= APPLY FILTER ================= */

  const applyFilter = () => {
    const filtered = events.filter((event) => {

      const matchesSearch =
        event.title.toLowerCase().includes(search.toLowerCase());

      const eventDate =
        new Date(event.date).toISOString().split("T")[0];

      const matchesDate =
        filterDate === "" || eventDate === filterDate;

      return matchesSearch && matchesDate;

    });

    setFilteredEvents(filtered);
  };

  /* ================= CLEAR FILTER ================= */

  const clearFilter = () => {
    setSearch("");
    setFilterDate("");
    setFilteredEvents(events);
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  /* ================= UI ================= */

  return (

    <div style={{ padding: "30px", fontFamily: "Arial" }}>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>

        <h2>Welcome {username} 🎓</h2>

        <button
          onClick={logout}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "5px"
          }}
        >
          Logout
        </button>

      </div>

      {/* SEARCH */}

      <div style={{ marginBottom: "25px" }}>

        <input
          placeholder="Search Events"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", width: "200px" }}
        />

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{ padding: "8px", marginLeft: "10px" }}
        />

        <button
          onClick={applyFilter}
          style={{
            marginLeft: "10px",
            padding: "8px 15px",
            background: "blue",
            color: "white",
            border: "none"
          }}
        >
          Search
        </button>

        <button
          onClick={clearFilter}
          style={{
            marginLeft: "10px",
            padding: "8px 15px"
          }}
        >
          Clear
        </button>

      </div>

      {/* AVAILABLE EVENTS */}

      <h3>Available Events</h3>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
        gap: "20px"
      }}>

        {filteredEvents.length === 0 ? (
          <p>No events available</p>
        ) : (

          filteredEvents.map((event) => {

            const deadlinePassed =
              new Date() > new Date(event.registration_deadline);

            const full =
              (event.registration_count || 0) >= event.max_students;

            const alreadyRegistered =
              myEvents.some(e => e.id === event.id); // ✅ NEW

            return (

              <div key={event.id} style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "10px",
                background: "#f9f9f9"
              }}>

                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p><b>Organized By:</b> {event.admin_name}</p>
                <p><b>Status:</b> {getStatus(event.date)}</p>
                <p><b>Date:</b> {new Date(event.date).toLocaleDateString()}</p>
                <p><b>Location:</b> {event.location}</p>

                <p><b>Capacity:</b>
                  {event.registration_count || 0}/{event.max_students}
                </p>

                <button
                  disabled={deadlinePassed || full || alreadyRegistered}
                  onClick={() => registerEvent(event.id)}
                  style={{
                    background:
                      alreadyRegistered
                        ? "orange"
                        : deadlinePassed || full
                        ? "gray"
                        : "green",
                    color: "white",
                    padding: "8px 15px",
                    border: "none",
                    borderRadius: "5px"
                  }}
                >
                  {alreadyRegistered
                    ? "Already Registered"
                    : deadlinePassed
                    ? "Registration Closed"
                    : full
                    ? "Event Full"
                    : "Register"}
                </button>

              </div>

            );

          })

        )}

      </div>

      {/* MY EVENTS */}

      <h3 style={{ marginTop: "40px" }}>My Registered Events</h3>

      {myEvents.length === 0 ? (
        <p>No upcoming registered events</p>
      ) : (

        myEvents.map((event) => (

          <div key={event.id} style={{
            border: "1px solid #ddd",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "10px"
          }}>

            <h4>{event.title}</h4>
            <p>{event.description}</p>
            <p>Date: {new Date(event.date).toLocaleDateString()}</p>
            <p>Location: {event.location}</p>

            <button
              onClick={() => cancelRegistration(event.id)}
              style={{
                background: "red",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: "5px"
              }}
            >
              Cancel Registration
            </button>

          </div>

        ))

      )}

    </div>

  );

}

export default StudentDashboard;