import React, { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {

  const username = localStorage.getItem("username");
  const adminId = localStorage.getItem("userId");

  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [date,setDate] = useState("");
  const [location,setLocation] = useState("");
  const [startTime,setStartTime] = useState("");
  const [deadline,setDeadline] = useState("");
  const [capacity,setCapacity] = useState("");

  const [events,setEvents] = useState([]);
  const [students,setStudents] = useState([]);
  const [selectedEvent,setSelectedEvent] = useState(null);

  const [editingId,setEditingId] = useState(null);

  const [editTitle,setEditTitle] = useState("");
  const [editDescription,setEditDescription] = useState("");
  const [editDate,setEditDate] = useState("");
  const [editLocation,setEditLocation] = useState("");
  const [editStartTime,setEditStartTime] = useState("");
  const [editDeadline,setEditDeadline] = useState("");

  const [showCreateForm,setShowCreateForm] = useState(false);

  useEffect(()=>{

    const role = localStorage.getItem("role");

    if(!role || role !== "admin"){
      window.location.href="/";
    }

    fetchEvents();

  },[]);

  const fetchEvents = async () => {

    const res = await axios.get(
      `https://clubsync-8i0l.onrender.com/events/${adminId}`
    );

    setEvents(res.data);

  };

  const handleLogout = () => {

    localStorage.clear();
    window.location.href="/";

  };

  const createEvent = async () => {

    if(!title || !description || !date){
      alert("Fill all fields");
      return;
    }

    await axios.post(
      "https://clubsync-8i0l.onrender.com/create-event",
      {
        title,
        description,
        date,
        location,
        start_time:startTime,
        registration_deadline:deadline,
        max_students:capacity,
        admin_id:adminId
      }
    );

    alert("Event Created");

    setTitle("");
    setDescription("");
    setDate("");
    setLocation("");
    setStartTime("");
    setDeadline("");
    setCapacity("");

    fetchEvents();

  };

  const deleteEvent = async (id) => {

    await axios.delete(
      `https://clubsync-8i0l.onrender.com/delete-event/${id}`
    );

    alert("Event Deleted");

    fetchEvents();

  };

  const updateEvent = async () => {

    const formattedDate =
      new Date(editDate).toISOString().split("T")[0];

    await axios.put(
      `https://clubsync-8i0l.onrender.com/update-event/${editingId}`,
      {
        title:editTitle,
        description:editDescription,
        date:formattedDate,
        location:editLocation,
        start_time:editStartTime,
        registration_deadline:editDeadline
      }
    );

    alert("Event Updated");

    setEditingId(null);

    fetchEvents();

  };

  const viewStudents = async (eventId) => {

    const res = await axios.get(
      `https://clubsync-8i0l.onrender.com/event-students/${eventId}`
    );

    setStudents(res.data);
    setSelectedEvent(eventId);

  };

  const getStatus = (eventDate) => {

    if(new Date(eventDate) >= new Date())
      return "Upcoming";

    return "Completed";

  };

  return(

<div style={{width:"90%",margin:"30px auto",fontFamily:"Arial"}}>

{/* HEADER */}

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"20px",
borderBottom:"1px solid #ddd",
paddingBottom:"10px"
}}
>

<h2>Welcome {username} 👋</h2>

<button
onClick={handleLogout}
style={{
background:"red",
color:"white",
border:"none",
padding:"8px 15px",
borderRadius:"5px"
}}
>
Logout
</button>

</div>


{/* CREATE EVENT BUTTON */}

<div style={{marginBottom:"20px"}}>

<button
onClick={()=>setShowCreateForm(!showCreateForm)}
style={{
background:"blue",
color:"white",
padding:"10px 20px",
border:"none",
borderRadius:"5px"
}}
>
{showCreateForm ? "Close Form" : "Create New Event"}
</button>

</div>


{/* CREATE EVENT FORM */}

{showCreateForm && (

<div style={{border:"1px solid #ddd",padding:"20px",borderRadius:"10px",marginBottom:"30px"}}>

<h3>Create Event</h3>

<label>Event Title</label>
<input value={title} onChange={(e)=>setTitle(e.target.value)} />

<br/><br/>

<label>Description</label>
<input value={description} onChange={(e)=>setDescription(e.target.value)} />

<br/><br/>

<label>Event Date</label>
<input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />

<br/><br/>

<label>Location</label>
<input value={location} onChange={(e)=>setLocation(e.target.value)} />

<br/><br/>

<label>Start Time</label>
<input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} />

<br/><br/>

<label>Registration Deadline</label>
<input type="date" value={deadline} onChange={(e)=>setDeadline(e.target.value)} />

<br/><br/>

<label>Max Students</label>
<input type="number" value={capacity} onChange={(e)=>setCapacity(e.target.value)} />

<br/><br/>

<button
onClick={createEvent}
style={{background:"green",color:"white",padding:"8px 15px",border:"none"}}
>
Create Event
</button>

</div>

)}


<h3>My Events</h3>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",
gap:"20px"
}}
>

{events.map(event => (

<div
key={event.id}
style={{
border:"1px solid #ddd",
padding:"15px",
borderRadius:"10px",
background:"#f9f9f9",
boxShadow:"0 2px 6px rgba(0,0,0,0.1)"
}}
>

{editingId === event.id ? (

<div>

<input value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} />
<br/><br/>

<input value={editDescription} onChange={(e)=>setEditDescription(e.target.value)} />
<br/><br/>

<input type="date" value={editDate?.split("T")[0]} onChange={(e)=>setEditDate(e.target.value)} />
<br/><br/>

<input value={editLocation} onChange={(e)=>setEditLocation(e.target.value)} />
<br/><br/>

<input type="time" value={editStartTime} onChange={(e)=>setEditStartTime(e.target.value)} />
<br/><br/>

<input type="date" value={editDeadline?.split("T")[0]} onChange={(e)=>setEditDeadline(e.target.value)} />
<br/><br/>

<button onClick={updateEvent}>Save</button>

</div>

) : (

<div>

<h3>{event.title}</h3>

<p><b>Description :</b> {event.description}</p>

<p><b>Date :</b> {new Date(event.date).toLocaleDateString()}</p>

<p><b>Location :</b> {event.location}</p>

<p><b>Start Time :</b> {event.start_time}</p>

<p><b>Registration Deadline :</b> {new Date(event.registration_deadline).toLocaleDateString()}</p>

<p><b>Status :</b> {getStatus(event.date)}</p>

<p><b>Capacity :</b> {event.max_students}</p>

<p><b>Registered :</b> {event.registration_count}</p>

<div style={{display:"flex",gap:"10px",marginTop:"10px"}}>

<button onClick={()=>viewStudents(event.id)}>View Students</button>

<button
onClick={()=>{
setEditingId(event.id);
setEditTitle(event.title);
setEditDescription(event.description);
setEditDate(event.date);
setEditLocation(event.location);
setEditStartTime(event.start_time);
setEditDeadline(event.registration_deadline);
}}
>
Edit
</button>

<button
onClick={()=>deleteEvent(event.id)}
style={{background:"red",color:"white"}}
>
Delete
</button>

</div>

</div>

)}

{/* STUDENTS */}

{selectedEvent === event.id && (

<div style={{marginTop:"15px"}}>

<h4>Registered Students</h4>

{students.length === 0 ? (
<p>No students registered</p>
) : (

<table border="1" cellPadding="8">

<thead>
<tr>
<th>Name</th>
<th>Email</th>
</tr>
</thead>

<tbody>

{students.map((s,i)=>(
<tr key={i}>
<td>{s.name}</td>0
<td>{s.email}</td>
</tr>
))}

</tbody>

</table>

)}

<br/>

<button onClick={()=>window.open(`https://clubsync-8i0l.onrender.com/download-excel/${event.id}`)}>
Download Excel
</button>

<button onClick={()=>window.open(`https://clubsync-8i0l.onrender.com/download-pdf/${event.id}`)}>
Download PDF
</button>


</div>

)}

</div>

))}

</div>

</div>

  );

}

export default Dashboard;
